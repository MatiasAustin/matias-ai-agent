import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Plus, 
  Edit3, 
  FileText, 
  Briefcase, 
  BrainCircuit, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  ExternalLink,
  MessageSquare, 
  SlidersHorizontal,
  ChevronRight,
  Sparkles,
  Layers,
  Lock,
  Archive,
  Check,
  AlertCircle,
  FolderGit2,
  Trash2,
  Cpu
} from 'lucide-react';
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
  TaskStatus,
  TaskPriority
} from '../../../server/db/types';
import { api } from '../../api/client';
import { CreateProjectModal } from '../modals/CreateProjectModal';
import { CreateTaskModal } from '../modals/CreateTaskModal';
import { CreateMemoryModal } from '../modals/CreateMemoryModal';
import { UploadFileModal } from '../modals/UploadFileModal';
import { EditClientModal } from '../modals/EditClientModal';

interface ClientWorkspaceViewProps {
  clientId: string;
  onBack: () => void;
  onOpenProject?: (projectId: string) => void;
}

type WorkspaceTab = 
  | 'Overview' 
  | 'Brand' 
  | 'Projects' 
  | 'Tasks' 
  | 'Memory' 
  | 'Files' 
  | 'Communication' 
  | 'Commercial' 
  | 'Activity';

const TABS: WorkspaceTab[] = [
  'Overview',
  'Brand',
  'Projects',
  'Tasks',
  'Memory',
  'Files',
  'Communication',
  'Commercial',
  'Activity'
];

export const ClientWorkspaceView: React.FC<ClientWorkspaceViewProps> = ({
  clientId,
  onBack,
  onOpenProject
}) => {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('Overview');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Loaded data
  const [client, setClient] = useState<(ClientRecord & { contacts: ContactRecord[] }) | null>(null);
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [tasks, setTasks] = useState<TaskRecord[]>([]);
  const [memories, setMemories] = useState<ClientMemoryRecord[]>([]);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [permissions, setPermissions] = useState<ClientPermissions | null>(null);
  const [activities, setActivities] = useState<ActivityRecord[]>([]);

  // Modals state
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isAddMemoryOpen, setIsAddMemoryOpen] = useState(false);
  const [isUploadFileOpen, setIsUploadFileOpen] = useState(false);
  const [isEditClientOpen, setIsEditClientOpen] = useState(false);

  // Memory filter
  const [selectedMemoryCategory, setSelectedMemoryCategory] = useState<string>('All');
  const [memorySearch, setMemorySearch] = useState<string>('');

  // Files filter
  const [selectedFileCategory, setSelectedFileCategory] = useState<string>('All');

  // Load client data
  const loadWorkspaceData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [
        clientData,
        projectsData,
        tasksData,
        memoriesData,
        docsData,
        permsData,
        activitiesData
      ] = await Promise.all([
        api.getClient(clientId),
        api.getProjects(clientId),
        api.getTasks(clientId),
        api.getMemories(clientId),
        api.getDocuments(clientId),
        api.getPermissions(clientId),
        api.getActivities(clientId)
      ]);

      setClient(clientData);
      setProjects(projectsData);
      setTasks(tasksData);
      setMemories(memoriesData);
      setDocuments(docsData);
      setPermissions(permsData);
      setActivities(activitiesData);
    } catch (err: any) {
      setError(err.message || 'Failed to load client workspace');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWorkspaceData();
  }, [clientId]);

  // Handlers for mutations
  const handleCreateProject = async (data: any) => {
    await api.createProject({ ...data, client_id: clientId });
    await loadWorkspaceData();
  };

  const handleCreateTask = async (data: any) => {
    await api.createTask({ ...data, client_id: clientId });
    await loadWorkspaceData();
  };

  const handleCreateMemory = async (data: any) => {
    await api.createMemory(data);
    await loadWorkspaceData();
  };

  const handleUploadFile = async (data: any) => {
    await api.uploadDocument(data);
    await loadWorkspaceData();
  };

  const handleUpdateClient = async (updates: Partial<ClientRecord>) => {
    await api.updateClient(clientId, updates);
    await loadWorkspaceData();
  };

  const handleApproveMemory = async (memoryId: string) => {
    await api.approveMemory(memoryId);
    await loadWorkspaceData();
  };

  const handleArchiveMemory = async (memoryId: string) => {
    await api.archiveMemory(memoryId);
    await loadWorkspaceData();
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: TaskStatus) => {
    await api.updateTask(taskId, { status: newStatus });
    await loadWorkspaceData();
  };

  const handleUpdatePermission = async (key: keyof ClientPermissions, level: any) => {
    if (!permissions) return;
    const updated = { ...permissions, [key]: level };
    setPermissions(updated);
    await api.updatePermissions(clientId, { [key]: level });
    await loadWorkspaceData();
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center space-y-3 animate-fadeIn">
        <div className="w-8 h-8 rounded-full border-2 border-ink border-t-transparent animate-spin mx-auto" />
        <span className="text-xs text-ink-secondary">Loading client intelligence workspace...</span>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="py-20 text-center space-y-4 max-w-md mx-auto">
        <AlertCircle size={24} className="mx-auto text-rose-600" />
        <h3 className="text-lg font-medium text-ink">Client Workspace Not Found</h3>
        <p className="text-xs text-ink-secondary">{error || 'Unable to retrieve records for this client ID.'}</p>
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-pill bg-ink text-white text-xs font-medium"
        >
          Return to Directory
        </button>
      </div>
    );
  }

  const primaryContact = client.contacts?.find(c => c.is_primary_contact) || client.contacts?.[0];
  const allowedPermsCount = permissions ? Object.values(permissions).filter(v => v === 'allowed').length : 0;
  const approvalPermsCount = permissions ? Object.values(permissions).filter(v => v === 'approval_required').length : 0;

  return (
    <div className="space-y-8 pb-20 animate-fadeIn">
      {/* Back button */}
      <div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-ink-secondary hover:text-ink transition-colors px-3 py-1.5 rounded-pill bg-surface border border-border shadow-subtle mb-4"
        >
          <ArrowLeft size={13} />
          <span>Clients Directory</span>
        </button>
      </div>

      {/* 1. Client Header */}
      <section className="bg-surface rounded-card-lg p-8 border border-border shadow-float">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-mono uppercase tracking-wider text-ink-muted">
                {client.industry}
              </span>
              <span className="text-border">·</span>
              <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-pill border inline-flex items-center gap-1.5 ${
                client.status === 'active' 
                  ? 'text-emerald-700 bg-emerald-50 border-emerald-200' 
                  : 'text-neutral-700 bg-neutral-100 border-neutral-200'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${client.status === 'active' ? 'bg-emerald-500' : 'bg-neutral-500'}`} />
                {client.status.toUpperCase()}
              </span>
              {client.location && (
                <>
                  <span className="text-border">·</span>
                  <span className="text-xs text-ink-secondary">{client.location}</span>
                </>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl font-light tracking-tight text-ink">
              {client.company_name}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-ink-secondary pt-1">
              {client.website && (
                <a 
                  href={client.website} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-1 text-ink hover:underline font-mono"
                >
                  <span>{client.website.replace(/^https?:\/\//, '')}</span>
                  <ExternalLink size={11} />
                </a>
              )}
              {primaryContact && (
                <span className="text-ink-secondary">
                  Primary Contact: <strong className="text-ink font-medium">{primaryContact.name}</strong> ({primaryContact.role})
                </span>
              )}
              <span className="text-ink-secondary">
                AI Readiness: <strong className="text-ink font-mono">{allowedPermsCount} Allowed</strong> · {approvalPermsCount} Gated
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap self-start lg:self-auto">
            <button
              onClick={() => setIsEditClientOpen(true)}
              className="px-4 py-2 rounded-pill bg-surface border border-border text-xs font-medium text-ink hover:bg-surface-secondary transition-colors"
            >
              Edit Client
            </button>
            <button
              onClick={() => setIsAddProjectOpen(true)}
              className="px-4 py-2 rounded-pill bg-surface border border-border text-xs font-medium text-ink hover:bg-surface-secondary transition-colors flex items-center gap-1.5"
            >
              <Plus size={13} />
              <span>Add Project</span>
            </button>
            <button
              onClick={() => setIsUploadFileOpen(true)}
              className="px-4 py-2 rounded-pill bg-surface border border-border text-xs font-medium text-ink hover:bg-surface-secondary transition-colors flex items-center gap-1.5"
            >
              <Plus size={13} />
              <span>Add File</span>
            </button>
            <button
              onClick={() => setIsAddMemoryOpen(true)}
              className="px-4 py-2 rounded-pill bg-ink text-white text-xs font-medium hover:bg-neutral-800 transition-colors shadow-subtle flex items-center gap-1.5"
            >
              <Sparkles size={13} />
              <span>Add Memory</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. Workspace Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-border scrollbar-none">
        {TABS.map((tab) => {
          const isActive = activeTab === tab;
          let countBadge: number | null = null;
          if (tab === 'Projects') countBadge = projects.length;
          if (tab === 'Tasks') countBadge = tasks.length;
          if (tab === 'Memory') countBadge = memories.length;
          if (tab === 'Files') countBadge = documents.length;

          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-pill text-xs font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
                isActive
                  ? 'bg-ink text-white shadow-subtle'
                  : 'bg-surface text-ink-secondary hover:text-ink hover:bg-surface-secondary border border-border/80'
              }`}
            >
              <span>{tab}</span>
              {countBadge !== null && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-pill font-mono ${
                  isActive ? 'bg-white/20 text-white' : 'bg-surface-secondary text-ink-muted'
                }`}>
                  {countBadge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 3. Tab Contents */}

      {/* ----------------- TAB: OVERVIEW ----------------- */}
      {activeTab === 'Overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Column */}
          <div className="lg:col-span-7 space-y-8">
            {/* Identity & Business Summary */}
            <div className="bg-surface rounded-card-lg p-8 border border-border shadow-float space-y-4">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted block">
                Executive Profile
              </span>
              <h3 className="text-xl font-normal text-ink">
                Business & Strategic Stance
              </h3>
              <p className="text-xs text-ink-secondary leading-relaxed font-light">
                {client.company_description || 'No company description provided yet.'}
              </p>

              <div className="grid grid-cols-2 gap-4 pt-3 text-xs border-t border-border">
                <div>
                  <span className="text-[10px] text-ink-muted block uppercase">Business Model</span>
                  <span className="text-ink font-medium">{client.business_model || 'Not defined'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-ink-muted block uppercase">Positioning</span>
                  <span className="text-ink font-medium">{client.positioning || 'Not defined'}</span>
                </div>
              </div>
            </div>

            {/* Current Projects */}
            <div className="bg-surface rounded-card-lg p-8 border border-border shadow-float space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted block">
                    Deliverables
                  </span>
                  <h3 className="text-xl font-normal text-ink">Current Projects ({projects.length})</h3>
                </div>
                <button
                  onClick={() => setIsAddProjectOpen(true)}
                  className="text-xs font-medium text-ink underline underline-offset-4"
                >
                  + Add Project
                </button>
              </div>

              {projects.length === 0 ? (
                <div className="p-8 text-center bg-surface-secondary/40 rounded-card border border-dashed border-border text-xs text-ink-secondary">
                  No projects yet. Create the first project for this client.
                </div>
              ) : (
                <div className="space-y-3">
                  {projects.map(proj => (
                    <div
                      key={proj.project_id}
                      onClick={() => onOpenProject && onOpenProject(proj.project_id)}
                      className="p-4 rounded-card bg-surface hover:bg-surface-secondary/50 border border-border transition-all cursor-pointer flex items-center justify-between text-xs"
                    >
                      <div>
                        <h4 className="font-semibold text-ink">{proj.project_name}</h4>
                        <p className="text-[11px] text-ink-muted mt-0.5">{proj.project_type} · Due {proj.deadline}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-ink text-xs font-semibold">{proj.progress}%</span>
                        <span className="block text-[10px] text-ink-secondary uppercase">{proj.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Important Memories */}
            <div className="bg-surface rounded-card-lg p-8 border border-border shadow-float space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted block">
                    Intelligence Engine
                  </span>
                  <h3 className="text-xl font-normal text-ink">Authoritative Memories ({memories.length})</h3>
                </div>
                <button
                  onClick={() => setActiveTab('Memory')}
                  className="text-xs font-medium text-ink underline underline-offset-4"
                >
                  View All Memory
                </button>
              </div>

              {memories.length === 0 ? (
                <div className="p-8 text-center bg-surface-secondary/40 rounded-card border border-dashed border-border text-xs text-ink-secondary">
                  No memories yet. Client intelligence will appear here as information is added or approved.
                </div>
              ) : (
                <div className="space-y-3">
                  {memories.slice(0, 4).map(mem => (
                    <div key={mem.id} className="p-4 rounded-card bg-surface-secondary/40 border border-border text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-ink">{mem.key}</span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-pill border ${
                          mem.status === 'OFFICIAL' ? 'bg-neutral-900 text-white border-neutral-900' :
                          mem.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          'bg-canvas text-ink-secondary border-dashed border-border'
                        }`}>
                          {mem.status}
                        </span>
                      </div>
                      <p className="text-ink-secondary font-light leading-relaxed">{mem.value}</p>
                      <div className="text-[10px] text-ink-muted pt-1 font-mono">
                        Source: {mem.source_id}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Side Column */}
          <div className="lg:col-span-5 space-y-8">
            {/* AI Permissions Boundary */}
            <div className="bg-surface rounded-card-lg p-7 border border-border shadow-float space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted block">
                    Autonomous Guardrails
                  </span>
                  <h3 className="text-lg font-normal text-ink">AI Permissions</h3>
                </div>
                <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-pill border border-emerald-200">
                  Enforced
                </span>
              </div>

              <div className="space-y-2 text-xs">
                {permissions && Object.entries(permissions).slice(0, 6).map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between py-1.5 border-b border-border/70">
                    <span className="text-ink-secondary capitalize">{k.replace(/_/g, ' ')}</span>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-pill border ${
                      v === 'allowed' ? 'text-emerald-700 bg-emerald-50 border-emerald-200' :
                      v === 'approval_required' ? 'text-amber-800 bg-amber-50 border-amber-200' :
                      'text-neutral-600 bg-neutral-100 border-neutral-200'
                    }`}>
                      {v.replace(/_/g, ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Real Activity Ledger */}
            <div className="bg-surface rounded-card-lg p-7 border border-border shadow-float space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted block">
                    Audit Trail
                  </span>
                  <h3 className="text-lg font-normal text-ink">Recent Activity</h3>
                </div>
                <button
                  onClick={() => setActiveTab('Activity')}
                  className="text-xs font-medium text-ink underline"
                >
                  Full Log
                </button>
              </div>

              {activities.length === 0 ? (
                <div className="p-6 text-center bg-surface-secondary/40 rounded-card border border-dashed border-border text-xs text-ink-secondary">
                  No activity yet.
                </div>
              ) : (
                <div className="space-y-3 text-xs">
                  {activities.slice(0, 5).map(act => (
                    <div key={act.id} className="p-3 rounded-card bg-surface-secondary/40 border border-border">
                      <div className="flex items-center justify-between text-[10px] text-ink-muted font-mono mb-1">
                        <span>{new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <span>by {act.actor_id}</span>
                      </div>
                      <p className="font-medium text-ink">{act.action}</p>
                      {act.result && (
                        <p className="text-[11px] text-ink-secondary mt-0.5 font-light">{act.result}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ----------------- TAB: BRAND ----------------- */}
      {activeTab === 'Brand' && (
        <div className="bg-surface rounded-card-lg p-8 border border-border shadow-float space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-6">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted block">
                Design Intelligence
              </span>
              <h2 className="text-2xl font-light tracking-tight text-ink mt-0.5">
                Structured Brand System
              </h2>
              <p className="text-xs text-ink-secondary mt-1 font-light">
                Classified memories governing vector design, typography hierarchy, and tone.
              </p>
            </div>
            <button
              onClick={() => setIsAddMemoryOpen(true)}
              className="px-4 py-2 rounded-pill bg-ink text-white text-xs font-medium hover:bg-neutral-800 transition-colors self-start"
            >
              + Add Brand Rule
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {memories.filter(m => m.category === 'Brand' || m.category === 'Visual' || m.category === 'Restrictions').map(mem => {
              const isOfficial = mem.status === 'OFFICIAL';
              const isObserved = mem.status === 'OBSERVED';
              return (
                <div 
                  key={mem.id}
                  className={`p-6 rounded-card border transition-all space-y-3 ${
                    isOfficial 
                      ? 'bg-surface border-ink/40 shadow-subtle ring-1 ring-ink/5' 
                      : isObserved 
                      ? 'bg-surface-secondary/30 border-dashed border-border'
                      : 'bg-surface-secondary/60 border-border'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono text-ink-muted uppercase block">{mem.category}</span>
                      <h4 className="text-base font-semibold text-ink mt-0.5">{mem.key}</h4>
                    </div>

                    <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-pill border ${
                      isOfficial ? 'bg-ink text-white border-ink' :
                      mem.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      'bg-surface-secondary text-ink-muted border-border'
                    }`}>
                      {mem.status}
                    </span>
                  </div>

                  <p className="text-xs text-ink leading-relaxed font-light">{mem.value}</p>

                  <div className="pt-3 border-t border-border flex items-center justify-between text-[11px] text-ink-muted">
                    <span>Source: {mem.source_id}</span>
                    {isObserved && (
                      <button
                        onClick={() => handleApproveMemory(mem.id)}
                        className="text-xs font-semibold text-ink underline"
                      >
                        Promote to Approved
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ----------------- TAB: PROJECTS ----------------- */}
      {activeTab === 'Projects' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-normal text-ink">Client Projects</h3>
              <p className="text-xs text-ink-secondary mt-0.5">Active initiatives and studio deliverables scoped to this account.</p>
            </div>
            <button
              onClick={() => setIsAddProjectOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-pill bg-ink text-white text-xs font-medium hover:bg-neutral-800 transition-colors shadow-subtle"
            >
              <Plus size={13} />
              <span>New Project</span>
            </button>
          </div>

          {projects.length === 0 ? (
            <div className="p-12 text-center bg-surface rounded-card-lg border border-border shadow-float text-xs text-ink-secondary">
              No projects yet. Create the first project for this client.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.map(proj => (
                <div
                  key={proj.project_id}
                  className="bg-surface rounded-card-lg p-7 border border-border shadow-float flex flex-col justify-between group hover:border-ink/20 transition-all"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted block">
                          {proj.project_type}
                        </span>
                        <h4 className="text-lg font-medium text-ink mt-0.5">{proj.project_name}</h4>
                      </div>
                      <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-pill bg-surface-secondary text-ink border border-border">
                        {proj.status}
                      </span>
                    </div>

                    <p className="text-xs text-ink-secondary leading-relaxed font-light mb-4">
                      {proj.description || 'No project description provided.'}
                    </p>

                    <div className="space-y-1.5 my-4">
                      <div className="flex justify-between text-xs text-ink-secondary">
                        <span>Progress</span>
                        <span className="font-mono text-ink font-semibold">{proj.progress}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-pill bg-surface-secondary overflow-hidden">
                        <div className="h-full bg-ink rounded-pill" style={{ width: `${proj.progress}%` }} />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border flex items-center justify-between text-xs text-ink-muted">
                    <span className="font-mono">Deadline: {proj.deadline}</span>
                    <button
                      onClick={() => onOpenProject && onOpenProject(proj.project_id)}
                      className="font-medium text-ink flex items-center gap-1 hover:underline"
                    >
                      <span>Open Workspace</span>
                      <ChevronRight size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ----------------- TAB: TASKS ----------------- */}
      {activeTab === 'Tasks' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-normal text-ink">Client Tasks & Queue</h3>
              <p className="text-xs text-ink-secondary mt-0.5">Autonomous workstream execution filtered strictly to this client.</p>
            </div>
            <button
              onClick={() => setIsAddTaskOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-pill bg-ink text-white text-xs font-medium hover:bg-neutral-800 transition-colors shadow-subtle"
            >
              <Plus size={13} />
              <span>Dispatch Task</span>
            </button>
          </div>

          {tasks.length === 0 ? (
            <div className="p-12 text-center bg-surface rounded-card-lg border border-border shadow-float text-xs text-ink-secondary">
              No tasks currently queued for this client.
            </div>
          ) : (
            <div className="bg-surface rounded-card-lg border border-border shadow-float overflow-hidden divide-y divide-border">
              {tasks.map(t => (
                <div key={t.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                  <div>
                    <h5 className="font-semibold text-ink text-sm leading-snug">{t.title}</h5>
                    <div className="flex items-center gap-3 text-[11px] text-ink-muted mt-1">
                      <span>Agent: {t.assigned_agent || 'Unassigned'}</span>
                      <span>·</span>
                      <span className="font-mono">Deadline: {t.deadline || 'None'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <select
                      value={t.status}
                      onChange={e => handleUpdateTaskStatus(t.id, e.target.value as any)}
                      className="px-3 py-1.5 rounded-pill bg-surface-secondary border border-border text-xs font-medium text-ink focus:outline-none"
                    >
                      <option value="queued">queued</option>
                      <option value="planning">planning</option>
                      <option value="running">running</option>
                      <option value="waiting_approval">waiting_approval</option>
                      <option value="completed">completed</option>
                      <option value="failed">failed</option>
                      <option value="cancelled">cancelled</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ----------------- TAB: MEMORY ----------------- */}
      {activeTab === 'Memory' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-4">
            <div>
              <h3 className="text-xl font-normal text-ink">Client Memory Engine</h3>
              <p className="text-xs text-ink-secondary mt-0.5">
                Strictly client-scoped knowledge base. No chain-of-thought is exposed; only authoritative facts and citations.
              </p>
            </div>
            <button
              onClick={() => setIsAddMemoryOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-pill bg-ink text-white text-xs font-medium hover:bg-neutral-800 transition-colors shadow-subtle self-start"
            >
              <Plus size={13} />
              <span>Add Memory</span>
            </button>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 w-full sm:w-auto scrollbar-none">
              {['All', 'Brand', 'Visual', 'Communication', 'Business', 'Positioning', 'Restrictions', 'Observations'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedMemoryCategory(cat)}
                  className={`px-3 py-1.5 rounded-pill text-xs font-medium transition-all ${
                    selectedMemoryCategory === cat
                      ? 'bg-surface text-ink shadow-subtle border border-border font-semibold'
                      : 'bg-transparent text-ink-secondary hover:text-ink hover:bg-surface-secondary'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <input
              type="text"
              placeholder="Search client memory..."
              value={memorySearch}
              onChange={e => setMemorySearch(e.target.value)}
              className="w-full sm:w-64 px-3.5 py-1.5 rounded-pill bg-surface border border-border text-xs text-ink placeholder:text-ink-muted focus:outline-none"
            />
          </div>

          {/* Memory records */}
          <div className="space-y-4">
            {memories
              .filter(m => {
                const matchCat = selectedMemoryCategory === 'All' || m.category === selectedMemoryCategory;
                const matchSearch = memorySearch.trim() === '' || 
                  m.key.toLowerCase().includes(memorySearch.toLowerCase()) ||
                  m.value.toLowerCase().includes(memorySearch.toLowerCase());
                return matchCat && matchSearch;
              })
              .map(mem => {
                const isOfficial = mem.status === 'OFFICIAL';
                const isObserved = mem.status === 'OBSERVED';
                return (
                  <div key={mem.id} className="p-6 rounded-card bg-surface border border-border shadow-float space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-mono text-ink-muted uppercase">{mem.category}</span>
                          <span className="text-border">·</span>
                          <span className="text-[10px] text-ink-muted font-mono">
                            {new Date(mem.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <h4 className="text-base font-semibold text-ink">{mem.key}</h4>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-pill border ${
                          isOfficial ? 'bg-ink text-white border-ink' :
                          mem.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          'bg-surface-secondary text-ink-muted border-border'
                        }`}>
                          {mem.status}
                        </span>

                        {isObserved && (
                          <button
                            onClick={() => handleApproveMemory(mem.id)}
                            className="px-2.5 py-0.5 rounded-pill bg-emerald-600 text-white text-[10px] font-medium"
                          >
                            Approve
                          </button>
                        )}

                        <button
                          onClick={() => handleArchiveMemory(mem.id)}
                          title="Archive Memory"
                          className="p-1 text-ink-muted hover:text-rose-600 transition-colors"
                        >
                          <Archive size={13} />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-ink leading-relaxed font-light">{mem.value}</p>

                    {mem.reason_context && (
                      <p className="text-[11px] text-ink-secondary bg-surface-secondary/50 p-2.5 rounded-card-sm font-light">
                        Context: {mem.reason_context}
                      </p>
                    )}

                    <div className="pt-2 text-[10px] text-ink-muted flex items-center justify-between font-mono">
                      <span>Source: {mem.source_type} · {mem.source_id}</span>
                      {mem.confidence && <span>Confidence: {mem.confidence}</span>}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ----------------- TAB: FILES ----------------- */}
      {activeTab === 'Files' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-normal text-ink">Client Files & Documents</h3>
              <p className="text-xs text-ink-secondary mt-0.5">Genuine uploaded files. No fake indexing claimed without server execution.</p>
            </div>
            <button
              onClick={() => setIsUploadFileOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-pill bg-ink text-white text-xs font-medium hover:bg-neutral-800 transition-colors shadow-subtle"
            >
              <Plus size={13} />
              <span>Add File</span>
            </button>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {['All', 'Brand', 'Brief', 'Reference', 'Contract', 'Commercial', 'Project'].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedFileCategory(cat)}
                className={`px-3 py-1.5 rounded-pill text-xs font-medium transition-all ${
                  selectedFileCategory === cat
                    ? 'bg-surface text-ink shadow-subtle border border-border font-semibold'
                    : 'bg-transparent text-ink-secondary hover:text-ink hover:bg-surface-secondary'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {documents.length === 0 ? (
            <div className="p-12 text-center bg-surface rounded-card-lg border border-border shadow-float text-xs text-ink-secondary">
              No files currently attached for this client.
            </div>
          ) : (
            <div className="bg-surface rounded-card-lg border border-border shadow-float overflow-hidden divide-y divide-border">
              {documents
                .filter(d => selectedFileCategory === 'All' || d.category === selectedFileCategory)
                .map(d => (
                  <div key={d.file_id} className="p-5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3.5">
                      <FileText size={18} className="text-ink-muted" />
                      <div>
                        <h5 className="font-semibold text-ink">{d.filename}</h5>
                        <div className="flex items-center gap-2 text-[11px] text-ink-muted mt-0.5">
                          <span>{d.category}</span>
                          <span>·</span>
                          <span className="font-mono">{d.file_size}</span>
                          <span>·</span>
                          <span>Uploaded {new Date(d.uploaded_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-pill bg-surface-secondary text-ink border border-border">
                        status: {d.status}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* ----------------- TAB: COMMUNICATION ----------------- */}
      {activeTab === 'Communication' && (
        <div className="bg-surface rounded-card-lg p-8 border border-border shadow-float space-y-6">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted block">
              Inbound & Outbound Streams
            </span>
            <h3 className="text-xl font-normal text-ink mt-0.5">Communication Integrations</h3>
            <p className="text-xs text-ink-secondary mt-1 font-light">
              Communication integrations are not connected yet. Connect Slack, WhatsApp, or Email when you're ready.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            {[
              { name: 'Slack', note: 'Sync client channels (#sync) for automated drafting', status: 'Not connected' },
              { name: 'WhatsApp', note: 'Direct client communication line for rapid approvals', status: 'Not connected' },
              { name: 'Email / Google Workspace', note: 'Official executive dispatch & formal deliverable threads', status: 'Not connected' }
            ].map(int => (
              <div key={int.name} className="p-6 rounded-card bg-surface-secondary/40 border border-border flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-semibold text-ink text-sm">{int.name}</h5>
                    <span className="text-[10px] font-mono text-ink-muted px-2 py-0.5 rounded-pill bg-surface border border-border">
                      {int.status}
                    </span>
                  </div>
                  <p className="text-xs text-ink-secondary font-light leading-relaxed">{int.note}</p>
                </div>

                <button
                  disabled
                  className="mt-6 px-4 py-1.5 rounded-pill bg-surface text-ink-muted text-xs border border-border cursor-not-allowed opacity-60 self-start"
                >
                  Configure Integration
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ----------------- TAB: COMMERCIAL ----------------- */}
      {activeTab === 'Commercial' && (
        <div className="bg-surface rounded-card-lg p-8 border border-border shadow-float space-y-6">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted block">
              Financial Baseline
            </span>
            <h3 className="text-xl font-normal text-ink mt-0.5">Commercial Defaults</h3>
            <p className="text-xs text-ink-secondary mt-1 font-light">
              Protected studio commercial rates and payment parameters.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <div className="p-5 rounded-card bg-surface-secondary/40 border border-border">
              <span className="text-ink-muted block mb-1">Billing Currency</span>
              <span className="text-lg font-semibold text-ink">{client.currency || 'USD'}</span>
            </div>

            <div className="p-5 rounded-card bg-surface-secondary/40 border border-border">
              <span className="text-ink-muted block mb-1">Hourly / Day Rate</span>
              <span className="text-lg font-semibold text-ink">
                {client.hourly_rate ? `$${client.hourly_rate}/hr` : client.day_rate ? `$${client.day_rate}/day` : 'Not configured'}
              </span>
            </div>

            <div className="p-5 rounded-card bg-surface-secondary/40 border border-border">
              <span className="text-ink-muted block mb-1">Payment Terms</span>
              <span className="text-lg font-semibold text-ink">{client.payment_terms || 'Net 30'}</span>
            </div>

            <div className="md:col-span-3 p-5 rounded-card bg-surface-secondary/40 border border-border space-y-2">
              <span className="text-ink font-semibold block">Contract & Retainer Notes</span>
              <p className="text-ink-secondary leading-relaxed font-light">
                {client.contract_notes || 'No confidential retainer notes recorded for this client.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- TAB: ACTIVITY ----------------- */}
      {activeTab === 'Activity' && (
        <div className="bg-surface rounded-card-lg p-8 border border-border shadow-float space-y-6">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted block">
              Immutable Ledger
            </span>
            <h3 className="text-xl font-normal text-ink mt-0.5">Client Activity History</h3>
            <p className="text-xs text-ink-secondary mt-1 font-light">
              Chronological log of real actions, mutations, and approvals.
            </p>
          </div>

          {activities.length === 0 ? (
            <div className="p-8 text-center bg-surface-secondary/40 rounded-card border border-dashed border-border text-xs text-ink-secondary">
              No activity yet.
            </div>
          ) : (
            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[1px] before:bg-border">
              {activities.map(act => (
                <div key={act.id} className="relative group">
                  <span className="absolute -left-[27px] top-1.5 w-2 h-2 rounded-full bg-ink ring-4 ring-surface" />
                  <div className="flex items-center gap-2 mb-1 text-xs">
                    <span className="font-mono text-ink-muted text-[11px]">
                      {new Date(act.created_at).toLocaleString()}
                    </span>
                    <span className="font-semibold text-ink">Actor: {act.actor_id}</span>
                  </div>
                  <p className="text-xs font-medium text-ink">{act.action}</p>
                  {act.result && (
                    <p className="text-[11px] text-ink-secondary mt-0.5 font-light">{act.result}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <CreateProjectModal
        isOpen={isAddProjectOpen}
        clientId={clientId}
        onClose={() => setIsAddProjectOpen(false)}
        onSubmit={handleCreateProject}
      />

      <CreateTaskModal
        isOpen={isAddTaskOpen}
        clientId={clientId}
        projects={projects}
        onClose={() => setIsAddTaskOpen(false)}
        onSubmit={handleCreateTask}
      />

      <CreateMemoryModal
        isOpen={isAddMemoryOpen}
        clientId={clientId}
        onClose={() => setIsAddMemoryOpen(false)}
        onSubmit={handleCreateMemory}
      />

      <UploadFileModal
        isOpen={isUploadFileOpen}
        clientId={clientId}
        projects={projects}
        onClose={() => setIsUploadFileOpen(false)}
        onSubmit={handleUploadFile}
      />

      <EditClientModal
        isOpen={isEditClientOpen}
        client={client}
        onClose={() => setIsEditClientOpen(false)}
        onSubmit={handleUpdateClient}
      />
    </div>
  );
};
