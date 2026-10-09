import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, ChevronDown, Building2, ShieldAlert, LogOut, Settings as SettingsIcon, Check } from 'lucide-react';
import { AIStatusState, NavigationTab } from '../types';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  currentPage: NavigationTab;
  aiStatus: AIStatusState;
  onCycleAIStatus: () => void;
  onOpenSearch: () => void;
  pendingApprovalsCount: number;
  onNavigate?: (tab: NavigationTab) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  aiStatus,
  onCycleAIStatus,
  onOpenSearch,
  pendingApprovalsCount,
  onNavigate
}) => {
  const { user, organization, role, userOrganizations, switchOrg, logout } = useAuth();
  const [showOrgDropdown, setShowOrgDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const orgDropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (orgDropdownRef.current && !orgDropdownRef.current.contains(event.target as Node)) {
        setShowOrgDropdown(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getStatusDot = () => {
    switch (aiStatus.type) {
      case 'online':
        return <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />;
      case 'working':
        return <span className="inline-block w-2 h-2 rounded-full bg-blue-500 animate-pulse" />;
      case 'waiting':
        return <span className="inline-block w-2 h-2 rounded-full border border-amber-500 bg-transparent" />;
      case 'attention':
        return <span className="inline-block w-2 h-2 rounded-full bg-rose-500" />;
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <header className="h-20 w-full px-8 md:px-10 flex items-center justify-between border-b border-border bg-canvas/80 backdrop-blur-md sticky top-0 z-30">
      {/* Current Page Identifier & Org Switcher */}
      <div className="flex items-center gap-4">
        {/* Organization Switcher Dropdown */}
        <div className="relative" ref={orgDropdownRef}>
          <button
            onClick={() => setShowOrgDropdown(!showOrgDropdown)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface border border-border hover:border-ink/20 shadow-subtle text-xs transition-colors"
          >
            <Building2 className="w-3.5 h-3.5 text-ink-muted" />
            <span className="font-medium text-ink max-w-[140px] truncate">
              {organization?.name || 'Matias Studio'}
            </span>
            <ChevronDown className="w-3 h-3 text-ink-muted" />
          </button>

          {showOrgDropdown && (
            <div className="absolute left-0 mt-2 w-64 bg-surface border border-border rounded-2xl shadow-card p-2 z-50 text-xs">
              <div className="px-3 py-2 text-[10px] uppercase tracking-wider font-semibold text-ink-muted border-b border-border/60">
                Switch Organization
              </div>
              <div className="py-1">
                {userOrganizations.map((uo) => {
                  const isCurrent = uo.organization.id === organization?.id;
                  return (
                    <button
                      key={uo.organization.id}
                      onClick={() => {
                        switchOrg(uo.organization.id);
                        setShowOrgDropdown(false);
                      }}
                      className="w-full px-3 py-2.5 rounded-xl flex items-center justify-between hover:bg-surface-secondary text-left transition-colors"
                    >
                      <div>
                        <div className="font-medium text-ink">{uo.organization.name}</div>
                        <div className="text-[10px] text-ink-muted font-mono">{uo.role} &middot; {uo.organization.plan}</div>
                      </div>
                      {isCurrent && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <span className="text-border text-xs">/</span>

        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold tracking-tight text-ink">
            {currentPage}
          </h2>
          <span className="text-border text-xs hidden sm:inline">/</span>
          <span className="text-xs text-ink-secondary font-normal tracking-wide hidden sm:inline">
            Creative Studio Canvas
          </span>
        </div>
      </div>

      {/* Global Minimal Search & AI Status Cluster */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* Super Admin Access Badge if user has SUPER_ADMIN role */}
        {user?.platform_role === 'SUPER_ADMIN' && onNavigate && (
          <button
            onClick={() => onNavigate('Super Admin')}
            className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-pill text-[11px] font-mono font-medium transition-all ${
              currentPage === 'Super Admin'
                ? 'bg-red-950 text-red-200 border border-red-800'
                : 'bg-red-50 hover:bg-red-100 text-red-800 border border-red-200'
            }`}
          >
            <ShieldAlert className="w-3 h-3 text-red-700" />
            Super Admin
          </button>
        )}

        {/* Minimal Search Trigger */}
        <button
          onClick={onOpenSearch}
          className="hidden sm:flex items-center gap-2.5 px-4 py-2 rounded-pill bg-surface border border-border text-ink-secondary hover:text-ink hover:border-ink/20 shadow-subtle transition-all duration-150 text-xs w-52 md:w-64 group"
        >
          <Search size={14} className="text-ink-muted group-hover:text-ink transition-colors" />
          <span className="font-normal text-ink-secondary">Search system...</span>
          <kbd className="ml-auto text-[10px] bg-surface-secondary text-ink-muted px-1.5 py-0.5 rounded font-mono border border-border">
            ⌘K
          </kbd>
        </button>

        {/* Persistent AI Status Indicator */}
        <button
          onClick={onCycleAIStatus}
          title="Click to cycle simulated AI status state"
          className="flex items-center gap-2 px-3.5 py-2 rounded-pill bg-surface border border-border hover:border-ink/20 shadow-subtle transition-all text-xs group cursor-pointer"
        >
          {getStatusDot()}
          <span className="font-medium text-ink tracking-tight">
            {aiStatus.label}
          </span>
          {aiStatus.subtext && (
            <span className="text-[11px] text-ink-muted font-normal hidden sm:inline">
              · {aiStatus.subtext}
            </span>
          )}
        </button>

        {/* Studio Notifications */}
        <button 
          className="relative p-2.5 rounded-full bg-surface border border-border hover:border-ink/20 shadow-subtle transition-all text-ink"
          title="Studio Notifications"
        >
          <Bell size={15} strokeWidth={1.8} />
          {pendingApprovalsCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-ink ring-2 ring-surface" />
          )}
        </button>

        {/* User Profile Dropdown */}
        <div className="relative pl-2 border-l border-border/80" ref={userDropdownRef}>
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="w-8 h-8 rounded-full bg-surface-secondary border border-border flex items-center justify-center text-xs font-semibold text-ink overflow-hidden shadow-subtle group-hover:border-ink/30 transition-colors">
              <span className="text-[11px]">{getInitials(user?.name)}</span>
            </div>
            <div className="hidden md:flex flex-col">
              <span className="text-xs font-semibold leading-tight text-ink">
                {user?.name || 'Matias'}
              </span>
              <span className="text-[10px] text-ink-secondary leading-tight">
                {role || 'Creative Partner'}
              </span>
            </div>
            <ChevronDown className="w-3 h-3 text-ink-muted group-hover:text-ink transition-colors" />
          </button>

          {showUserDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-surface border border-border rounded-2xl shadow-card p-2 z-50 text-xs">
              <div className="px-3 py-2 border-b border-border/60">
                <div className="font-medium text-ink">{user?.name}</div>
                <div className="text-[10px] text-ink-muted font-mono">{user?.email}</div>
                <div className="text-[10px] text-ink-secondary mt-1">
                  Tenant: <span className="font-semibold text-ink">{role}</span>
                  {user?.platform_role === 'SUPER_ADMIN' && ' · Super Admin'}
                </div>
              </div>

              <div className="py-1">
                {onNavigate && (
                  <button
                    onClick={() => {
                      onNavigate('Settings');
                      setShowUserDropdown(false);
                    }}
                    className="w-full px-3 py-2 rounded-xl flex items-center gap-2.5 text-ink-secondary hover:text-ink hover:bg-surface-secondary text-left transition-colors"
                  >
                    <SettingsIcon className="w-3.5 h-3.5" />
                    <span>Studio Settings</span>
                  </button>
                )}

                {user?.platform_role === 'SUPER_ADMIN' && onNavigate && (
                  <button
                    onClick={() => {
                      onNavigate('Super Admin');
                      setShowUserDropdown(false);
                    }}
                    className="w-full px-3 py-2 rounded-xl flex items-center gap-2.5 text-red-700 hover:text-red-900 hover:bg-red-50 text-left transition-colors"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Super Admin Area</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    logout();
                    setShowUserDropdown(false);
                  }}
                  className="w-full px-3 py-2 rounded-xl flex items-center gap-2.5 text-red-600 hover:text-red-800 hover:bg-red-50 text-left transition-colors mt-1 border-t border-border/40"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
