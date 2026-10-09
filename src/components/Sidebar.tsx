import React from 'react';
import { 
  LayoutGrid, 
  Users, 
  Briefcase, 
  CheckSquare, 
  Cpu, 
  BrainCircuit, 
  FileText, 
  CheckCircle2, 
  Activity,
  Sparkles,
  Command
} from 'lucide-react';
import { NavigationTab } from '../types';

interface SidebarProps {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  pendingApprovalsCount: number;
  activeAgentsCount: number;
}

const navItems: { label: NavigationTab; icon: React.ElementType }[] = [
  { label: 'Dashboard', icon: LayoutGrid },
  { label: 'Clients', icon: Users },
  { label: 'Projects', icon: Briefcase },
  { label: 'Tasks', icon: CheckSquare },
  { label: 'Agents', icon: Cpu },
  { label: 'Memory', icon: BrainCircuit },
  { label: 'Documents', icon: FileText },
  { label: 'Approvals', icon: CheckCircle2 },
  { label: 'Activity', icon: Activity },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  pendingApprovalsCount,
  activeAgentsCount
}) => {
  return (
    <aside className="w-64 shrink-0 flex flex-col justify-between py-8 px-6 bg-canvas border-r border-border select-none min-h-screen">
      {/* Brand & Studio Identity */}
      <div className="flex flex-col gap-8">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-ink text-white flex items-center justify-center font-medium text-xs tracking-tighter shadow-sm">
            <span className="font-semibold text-sm">M</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold tracking-tight text-ink">Matias Studio</span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-[11px] text-ink-secondary tracking-normal">AI Creative Operating System</p>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex flex-col gap-1">
          <div className="text-[10px] uppercase tracking-wider font-semibold text-ink-muted px-3 mb-2">
            Workspace
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.label;

            return (
              <button
                key={item.label}
                onClick={() => onSelectTab(item.label)}
                className={`flex items-center justify-between w-full px-3.5 py-2.5 rounded-pill text-[13px] font-medium transition-all duration-200 group text-left ${
                  isActive
                    ? 'bg-surface text-ink shadow-subtle border border-border/80 font-semibold'
                    : 'text-ink-secondary hover:text-ink hover:bg-surface-secondary/70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon 
                    size={17} 
                    strokeWidth={isActive ? 2.2 : 1.7} 
                    className={isActive ? 'text-ink' : 'text-ink-muted group-hover:text-ink transition-colors'} 
                  />
                  <span>{item.label}</span>
                </div>

                {/* Subtext Badges */}
                {item.label === 'Approvals' && pendingApprovalsCount > 0 && (
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-pill transition-colors ${
                    isActive ? 'bg-ink text-white' : 'bg-surface-secondary text-ink'
                  }`}>
                    {pendingApprovalsCount}
                  </span>
                )}
                {item.label === 'Agents' && activeAgentsCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer System Telemetry Module */}
      <div className="pt-6 border-t border-border/70 flex flex-col gap-3">
        <div className="bg-surface rounded-card p-3.5 border border-border shadow-subtle flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Sparkles size={13} className="text-ink" />
              <span className="text-[11px] font-semibold text-ink">Autonomous Engine</span>
            </div>
            <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200/50">
              Active
            </span>
          </div>
          <p className="text-[11px] text-ink-secondary leading-snug">
            3 agents actively collaborating on XYZ AI master token sets.
          </p>
        </div>

        <div className="flex items-center justify-between px-2 text-ink-muted text-[11px]">
          <span className="flex items-center gap-1">
            <Command size={11} /> Quick Nav
          </span>
          <span>v2.8 Studio</span>
        </div>
      </div>
    </aside>
  );
};
