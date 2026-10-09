import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/views/DashboardView';
import { ClientsView } from './components/views/ClientsView';
import { ClientDetailWorkspace } from './components/views/ClientDetailWorkspace';
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
  Client, 
  ApprovalItem, 
  Task 
} from './types';
import { 
  initialClients, 
  initialApprovals, 
  initialActivities, 
  initialProjects, 
  initialTasks 
} from './data/mockData';

const aiStatusStates: AIStatusState[] = [
  {
    type: 'online',
    label: 'AI Employee online',
    subtext: 'Observing studio workspace'
  },
  {
    type: 'working',
    label: 'Working on XYZ AI',
    subtext: 'Generating spatial tokens'
  },
  {
    type: 'waiting',
    label: 'Waiting for approval',
    subtext: 'Slack dispatch pending'
  },
  {
    type: 'attention',
    label: 'Needs attention',
    subtext: '1 token conflict'
  }
];

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavigationTab>('Dashboard');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [aiStatusIndex, setAiStatusIndex] = useState(0);
  const [approvals, setApprovals] = useState<ApprovalItem[]>(initialApprovals);
  const [activeApprovalModalItem, setActiveApprovalModalItem] = useState<ApprovalItem | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

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

  const handleApprove = (id: string) => {
    setApprovals(prev => prev.map(a => a.id === id ? { ...a, status: 'approved' } : a));
  };

  const handleReject = (id: string) => {
    setApprovals(prev => prev.map(a => a.id === id ? { ...a, status: 'rejected' } : a));
  };

  const handleSaveAndApprove = (id: string, newContent: string) => {
    setApprovals(prev => prev.map(a => a.id === id ? { 
      ...a, 
      previewContent: newContent, 
      status: 'approved' 
    } : a));
  };

  const handleSelectClient = (client: Client) => {
    setSelectedClient(client);
    setActiveTab('Clients');
  };

  const handleNavigate = (tab: NavigationTab) => {
    setActiveTab(tab);
    if (tab !== 'Clients') {
      setSelectedClient(null);
    }
  };

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
          currentPage={selectedClient ? 'Clients' : activeTab}
          aiStatus={aiStatusStates[aiStatusIndex]}
          onCycleAIStatus={handleCycleAIStatus}
          onOpenSearch={() => setIsSearchOpen(true)}
          pendingApprovalsCount={pendingApprovalsCount}
        />

        <main className="flex-1 px-8 lg:px-14 py-10 max-w-7xl w-full mx-auto">
          {/* Dashboard View */}
          {activeTab === 'Dashboard' && (
            <DashboardView
              onNavigate={handleNavigate}
              onOpenApproval={(item) => setActiveApprovalModalItem(item)}
              onSelectClient={handleSelectClient}
              activities={initialActivities}
              approvals={approvals}
              tasks={initialTasks}
              projects={initialProjects}
              clients={initialClients}
            />
          )}

          {/* Clients View / Dedicated Workspace */}
          {activeTab === 'Clients' && (
            selectedClient ? (
              <ClientDetailWorkspace
                client={selectedClient}
                onBack={() => setSelectedClient(null)}
              />
            ) : (
              <ClientsView
                clients={initialClients}
                onSelectClient={handleSelectClient}
              />
            )
          )}

          {/* Projects View */}
          {activeTab === 'Projects' && (
            <ProjectsView projects={initialProjects} />
          )}

          {/* Tasks View */}
          {activeTab === 'Tasks' && (
            <TasksView tasks={initialTasks} />
          )}

          {/* Agents View */}
          {activeTab === 'Agents' && (
            <AgentsView />
          )}

          {/* Memory View */}
          {activeTab === 'Memory' && (
            <MemoryView />
          )}

          {/* Documents View */}
          {activeTab === 'Documents' && (
            <DocumentsView />
          )}

          {/* Approvals View */}
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

          {/* Activity View */}
          {activeTab === 'Activity' && (
            <ActivityView activities={initialActivities} />
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
        clients={initialClients}
        projects={initialProjects}
        onSelectClient={handleSelectClient}
        onNavigate={handleNavigate}
      />
    </div>
  );
};

export default App;
