import { ToolDefinition, ToolCategory, ToolRiskLevel } from '../db/types';
import { db } from '../db/database';

export type ToolExecutor = (context: {
  organizationId: string;
  userId: string;
  clientId?: string;
  projectId?: string;
  input: Record<string, any>;
}) => Promise<any> | any;

export interface RegisteredTool extends ToolDefinition {
  executor?: ToolExecutor;
}

export class ToolRegistryService {
  private static registeredTools: Map<string, RegisteredTool> = new Map();
  private static initialized: boolean = false;

  public static initialize(): void {
    if (this.initialized) return;

    // Register all initial tools defined in the specification
    const initialDefinitions: RegisteredTool[] = [
      // ----------------------------------------------------
      // LOW RISK (Read-only operations)
      // ----------------------------------------------------
      {
        id: 'system.get_current_user',
        name: 'Get Current User',
        provider: 'core',
        description: 'Retrieves current authenticated user profile and permissions.',
        category: 'system',
        version: '1.0.0',
        risk_level: 'LOW',
        requires_approval: false,
        enabled: true,
        input_schema: { type: 'object', properties: {} },
        output_schema: { type: 'object', properties: { user: { type: 'object' } } },
        required_permissions: ['system:read']
      },
      {
        id: 'system.get_current_organization',
        name: 'Get Current Organization',
        provider: 'core',
        description: 'Retrieves current active organization context and plan tier.',
        category: 'system',
        version: '1.0.0',
        risk_level: 'LOW',
        requires_approval: false,
        enabled: true,
        input_schema: { type: 'object', properties: {} },
        output_schema: { type: 'object', properties: { organization: { type: 'object' } } },
        required_permissions: ['system:read']
      },
      {
        id: 'clients.read',
        name: 'Read Client Information',
        provider: 'core',
        description: 'Retrieves client profile, contacts, and metadata.',
        category: 'business',
        version: '1.0.0',
        risk_level: 'LOW',
        requires_approval: false,
        enabled: true,
        input_schema: { type: 'object', properties: { clientId: { type: 'string' } } },
        output_schema: { type: 'object', properties: { client: { type: 'object' } } },
        required_permissions: ['clients.read']
      },
      {
        id: 'projects.read',
        name: 'Read Project Portfolio',
        provider: 'core',
        description: 'Retrieves projects, deliverables, milestones, and progress.',
        category: 'project_management',
        version: '1.0.0',
        risk_level: 'LOW',
        requires_approval: false,
        enabled: true,
        input_schema: { type: 'object', properties: { projectId: { type: 'string' }, clientId: { type: 'string' } } },
        output_schema: { type: 'object', properties: { projects: { type: 'array' } } },
        required_permissions: ['projects.read']
      },
      {
        id: 'tasks.read',
        name: 'Read Studio Tasks',
        provider: 'core',
        description: 'Queries active, queued, or completed tasks for a project or client.',
        category: 'project_management',
        version: '1.0.0',
        risk_level: 'LOW',
        requires_approval: false,
        enabled: true,
        input_schema: { type: 'object', properties: { taskId: { type: 'string' }, projectId: { type: 'string' } } },
        output_schema: { type: 'object', properties: { tasks: { type: 'array' } } },
        required_permissions: ['tasks.read']
      },
      {
        id: 'memory.read',
        name: 'Query Client Memory',
        provider: 'core',
        description: 'Retrieves authoritative and observed client knowledge nodes.',
        category: 'research',
        version: '1.0.0',
        risk_level: 'LOW',
        requires_approval: false,
        enabled: true,
        input_schema: { type: 'object', properties: { clientId: { type: 'string' }, category: { type: 'string' } } },
        output_schema: { type: 'object', properties: { memories: { type: 'array' } } },
        required_permissions: ['memory.read']
      },
      {
        id: 'documents.read',
        name: 'Read Studio Documents',
        provider: 'core',
        description: 'Retrieves indexed documents, briefs, and brand assets.',
        category: 'documents',
        version: '1.0.0',
        risk_level: 'LOW',
        requires_approval: false,
        enabled: true,
        input_schema: { type: 'object', properties: { documentId: { type: 'string' }, clientId: { type: 'string' } } },
        output_schema: { type: 'object', properties: { documents: { type: 'array' } } },
        required_permissions: ['documents.read']
      },
      {
        id: 'communication.read',
        name: 'Read Slack Channel Communication',
        provider: 'slack',
        description: 'Retrieves messages and conversation history from a connected Slack channel.',
        category: 'communication',
        version: '1.0.0',
        risk_level: 'LOW',
        requires_approval: false,
        enabled: true,
        input_schema: {
          type: 'object',
          required: ['channel_id'],
          properties: {
            channel_id: { type: 'string' },
            limit: { type: 'number' }
          }
        },
        output_schema: {
          type: 'object',
          properties: {
            messages: { type: 'array' }
          }
        },
        required_permissions: ['communication.read']
      },

      // ----------------------------------------------------
      // MEDIUM RISK (Internal mutations with reversible effects)
      // ----------------------------------------------------
      {
        id: 'clients.create',
        name: 'Create Client Workspace',
        provider: 'core',
        description: 'Initializes a new client workspace with identity and contacts.',
        category: 'business',
        version: '1.0.0',
        risk_level: 'MEDIUM',
        requires_approval: false,
        enabled: true,
        input_schema: {
          type: 'object',
          required: ['company_name', 'industry'],
          properties: {
            company_name: { type: 'string' },
            industry: { type: 'string' },
            website: { type: 'string' }
          }
        },
        output_schema: { type: 'object', properties: { client: { type: 'object' } } },
        required_permissions: ['clients.create']
      },
      {
        id: 'projects.create',
        name: 'Create Studio Project',
        provider: 'core',
        description: 'Creates a project container for client deliverables.',
        category: 'project_management',
        version: '1.0.0',
        risk_level: 'MEDIUM',
        requires_approval: false,
        enabled: true,
        input_schema: {
          type: 'object',
          required: ['client_id', 'project_name', 'project_type', 'deadline'],
          properties: {
            client_id: { type: 'string' },
            project_name: { type: 'string' },
            project_type: { type: 'string' },
            deadline: { type: 'string' }
          }
        },
        output_schema: { type: 'object', properties: { project: { type: 'object' } } },
        required_permissions: ['projects.create']
      },
      {
        id: 'tasks.create',
        name: 'Create Task',
        provider: 'core',
        description: 'Dispatches a new task into the studio execution queue.',
        category: 'project_management',
        version: '1.0.0',
        risk_level: 'MEDIUM',
        requires_approval: false,
        enabled: true,
        input_schema: {
          type: 'object',
          required: ['client_id', 'title'],
          properties: {
            client_id: { type: 'string' },
            project_id: { type: 'string' },
            title: { type: 'string' },
            assigned_agent: { type: 'string' }
          }
        },
        output_schema: { type: 'object', properties: { task: { type: 'object' } } },
        required_permissions: ['tasks.create']
      },
      {
        id: 'tasks.update',
        name: 'Update Task Status',
        provider: 'core',
        description: 'Modifies status, priority, or notes of an existing task.',
        category: 'project_management',
        version: '1.0.0',
        risk_level: 'MEDIUM',
        requires_approval: false,
        enabled: true,
        input_schema: {
          type: 'object',
          required: ['taskId'],
          properties: {
            taskId: { type: 'string' },
            status: { type: 'string' },
            priority: { type: 'string' }
          }
        },
        output_schema: { type: 'object', properties: { task: { type: 'object' } } },
        required_permissions: ['tasks.update']
      },
      {
        id: 'memory.create',
        name: 'Store Client Memory Node',
        provider: 'core',
        description: 'Adds an observed knowledge node or fact to client memory.',
        category: 'research',
        version: '1.0.0',
        risk_level: 'MEDIUM',
        requires_approval: false,
        enabled: true,
        input_schema: {
          type: 'object',
          required: ['client_id', 'category', 'key', 'value'],
          properties: {
            client_id: { type: 'string' },
            category: { type: 'string' },
            key: { type: 'string' },
            value: { type: 'string' }
          }
        },
        output_schema: { type: 'object', properties: { memory: { type: 'object' } } },
        required_permissions: ['memory.create']
      },
      {
        id: 'memory.update',
        name: 'Update Client Memory Node',
        provider: 'core',
        description: 'Updates values or confidence score of an existing memory item.',
        category: 'research',
        version: '1.0.0',
        risk_level: 'MEDIUM',
        requires_approval: false,
        enabled: true,
        input_schema: {
          type: 'object',
          required: ['memoryId'],
          properties: {
            memoryId: { type: 'string' },
            value: { type: 'string' }
          }
        },
        output_schema: { type: 'object', properties: { memory: { type: 'object' } } },
        required_permissions: ['memory.update']
      },
      {
        id: 'documents.create',
        name: 'Register Studio Document',
        provider: 'core',
        description: 'Registers uploaded asset or extracted file metadata.',
        category: 'documents',
        version: '1.0.0',
        risk_level: 'MEDIUM',
        requires_approval: false,
        enabled: true,
        input_schema: {
          type: 'object',
          required: ['client_id', 'filename', 'category'],
          properties: {
            client_id: { type: 'string' },
            filename: { type: 'string' },
            category: { type: 'string' }
          }
        },
        output_schema: { type: 'object', properties: { document: { type: 'object' } } },
        required_permissions: ['documents.create']
      },

      // ----------------------------------------------------
      // HIGH RISK (External communication, publishing, commercial, official truth)
      // ----------------------------------------------------
      {
        id: 'memory.approve',
        name: 'Approve Official Memory',
        provider: 'core',
        description: 'Elevates observed knowledge into official authoritative studio truth.',
        category: 'research',
        version: '1.0.0',
        risk_level: 'HIGH',
        requires_approval: true,
        enabled: true,
        input_schema: {
          type: 'object',
          required: ['memoryId'],
          properties: {
            memoryId: { type: 'string' }
          }
        },
        output_schema: { type: 'object', properties: { approved: { type: 'boolean' } } },
        required_permissions: ['memory.approve']
      },
      {
        id: 'client.update',
        name: 'Update Client Profile',
        provider: 'core',
        description: 'Modifies top-level client identity and strategic business positioning.',
        category: 'business',
        version: '1.0.0',
        risk_level: 'HIGH',
        requires_approval: true,
        enabled: true,
        input_schema: {
          type: 'object',
          required: ['clientId'],
          properties: {
            clientId: { type: 'string' },
            updates: { type: 'object' }
          }
        },
        output_schema: { type: 'object', properties: { client: { type: 'object' } } },
        required_permissions: ['clients.update']
      },
      {
        id: 'clients.update',
        name: 'Update Client Profile (Alias)',
        provider: 'core',
        description: 'Modifies client profile records and settings.',
        category: 'business',
        version: '1.0.0',
        risk_level: 'HIGH',
        requires_approval: true,
        enabled: true,
        input_schema: {
          type: 'object',
          required: ['clientId'],
          properties: {
            clientId: { type: 'string' },
            updates: { type: 'object' }
          }
        },
        output_schema: { type: 'object', properties: { client: { type: 'object' } } },
        required_permissions: ['clients.update']
      },
      {
        id: 'document.publish',
        name: 'Publish Deliverable Document',
        provider: 'core',
        description: 'Publishes finalized brand assets, pitch decks, or specifications.',
        category: 'documents',
        version: '1.0.0',
        risk_level: 'HIGH',
        requires_approval: true,
        enabled: true,
        input_schema: {
          type: 'object',
          required: ['documentId'],
          properties: {
            documentId: { type: 'string' },
            distribution: { type: 'string' }
          }
        },
        output_schema: { type: 'object', properties: { published: { type: 'boolean' } } },
        required_permissions: ['documents.publish']
      },
      {
        id: 'communication.send',
        name: 'Send Slack Message',
        provider: 'slack',
        description: 'Dispatches message to client communication channel via Slack Web API.',
        category: 'communication',
        version: '1.0.0',
        risk_level: 'HIGH',
        requires_approval: true,
        enabled: true,
        input_schema: {
          type: 'object',
          required: ['message'],
          properties: {
            channel_id: { type: 'string' },
            channel: { type: 'string' },
            thread_ts: { type: 'string' },
            message: { type: 'string' },
            clientId: { type: 'string' },
            recipient: { type: 'string' }
          }
        },
        output_schema: {
          type: 'object',
          properties: {
            sent: { type: 'boolean' },
            external_message_id: { type: 'string' },
            channel_id: { type: 'string' },
            timestamp: { type: 'string' }
          }
        },
        required_permissions: ['communication.send']
      },
      {
        id: 'figma.publish',
        name: 'Publish Figma Design Tokens',
        provider: 'core',
        description: 'Exports and publishes design tokens directly to remote Figma files.',
        category: 'design',
        version: '1.0.0',
        risk_level: 'HIGH',
        requires_approval: true,
        enabled: true,
        input_schema: {
          type: 'object',
          required: ['fileKey', 'tokens'],
          properties: {
            fileKey: { type: 'string' },
            tokens: { type: 'object' }
          }
        },
        output_schema: { type: 'object', properties: { synced: { type: 'boolean' } } },
        required_permissions: ['design.publish']
      },
      {
        id: 'invoice.send',
        name: 'Issue Commercial Invoice',
        provider: 'core',
        description: 'Generates and transmits commercial invoice to client billing contact.',
        category: 'business',
        version: '1.0.0',
        risk_level: 'HIGH',
        requires_approval: true,
        enabled: true,
        input_schema: {
          type: 'object',
          required: ['clientId', 'amount', 'currency'],
          properties: {
            clientId: { type: 'string' },
            amount: { type: 'number' },
            currency: { type: 'string' }
          }
        },
        output_schema: { type: 'object', properties: { invoiceId: { type: 'string' }, sent: { type: 'boolean' } } },
        required_permissions: ['billing.manage']
      },
      {
        id: 'quotation.send',
        name: 'Send Commercial Quotation',
        provider: 'core',
        description: 'Submits formal fee quotation or project estimate to client.',
        category: 'business',
        version: '1.0.0',
        risk_level: 'HIGH',
        requires_approval: true,
        enabled: true,
        input_schema: {
          type: 'object',
          required: ['clientId', 'estimatedAmount'],
          properties: {
            clientId: { type: 'string' },
            estimatedAmount: { type: 'number' }
          }
        },
        output_schema: { type: 'object', properties: { quoteId: { type: 'string' }, sent: { type: 'boolean' } } },
        required_permissions: ['billing.manage']
      },

      // ----------------------------------------------------
      // CRITICAL RISK (Security, credentials, tenant deletion)
      // ----------------------------------------------------
      {
        id: 'organization.delete',
        name: 'Delete Studio Organization',
        provider: 'core',
        description: 'Permanently deletes organization tenant and all associated data.',
        category: 'system',
        version: '1.0.0',
        risk_level: 'CRITICAL',
        requires_approval: true,
        enabled: true,
        input_schema: {
          type: 'object',
          required: ['organizationId', 'confirmSlug'],
          properties: {
            organizationId: { type: 'string' },
            confirmSlug: { type: 'string' }
          }
        },
        output_schema: { type: 'object', properties: { deleted: { type: 'boolean' } } },
        required_permissions: ['organization.manage']
      },
      {
        id: 'user.delete',
        name: 'Delete Organization User',
        provider: 'core',
        description: 'Revokes user access and deletes account credentials.',
        category: 'system',
        version: '1.0.0',
        risk_level: 'CRITICAL',
        requires_approval: true,
        enabled: true,
        input_schema: {
          type: 'object',
          required: ['targetUserId'],
          properties: {
            targetUserId: { type: 'string' }
          }
        },
        output_schema: { type: 'object', properties: { deleted: { type: 'boolean' } } },
        required_permissions: ['members.manage']
      },
      {
        id: 'financial_action',
        name: 'Execute Direct Financial Action',
        provider: 'core',
        description: 'Initiates debit/credit or refund transaction on studio payment gateway.',
        category: 'business',
        version: '1.0.0',
        risk_level: 'CRITICAL',
        requires_approval: true,
        enabled: true,
        input_schema: {
          type: 'object',
          required: ['actionType', 'amount'],
          properties: {
            actionType: { type: 'string' },
            amount: { type: 'number' }
          }
        },
        output_schema: { type: 'object', properties: { executed: { type: 'boolean' } } },
        required_permissions: ['billing.manage']
      },
      {
        id: 'credential_access',
        name: 'Access Vault Credentials',
        provider: 'core',
        description: 'Requests raw API tokens or third-party OAuth secrets.',
        category: 'system',
        version: '1.0.0',
        risk_level: 'CRITICAL',
        requires_approval: true,
        enabled: true,
        input_schema: {
          type: 'object',
          required: ['secretName'],
          properties: {
            secretName: { type: 'string' }
          }
        },
        output_schema: { type: 'object', properties: { retrieved: { type: 'boolean' } } },
        required_permissions: ['credential_access']
      }
    ];

    for (const tool of initialDefinitions) {
      this.registeredTools.set(tool.id, tool);
    }

    this.initialized = true;
  }

  public static registerTool(tool: RegisteredTool): void {
    this.initialize();
    this.registeredTools.set(tool.id, tool);
  }

  public static getTool(id: string): RegisteredTool | undefined {
    this.initialize();
    return this.registeredTools.get(id);
  }

  public static listTools(): ToolDefinition[] {
    this.initialize();
    return Array.from(this.registeredTools.values()).map(t => {
      const { executor, ...def } = t;
      return def;
    });
  }

  public static isToolAvailable(id: string): boolean {
    this.initialize();
    const tool = this.registeredTools.get(id);
    return Boolean(tool && tool.enabled);
  }

  public static getToolSchema(id: string): { input: Record<string, any>; output: Record<string, any> } | undefined {
    this.initialize();
    const tool = this.registeredTools.get(id);
    if (!tool) return undefined;
    return {
      input: tool.input_schema,
      output: tool.output_schema
    };
  }

  public static getToolsForAgent(agentId: string, organizationId: string): ToolDefinition[] {
    this.initialize();
    const agentTools = db.get('agent_tools').filter(
      at => at.organization_id === organizationId && at.agent_id === agentId && at.enabled
    );
    const allowedIds = new Set(agentTools.map(at => at.tool_id));
    return this.listTools().filter(t => allowedIds.has(t.id));
  }
}
