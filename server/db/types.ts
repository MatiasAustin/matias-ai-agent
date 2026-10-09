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

export interface ClientRecord {
  id: string;
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
  client_id: string;
  permissions: ClientPermissions;
  updated_at: string;
}

export interface ActivityRecord {
  id: string;
  client_id: string;
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

export interface DatabaseSchema {
  clients: ClientRecord[];
  contacts: ContactRecord[];
  projects: ProjectRecord[];
  tasks: TaskRecord[];
  client_memory: ClientMemoryRecord[];
  documents: DocumentRecord[];
  client_permissions: ClientPermissionsRecord[];
  activities: ActivityRecord[];
}
