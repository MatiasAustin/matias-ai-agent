export type NavigationTab = 
  | 'Dashboard' 
  | 'Clients' 
  | 'Projects' 
  | 'Tasks' 
  | 'Agents' 
  | 'Memory' 
  | 'Documents' 
  | 'Approvals' 
  | 'Activity'
  | 'Settings'
  | 'Super Admin';

export type AIStatusType = 
  | 'online' 
  | 'working' 
  | 'waiting' 
  | 'attention';

export interface AIStatusState {
  type: AIStatusType;
  label: string;
  subtext?: string;
  currentTask?: string;
}

export interface ActivityItem {
  id: string;
  time: string;
  agent: string;
  action: string;
  client?: string;
  detail?: string;
  badge?: string;
  type?: 'research' | 'memory' | 'design' | 'comms' | 'system';
}

export interface ApprovalItem {
  id: string;
  title: string;
  proposedAction: string;
  client: string;
  project: string;
  reason: string;
  previewContent?: string;
  confidence: number;
  time: string;
  status: 'pending' | 'approved' | 'rejected' | 'edited';
}

export interface Client {
  id: string;
  name: string;
  industry: string;
  currentProject: string;
  status: 'Active' | 'Review' | 'Onboarding' | 'Archived';
  lastActivity: string;
  aiMemoryStatus: 'Synced' | 'Indexing' | 'Up to date';
  metrics: {
    activeDeliverables: number;
    memoryNodes: number;
    studioHoursSaved: string;
  };
  brandPersonality: string[];
  communicationStyle: string[];
  visualLanguage: string[];
  recentWorkspaces: string[];
}

export interface Project {
  id: string;
  title: string;
  client: string;
  status: 'In Progress' | 'Client Review' | 'Discovery' | 'Completed';
  deadline: string;
  currentTask: string;
  recentActivity: string;
  progress: number;
  assignedAgents: string[];
}

export interface Task {
  id: string;
  title: string;
  client: string;
  project: string;
  agent: string;
  status: 'Running' | 'Queued' | 'Awaiting Feedback' | 'Done';
  priority: 'Urgent' | 'High' | 'Normal';
  deadline: string;
}

export interface AgentInfo {
  id: string;
  name: string;
  role: string;
  status: 'Active' | 'Standby' | 'Processing';
  currentAction: string;
  memoryLoaded: string;
  efficiency: string;
}

export interface MemoryCategory {
  id: string;
  client: string;
  category: string;
  items: {
    label: string;
    values: string[];
    confidence: number;
    source: string;
  }[];
}
