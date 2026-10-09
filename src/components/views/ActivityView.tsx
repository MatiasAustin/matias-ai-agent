import React, { useState } from 'react';
import { 
  Activity, 
  Search, 
  Filter, 
  Sparkles, 
  Clock, 
  Cpu, 
  Layers, 
  ArrowUpRight 
} from 'lucide-react';
import { ActivityItem } from '../../types';

interface ActivityViewProps {
  activities: ActivityItem[];
}

export const ActivityView: React.FC<ActivityViewProps> = ({ activities }) => {
  const [filterAgent, setFilterAgent] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filtered = activities.filter(a => {
    const matchesAgent = filterAgent === 'All' || a.agent.toLowerCase().includes(filterAgent.toLowerCase());
    const matchesSearch = a.action.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (a.client && a.client.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (a.detail && a.detail.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesAgent && matchesSearch;
  });

  return (
    <div className="space-y-12 pb-16 animate-fadeIn">
      {/* Editorial Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="text-xs uppercase tracking-widest text-ink-muted font-medium mb-2 block">
            System Observability
          </span>
          <h1 className="text-4xl md:text-5xl font-light tracking-tight text-ink">
            AI Operating Ledger
          </h1>
          <p className="text-sm text-ink-secondary mt-2 max-w-xl font-light">
            Real-time chronological telemetry tracking cognitive hops, vector retrieval, Figma sync, and external actions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-ink bg-surface px-4 py-2 rounded-pill border border-border shadow-subtle">
            ● Realtime Stream
          </span>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 w-full sm:w-auto">
          {['All', 'Creative Director', 'Design Agent', 'Memory Engine', 'Research Agent', 'Client Liaison'].map((agent) => (
            <button
              key={agent}
              onClick={() => setFilterAgent(agent)}
              className={`px-3.5 py-1.5 rounded-pill text-xs font-medium transition-all whitespace-nowrap ${
                filterAgent === agent
                  ? 'bg-surface text-ink shadow-subtle border border-border font-semibold'
                  : 'bg-transparent text-ink-secondary hover:text-ink hover:bg-surface-secondary'
              }`}
            >
              {agent}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input
            type="text"
            placeholder="Search activity log..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 rounded-pill bg-surface border border-border text-xs text-ink placeholder:text-ink-muted focus:outline-none focus:border-ink/30 transition-all shadow-subtle"
          />
        </div>
      </div>

      {/* Operating Log Canvas */}
      <div className="bg-surface rounded-card-lg p-8 border border-border shadow-float relative">
        <div className="relative pl-8 space-y-8 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[1px] before:bg-border">
          {filtered.map((item, idx) => (
            <div key={item.id} className="relative group">
              {/* Subtle node marker */}
              <span className={`absolute -left-[31px] top-1.5 w-2.5 h-2.5 rounded-full ring-4 ring-surface transition-colors ${
                idx === 0 ? 'bg-ink' : 'bg-ink-muted/60 group-hover:bg-ink'
              }`} />

              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-xs text-ink-muted font-medium">
                    {item.time}
                  </span>
                  <span className="text-xs font-semibold text-ink">
                    {item.agent}
                  </span>
                  {item.client && (
                    <span className="text-[11px] text-ink-secondary bg-surface-secondary px-2 py-0.5 rounded-pill font-medium">
                      {item.client}
                    </span>
                  )}
                </div>
                {item.badge && (
                  <span className="text-[10px] text-ink-muted tracking-tight font-mono self-start sm:self-auto">
                    {item.badge}
                  </span>
                )}
              </div>

              <div className="p-4 rounded-card bg-surface-secondary/40 border border-border/80 group-hover:border-ink/20 transition-all">
                <p className="text-sm font-medium text-ink">
                  {item.action}
                </p>
                {item.detail && (
                  <p className="text-xs text-ink-secondary mt-1 font-light leading-relaxed">
                    {item.detail}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
