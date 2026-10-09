import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginView } from './components/auth/LoginView';
import { SuperAdminView } from './components/admin/SuperAdminView';
import { SettingsView } from './components/views/SettingsView';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/views/DashboardView';
import { InboxView } from './components/views/InboxView';
import { ClientsView } from './components/views/ClientsView';
import { ClientWorkspaceView } from './components/views/ClientWorkspaceView';
import { ClientOnboardingView } from './components/onboarding/ClientOnboardingView';
import { ProjectDetailView } from './components/views/ProjectDetailView';
import { ProjectsView } from './components/views/ProjectsView';
import { TasksView } from './components/views/TasksView';
import { AgentsView } from './components/views/AgentsView';
import { MemoryView } from './components/views/MemoryView';
import { DocumentsView } from './components/views/DocumentsView';
import { ApprovalsView } from './components/views/ApprovalsView';
import { ActivityView } from './components/views/ActivityView';
import { ApprovalModal } from './components/ApprovalModal';
import { SearchModal } from './components/SearchModal';
import { 
  NavigationTab, 
  AIStatusState, 
  ApprovalItem 
} from './types';
import { 
  ClientRecord, 
  ProjectRecord, 
  TaskRecord, 
  ClientMemoryRecord, 
  ActivityRecord 
} from '../server/db/types';
import { api } from './api/client';
import { initialApprovals } from './data/mockData';

const aiStatusStates: AIStatusState[] = [
  {
    type: 'online',
    label: 'AI Employee online',
    subtext: 'Observing studio workspace'
  },
  {
    type: 'working',
    label: 'Working on Studio Initiatives',
    subtext: 'Generating spatial tokens'
  },
  {
    type: 'waiting',
    label: 'Waiting for approval',
    subtext: 'Checkpoints pending review'
  },
  {
    type: 'attention',
    label: 'Needs attention',
    subtext: 'Audit boundary check'
  }
];

const AppContent: React.FC = () => {
  const { user, organization, loading } = useAuth();

  // Navigation & URL parsing
  const [activeTab, setActiveTab] = useState<NavigationTab>('Dashboard');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isOnboarding, setIsOnboarding] = useState<boolean>(false);

  // Real Database state
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [tasks, setTasks] = useState<TaskRecord[]>([]);
  const [memories, setMemories] = useState<ClientMemoryRecord[]>([]);
  const [activities, setActivities] = useState<ActivityRecord[]>([]);

  // Telemetry & Modals
  const [aiStatusIndex, setAiStatusIndex] = useState(0);
  const [approvals, setApprovals] = useState<ApprovalItem[]>(initialApprovals);
  const [activeApprovalModalItem, setActiveApprovalModalItem] = useState<ApprovalItem | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Sync state with URL path
  const syncFromPath = () => {
    const path = window.location.pathname;
    if (path === '/admin') {
      setActiveTab('Super Admin');
      setIsOnboarding(false);
      setSelectedClientId(null);
      setSelectedProjectId(null);
    } else if (path === '/settings') {
      setActiveTab('Settings');
      setIsOnboarding(false);
      setSelectedClientId(null);
      setSelectedProjectId(null);
    } else if (path === '/inbox') {
      setActiveTab('Inbox');
      setIsOnboarding(false);
      setSelectedClientId(null);
      setSelectedProjectId(null);
    } else if (path === '/clients/new') {
      setActiveTab('Clients');
      setIsOnboarding(true);
      setSelectedClientId(null);
      setSelectedProjectId(null);
    } else if (path.startsWith('/clients/') && path.includes('/projects/')) {
      const parts = path.split('/');
      const cId = parts[2];
      const pId = parts[4];
      setActiveTab('Clients');
      setIsOnboarding(false);
      setSelectedClientId(cId);
      setSelectedProjectId(pId);
    } else if (path.startsWith('/clients/')) {
      const cId = path.replace('/clients/', '').replace(/\/$/, '');
      if (cId) {
        setActiveTab('Clients');
        setIsOnboarding(false);
        setSelectedClientId(cId);
        setSelectedProjectId(null);
      }
    } else if (path === '/clients') {
      setActiveTab('Clients');
      setIsOnboarding(false);
      setSelectedClientId(null);
      setSelectedProjectId(null);
    } else if (path === '/projects') {
      setActiveTab('Projects');
      setIsOnboarding(false);
      setSelectedClientId(null);
      setSelectedProjectId(null);
    } else if (path === '/tasks') {
      setActiveTab('Tasks');
      setIsOnboarding(false);
      setSelectedClientId(null);
      setSelectedProjectId(null);
    } else if (path === '/agents') {
      setActiveTab('Agents');
      setIsOnboarding(false);
      setSelectedClientId(null);
      setSelectedProjectId(null);
    } else if (path === '/memory') {
      setActiveTab('Memory');
      setIsOnboarding(false);
      setSelectedClientId(null);
      setSelectedProjectId(null);
    } else if (path === '/documents') {
      setActiveTab('Documents');
      setIsOnboarding(false);
      setSelectedClientId(null);
      setSelectedProjectId(null);
    } else if (path === '/approvals') {
      setActiveTab('Approvals');
      setIsOnboarding(false);
      setSelectedClientId(null);
      setSelectedProjectId(null);
    } else if (path === '/activity') {
      setActiveTab('Activity');
      setIsOnboarding(false);
      setSelectedClientId(null);
      setSelectedProjectId(null);
    } else {
      setActiveTab('Dashboard');
      setIsOnboarding(false);
      setSelectedClientId(null);
      setSelectedProjectId(null);
    }
  };

  const setUrlPath = (url: string) => {
    window.history.pushState(null, '', url);
  };

  // Initial load & popstate listener
  useEffect(() => {
    syncFromPath();
    const onPop = () => syncFromPath();
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // Fetch real database records (scoped to active organization)
  const loadStudioState = async () => {
    if (!user) return;
    try {
      const [c, p, t, a, realApprovals] = await Promise.all([
        api.getClients(),
        api.getProjects(),
        api.getTasks(),
        api.getActivities(),
        api.getApprovals().catch(() => [])
      ]);
      setClients(c);
      setProjects(p);
      setTasks(t);
      setActivities(a);

      // Map real database approvals
      if (realApprovals && realApprovals.length > 0) {
        const mapped: ApprovalItem[] = realApprovals.map((r: any) => {
          const clientObj = c.find(cl => cl.id === r.client_id);
          const clientName = clientObj ? clientObj.company_name : (r.client_id || 'Studio Workspace');
          const projectObj = p.find(pr => pr.project_id === r.project_id);
          const projectName = projectObj ? projectObj.project_name : 'General Initiative';

          let preview = '';
          if (r.original_input?.message) {
            preview = r.original_input.message;
          } else if (r.original_input?.tokens) {
            preview = `Publishing ${Object.keys(r.original_input.tokens).length} tokens to Figma.`;
          } else {
            preview = JSON.stringify(r.original_input, null, 2);
          }

          return {
            id: r.id,
            title: `Autonomous Gate: ${r.tool_id}`,
            proposedAction: `${r.tool_id} (${r.risk_level} Risk)`,
            client: clientName,
            project: projectName,
            reason: r.reason,
            previewContent: preview,
            confidence: 98,
            time: new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: (r.status === 'executed' || r.status === 'approved') ? 'approved' : (r.status === 'rejected' ? 'rejected' : 'pending')
          };
        });
        setApprovals(mapped);
      } else {
        setApprovals([]);
      }

      // Load client memories
      if (c.length > 0) {
        const memPromises = c.map(cl => api.getMemories(cl.id).catch(() => []));
        const memResults = await Promise.all(memPromises);
        setMemories(memResults.flat());
      } else {
        setMemories([]);
      }
    } catch (err) {
      console.error('Failed to load studio state:', err);
    }
  };

  // Reload when tab, client, or active organization changes
  useEffect(() => {
    if (user && organization) {
      loadStudioState();
    }
  }, [activeTab, selectedClientId, organization?.id, user?.id]);

  // Keyboard shortcut for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleCycleAIStatus = () => {
    setAiStatusIndex((prev) => (prev + 1) % aiStatusStates.length);
  };

  const handleApprove = async (id: string) => {
    try {
      await api.approveAction(id);
      await loadStudioState();
    } catch (err: any) {
      alert(`Approval execution failed: ${err.message}`);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await api.rejectAction(id, 'Rejected by studio operator');
      await loadStudioState();
    } catch (err: any) {
      alert(`Rejection failed: ${err.message}`);
    }
  };

  const handleSaveAndApprove = async (id: string, newContent: string) => {
    try {
      let editedPayload: any = { message: newContent };
      try {
        if (newContent.trim().startsWith('{') || newContent.trim().startsWith('[')) {
          editedPayload = JSON.parse(newContent);
        }
      } catch {}
      await api.approveAction(id, editedPayload);
      await loadStudioState();
    } catch (err: any) {
      alert(`Edited approval execution failed: ${err.message}`);
    }
  };

  const handleNavigate = (tab: NavigationTab) => {
    setActiveTab(tab);
    setIsOnboarding(false);
    setSelectedClientId(null);
    setSelectedProjectId(null);

    if (tab === 'Dashboard') {
      setUrlPath('/');
    } else if (tab === 'Super Admin') {
      setUrlPath('/admin');
    } else if (tab === 'Settings') {
      setUrlPath('/settings');
    } else {
      setUrlPath(`/${tab.toLowerCase()}`);
    }
  };

  const handleSelectClient = (clientId: string) => {
    setSelectedClientId(clientId);
    setSelectedProjectId(null);
    setIsOnboarding(false);
    setActiveTab('Clients');
    setUrlPath(`/clients/${clientId}`);
  };

  const handleOpenProject = (projectId: string) => {
    setSelectedProjectId(projectId);
    if (selectedClientId) {
      setUrlPath(`/clients/${selectedClientId}/projects/${projectId}`);
    }
  };

  const handleStartOnboarding = () => {
    setIsOnboarding(true);
    setSelectedClientId(null);
    setSelectedProjectId(null);
    setActiveTab('Clients');
    setUrlPath('/clients/new');
  };

  const handleOnboardingSuccess = (newClientId: string) => {
    setIsOnboarding(false);
    loadStudioState();
    handleSelectClient(newClientId);
  };

  // 1. Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F3] text-[#111111] flex flex-col items-center justify-center font-sans">
        <div className="w-10 h-10 rounded-full bg-[#111111] text-white flex items-center justify-center font-medium text-base mb-4 tracking-tighter">
          M
        </div>
        <div className="text-xs font-mono uppercase tracking-widest text-[#6F6F6B]">
          Authenticating Studio Workspace...
        </div>
      </div>
    );
  }

  // 2. Unauthenticated State -> Render Login
  if (!user) {
    return <LoginView />;
  }

  // 3. Super Admin Route Protection
  const isSuperAdminTab = activeTab === 'Super Admin';
  if (isSuperAdminTab && user.platform_role !== 'SUPER_ADMIN') {
    return (
      <div className="min-h-screen bg-[#F5F5F3] text-[#111111] flex flex-col items-center justify-center font-sans p-6 text-center">
        <div className="max-w-md bg-white border border-[#E5E5E1] rounded-[24px] p-8 shadow-sm">
          <h2 className="text-xl font-medium text-[#111111]">Access Denied</h2>
          <p className="text-xs text-[#6F6F6B] mt-2 mb-6">
            The Super Admin control plane is restricted to platform operators with SUPER_ADMIN clearance.
          </p>
          <button
            onClick={() => handleNavigate('Dashboard')}
            className="px-4 py-2 bg-[#111111] text-white rounded-xl text-xs font-medium"
          >
            Return to Studio Dashboard
          </button>
        </div>
      </div>
    );
  }

  const pendingApprovalsCount = approvals.filter(a => a.status === 'pending').length;

  return (
    <div className="min-h-screen flex bg-canvas text-ink selection:bg-ink selection:text-white relative">
      {/* Subtle Warm Mesh Ambient Glow across top right */}
      <div className="fixed top-0 right-0 w-[50vw] h-[40vh] warm-mesh-glow pointer-events-none z-0" />

      {/* Persistent Left Integrated Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={handleNavigate}
        pendingApprovalsCount={pendingApprovalsCount}
        activeAgentsCount={3}
      />

      {/* Main Studio Canvas Viewport */}
      <div className="flex-1 flex flex-col min-w-0 z-10">
        <Header
          currentPage={selectedClientId ? 'Clients' : activeTab}
          aiStatus={aiStatusStates[aiStatusIndex]}
          onCycleAIStatus={handleCycleAIStatus}
          onOpenSearch={() => setIsSearchOpen(true)}
          pendingApprovalsCount={pendingApprovalsCount}
          onNavigate={handleNavigate}
        />

        <main className="flex-1 px-8 lg:px-14 py-10 max-w-7xl w-full mx-auto">
          {/* Super Admin Control Plane */}
          {activeTab === 'Super Admin' && user.platform_role === 'SUPER_ADMIN' && (
            <SuperAdminView />
          )}

          {/* Settings View */}
          {activeTab === 'Settings' && (
            <SettingsView />
          )}

          {/* 1. Dashboard View */}
          {activeTab === 'Dashboard' && (
            <DashboardView
              onNavigate={handleNavigate}
              onSelectClient={handleSelectClient}
              onOpenProject={(pId) => {
                const proj = projects.find(p => p.project_id === pId);
                if (proj) {
                  setSelectedClientId(proj.client_id);
                  handleOpenProject(pId);
                }
              }}
              activities={activities}
              tasks={tasks}
              projects={projects}
              clients={clients}
              memories={memories}
            />
          )}

          {/* Inbox View */}
          {activeTab === 'Inbox' && (
            <InboxView />
          )}

          {/* 2. Clients View, Onboarding Flow & Client Workspace */}
          {activeTab === 'Clients' && (
            isOnboarding ? (
              <ClientOnboardingView
                onCancel={() => {
                  setIsOnboarding(false);
                  setUrlPath('/clients');
                }}
                onSuccess={handleOnboardingSuccess}
              />
            ) : selectedClientId && selectedProjectId ? (
              <ProjectDetailView
                clientId={selectedClientId}
                projectId={selectedProjectId}
                onBack={() => {
                  setSelectedProjectId(null);
                  setUrlPath(`/clients/${selectedClientId}`);
                }}
              />
            ) : selectedClientId ? (
              <ClientWorkspaceView
                clientId={selectedClientId}
                onBack={() => {
                  setSelectedClientId(null);
                  setUrlPath('/clients');
                }}
                onOpenProject={handleOpenProject}
              />
            ) : (
              <ClientsView
                onSelectClient={handleSelectClient}
                onOnboardClient={handleStartOnboarding}
              />
            )
          )}

          {/* 3. Projects View */}
          {activeTab === 'Projects' && (
            <ProjectsView 
              projects={projects.map(p => ({
                id: p.project_id,
                title: p.project_name,
                client: clients.find(c => c.id === p.client_id)?.company_name || p.client_id,
                status: (p.status === 'in_progress' ? 'In Progress' : p.status === 'completed' ? 'Completed' : 'Discovery') as any,
                deadline: p.deadline,
                currentTask: p.description || 'Deliverable roadmap active',
                recentActivity: `Priority: ${p.priority}`,
                progress: p.progress,
                assignedAgents: p.assigned_agents
              }))} 
            />
          )}

          {/* 4. Tasks View */}
          {activeTab === 'Tasks' && (
            <TasksView 
              tasks={tasks.map(t => ({
                id: t.id,
                title: t.title,
                client: clients.find(c => c.id === t.client_id)?.company_name || t.client_id,
                project: projects.find(p => p.project_id === t.project_id)?.project_name || 'General Workspace',
                agent: t.assigned_agent || 'Creative Director Agent',
                status: (t.status === 'running' ? 'Running' : t.status === 'waiting_approval' ? 'Awaiting Feedback' : t.status === 'completed' ? 'Done' : 'Queued') as any,
                priority: (t.priority === 'urgent' ? 'Urgent' : t.priority === 'high' ? 'High' : 'Normal') as any,
                deadline: t.deadline || 'Flexible'
              }))} 
            />
          )}

          {/* 5. Agents View */}
          {activeTab === 'Agents' && (
            <AgentsView />
          )}

          {/* 6. Memory View */}
          {activeTab === 'Memory' && (
            <MemoryView />
          )}

          {/* 7. Documents View */}
          {activeTab === 'Documents' && (
            <DocumentsView />
          )}

          {/* 8. Approvals View */}
          {activeTab === 'Approvals' && (
            <ApprovalsView
              approvals={approvals}
              onApprove={handleApprove}
              onReject={handleReject}
              onEdit={(id) => {
                const item = approvals.find(a => a.id === id);
                if (item) setActiveApprovalModalItem(item);
              }}
            />
          )}

          {/* 9. Activity View */}
          {activeTab === 'Activity' && (
            <ActivityView 
              activities={activities.map(a => ({
                id: a.id,
                time: new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                agent: a.actor_id,
                action: a.action,
                client: clients.find(c => c.id === a.client_id)?.company_name,
                detail: a.result,
                badge: a.entity_type
              }))} 
            />
          )}
        </main>
      </div>

      {/* Approval Human-in-the-Loop Modal */}
      <ApprovalModal
        item={activeApprovalModalItem}
        onClose={() => setActiveApprovalModalItem(null)}
        onApprove={handleApprove}
        onReject={handleReject}
        onSaveAndApprove={handleSaveAndApprove}
      />

      {/* Global Command Palette / Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        clients={clients}
        projects={projects}
        onSelectClient={handleSelectClient}
        onNavigate={handleNavigate}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
