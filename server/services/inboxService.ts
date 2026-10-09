import { db } from '../db/database';
import { 
  ConversationRecord, 
  ConversationMessageRecord, 
  IntegrationRecord, 
  IntegrationEventRecord,
  SlackChannelMappingRecord,
  ClientCommunicationLinkRecord,
  ProjectCommunicationLinkRecord,
  ConversationClassification,
  ConversationStatus
} from '../db/types';
import { ContextService } from './contextService';
import { ToolExecutionService } from './toolExecutionService';
import { ActivityService } from './activityService';

export class InboxService {
  /**
   * Main entry point to process an incoming Slack message event asynchronously.
   */
  public static async processIncomingMessage(params: {
    organizationId?: string;
    teamId?: string;
    channel: string;
    user: string;
    text: string;
    ts: string;
    thread_ts?: string;
    event_id: string;
    user_name?: string;
    bot_id?: string;
    subtype?: string;
  }): Promise<{ success: boolean; status: string; conversationId?: string; reason?: string }> {
    const { 
      teamId, 
      channel, 
      user, 
      text, 
      ts, 
      thread_ts, 
      event_id, 
      user_name,
      bot_id,
      subtype 
    } = params;

    // ----------------------------------------------------
    // 1. Resolve Organization & Slack Integration
    // ----------------------------------------------------
    const integrations = db.get('integrations') || [];
    let integration: IntegrationRecord | undefined;

    if (params.organizationId) {
      integration = integrations.find(i => i.organization_id === params.organizationId && i.provider === 'slack');
    } else if (teamId) {
      integration = integrations.find(i => i.provider === 'slack' && i.external_account_id === teamId);
    }

    if (!integration) {
      return { success: false, status: 'ignored', reason: 'No matching Slack integration found for workspace.' };
    }

    const orgId = integration.organization_id;

    // ----------------------------------------------------
    // 2. Prevent Bot Loops and Ignore System Subtypes
    // ----------------------------------------------------
    if (bot_id || subtype === 'bot_message') {
      return { success: true, status: 'ignored', reason: 'Bot message ignored to prevent feedback loops.' };
    }

    if (integration.metadata?.bot_user_id && user === integration.metadata.bot_user_id) {
      return { success: true, status: 'ignored', reason: 'Self-sent AI message ignored.' };
    }

    if (subtype && ['channel_join', 'channel_leave', 'channel_topic', 'message_changed', 'message_deleted'].includes(subtype)) {
      return { success: true, status: 'ignored', reason: `System subtype "${subtype}" ignored.` };
    }

    // ----------------------------------------------------
    // 3. Prevent Duplicate Messages (Idempotency)
    // ----------------------------------------------------
    const messages = db.get('conversation_messages') || [];
    const duplicate = messages.find(
      m => m.organization_id === orgId && m.external_message_id === ts
    );
    if (duplicate) {
      return { 
        success: true, 
        status: 'duplicate', 
        conversationId: duplicate.conversation_id, 
        reason: 'Message already received and recorded.' 
      };
    }

    // ----------------------------------------------------
    // 4. Conversation Lookup or Creation
    // ----------------------------------------------------
    const conversations = db.get('conversations') || [];
    const targetThreadId = thread_ts || ts;
    let conversation = conversations.find(
      c => c.organization_id === orgId && 
           c.external_channel_id === channel && 
           (c.external_thread_id === targetThreadId || c.external_thread_id === ts)
    );

    const isNewConversation = !conversation;

    if (!conversation) {
      const convId = `conv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      conversation = {
        id: convId,
        organization_id: orgId,
        integration_id: integration.id,
        external_channel_id: channel,
        external_thread_id: targetThreadId,
        title: `Slack conversation in #${channel}`,
        status: 'processing',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      db.update('conversations', list => [...(list || []), conversation!]);
    } else {
      conversation.status = 'processing';
      conversation.updated_at = new Date().toISOString();
      db.update('conversations', list => list.map(c => c.id === conversation!.id ? conversation! : c));
    }

    // ----------------------------------------------------
    // 5. Store Incoming Message
    // ----------------------------------------------------
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const messageRecord: ConversationMessageRecord = {
      id: messageId,
      conversation_id: conversation.id,
      organization_id: orgId,
      external_message_id: ts,
      sender_type: 'user',
      external_sender_id: user,
      sender_name: user_name || `Slack User (${user})`,
      content: text,
      message_type: 'user',
      metadata: {
        slack_channel: channel,
        slack_ts: ts,
        slack_thread_ts: thread_ts,
        event_id
      },
      created_at: new Date().toISOString()
    };

    db.update('conversation_messages', list => [...(list || []), messageRecord]);

    ActivityService.logActivity({
      organization_id: orgId,
      actor_type: 'user',
      actor_id: user_name || user,
      action: 'SLACK_MESSAGE_RECEIVED',
      entity_type: 'conversation',
      entity_id: conversation.id,
      result: `Slack message received in #${channel}: "${text.slice(0, 60)}..."`,
      metadata: { channel, ts, user }
    });

    // ----------------------------------------------------
    // 6. Client Identification
    // ----------------------------------------------------
    let clientId: string | undefined = conversation.client_id;

    if (!clientId) {
      // Signal A: Slack Channel Mapping
      const channelMappings = (db.get('slack_channel_mappings') || []).filter(
        m => m.organization_id === orgId && m.enabled && m.channel_id === channel
      );
      if (channelMappings.length > 0 && channelMappings[0].client_id) {
        clientId = channelMappings[0].client_id;
      }

      // Signal B: Client Communication Link (by Slack User or Channel)
      if (!clientId) {
        const commLinks = (db.get('client_communication_links') || []).filter(
          l => l.organization_id === orgId && (l.external_user_id === user || l.external_channel_id === channel)
        );
        if (commLinks.length > 0 && commLinks[0].confidence >= 0.7) {
          clientId = commLinks[0].client_id;
        }
      }

      // Signal C: Client Contacts matching
      if (!clientId) {
        const contacts = (db.get('contacts') || []).filter(c => c.organization_id === orgId);
        const matchedContact = contacts.find(c => 
          (user_name && c.name.toLowerCase().includes(user_name.toLowerCase())) ||
          (user_name && c.email.toLowerCase().includes(user_name.toLowerCase()))
        );
        if (matchedContact) {
          clientId = matchedContact.client_id;
        }
      }

      if (clientId) {
        conversation.client_id = clientId;
        const clientRec = (db.get('clients') || []).find(c => c.id === clientId);
        if (clientRec) {
          conversation.title = `${clientRec.company_name} &middot; #${channel}`;
        }
        ActivityService.logActivity({
          organization_id: orgId,
          client_id: clientId,
          actor_type: 'system',
          actor_id: 'AI Routing Engine',
          action: 'CLIENT_IDENTIFIED',
          entity_type: 'conversation',
          entity_id: conversation.id,
          result: `Identified client "${clientRec?.company_name || clientId}" from communication channels.`
        });
      } else {
        // Do NOT guess! Mark as needs_client
        conversation.status = 'needs_client';
        db.update('conversations', list => list.map(c => c.id === conversation!.id ? conversation! : c));
        return {
          success: true,
          status: 'needs_client',
          conversationId: conversation.id,
          reason: 'Client could not be identified with confidence. Awaiting operator assignment.'
        };
      }
    }

    // ----------------------------------------------------
    // 7. Project Identification
    // ----------------------------------------------------
    let projectId: string | undefined = conversation.project_id;

    if (!projectId && clientId) {
      // Signal A: Channel Mapping
      const channelMapping = (db.get('slack_channel_mappings') || []).find(
        m => m.organization_id === orgId && m.channel_id === channel
      );
      if (channelMapping?.project_id) {
        projectId = channelMapping.project_id;
      }

      // Signal B: Project Communication Link
      if (!projectId) {
        const projLink = (db.get('project_communication_links') || []).find(
          l => l.organization_id === orgId && l.external_channel_id === channel
        );
        if (projLink?.project_id) {
          projectId = projLink.project_id;
        }
      }

      // Signal C: Text mentions client project title
      if (!projectId) {
        const clientProjects = (db.get('projects') || []).filter(
          p => p.organization_id === orgId && p.client_id === clientId
        );
        const lowerText = text.toLowerCase();
        const matched = clientProjects.find(p => lowerText.includes(p.project_name.toLowerCase()));
        if (matched) {
          projectId = matched.project_id;
        }
      }

      if (projectId) {
        conversation.project_id = projectId;
        ActivityService.logActivity({
          organization_id: orgId,
          client_id: clientId,
          project_id: projectId,
          actor_type: 'system',
          actor_id: 'AI Routing Engine',
          action: 'PROJECT_IDENTIFIED',
          entity_type: 'conversation',
          entity_id: conversation.id,
          result: `Identified project "${projectId}" for conversation.`
        });
      }
    }

    // ----------------------------------------------------
    // 8. Load Client Intelligence Context
    // ----------------------------------------------------
    const clientContext = ContextService.getClientContext(orgId, clientId, projectId);

    // ----------------------------------------------------
    // 9. AI Message Classification
    // ----------------------------------------------------
    const classification = this.classifyMessage(text, clientContext);
    conversation.classification = classification;

    ActivityService.logActivity({
      organization_id: orgId,
      client_id: clientId,
      project_id: projectId,
      actor_type: 'agent',
      actor_id: 'AI Employee Classifier',
      action: 'MESSAGE_CLASSIFIED',
      entity_type: 'conversation',
      entity_id: conversation.id,
      result: `Classified as ${classification.category} (${classification.urgency} urgency): ${classification.reason}`,
      metadata: classification as any
    });

    // ----------------------------------------------------
    // 10. Task Creation via Tool Registry
    // ----------------------------------------------------
    if (classification.requires_task) {
      const taskTitle = this.extractTaskTitle(text, classification.category);
      try {
        const taskResult = await ToolExecutionService.executeTool({
          toolId: 'tasks.create',
          organizationId: orgId,
          userId: 'ai-employee',
          clientId,
          projectId,
          input: {
            title: taskTitle,
            description: `Generated from Slack message (#${channel}):\n\n"${text}"`,
            priority: classification.urgency === 'high' ? 'High' : 'Normal',
            client_id: clientId,
            project_id: projectId
          }
        });

        if (taskResult.success && taskResult.data?.task) {
          conversation.task_id = taskResult.data.task.id;
          ActivityService.logActivity({
            organization_id: orgId,
            client_id: clientId,
            project_id: projectId,
            actor_type: 'agent',
            actor_id: 'Client Liaison Agent',
            action: 'TASK_CREATED_FROM_MESSAGE',
            entity_type: 'task',
            entity_id: taskResult.data.task.id,
            result: `Created task "${taskTitle}" via Tool Registry.`
          });
        }
      } catch (err: any) {
        console.warn('Failed to auto-create task via Tool Registry:', err.message);
      }
    }

    // ----------------------------------------------------
    // 11. AI Response Drafting
    // ----------------------------------------------------
    if (classification.requires_response) {
      const draft = this.generateResponseDraft(text, clientContext, classification);
      conversation.ai_draft_response = draft;

      ActivityService.logActivity({
        organization_id: orgId,
        client_id: clientId,
        project_id: projectId,
        actor_type: 'agent',
        actor_id: 'Client Liaison Agent',
        action: 'AI_RESPONSE_DRAFTED',
        entity_type: 'conversation',
        entity_id: conversation.id,
        result: `Drafted response aligned with brand tone: "${draft.slice(0, 70)}..."`
      });

      // ----------------------------------------------------
      // 12. External Communication Gate & Approval
      // ----------------------------------------------------
      const commExecution = await ToolExecutionService.executeTool({
        toolId: 'communication.send',
        organizationId: orgId,
        userId: 'ai-employee',
        clientId,
        projectId,
        input: {
          channel_id: channel,
          channel: channel,
          thread_ts: targetThreadId,
          message: draft
        }
      });

      if (commExecution.status === 'waiting_approval') {
        conversation.status = 'waiting_approval';
        ActivityService.logActivity({
          organization_id: orgId,
          client_id: clientId,
          project_id: projectId,
          actor_type: 'system',
          actor_id: 'Risk Engine',
          action: 'COMMUNICATION_APPROVAL_REQUIRED',
          entity_type: 'approval',
          entity_id: commExecution.approvalId || conversation.id,
          result: `Held outgoing Slack reply for human sign-off (Approval: ${commExecution.approvalId})`
        });
      } else {
        conversation.status = 'ai_draft';
      }
    } else {
      conversation.status = 'completed';
    }

    // ----------------------------------------------------
    // 13. Observe Potential Memory (Strictly "Observed")
    // ----------------------------------------------------
    this.extractAndRecordObservedMemory(orgId, clientId, text);

    // Save final conversation state
    conversation.updated_at = new Date().toISOString();
    db.update('conversations', list => list.map(c => c.id === conversation!.id ? conversation! : c));

    return {
      success: true,
      status: conversation.status,
      conversationId: conversation.id
    };
  }

  /**
   * Lightweight deterministic rule/keyword classification engine.
   */
  private static classifyMessage(text: string, context: any): ConversationClassification {
    const t = text.toLowerCase();

    // Design Request
    if (t.includes('design') || t.includes('hero') || t.includes('variation') || t.includes('version') || t.includes('wireframe') || t.includes('mockup') || t.includes('figma') || t.includes('logo') || t.includes('layout') || t.includes('ui')) {
      return {
        category: 'design_request',
        urgency: t.includes('urgent') || t.includes('asap') || t.includes('today') ? 'high' : 'normal',
        requires_task: true,
        requires_response: true,
        requires_human: false,
        reason: 'Client requested specific design deliverable explorations.'
      };
    }

    // Revision Request
    if (t.includes('change') || t.includes('revision') || t.includes('modify') || t.includes('make it') || t.includes('adjust') || t.includes('update the copy') || t.includes('font')) {
      return {
        category: 'revision_request',
        urgency: t.includes('urgent') || t.includes('deadline') ? 'high' : 'normal',
        requires_task: true,
        requires_response: true,
        requires_human: false,
        reason: 'Client requested modifications or stylistic adjustments to existing work.'
      };
    }

    // Feedback
    if (t.includes('love this') || t.includes('looks great') || t.includes('thoughts:') || t.includes('feedback') || t.includes('reviewing')) {
      return {
        category: 'feedback',
        urgency: 'low',
        requires_task: false,
        requires_response: true,
        requires_human: false,
        reason: 'Client shared review feedback on submitted work.'
      };
    }

    // Approval
    if (t.includes('approved') || t.includes('sign off') || t.includes('go ahead') || t.includes('looks good to proceed')) {
      return {
        category: 'approval',
        urgency: 'normal',
        requires_task: true,
        requires_response: true,
        requires_human: false,
        reason: 'Client formally approved current milestone checkpoint.'
      };
    }

    // Status Request
    if (t.includes('status') || t.includes('progress') || t.includes('timeline') || t.includes('how is') || t.includes('eta') || t.includes('when can we')) {
      return {
        category: 'status_request',
        urgency: 'normal',
        requires_task: false,
        requires_response: true,
        requires_human: false,
        reason: 'Client inquiring about project status or delivery timelines.'
      };
    }

    // Billing / Commercial
    if (t.includes('invoice') || t.includes('payment') || t.includes('contract') || t.includes('pricing') || t.includes('budget') || t.includes('scope')) {
      return {
        category: 'billing',
        urgency: 'high',
        requires_task: true,
        requires_response: true,
        requires_human: true,
        reason: 'Commercial or billing inquiry requiring account manager verification.'
      };
    }

    // Question / Inquiries
    if (t.includes('?') || t.includes('can we') || t.includes('could you') || t.includes('what do you think')) {
      return {
        category: 'question',
        urgency: 'normal',
        requires_task: false,
        requires_response: true,
        requires_human: false,
        reason: 'Client posed an inquiry about studio process or assets.'
      };
    }

    return {
      category: 'general',
      urgency: 'low',
      requires_task: false,
      requires_response: true,
      requires_human: false,
      reason: 'General studio communication.'
    };
  }

  /**
   * Generates a concise task title from message text.
   */
  private static extractTaskTitle(text: string, category: string): string {
    const cleaned = text.replace(/^(can you|please|could you|we need|let's)\s+/i, '').trim();
    const firstSentence = cleaned.split(/[.?!\n]/)[0].trim();
    if (firstSentence.length > 5 && firstSentence.length < 80) {
      return firstSentence.charAt(0).toUpperCase() + firstSentence.slice(1);
    }
    switch (category) {
      case 'design_request': return `Explore design iterations for request`;
      case 'revision_request': return `Implement requested design revisions`;
      case 'approval': return `Proceed to next milestone upon client sign-off`;
      default: return `Follow up on client communication`;
    }
  }

  /**
   * Generates a calm, editorial response draft following client communication preferences.
   */
  private static generateResponseDraft(text: string, context: any, classification: ConversationClassification): string {
    const client = context?.client;
    const tone = client?.communication_tone?.toLowerCase() || 'editorial';
    const isConcise = tone.includes('concise') || tone.includes('brief') || tone.includes('direct');

    switch (classification.category) {
      case 'design_request':
        if (isConcise) {
          return `Received. Exploring variations aligned with the established design system. Will share an update soon.`;
        }
        return `Understood. I'm exploring variations for this while ensuring it remains strictly aligned with the current brand guidelines and visual direction. I'll prepare a set for review shortly.`;

      case 'revision_request':
        if (isConcise) {
          return `Got it. Making the requested adjustments now and will follow up with updated frames.`;
        }
        return `Understood. I've noted these adjustments and am integrating them into the layout. Will present the refined direction once complete.`;

      case 'status_request':
        return `Everything is tracking on schedule according to our milestone plan. We'll share the latest deliverables as soon as our QA review checkpoint completes.`;

      case 'approval':
        return `Thank you for the sign-off. We are advancing this deliverable to production status.`;

      case 'billing':
        return `Thank you for reaching out regarding this. I have routed this inquiry to our studio account lead who will follow up with full details shortly.`;

      default:
        return `Received. Reviewing against the project context and will follow up shortly.`;
    }
  }

  /**
   * Identifies potential preferences and creates an OBSERVED memory item if detected.
   */
  private static extractAndRecordObservedMemory(organizationId: string, clientId: string, text: string) {
    const t = text.toLowerCase();
    let preferenceCandidate: string | null = null;

    if (t.includes('we prefer') || t.includes('always use') || t.includes('never use') || t.includes('our team prefers') || t.includes('keep messages brief')) {
      preferenceCandidate = text;
    }

    if (preferenceCandidate) {
      try {
        ToolExecutionService.executeTool({
          toolId: 'memory.create',
          organizationId,
          userId: 'ai-employee',
          clientId,
          input: {
            client_id: clientId,
            category: 'Communication Preference',
            content: `Observed via Slack interaction: "${preferenceCandidate.slice(0, 150)}"`,
            status: 'Observed', // STRICTLY OBSERVED, NEVER APPROVED
            confidence: 'Medium',
            source_type: 'Slack Conversation'
          }
        });
      } catch (err) {
        // Safe observation non-blocking
      }
    }
  }

  // ----------------------------------------------------
  // CONVERSATIONS QUERYING & OPERATOR ACTIONS
  // ----------------------------------------------------
  public static getConversations(organizationId: string, filter?: { status?: string; search?: string }): ConversationRecord[] {
    let list = (db.get('conversations') || []).filter(c => c.organization_id === organizationId);

    if (filter?.status) {
      if (filter.status === 'needs_attention') {
        list = list.filter(c => ['needs_client', 'needs_project', 'waiting_approval'].includes(c.status));
      } else if (filter.status === 'slack') {
        list = list.filter(c => Boolean(c.external_channel_id));
      } else {
        list = list.filter(c => c.status === filter.status);
      }
    }

    if (filter?.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(c => c.title.toLowerCase().includes(q));
    }

    list.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    return list;
  }

  public static getConversationDetails(organizationId: string, conversationId: string) {
    const conversations = db.get('conversations') || [];
    const conversation = conversations.find(c => c.id === conversationId && c.organization_id === organizationId);
    if (!conversation) return null;

    const messages = (db.get('conversation_messages') || [])
      .filter(m => m.conversation_id === conversationId && m.organization_id === organizationId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    const client = conversation.client_id ? (db.get('clients') || []).find(c => c.id === conversation.client_id) : null;
    const project = conversation.project_id ? (db.get('projects') || []).find(p => p.project_id === conversation.project_id) : null;
    const task = conversation.task_id ? (db.get('tasks') || []).find(t => t.id === conversation.task_id) : null;
    
    // Look for pending approvals for this conversation
    const approvals = (db.get('approvals') || []).filter(
      a => a.organization_id === organizationId && 
           a.client_id === conversation.client_id && 
           a.status === 'pending'
    );

    let context = null;
    if (conversation.client_id) {
      context = ContextService.getClientContext(organizationId, conversation.client_id, conversation.project_id);
    }

    return {
      conversation,
      messages,
      client,
      project,
      task,
      approvals,
      context
    };
  }

  public static assignClient(organizationId: string, conversationId: string, clientId: string, actorId: string): boolean {
    const conversations = db.get('conversations') || [];
    const conv = conversations.find(c => c.id === conversationId && c.organization_id === organizationId);
    if (!conv) return false;

    conv.client_id = clientId;
    if (conv.status === 'needs_client') {
      conv.status = 'ai_draft';
    }
    conv.updated_at = new Date().toISOString();

    const client = (db.get('clients') || []).find(c => c.id === clientId);
    if (client) {
      conv.title = `${client.company_name} &middot; #${conv.external_channel_id || 'conversation'}`;
    }

    db.update('conversations', list => list.map(c => c.id === conv.id ? conv : c));

    // Also link user/channel to improve future auto-identification
    if (conv.external_channel_id) {
      const linkRecord: ClientCommunicationLinkRecord = {
        id: `ccl_${Date.now()}`,
        organization_id: organizationId,
        client_id: clientId,
        integration_id: conv.integration_id || 'intg_slack',
        external_channel_id: conv.external_channel_id,
        confidence: 1.0,
        created_at: new Date().toISOString()
      };
      db.update('client_communication_links', list => [...(list || []), linkRecord]);
    }

    ActivityService.logActivity({
      organization_id: organizationId,
      client_id: clientId,
      actor_type: 'user',
      actor_id: actorId,
      action: 'CLIENT_ASSIGNED_TO_CONVERSATION',
      entity_type: 'conversation',
      entity_id: conversationId,
      result: `Manually assigned conversation to client "${client?.company_name || clientId}"`
    });

    return true;
  }

  public static assignProject(organizationId: string, conversationId: string, projectId: string, actorId: string): boolean {
    const conversations = db.get('conversations') || [];
    const conv = conversations.find(c => c.id === conversationId && c.organization_id === organizationId);
    if (!conv) return false;

    conv.project_id = projectId;
    if (conv.status === 'needs_project') {
      conv.status = 'ai_draft';
    }
    conv.updated_at = new Date().toISOString();

    db.update('conversations', list => list.map(c => c.id === conv.id ? conv : c));

    if (conv.external_channel_id) {
      const projLink: ProjectCommunicationLinkRecord = {
        id: `pcl_${Date.now()}`,
        organization_id: organizationId,
        project_id: projectId,
        integration_id: conv.integration_id || 'intg_slack',
        external_channel_id: conv.external_channel_id,
        created_at: new Date().toISOString()
      };
      db.update('project_communication_links', list => [...(list || []), projLink]);
    }

    ActivityService.logActivity({
      organization_id: organizationId,
      client_id: conv.client_id,
      project_id: projectId,
      actor_type: 'user',
      actor_id: actorId,
      action: 'PROJECT_ASSIGNED_TO_CONVERSATION',
      entity_type: 'conversation',
      entity_id: conversationId,
      result: `Manually assigned conversation to project "${projectId}"`
    });

    return true;
  }
}
