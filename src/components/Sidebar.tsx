import React from 'react';
import { 
  LayoutGrid, 
  Inbox,
  Users, 
  Briefcase, 
  CheckSquare, 
  Cpu, 
  BrainCircuit, 
  FileText, 
  CheckCircle2, 
  Activity, 
  Sparkles, 
  Command, 
  Settings, 
  ShieldAlert 
} from 'lucide-react';
import { NavigationTab } from '../types';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  pendingApprovalsCount: number;
  activeAgentsCount: number;
}

const baseNavItems: { label: NavigationTab; icon: React.ElementType }[] = [
  { label: 'Dashboard', icon: LayoutGrid },
  { label: 'Inbox', icon: Inbox },
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
  const { user, organization } = useAuth();

  return (
    <aside className="w-64 shrink-0 flex flex-col justify-between py-8 px-6 bg-canvas border-r border-border select-none min-h-screen">
      {/* Brand & Studio Identity */}
      <div className="flex flex-col gap-7">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-ink text-white flex items-center justify-center font-medium text-xs tracking-tighter shadow-sm">
            <span className="font-semibold text-sm">
              {organization?.name ? organization.name.charAt(0).toUpperCase() : 'M'}
            </span>
          </div>
          <div className="overflow-hidden">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold tracking-tight text-ink truncate">
                {organization?.name || 'Matias Studio'}
              </span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
            </div>
            <p className="text-[11px] text-ink-secondary tracking-normal flex items-center gap-1 truncate">
              <span>{organization?.plan || 'Studio'} Plan</span>
              <span>&middot;</span>
              <span>AI Employee OS</span>
            </p>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex flex-col gap-1">
          <div className="text-[10px] uppercase tracking-wider font-semibold text-ink-muted px-3 mb-2">
            Workspace
          </div>
          {baseNavItems.map((item) => {
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

          {/* System Settings Link */}
          <div className="text-[10px] uppercase tracking-wider font-semibold text-ink-muted px-3 mt-4 mb-2">
            Configuration
          </div>

          <button
            onClick={() => onSelectTab('Settings')}
            className={`flex items-center justify-between w-full px-3.5 py-2.5 rounded-pill text-[13px] font-medium transition-all duration-200 group text-left ${
              activeTab === 'Settings'
                ? 'bg-surface text-ink shadow-subtle border border-border/80 font-semibold'
                : 'text-ink-secondary hover:text-ink hover:bg-surface-secondary/70'
            }`}
          >
            <div className="flex items-center gap-3">
              <Settings 
                size={17} 
                strokeWidth={activeTab === 'Settings' ? 2.2 : 1.7} 
                className={activeTab === 'Settings' ? 'text-ink' : 'text-ink-muted group-hover:text-ink transition-colors'} 
              />
              <span>Settings</span>
            </div>
          </button>

          {/* Super Admin item if platform_role is SUPER_ADMIN */}
          {user?.platform_role === 'SUPER_ADMIN' && (
            <button
              onClick={() => onSelectTab('Super Admin')}
              className={`flex items-center justify-between w-full px-3.5 py-2.5 rounded-pill text-[13px] font-medium transition-all duration-200 group text-left mt-1 ${
                activeTab === 'Super Admin'
                  ? 'bg-red-950 text-red-100 shadow-subtle border border-red-800 font-semibold'
                  : 'text-red-700 hover:text-red-900 hover:bg-red-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <ShieldAlert 
                  size={17} 
                  strokeWidth={activeTab === 'Super Admin' ? 2.2 : 1.7} 
                  className={activeTab === 'Super Admin' ? 'text-red-200' : 'text-red-600'} 
                />
                <span>Super Admin</span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-100 text-red-800">
                PRO
              </span>
            </button>
          )}
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
            Multi-Tenant isolated session &middot; {user?.name || 'User'}
          </p>
        </div>

        <div className="flex items-center justify-between px-2 text-ink-muted text-[11px]">
          <span className="flex items-center gap-1">
            <Command size={11} /> Quick Nav
          </span>
          <span>v2.8 SaaS</span>
        </div>
      </div>
    </aside>
  );
};
