import React, { useState, useEffect } from 'react';
import { Search, X, Users, Briefcase, BrainCircuit, ArrowRight, CornerDownLeft } from 'lucide-react';
import { Client, Project, NavigationTab } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: Client[];
  projects: Project[];
  onSelectClient: (client: Client) => void;
  onNavigate: (tab: NavigationTab) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  clients,
  projects,
  onSelectClient,
  onNavigate
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const matchedClients = clients.filter(c => 
    c.name.toLowerCase().includes(query.toLowerCase()) || 
    c.industry.toLowerCase().includes(query.toLowerCase())
  );

  const matchedProjects = projects.filter(p => 
    p.title.toLowerCase().includes(query.toLowerCase()) || 
    p.client.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-ink/20 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-xl bg-surface rounded-card-lg border border-border shadow-float overflow-hidden space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-border">
          <Search size={16} className="text-ink-muted" />
          <input
            type="text"
            autoFocus
            placeholder="Search clients, workspaces, knowledge nodes, or commands..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full text-sm text-ink placeholder:text-ink-muted bg-transparent focus:outline-none"
          />
          <button 
            onClick={onClose}
            className="p-1 rounded-full text-ink-muted hover:text-ink"
          >
            <X size={15} />
          </button>
        </div>

        {/* Results */}
        <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
          {/* Quick Views */}
          <div className="space-y-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted px-3">
              Navigation
            </span>
            <div className="grid grid-cols-3 gap-2 p-2">
              {[
                { label: 'Dashboard' as NavigationTab },
                { label: 'Approvals' as NavigationTab },
                { label: 'Memory' as NavigationTab },
              ].map(t => (
                <button
                  key={t.label}
                  onClick={() => {
                    onNavigate(t.label);
                    onClose();
                  }}
                  className="px-3 py-2 rounded-card-sm bg-surface-secondary/50 hover:bg-surface-secondary border border-border text-xs text-left font-medium text-ink transition-colors"
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Matched Clients */}
          {matchedClients.length > 0 && (
            <div className="space-y-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted px-3">
                Clients & Workspaces
              </span>
              {matchedClients.map(c => (
                <div
                  key={c.id}
                  onClick={() => {
                    onSelectClient(c);
                    onClose();
                  }}
                  className="flex items-center justify-between p-3 rounded-card hover:bg-surface-secondary/60 cursor-pointer transition-colors text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <Users size={14} className="text-ink-muted" />
                    <span className="font-medium text-ink">{c.name}</span>
                    <span className="text-[11px] text-ink-muted font-light">({c.industry})</span>
                  </div>
                  <span className="text-[10px] text-ink-muted flex items-center gap-1">
                    Open <ArrowRight size={11} />
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Matched Projects */}
          {matchedProjects.length > 0 && (
            <div className="space-y-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted px-3">
                Projects
              </span>
              {matchedProjects.map(p => (
                <div
                  key={p.id}
                  onClick={() => {
                    onNavigate('Projects');
                    onClose();
                  }}
                  className="flex items-center justify-between p-3 rounded-card hover:bg-surface-secondary/60 cursor-pointer transition-colors text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <Briefcase size={14} className="text-ink-muted" />
                    <span className="font-medium text-ink">{p.title}</span>
                    <span className="text-[11px] text-ink-muted font-light">· {p.client}</span>
                  </div>
                  <span className="text-[10px] text-ink-muted flex items-center gap-1">
                    View <ArrowRight size={11} />
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 bg-canvas border-t border-border flex items-center justify-between text-[11px] text-ink-muted">
          <span>Search system index</span>
          <span className="flex items-center gap-1 font-mono">
            <span>ESC to close</span>
          </span>
        </div>
      </div>
    </div>
  );
};
