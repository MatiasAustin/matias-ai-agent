import React from 'react';
import { 
  ArrowUpRight, 
  Sparkles, 
  Clock, 
  ChevronRight,
  ShieldCheck,
  Building2,
  FolderGit2
} from 'lucide-react';
import { ActivityRecord, ClientRecord, ProjectRecord, TaskRecord, ClientMemoryRecord } from '../../../server/db/types';

interface DashboardViewProps {
  onNavigate: (tab: any) => void;
  onSelectClient: (clientId: string) => void;
  onOpenProject?: (projectId: string) => void;
  activities: ActivityRecord[];
  tasks: TaskRecord[];
  projects: ProjectRecord[];
  clients: ClientRecord[];
  memories: ClientMemoryRecord[];
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onSelectClient,
  onOpenProject,
  activities,
  tasks,
  projects,
  clients,
  memories
}) => {
  const runningTasks = tasks.filter(t => t.status === 'running');
  const waitingApprovalTasks = tasks.filter(t => t.status === 'waiting_approval');

  return (
    <div className="space-y-12 pb-16 animate-fadeIn">
      {/* 1. Large Editorial Heading & System Status Banner */}
      <section className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs uppercase tracking-widest text-ink-muted font-medium">Studio Engine 01</span>
              <span className="text-border">·</span>
              <span className="text-xs text-ink-secondary">
                Synchronized with {clients.length} Client Workspaces
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-light tracking-tight text-ink">
              Good morning, <span className="font-semibold text-ink">Matias.</span>
            </h1>
          </div>

          {/* Real AI Employee Core State Pill */}
          <div className="flex items-center gap-3 bg-surface px-5 py-3 rounded-pill border border-border shadow-subtle">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <div className="text-xs">
              <span className="font-semibold text-ink">AI Employee Online</span>
              <span className="text-ink-secondary ml-1.5">
                · {runningTasks.length} tasks running · {waitingApprovalTasks.length} waiting approval
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Asymmetric Primary Composition */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Real Activity Log & High-Contrast Telemetry */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Main Floating Canvas: Real Operating Ledger */}
          <div className="bg-surface rounded-card-lg p-8 border border-border shadow-float relative overflow-hidden group">
            <div className="flex items-center justify-between mb-8 relative z-10">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1">
                  Operating Ledger
                </div>
                <h3 className="text-2xl font-normal tracking-tight text-ink">
                  Recent Activity Log
                </h3>
              </div>
              <button 
                onClick={() => onNavigate('Activity')}
                className="flex items-center gap-1.5 text-xs font-medium text-ink-secondary hover:text-ink transition-colors px-3 py-1.5 rounded-pill hover:bg-surface-secondary"
              >
                <span>Full Ledger</span>
                <ArrowUpRight size={14} />
              </button>
            </div>

            {/* Editorial Activity Timeline */}
            {activities.length === 0 ? (
              <div className="p-8 text-center bg-surface-secondary/40 rounded-card border border-dashed border-border text-xs text-ink-secondary">
                No activity yet.
              </div>
            ) : (
              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[1px] before:bg-border z-10">
                {activities.slice(0, 5).map((act, idx) => (
                  <div key={act.id} className="relative group/item">
                    {/* Timeline dot */}
                    <span className={`absolute -left-[27px] top-1.5 w-2 h-2 rounded-full ring-4 ring-surface transition-colors ${
                      idx === 0 ? 'bg-ink' : 'bg-ink-muted/50 group-hover/item:bg-ink'
                    }`} />

                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-ink-muted font-medium">
                          {new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="text-xs font-semibold text-ink">
                          {act.actor_id}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-ink-muted">
                        {new Date(act.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-sm text-ink font-normal leading-relaxed">
                      {act.action}
                    </p>
                    {act.result && (
                      <p className="text-xs text-ink-secondary mt-0.5 leading-relaxed font-light">
                        {act.result}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Bottom summary bar with real counts */}
            <div className="mt-8 pt-6 border-t border-border/80 flex items-center justify-between text-xs text-ink-secondary relative z-10">
              <span className="flex items-center gap-1.5">
                <Sparkles size={13} className="text-ink" />
                Persistent database records synchronized
              </span>
              <span className="font-mono text-ink-muted">{activities.length} total ledger entries</span>
            </div>
          </div>

          {/* High-Contrast Black Section: Real Studio Telemetry (Calculated from Real Database!) */}
          <div className="bg-surface-dark text-white rounded-card-lg p-8 border border-border-dark shadow-dark-float relative overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-[11px] uppercase tracking-widest text-neutral-400 font-semibold">
                  Studio Foundation Database
                </span>
                <h4 className="text-xl font-light tracking-tight text-white mt-1">
                  System Context Ledger
                </h4>
              </div>
              <span className="text-xs font-mono text-neutral-400 px-3 py-1 rounded-pill bg-surface-darkMuted border border-neutral-800">
                Persistent Storage
              </span>
            </div>

            {/* Real Data Counts */}
            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="bg-surface-darkMuted/70 border border-neutral-800/80 rounded-card p-5">
                <span className="text-xs text-neutral-400 block mb-1">Active Clients</span>
                <div className="text-3xl font-light tracking-tight text-white">
                  {clients.length}
                </div>
                <span className="text-[10px] text-neutral-400 mt-2 block">In database</span>
              </div>

              <div className="bg-surface-darkMuted/70 border border-neutral-800/80 rounded-card p-5">
                <span className="text-xs text-neutral-400 block mb-1">Knowledge Records</span>
                <div className="text-3xl font-light tracking-tight text-white">
                  {memories.length}
                </div>
                <span className="text-[10px] text-neutral-400 mt-2 block">Client memories</span>
              </div>

              <div className="bg-surface-darkMuted/70 border border-neutral-800/80 rounded-card p-5">
                <span className="text-xs text-neutral-400 block mb-1">Projects & Tasks</span>
                <div className="text-3xl font-light tracking-tight text-white">
                  {projects.length + tasks.length}
                </div>
                <span className="text-[10px] text-neutral-400 mt-2 block">{projects.length} proj · {tasks.length} tasks</span>
              </div>
            </div>

            {/* System Status info */}
            <div className="border-t border-neutral-800/80 pt-6 flex items-center justify-between text-xs text-neutral-400">
              <span>Client context layer active</span>
              <span className="font-mono text-neutral-300">Strict client isolation enforced</span>
            </div>
          </div>

        </div>

        {/* Right Column: Active Projects & Client Directory Preview */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* Active Workspaces & Studio Projects */}
          <div className="bg-surface rounded-card-lg p-7 border border-border shadow-float">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                  Active Workspaces
                </span>
                <h3 className="text-xl font-normal tracking-tight text-ink mt-0.5">
                  Studio Projects ({projects.length})
                </h3>
              </div>
              <button 
                onClick={() => onNavigate('Projects')}
                className="text-xs font-medium text-ink-secondary hover:text-ink flex items-center gap-1"
              >
                <span>View all</span>
                <ChevronRight size={14} />
              </button>
            </div>

            {projects.length === 0 ? (
              <div className="p-8 text-center bg-surface-secondary/40 rounded-card border border-dashed border-border text-xs text-ink-secondary">
                No projects yet.
              </div>
            ) : (
              <div className="space-y-3.5">
                {projects.slice(0, 3).map((proj) => (
                  <div 
                    key={proj.project_id}
                    onClick={() => onOpenProject && onOpenProject(proj.project_id)}
                    className="p-4 rounded-card bg-surface hover:bg-surface-secondary/50 border border-border transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <span className="text-[11px] text-ink-muted font-medium">
                          {proj.project_type}
                        </span>
                        <h4 className="text-sm font-semibold text-ink group-hover:text-neutral-700 transition-colors">
                          {proj.project_name}
                        </h4>
                      </div>
                      <span className="text-[11px] font-medium text-ink-secondary bg-surface-secondary px-2 py-0.5 rounded-pill">
                        {proj.status}
                      </span>
                    </div>

                    <p className="text-xs text-ink-secondary line-clamp-1 mb-3 font-light">
                      {proj.description || 'Deliverables underway.'}
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-ink-muted pt-2 border-t border-border/60">
                      <span className="flex items-center gap-1 font-mono">
                        <Clock size={11} /> {proj.deadline}
                      </span>
                      <span className="font-mono text-ink font-medium">
                        {proj.progress}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Client Activity Preview Cards */}
          <div className="bg-surface rounded-card-lg p-7 border border-border shadow-float">
            <div className="flex items-center justify-between mb-5">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                  Partner Accounts
                </span>
                <h3 className="text-xl font-normal tracking-tight text-ink mt-0.5">
                  Clients Directory ({clients.length})
                </h3>
              </div>
              <button 
                onClick={() => onNavigate('Clients')}
                className="text-xs font-medium text-ink-secondary hover:text-ink flex items-center gap-1"
              >
                <span>Directory</span>
                <ChevronRight size={14} />
              </button>
            </div>

            {clients.length === 0 ? (
              <div className="p-8 text-center bg-surface-secondary/40 rounded-card border border-dashed border-border text-xs text-ink-secondary">
                No clients yet.
              </div>
            ) : (
              <div className="space-y-3">
                {clients.slice(0, 3).map((cl) => (
                  <div 
                    key={cl.id}
                    onClick={() => onSelectClient(cl.id)}
                    className="p-3.5 rounded-card bg-surface-secondary/40 border border-border/80 hover:border-ink/20 hover:bg-surface-secondary transition-all cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <h5 className="text-xs font-semibold text-ink">{cl.company_name}</h5>
                      <p className="text-[11px] text-ink-muted font-light">{cl.industry}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-pill border border-emerald-200">
                        ● {cl.status.toUpperCase()}
                      </span>
                      <span className="block text-[10px] text-ink-muted mt-1 font-mono">
                        {new Date(cl.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
