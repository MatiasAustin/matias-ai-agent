import React from 'react';
import { Search, Bell } from 'lucide-react';
import { AIStatusState, NavigationTab } from '../types';

interface HeaderProps {
  currentPage: NavigationTab;
  aiStatus: AIStatusState;
  onCycleAIStatus: () => void;
  onOpenSearch: () => void;
  pendingApprovalsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  aiStatus,
  onCycleAIStatus,
  onOpenSearch,
  pendingApprovalsCount
}) => {
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

  return (
    <header className="h-20 w-full px-10 flex items-center justify-between border-b border-border bg-canvas/80 backdrop-blur-md sticky top-0 z-30">
      {/* Current Page Identifier */}
      <div className="flex items-center gap-3">
        <h2 className="text-sm font-semibold tracking-tight text-ink">
          {currentPage}
        </h2>
        <span className="text-border text-xs">/</span>
        <span className="text-xs text-ink-secondary font-normal tracking-wide">
          Creative Studio Canvas
        </span>
      </div>

      {/* Global Minimal Search & AI Status Cluster */}
      <div className="flex items-center gap-4">
        {/* Minimal Search Trigger */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2.5 px-4 py-2 rounded-pill bg-surface border border-border text-ink-secondary hover:text-ink hover:border-ink/20 shadow-subtle transition-all duration-150 text-xs w-64 group"
        >
          <Search size={14} className="text-ink-muted group-hover:text-ink transition-colors" />
          <span className="font-normal text-ink-secondary">Search by system...</span>
          <kbd className="ml-auto text-[10px] bg-surface-secondary text-ink-muted px-1.5 py-0.5 rounded font-mono border border-border">
            ⌘K
          </kbd>
        </button>

        {/* Persistent AI Status Indicator - Interactive to demonstrate states */}
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
            <span className="text-[11px] text-ink-muted font-normal">
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

        {/* User Profile */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-border/80">
          <div className="w-8 h-8 rounded-full bg-surface-secondary border border-border flex items-center justify-center text-xs font-semibold text-ink overflow-hidden shadow-subtle">
            <span className="text-[11px]">MA</span>
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-semibold leading-tight text-ink">Matias</span>
            <span className="text-[10px] text-ink-secondary leading-tight">Creative Partner</span>
          </div>
        </div>
      </div>
    </header>
  );
};
