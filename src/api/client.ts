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
  MemoryStatus
} from '../../server/db/types';
import { CreateClientPayload } from '../../server/services/clientService';
import { ClientContextPayload } from '../../server/services/contextService';

const API_BASE = '/api';

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      'x-actor-id': 'Matias',
      ...(options?.headers || {})
    },
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

  // Reset seed (dev only)
  resetSeed: () => request<{ status: string }>('/seed/reset', { method: 'POST' })
};
