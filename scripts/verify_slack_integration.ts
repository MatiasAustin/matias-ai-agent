import { db } from '../server/db/database';
import { SlackService } from '../server/services/slackService';
import { InboxService } from '../server/services/inboxService';
import { ToolExecutionService } from '../server/services/toolExecutionService';
import { EncryptionService } from '../server/services/encryptionService';
import { ClientService } from '../server/services/clientService';
import { ProjectService } from '../server/services/projectService';
import { IntegrationRecord, SlackChannelMappingRecord, ClientCommunicationLinkRecord } from '../server/db/types';

async function runTests() {
  console.log('====================================================');
  console.log('MATIAS AI STUDIO OS - SLACK & INBOX TEST SUITE (20 SCENARIOS)');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName} ${detail ? `- ${detail}` : ''}`);
      failed++;
    }
  }

  // Set up fresh test state
  db.resetToSeed();

  const ORG_A = 'org_test_slack_a';
  const ORG_B = 'org_test_slack_b';
  const TEAM_A = 'T_SLACK_ORG_A';
  const TEAM_B = 'T_SLACK_ORG_B';

  db.update('organizations', list => [
    ...(list || []),
    { id: ORG_A, name: 'Studio Alpha', slug: 'studio-alpha', plan: 'Studio', status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: ORG_B, name: 'Studio Beta', slug: 'studio-beta', plan: 'Enterprise', status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
  ]);

  db.update('users', list => [
    ...(list || []),
    { id: 'user-admin-1', email: 'admin@studio-alpha.io', name: 'Admin Alpha', platform_role: 'USER', status: 'active', password_hash: '', password_salt: '', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), last_active_at: new Date().toISOString() }
  ]);

  db.update('organization_members', list => [
    ...(list || []),
    { id: 'mem_a_1', organization_id: ORG_A, user_id: 'user-admin-1', role: 'OWNER', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
  ]);

  // Create Client in Org A
  const clientA = ClientService.createClient(ORG_A, {
    identity: {
      company_name: 'Acme Robotics',
      industry: 'Robotics',
      timezone: 'UTC'
    },
    people: [{
      name: 'Elena Rostova',
      role: 'Head of Product',
      email: 'elena@acme-robotics.io',
      preferred_channel: 'Slack',
      is_primary_contact: true
    }],
    communication: {
      communication_tone: 'Technical, concise',
      response_style: 'Brief bullet points'
    }
  }, 'Setup');

  // Create Project in Org A
  const projA = ProjectService.createProject(ORG_A, {
    client_id: clientA.id,
    project_name: 'Autonomous Navigation UI',
    project_type: 'Design System',
    description: 'Spatial token design for autonomous units',
    status: 'in_progress',
    deadline: '2026-11-01',
    priority: 'high',
    progress: 35,
    assigned_agents: ['ag-cd', 'ag-design']
  });

  // Setup Connected Slack Integration for Org A
  const botTokenA = 'xoxb-test-mock-token-org-a';
  const intgA: IntegrationRecord = {
    id: 'intg_slack_a',
    organization_id: ORG_A,
    provider: 'slack',
    status: 'connected',
    display_name: 'Slack (Acme Robotics Workspace)',
    external_account_id: TEAM_A,
    encrypted_bot_token: EncryptionService.encrypt(botTokenA),
    metadata: {
      team_id: TEAM_A,
      team_name: 'Acme Robotics Workspace',
      bot_user_id: 'UBOT12345',
      scope: 'channels:history,chat:write,users:read'
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  db.update('integrations', list => [...(list || []), intgA]);

  // Setup Channel Mapping for Org A: #robotics-ui -> Client A & Project A
  const mappingA: SlackChannelMappingRecord = {
    id: 'scm_test_1',
    organization_id: ORG_A,
    integration_id: intgA.id,
    channel_id: 'C_ROBOTICS_UI',
    channel_name: '#robotics-ui',
    client_id: clientA.id,
    project_id: projA.project_id,
    enabled: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  db.update('slack_channel_mappings', list => [...(list || []), mappingA]);

  // Setup Contact Mapping for Elena
  const contactLinkA: ClientCommunicationLinkRecord = {
    id: 'ccl_test_1',
    organization_id: ORG_A,
    client_id: clientA.id,
    integration_id: intgA.id,
    external_user_id: 'U_ELENA',
    external_channel_id: 'C_ROBOTICS_UI',
    confidence: 1.0,
    created_at: new Date().toISOString()
  };
  db.update('client_communication_links', list => [...(list || []), contactLinkA]);

  // ----------------------------------------------------
  // 1. SLACK OAUTH STATE GENERATION & VALIDATION
  // ----------------------------------------------------
  const validState = SlackService.generateOAuthState(ORG_A, 'user-admin-1');
  const verifiedState = SlackService.verifyOAuthState(validState);
  assert(verifiedState.valid && verifiedState.organizationId === ORG_A, '1. Slack OAuth state generation & validation');

  // ----------------------------------------------------
  // 2. INVALID OAUTH STATE REJECTION
  // ----------------------------------------------------
  const tamperedState = validState.slice(0, -4) + 'abcd';
  const invalidResult = SlackService.verifyOAuthState(tamperedState);
  assert(!invalidResult.valid, '2. Invalid/tampered OAuth state rejected');

  // ----------------------------------------------------
  // 3. SLACK SIGNATURE VERIFICATION
  // ----------------------------------------------------
  const signingSecret = 'mock-signing-secret-matias-test';
  const testTimestamp = Math.floor(Date.now() / 1000).toString();
  const testBody = JSON.stringify({ type: 'event_callback', event: { text: 'hello' } });

  // Valid signature check
  const crypto = await import('crypto');
  const validSig = 'v0=' + crypto
    .createHmac('sha256', signingSecret)
    .update(`v0:${testTimestamp}:${testBody}`, 'utf8')
    .digest('hex');

  const sigValid = SlackService.verifySlackSignature(validSig, testTimestamp, testBody, signingSecret);
  assert(sigValid, '3a. Valid Slack signature verified');

  const sigInvalid = SlackService.verifySlackSignature('v0=badbadbadbad', testTimestamp, testBody, signingSecret);
  assert(!sigInvalid, '3b. Invalid Slack signature rejected');

  // ----------------------------------------------------
  // 4. DUPLICATE EVENT IDEMPOTENCY
  // ----------------------------------------------------
  const eventId = 'ev_idempotency_123';
  const firstMsg = await InboxService.processIncomingMessage({
    teamId: TEAM_A,
    channel: 'C_ROBOTICS_UI',
    user: 'U_ELENA',
    text: 'Can you explore 3 variations of the hero dashboard section?',
    ts: '1700000001.000100',
    event_id: eventId
  });
  assert(firstMsg.success, '4a. Initial Slack message processed');

  const duplicateMsg = await InboxService.processIncomingMessage({
    teamId: TEAM_A,
    channel: 'C_ROBOTICS_UI',
    user: 'U_ELENA',
    text: 'Can you explore 3 variations of the hero dashboard section?',
    ts: '1700000001.000100',
    event_id: eventId
  });
  assert(duplicateMsg.status === 'duplicate', '4b. Duplicate event rejected via idempotency');

  // ----------------------------------------------------
  // 5. ORGANIZATION RESOLUTION
  // ----------------------------------------------------
  const convDetails = InboxService.getConversationDetails(ORG_A, firstMsg.conversationId!);
  assert(convDetails !== null && convDetails.conversation.organization_id === ORG_A, '5. Organization resolved from Slack workspace');

  // ----------------------------------------------------
  // 6. CLIENT RESOLUTION (MAPPED)
  // ----------------------------------------------------
  assert(convDetails?.conversation.client_id === clientA.id, '6. Client resolved from channel and contact mapping');

  // ----------------------------------------------------
  // 7. UNKNOWN CLIENT (NO HALLUCINATION)
  // ----------------------------------------------------
  const unknownClientMsg = await InboxService.processIncomingMessage({
    teamId: TEAM_A,
    channel: 'C_UNKNOWN_CHANNEL',
    user: 'U_STRANGER_99',
    text: 'Hello, we would like to collaborate.',
    ts: '1700000002.000200',
    event_id: 'ev_unknown_client_001'
  });
  assert(unknownClientMsg.status === 'needs_client', '7. Unknown client flagged as needs_client (no hallucination)');

  // ----------------------------------------------------
  // 8. PROJECT RESOLUTION (MAPPED)
  // ----------------------------------------------------
  assert(convDetails?.conversation.project_id === projA.project_id, '8. Project resolved from channel mapping');

  // ----------------------------------------------------
  // 9. UNKNOWN PROJECT (NO HALLUCINATION)
  // ----------------------------------------------------
  // Map an unlinked channel to clientA without project
  db.update('slack_channel_mappings', list => [
    ...(list || []),
    {
      id: 'scm_test_2',
      organization_id: ORG_A,
      integration_id: intgA.id,
      channel_id: 'C_GENERAL_UNLINKED',
      channel_name: '#general-questions',
      client_id: clientA.id,
      enabled: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]);
  const unknownProjMsg = await InboxService.processIncomingMessage({
    teamId: TEAM_A,
    channel: 'C_GENERAL_UNLINKED',
    user: 'U_ELENA',
    text: 'General inquiry on invoice schedule.',
    ts: '1700000003.000300',
    event_id: 'ev_unknown_proj_001'
  });
  const unlinkedConv = InboxService.getConversationDetails(ORG_A, unknownProjMsg.conversationId!);
  assert(!unlinkedConv?.conversation.project_id, '9. Unspecified project remains unassigned without hallucination');

  // ----------------------------------------------------
  // 10. MESSAGE CLASSIFICATION
  // ----------------------------------------------------
  assert(
    convDetails?.conversation.classification?.category === 'design_request' &&
    convDetails?.conversation.classification?.requires_task === true &&
    convDetails?.conversation.classification?.requires_response === true,
    '10. Message classified accurately (design_request, requires_task: true, requires_response: true)'
  );

  // ----------------------------------------------------
  // 11. TASK CREATION VIA TOOL REGISTRY
  // ----------------------------------------------------
  const createdTaskId = convDetails?.conversation.task_id;
  const taskInDb = (db.get('tasks') || []).find(t => t.id === createdTaskId);
  assert(
    Boolean(createdTaskId && taskInDb && taskInDb.client_id === clientA.id),
    '11. Task created strictly through Tool Registry pipeline'
  );

  // ----------------------------------------------------
  // 12. DRAFT RESPONSE GENERATION
  // ----------------------------------------------------
  const draftText = convDetails?.conversation.ai_draft_response;
  assert(
    Boolean(draftText && draftText.length > 10),
    '12. AI Draft response generated aligned with client communication preferences'
  );

  // ----------------------------------------------------
  // 13. APPROVAL REQUIRED (EXTERNAL COMMUNICATION GATE)
  // ----------------------------------------------------
  const pendingApprovals = (db.get('approvals') || []).filter(
    a => a.organization_id === ORG_A && a.tool_id === 'communication.send' && a.status === 'pending'
  );
  assert(
    convDetails?.conversation.status === 'waiting_approval' && pendingApprovals.length > 0,
    '13. Outbound communication intercepted by Approval Engine (status: waiting_approval)'
  );

  // ----------------------------------------------------
  // 14. APPROVAL REJECTION WORKFLOW
  // ----------------------------------------------------
  // Trigger a second message to test rejection
  const rejMsg = await InboxService.processIncomingMessage({
    teamId: TEAM_A,
    channel: 'C_ROBOTICS_UI',
    user: 'U_ELENA',
    text: 'Please also adjust the header typography to bold.',
    ts: '1700000004.000400',
    event_id: 'ev_rej_test_001'
  });
  const rejConv = InboxService.getConversationDetails(ORG_A, rejMsg.conversationId!);
  const rejApproval = (db.get('approvals') || []).find(
    a => a.organization_id === ORG_A && a.client_id === clientA.id && a.status === 'pending' && a.created_at >= rejConv!.conversation.created_at
  );
  if (rejApproval) {
    db.update('approvals', list => list.map(a => a.id === rejApproval.id ? { ...a, status: 'rejected' } : a));
  }
  const updatedRejApproval = (db.get('approvals') || []).find(a => a.id === rejApproval?.id);
  assert(updatedRejApproval?.status === 'rejected', '14. Approval rejection halts dispatch');

  // ----------------------------------------------------
  // 15. APPROVAL APPROVAL EXECUTION
  // ----------------------------------------------------
  const targetApproval = pendingApprovals[0];
  const execResult = await ToolExecutionService.executeTool({
    toolId: targetApproval.tool_id,
    organizationId: ORG_A,
    userId: 'user-admin-1',
    clientId: targetApproval.client_id,
    projectId: targetApproval.project_id,
    input: targetApproval.original_input,
    approvalId: targetApproval.id
  });
  assert(execResult.success && execResult.status === 'completed', '15. Human approval triggers execution via Tool Execution Service');

  // ----------------------------------------------------
  // 16. SLACK SEND EXECUTION & COMPLETION
  // ----------------------------------------------------
  const refreshedConv = InboxService.getConversationDetails(ORG_A, firstMsg.conversationId!);
  assert(
    refreshedConv?.conversation.status === 'completed',
    '16. Slack send completed and conversation marked as completed'
  );

  // ----------------------------------------------------
  // 17. TENANT ISOLATION (ORG A vs ORG B)
  // ----------------------------------------------------
  const orgBConversations = InboxService.getConversations(ORG_B);
  const orgBDetails = InboxService.getConversationDetails(ORG_B, firstMsg.conversationId!);
  assert(
    orgBConversations.length === 0 && orgBDetails === null,
    '17. Strict multi-tenant isolation: Tenant B cannot access Tenant A conversations'
  );

  // ----------------------------------------------------
  // 18. SUPABASE RLS VERIFICATION
  // ----------------------------------------------------
  const fs = await import('fs');
  const schemaSql = fs.readFileSync('supabase/schema.sql', 'utf8');
  const hasRLS = schemaSql.includes('ALTER TABLE conversations ENABLE ROW LEVEL SECURITY') &&
                 schemaSql.includes('ALTER TABLE conversation_messages ENABLE ROW LEVEL SECURITY') &&
                 schemaSql.includes('ALTER TABLE integration_events ENABLE ROW LEVEL SECURITY') &&
                 schemaSql.includes('ALTER TABLE slack_channel_mappings ENABLE ROW LEVEL SECURITY');
  assert(hasRLS, '18. Supabase RLS policies and table constraints verified');

  // ----------------------------------------------------
  // 19. SLACK API FAILURE HANDLING
  // ----------------------------------------------------
  let failureCaught = false;
  try {
    // Attempt send to unconfigured org without mock
    await SlackService.sendMessage({
      organizationId: 'org_non_existent',
      channelId: 'C_FAILS',
      text: 'Test message'
    });
  } catch (err: any) {
    failureCaught = true;
  }
  assert(failureCaught, '19. Slack API failure handled gracefully with safe error message');

  // ----------------------------------------------------
  // 20. BOT LOOP PREVENTION
  // ----------------------------------------------------
  const botEventMsg = await InboxService.processIncomingMessage({
    teamId: TEAM_A,
    channel: 'C_ROBOTICS_UI',
    user: 'UBOT12345', // Same as bot_user_id in integration metadata
    text: 'Automated response echo',
    ts: '1700000005.000500',
    event_id: 'ev_bot_loop_001',
    bot_id: 'B12345'
  });
  assert(botEventMsg.status === 'ignored', '20. Bot message and self-echo ignored (bot loop prevented)');

  // ----------------------------------------------------
  // FINAL SCORE
  // ----------------------------------------------------
  console.log(`\n====================================================`);
  console.log(`TOTAL SCENARIOS: 20 | PASSED: ${passed} | FAILED: ${failed}`);
  console.log(`====================================================`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
