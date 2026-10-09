export type PlatformRole = 'SUPER_ADMIN' | 'USER';

export type OrganizationRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';

export type OrganizationStatus = 'active' | 'suspended' | 'trial' | 'cancelled';

export type OrganizationPlan = 'Free' | 'Pro' | 'Studio' | 'Enterprise';

export type UserStatus = 'active' | 'suspended';

export type MemoryStatus = 'OFFICIAL' | 'APPROVED' | 'OBSERVED' | 'TEMPORARY';

export type MemoryCategory = 
  | 'Business' 
  | 'Positioning' 
  | 'Audience' 
  | 'Brand' 
  | 'Visual' 
  | 'Communication' 
  | 'Preferences' 
  | 'Workflow' 
  | 'Commercial' 
  | 'Restrictions' 
  | 'Observations';

export type DocumentCategory = 
  | 'Brand' 
  | 'Brief' 
  | 'Reference' 
  | 'Contract' 
  | 'Quotation' 
  | 'Invoice' 
  | 'MOU' 
  | 'Project' 
  | 'Other';

export type DocumentStatus = 'uploaded' | 'processing' | 'indexed' | 'failed';

export type TaskStatus = 
  | 'queued' 
  | 'planning' 
  | 'running' 
  | 'waiting_approval' 
  | 'completed' 
  | 'failed' 
  | 'cancelled';

export type TaskPriority = 'low' | 'normal' | 'high' | 'urgent';

export type ProjectStatus = 'queued' | 'planning' | 'in_progress' | 'review' | 'completed' | 'on_hold';

export type PermissionLevel = 'allowed' | 'approval_required' | 'disabled';

export interface ClientPermissions {
  read_client_messages: PermissionLevel;
  read_project_files: PermissionLevel;
  read_brand_guidelines: PermissionLevel;
  create_tasks: PermissionLevel;
  update_tasks: PermissionLevel;
  create_documents: PermissionLevel;
  draft_client_messages: PermissionLevel;
  send_client_messages: PermissionLevel;
  modify_client_memory: PermissionLevel;
  publish_design: PermissionLevel;
  send_invoice: PermissionLevel;
  send_quotation: PermissionLevel;
}

export interface UserRecord {
  id: string;
  email: string;
  password_hash: string;
  password_salt: string;
  name: string;
  platform_role: PlatformRole;
  status: UserStatus;
  last_active_at: string;
  created_at: string;
  updated_at: string;
}

export interface OrganizationRecord {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  status: OrganizationStatus;
  plan: OrganizationPlan;
  subscription_status?: string;
  trial_ends_at?: string;
  billing_customer_id?: string;
  subscription_id?: string;
  created_at: string;
  updated_at: string;
}

export interface OrganizationMemberRecord {
  id: string;
  organization_id: string;
  user_id: string;
  role: OrganizationRole;
  created_at: string;
  updated_at: string;
}

export interface SessionRecord {
  id: string;
  token: string;
  user_id: string;
  active_organization_id: string;
  expires_at: string;
  created_at: string;
}

export interface InvitationRecord {
  id: string;
  organization_id: string;
  email: string;
  role: OrganizationRole;
  invited_by_user_id: string;
  status: 'pending' | 'accepted' | 'revoked';
  created_at: string;
}

export interface FeatureFlagRecord {
  id: string;
  organization_id?: string; // null or undefined indicates global flag
  key: string;
  enabled: boolean;
  description?: string;
  updated_at: string;
}

export interface ClientRecord {
  id: string;
  organization_id: string;
  company_name: string;
  website?: string;
  industry: string;
  company_size?: string;
  location?: string;
  timezone?: string;
  company_description?: string;
  status: 'active' | 'review' | 'onboarding' | 'archived';
  // Business Context
  business_model?: string;
  target_audience?: string;
  primary_market?: string;
  positioning?: string;
  value_proposition?: string;
  main_products?: string;
  competitors?: string;
  business_goals?: string;
  // Communication
  preferred_channel?: string;
  communication_tone?: string;
  response_style?: string;
  working_hours?: string;
  approval_process?: string;
  who_can_approve?: string;
  important_communication_notes?: string;
  // Commercial
  currency?: string;
  default_rate?: string;
  day_rate?: string;
  hourly_rate?: string;
  payment_terms?: string;
  invoice_notes?: string;
  contract_notes?: string;
  quotation_settings?: string;
  invoice_settings?: string;
  mou_settings?: string;
  created_at: string;
  updated_at: string;
}

export interface ContactRecord {
  id: string;
  organization_id: string;
  client_id: string;
  name: string;
  role: string;
  email: string;
  phone?: string;
  preferred_channel?: string;
  is_primary_contact: boolean;
  created_at: string;
}

export interface ProjectRecord {
  project_id: string;
  organization_id: string;
  client_id: string;
  project_name: string;
  project_type: string;
  description: string;
  status: ProjectStatus;
  deadline: string;
  priority: TaskPriority;
  estimated_budget?: string;
  project_notes?: string;
  progress: number;
  assigned_agents: string[];
  created_at: string;
  updated_at: string;
}

export interface TaskRecord {
  id: string;
  organization_id: string;
  client_id: string;
  project_id?: string;
  title: string;
  description?: string;
  assigned_agent?: string;
  status: TaskStatus;
  priority: TaskPriority;
  deadline?: string;
  created_at: string;
  updated_at: string;
}

export interface ClientMemoryRecord {
  id: string;
  organization_id: string;
  client_id: string;
  category: MemoryCategory;
  key: string;
  value: string;
  status: MemoryStatus;
  confidence?: 'High' | 'Medium' | 'Low';
  source_type: string;
  source_id: string;
  reason_context?: string;
  created_at: string;
  updated_at: string;
  archived?: boolean;
}

export interface DocumentRecord {
  file_id: string;
  organization_id: string;
  client_id: string;
  project_id?: string;
  category: DocumentCategory;
  filename: string;
  file_size?: string;
  uploaded_at: string;
  uploaded_by: string;
  status: DocumentStatus;
  notes?: string;
}

export interface ClientPermissionsRecord {
  id: string;
  organization_id: string;
  client_id: string;
  permissions: ClientPermissions;
  updated_at: string;
}

export interface ActivityRecord {
  id: string;
  organization_id?: string;
  client_id?: string;
  project_id?: string;
  actor_type: 'user' | 'agent' | 'system';
  actor_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  result?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

// ==========================================
// TOOL REGISTRY & EXECUTION TYPES
// ==========================================

export type ToolCategory =
  | 'communication'
  | 'design'
  | 'project_management'
  | 'documents'
  | 'research'
  | 'storage'
  | 'system'
  | 'business';

export type ToolRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface ToolDefinition {
  id: string;
  name: string;
  provider: string; // e.g. 'core'
  description: string;
  category: ToolCategory;
  version: string;
  risk_level: ToolRiskLevel;
  requires_approval: boolean;
  enabled: boolean;
  input_schema: Record<string, any>;
  output_schema: Record<string, any>;
  required_permissions: string[];
}

export interface AgentRecord {
  id: string;
  organization_id: string;
  name: string;
  role: string;
  description: string;
  status: 'Active' | 'Standby' | 'Processing';
  created_at: string;
  updated_at: string;
}

export interface AgentToolRecord {
  id: string;
  organization_id: string;
  agent_id: string;
  tool_id: string;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface AgentPermissionRecord {
  id: string;
  organization_id: string;
  agent_id: string;
  permission: string;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export type ApprovalStatus = 
  | 'pending' 
  | 'approved' 
  | 'rejected' 
  | 'expired' 
  | 'cancelled' 
  | 'executed' 
  | 'failed';

export interface ApprovalRecord {
  id: string;
  organization_id: string;
  client_id?: string;
  project_id?: string;
  requested_by_type: 'user' | 'agent';
  requested_by_id: string;
  tool_id: string;
  risk_level: ToolRiskLevel;
  status: ApprovalStatus;
  original_input: Record<string, any>;
  approved_input?: Record<string, any>;
  reason: string;
  reviewed_by?: string;
  reviewed_at?: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

export type ToolExecutionStatus = 
  | 'queued' 
  | 'running' 
  | 'waiting_approval' 
  | 'completed' 
  | 'failed' 
  | 'cancelled';

export interface ToolExecutionRecord {
  id: string;
  organization_id: string;
  tool_id: string;
  agent_id?: string;
  user_id: string;
  client_id?: string;
  project_id?: string;
  approval_id?: string;
  risk_level: ToolRiskLevel;
  status: ToolExecutionStatus;
  input: Record<string, any>;
  output?: Record<string, any>;
  error?: {
    code: string;
    message: string;
  };
  idempotency_key?: string;
  started_at?: string;
  completed_at?: string;
  created_at: string;
}

export interface OrgGovernancePolicy {
  id: string;
  organization_id: string;
  official_truth_gate: boolean;
  external_communication_gate: boolean;
  design_publishing_gate: boolean;
  commercial_budget_enforcement: boolean;
  updated_at: string;
}

// ==========================================
// INTEGRATIONS & INBOX (SLACK V1)
// ==========================================
export type IntegrationProvider = 'slack';
export type IntegrationStatus = 'connected' | 'disconnected' | 'error' | 'pending';

export interface IntegrationRecord {
  id: string;
  organization_id: string;
  provider: IntegrationProvider;
  status: IntegrationStatus;
  display_name: string;
  external_account_id?: string; // Slack team ID
  encrypted_access_token?: string; // encrypted server-side
  encrypted_bot_token?: string; // encrypted server-side
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export type ConversationStatus = 
  | 'new' 
  | 'processing' 
  | 'needs_client' 
  | 'needs_project' 
  | 'ai_draft' 
  | 'waiting_approval' 
  | 'completed' 
  | 'archived';

export interface ConversationClassification {
  category: 
    | 'design_request' 
    | 'revision_request' 
    | 'question' 
    | 'feedback' 
    | 'approval' 
    | 'status_request' 
    | 'new_project' 
    | 'billing' 
    | 'general' 
    | 'unknown';
  urgency: 'low' | 'normal' | 'high';
  requires_task: boolean;
  requires_response: boolean;
  requires_human: boolean;
  reason: string;
}

export interface ConversationRecord {
  id: string;
  organization_id: string;
  client_id?: string;
  project_id?: string;
  integration_id?: string;
  external_channel_id?: string;
  external_thread_id?: string;
  title: string;
  status: ConversationStatus;
  classification?: ConversationClassification;
  ai_draft_response?: string;
  task_id?: string;
  created_at: string;
  updated_at: string;
}

export type MessageSenderType = 'user' | 'assistant' | 'system' | 'bot';

export interface ConversationMessageRecord {
  id: string;
  conversation_id: string;
  organization_id: string;
  external_message_id?: string;
  sender_type: MessageSenderType;
  external_sender_id?: string;
  sender_name: string;
  content: string;
  message_type: 'user' | 'assistant' | 'system' | 'bot';
  metadata?: Record<string, any>;
  created_at: string;
}

export interface IntegrationEventRecord {
  id: string;
  organization_id: string;
  integration_id?: string;
  external_event_id: string; // Slack event_id for idempotency
  event_type: string;
  payload: Record<string, any>;
  status: 'received' | 'processing' | 'processed' | 'failed' | 'ignored';
  processed_at?: string;
  error?: string;
  created_at: string;
}

export interface SlackChannelMappingRecord {
  id: string;
  organization_id: string;
  integration_id: string;
  channel_id: string;
  channel_name: string;
  client_id?: string;
  project_id?: string;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClientCommunicationLinkRecord {
  id: string;
  organization_id: string;
  client_id: string;
  integration_id: string;
  external_user_id?: string;
  external_channel_id?: string;
  confidence: number;
  created_at: string;
}

export interface ProjectCommunicationLinkRecord {
  id: string;
  organization_id: string;
  project_id: string;
  integration_id: string;
  external_channel_id: string;
  created_at: string;
}

export interface DatabaseSchema {
  users: UserRecord[];
  organizations: OrganizationRecord[];
  organization_members: OrganizationMemberRecord[];
  sessions: SessionRecord[];
  invitations: InvitationRecord[];
  feature_flags: FeatureFlagRecord[];
  clients: ClientRecord[];
  contacts: ContactRecord[];
  projects: ProjectRecord[];
  tasks: TaskRecord[];
  client_memory: ClientMemoryRecord[];
  documents: DocumentRecord[];
  client_permissions: ClientPermissionsRecord[];
  activities: ActivityRecord[];
  tools: ToolDefinition[];
  agents: AgentRecord[];
  agent_tools: AgentToolRecord[];
  agent_permissions: AgentPermissionRecord[];
  approvals: ApprovalRecord[];
  tool_executions: ToolExecutionRecord[];
  governance_policies: OrgGovernancePolicy[];
  integrations: IntegrationRecord[];
  conversations: ConversationRecord[];
  conversation_messages: ConversationMessageRecord[];
  integration_events: IntegrationEventRecord[];
  slack_channel_mappings: SlackChannelMappingRecord[];
  client_communication_links: ClientCommunicationLinkRecord[];
  project_communication_links: ProjectCommunicationLinkRecord[];
}

