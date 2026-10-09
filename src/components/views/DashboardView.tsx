import React from 'react';
import { 
  ArrowUpRight, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight,
  FolderGit2,
  Cpu,
  Layers,
  ShieldCheck
} from 'lucide-react';
import { ActivityItem, ApprovalItem, Client, Project, Task } from '../../types';

interface DashboardViewProps {
  onNavigate: (tab: any) => void;
  onOpenApproval: (item: ApprovalItem) => void;
  onSelectClient: (client: Client) => void;
  activities: ActivityItem[];
  approvals: ApprovalItem[];
  tasks: Task[];
  projects: Project[];
  clients: Client[];
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onOpenApproval,
  onSelectClient,
  activities,
  approvals,
  tasks,
  projects,
  clients
}) => {
  const pendingApprovals = approvals.filter(a => a.status === 'pending');
  const runningTasks = tasks.filter(t => t.status === 'Running');

  return (
    <div className="space-y-12 pb-16 animate-fadeIn">
      {/* 1. Large Editorial Heading & System Status Banner */}
      <section className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs uppercase tracking-widest text-ink-muted font-medium">Studio Engine 01</span>
              <span className="text-border">·</span>
              <span className="text-xs text-ink-secondary">Synchronized with 4 Creative Workspaces</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-light tracking-tight text-ink">
              Good morning, <span className="font-semibold text-ink">Matias.</span>
            </h1>
          </div>

          {/* AI Employee Core State Pill */}
          <div className="flex items-center gap-3 bg-surface px-5 py-3 rounded-pill border border-border shadow-subtle">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <div className="text-xs">
              <span className="font-semibold text-ink">AI Employee Online</span>
              <span className="text-ink-secondary ml-1.5">
                · {runningTasks.length} tasks running · {pendingApprovals.length} approvals waiting
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Asymmetric Primary Composition */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: AI Employee Command Center & High-Contrast Section (Ref 1 Influence) */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Main Floating Canvas: Live AI Activity Log */}
          <div className="bg-surface rounded-card-lg p-8 border border-border shadow-float relative overflow-hidden group">
            {/* Subtle background ambient mesh */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-amber-50/40 via-stone-50/20 to-transparent pointer-events-none rounded-full blur-2xl" />

            <div className="flex items-center justify-between mb-8 relative z-10">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1">
                  Operating Log
                </div>
                <h3 className="text-2xl font-normal tracking-tight text-ink">
                  AI Employee Activity
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
                        {act.time}
                      </span>
                      <span className="text-xs font-semibold text-ink">
                        {act.agent}
                      </span>
                      {act.client && (
                        <span className="text-[11px] text-ink-secondary bg-surface-secondary px-2 py-0.5 rounded-pill font-medium">
                          {act.client}
                        </span>
                      )}
                    </div>
                    {act.badge && (
                      <span className="text-[10px] text-ink-muted tracking-tight font-medium self-start sm:self-auto">
                        {act.badge}
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-ink font-normal leading-relaxed">
                    {act.action}
                  </p>
                  {act.detail && (
                    <p className="text-xs text-ink-secondary mt-0.5 leading-relaxed font-light">
                      {act.detail}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Bottom summary bar */}
            <div className="mt-8 pt-6 border-t border-border/80 flex items-center justify-between text-xs text-ink-secondary relative z-10">
              <span className="flex items-center gap-1.5">
                <Sparkles size={13} className="text-ink" />
                Continuously observing briefs, Figma changes, and Slack queries
              </span>
              <span className="font-mono text-ink-muted">0.4s response latency</span>
            </div>
          </div>

          {/* High-Contrast Black Section: Real-time Studio Telemetry (Inspired directly by Ref 1 Dark Card) */}
          <div className="bg-surface-dark text-white rounded-card-lg p-8 border border-border-dark shadow-dark-float relative overflow-hidden">
            {/* Subtle glow orb */}
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-gradient-to-br from-amber-500/20 to-orange-600/0 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-[11px] uppercase tracking-widest text-neutral-400 font-semibold">
                  Autonomous Studio Velocity
                </span>
                <h4 className="text-xl font-light tracking-tight text-white mt-1">
                  Synthetic Workload Distribution
                </h4>
              </div>
              <span className="text-xs font-mono text-neutral-400 px-3 py-1 rounded-pill bg-surface-darkMuted border border-neutral-800">
                Live Pulse · 60Hz
              </span>
            </div>

            {/* Large Data Display */}
            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="bg-surface-darkMuted/70 border border-neutral-800/80 rounded-card p-5">
                <span className="text-xs text-neutral-400 block mb-1">Studio Output</span>
                <div className="text-3xl font-light tracking-tight text-white">
                  98.4<span className="text-sm text-neutral-500 font-normal">%</span>
                </div>
                <span className="text-[10px] text-emerald-400 mt-2 block">+14% vs human baseline</span>
              </div>

              <div className="bg-surface-darkMuted/70 border border-neutral-800/80 rounded-card p-5">
                <span className="text-xs text-neutral-400 block mb-1">Knowledge Nodes</span>
                <div className="text-3xl font-light tracking-tight text-white">
                  353
                </div>
                <span className="text-[10px] text-neutral-400 mt-2 block">Across 4 client models</span>
              </div>

              <div className="bg-surface-darkMuted/70 border border-neutral-800/80 rounded-card p-5">
                <span className="text-xs text-neutral-400 block mb-1">Weekly Time Saved</span>
                <div className="text-3xl font-light tracking-tight text-white">
                  93<span className="text-sm text-neutral-500 font-normal">h</span>
                </div>
                <span className="text-[10px] text-neutral-400 mt-2 block">Auto-drafting & token sync</span>
              </div>
            </div>

            {/* Running Sub-Agents Status Grid */}
            <div className="border-t border-neutral-800/80 pt-6">
              <div className="flex items-center justify-between text-xs mb-3 text-neutral-400">
                <span className="font-medium">Active Agent Heartbeat</span>
                <span className="font-mono">5 active instances</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-card-sm bg-surface-darkMuted/50 border border-neutral-800/60 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-neutral-200 font-medium">Creative Director</span>
                  </div>
                  <span className="text-neutral-500 font-mono text-[11px]">XYZ AI tokens</span>
                </div>
                <div className="p-3 rounded-card-sm bg-surface-darkMuted/50 border border-neutral-800/60 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                    <span className="text-neutral-200 font-medium">Design Agent</span>
                  </div>
                  <span className="text-neutral-500 font-mono text-[11px]">Figma layout sync</span>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Right Column: Pending Approvals & Supporting Modules */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* Pending Approvals Card (Prompt emphasis: Calm, Intentional, High Attention) */}
          <div className="bg-surface rounded-card-lg p-7 border border-border shadow-float">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                    Human-in-the-Loop
                  </span>
                  {pendingApprovals.length > 0 && (
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                  )}
                </div>
                <h3 className="text-xl font-normal tracking-tight text-ink mt-0.5">
                  Pending Approvals
                </h3>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-pill bg-surface-secondary text-ink border border-border">
                {pendingApprovals.length} Waiting
              </span>
            </div>

            {pendingApprovals.length === 0 ? (
              <div className="py-8 text-center bg-surface-secondary/40 rounded-card border border-dashed border-border text-ink-secondary text-xs">
                <ShieldCheck size={24} className="mx-auto mb-2 text-ink-muted" />
                All proposed autonomous actions have been approved.
              </div>
            ) : (
              <div className="space-y-4">
                {pendingApprovals.map((app) => (
                  <div 
                    key={app.id} 
                    className="p-5 rounded-card bg-surface-secondary/50 border border-border hover:border-ink/20 transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted block mb-1">
                          {app.client} · {app.time}
                        </span>
                        <h5 className="text-sm font-semibold text-ink leading-snug">
                          {app.title}
                        </h5>
                      </div>
                      <span className="text-[10px] font-mono font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-pill border border-emerald-200">
                        {app.confidence}% Confident
                      </span>
                    </div>

                    <div className="bg-surface rounded-card-sm p-3 border border-border text-xs text-ink-secondary space-y-1">
                      <div className="text-[11px] font-medium text-ink">
                        Proposed action: <span className="font-normal text-ink-secondary">{app.proposedAction}</span>
                      </div>
                      <div className="text-[11px] text-ink-muted">
                        Reason: {app.reason}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <button
                        onClick={() => onOpenApproval(app)}
                        className="text-xs font-semibold text-ink underline underline-offset-4 hover:text-ink-secondary transition-colors"
                      >
                        Review Full Message
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onOpenApproval(app)}
                          className="px-4 py-1.5 rounded-pill bg-ink text-white text-xs font-medium hover:bg-neutral-800 transition-colors shadow-sm"
                        >
                          Review & Act
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Workspaces & Studio Projects */}
          <div className="bg-surface rounded-card-lg p-7 border border-border shadow-float">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                  Studio Focus
                </span>
                <h3 className="text-xl font-normal tracking-tight text-ink mt-0.5">
                  Active Projects
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

            <div className="space-y-3.5">
              {projects.slice(0, 3).map((proj) => (
                <div 
                  key={proj.id}
                  onClick={() => onNavigate('Projects')}
                  className="p-4 rounded-card bg-surface hover:bg-surface-secondary/50 border border-border transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="text-[11px] text-ink-muted font-medium">
                        {proj.client}
                      </span>
                      <h4 className="text-sm font-semibold text-ink group-hover:text-neutral-700 transition-colors">
                        {proj.title}
                      </h4>
                    </div>
                    <span className="text-[11px] font-medium text-ink-secondary bg-surface-secondary px-2 py-0.5 rounded-pill">
                      {proj.status}
                    </span>
                  </div>

                  <p className="text-xs text-ink-secondary line-clamp-1 mb-3">
                    Current task: {proj.currentTask}
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
          </div>

          {/* Client Activity Preview Cards (Editorial Card Layout) */}
          <div className="bg-surface rounded-card-lg p-7 border border-border shadow-float">
            <div className="flex items-center justify-between mb-5">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                  Client Health
                </span>
                <h3 className="text-xl font-normal tracking-tight text-ink mt-0.5">
                  Recent Clients
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

            <div className="space-y-3">
              {clients.slice(0, 3).map((cl) => (
                <div 
                  key={cl.id}
                  onClick={() => onSelectClient(cl)}
                  className="p-3.5 rounded-card bg-surface-secondary/40 border border-border/80 hover:border-ink/20 hover:bg-surface-secondary transition-all cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <h5 className="text-xs font-semibold text-ink">{cl.name}</h5>
                    <p className="text-[11px] text-ink-muted">{cl.industry}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-pill border border-emerald-200">
                      ● {cl.aiMemoryStatus}
                    </span>
                    <span className="block text-[10px] text-ink-muted mt-1 font-mono">
                      {cl.lastActivity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
