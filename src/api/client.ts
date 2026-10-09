import { 
  ClientRecord, 
  ContactRecord, 
  ProjectRecord, 
  TaskRecord, 
  ClientMemoryRecord, 
  DocumentRecord, 
  ClientPermissions, 
  ActivityRecord,
  MemoryCategory,
  MemoryStatus,
  PlatformRole,
  OrganizationRole,
  OrganizationStatus,
  OrganizationPlan,
  UserStatus,
  OrganizationRecord,
  OrganizationMemberRecord,
  InvitationRecord,
  FeatureFlagRecord,
  ToolDefinition,
  ApprovalRecord,
  ToolExecutionRecord,
  OrgGovernancePolicy
} from '../../server/db/types';
import { CreateClientPayload } from '../../server/services/clientService';
import { ClientContextPayload } from '../../server/services/contextService';

const API_BASE = '/api';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  platform_role: PlatformRole;
  status: UserStatus;
  last_active_at: string;
}

export interface UserOrganizationMembership {
  organization: OrganizationRecord;
  role: OrganizationRole;
}

export interface AuthContextResponse {
  user: AuthUser;
  organization: OrganizationRecord | null;
  role: OrganizationRole | null;
  user_organizations: UserOrganizationMembership[];
}

export interface LoginResponse extends AuthContextResponse {
  token: string;
}

export interface AdminOverview {
  total_organizations: number;
  active_organizations: number;
  suspended_organizations: number;
  total_users: number;
  active_users: number;
  recent_activities: ActivityRecord[];
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('session_token') : null;
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(options?.headers || {})
    },
    credentials: 'include',
    ...options
  });

  if (!res.ok) {
    let errMsg = `Request failed: ${res.status}`;
    try {
      const data = await res.json();
      if (data.error) errMsg = data.error;
    } catch {}
    throw new Error(errMsg);
  }

  return res.json();
}

export const api = {
  // Authentication
  login: async (credentials: { email: string; password: string }) => {
    const data = await request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
    if (data.token) {
      localStorage.setItem('session_token', data.token);
    }
    return data;
  },
  getMe: () => request<AuthContextResponse>('/auth/me'),
  switchOrg: (organization_id: string) => request<AuthContextResponse>('/auth/switch-org', {
    method: 'POST',
    body: JSON.stringify({ organization_id })
  }),
  logout: async () => {
    try {
      await request<{ status: string }>('/auth/logout', { method: 'POST' });
    } finally {
      localStorage.removeItem('session_token');
    }
  },

  // Super Admin
  getAdminOverview: () => request<AdminOverview>('/admin/overview'),
  getAdminOrganizations: () => request<OrganizationRecord[]>('/admin/organizations'),
  createAdminOrganization: (data: { name: string; slug?: string; plan?: OrganizationPlan }) =>
    request<OrganizationRecord>('/admin/organizations', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  setAdminOrganizationStatus: (id: string, status: OrganizationStatus) =>
    request<OrganizationRecord>(`/admin/organizations/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    }),
  getAdminUsers: () => request<AuthUser[]>('/admin/users'),
  createAdminUser: (data: { name: string; email: string; password: string; platform_role?: PlatformRole }) =>
    request<AuthUser>('/admin/users', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  setAdminUserStatus: (id: string, status: UserStatus) =>
    request<AuthUser>(`/admin/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    }),
  setAdminUserPlatformRole: (id: string, platform_role: PlatformRole) =>
    request<AuthUser>(`/admin/users/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ platform_role })
    }),
  getAdminActivities: (limit?: number) =>
    request<ActivityRecord[]>(`/admin/activities${limit ? `?limit=${limit}` : ''}`),
  getAdminFeatureFlags: () => request<FeatureFlagRecord[]>('/admin/flags'),

  // Organization Settings & Members
  getOrgMembers: () => request<OrganizationMemberRecord[]>('/organization/members'),
  inviteOrgMember: (data: { email: string; role: OrganizationRole }) =>
    request<InvitationRecord>('/organization/invitations', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  getOrgInvitations: () => request<InvitationRecord[]>('/organization/invitations'),
  updateOrgMemberRole: (memberId: string, role: OrganizationRole) =>
    request<OrganizationMemberRecord>(`/organization/members/${memberId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role })
    }),
  removeOrgMember: (memberId: string) =>
    request<{ success: boolean }>(`/organization/members/${memberId}`, {
      method: 'DELETE'
    }),

  // Clients
  getClients: () => request<ClientRecord[]>('/clients'),
  getClient: (id: string) => request<ClientRecord & { contacts: ContactRecord[] }>(`/clients/${id}`),
  createClient: (payload: CreateClientPayload) => request<ClientRecord>('/clients', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  updateClient: (id: string, updates: Partial<ClientRecord>) => request<ClientRecord>(`/clients/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates)
  }),

  // Client Context
  getClientContext: (clientId: string, projectId?: string) => 
    request<ClientContextPayload>(`/clients/${clientId}/context${projectId ? `?projectId=${projectId}` : ''}`),

  // Projects
  getProjects: (clientId?: string) => 
    request<ProjectRecord[]>(`/projects${clientId ? `?clientId=${clientId}` : ''}`),
  getProject: (projectId: string) => request<ProjectRecord>(`/projects/${projectId}`),
  createProject: (data: Partial<ProjectRecord> & { client_id: string; project_name: string; deadline: string }) => 
    request<ProjectRecord>('/projects', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updateProject: (projectId: string, updates: Partial<ProjectRecord>) => 
    request<ProjectRecord>(`/projects/${projectId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    }),

  // Tasks
  getTasks: (clientId?: string, projectId?: string) => {
    const params = new URLSearchParams();
    if (clientId) params.set('clientId', clientId);
    if (projectId) params.set('projectId', projectId);
    const qs = params.toString();
    return request<TaskRecord[]>(`/tasks${qs ? `?${qs}` : ''}`);
  },
  createTask: (data: { client_id: string; project_id?: string; title: string; assigned_agent?: string; priority?: string; deadline?: string; description?: string }) =>
    request<TaskRecord>('/tasks', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updateTask: (taskId: string, updates: Partial<TaskRecord>) =>
    request<TaskRecord>(`/tasks/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    }),

  // Memory
  getMemories: (clientId: string, options?: { q?: string; category?: MemoryCategory }) => {
    const params = new URLSearchParams();
    params.set('clientId', clientId);
    if (options?.q) params.set('q', options.q);
    if (options?.category) params.set('category', options.category);
    return request<ClientMemoryRecord[]>(`/memories?${params.toString()}`);
  },
  createMemory: (data: {
    client_id: string;
    category: MemoryCategory;
    key: string;
    value: string;
    status: MemoryStatus;
    confidence?: 'High' | 'Medium' | 'Low';
    source_type: string;
    source_id: string;
    reason_context?: string;
  }) => request<ClientMemoryRecord>('/memories', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateMemory: (memoryId: string, updates: Partial<ClientMemoryRecord>, allowOfficialOverwrite?: boolean) =>
    request<ClientMemoryRecord>(`/memories/${memoryId}`, {
      method: 'PATCH',
      body: JSON.stringify({ ...updates, allowOfficialOverwrite })
    }),
  approveMemory: (memoryId: string) => request<ClientMemoryRecord>(`/memories/${memoryId}/approve`, {
    method: 'POST'
  }),
  archiveMemory: (memoryId: string) => request<{ success: boolean }>(`/memories/${memoryId}/archive`, {
    method: 'POST'
  }),

  // Documents
  getDocuments: (clientId?: string, category?: string) => {
    const params = new URLSearchParams();
    if (clientId) params.set('clientId', clientId);
    if (category) params.set('category', category);
    const qs = params.toString();
    return request<DocumentRecord[]>(`/documents${qs ? `?${qs}` : ''}`);
  },
  uploadDocument: (data: {
    client_id: string;
    project_id?: string;
    category: string;
    filename: string;
    file_size?: string;
    notes?: string;
  }) => request<DocumentRecord>('/documents', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateDocumentStatus: (fileId: string, status: string) =>
    request<DocumentRecord>(`/documents/${fileId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    }),

  // Permissions
  getPermissions: (clientId: string) => request<ClientPermissions>(`/permissions/${clientId}`),
  updatePermissions: (clientId: string, updates: Partial<ClientPermissions>) =>
    request<ClientPermissions>(`/permissions/${clientId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    }),

  // Activities
  getActivities: (clientId?: string) => 
    request<ActivityRecord[]>(`/activities${clientId ? `?clientId=${clientId}` : ''}`),

  // Tools & Execution Registry
  getTools: () => request<ToolDefinition[]>('/tools'),
  executeTool: (payload: {
    toolId: string;
    clientId?: string;
    projectId?: string;
    agentId?: string;
    input?: Record<string, any>;
    idempotencyKey?: string;
  }) => request<{
    success: boolean;
    toolId: string;
    executionId: string;
    status: string;
    data?: any;
    approvalId?: string;
    errorCode?: string;
    message?: string;
  }>('/tools/execute', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),

  // Agents
  getAgents: () => request<any[]>('/agents'),
  updateAgentTools: (agentId: string, toolId: string, enabled: boolean) =>
    request<{ success: boolean; agentId: string; toolId: string; enabled: boolean }>(`/agents/${agentId}/tools`, {
      method: 'PATCH',
      body: JSON.stringify({ toolId, enabled })
    }),

  // Approvals
  getApprovals: (status?: string) => 
    request<ApprovalRecord[]>(`/approvals${status ? `?status=${status}` : ''}`),
  approveAction: (approvalId: string, editedInput?: Record<string, any>) =>
    request<{ approval: ApprovalRecord; execution: any }>(`/approvals/${approvalId}/approve`, {
      method: 'POST',
      body: JSON.stringify({ editedInput })
    }),
  rejectAction: (approvalId: string, reason?: string) =>
    request<{ success: boolean; approval: ApprovalRecord }>(`/approvals/${approvalId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    }),

  // Tool Executions
  getToolExecutions: (params?: { agentId?: string; toolId?: string; status?: string; limit?: number }) => {
    const sp = new URLSearchParams();
    if (params?.agentId) sp.set('agentId', params.agentId);
    if (params?.toolId) sp.set('toolId', params.toolId);
    if (params?.status) sp.set('status', params.status);
    if (params?.limit) sp.set('limit', params.limit.toString());
    const qs = sp.toString();
    return request<ToolExecutionRecord[]>(`/tool-executions${qs ? `?${qs}` : ''}`);
  },

  // AI Governance
  getGovernance: () => request<OrgGovernancePolicy>('/governance'),
  updateGovernance: (updates: Partial<OrgGovernancePolicy>) =>
    request<OrgGovernancePolicy>('/governance', {
      method: 'PATCH',
      body: JSON.stringify(updates)
    }),

  // Reset seed (dev only)
  resetSeed: () => request<{ status: string }>('/seed/reset', { method: 'POST' })
};
