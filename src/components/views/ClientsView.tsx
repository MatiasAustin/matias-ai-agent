import React, { useState } from 'react';
import { 
  Plus, 
  ArrowUpRight, 
  Search, 
  Sparkles, 
  Layers,
  Cpu,
  BrainCircuit,
  SlidersHorizontal
} from 'lucide-react';
import { Client } from '../../types';

interface ClientsViewProps {
  clients: Client[];
  onSelectClient: (client: Client) => void;
}

export const ClientsView: React.FC<ClientsViewProps> = ({
  clients,
  onSelectClient
}) => {
  const [filter, setFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredClients = clients.filter(c => {
    const matchesFilter = filter === 'All' || c.status === filter;
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.industry.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-12 pb-16 animate-fadeIn">
      {/* Editorial Page Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="text-xs uppercase tracking-widest text-ink-muted font-medium mb-2 block">
            Studio Partners & Ecosystem
          </span>
          <h1 className="text-4xl md:text-5xl font-light tracking-tight text-ink">
            Clients Directory
          </h1>
          <p className="text-sm text-ink-secondary mt-2 max-w-xl font-light">
            Every client is governed by a dedicated autonomous knowledge graph, brand memory model, and communication persona.
          </p>
        </div>

        {/* Action button */}
        <button className="flex items-center gap-2 px-5 py-2.5 rounded-pill bg-ink text-white text-xs font-medium hover:bg-neutral-800 transition-colors shadow-subtle self-start md:self-auto">
          <Plus size={14} />
          <span>Onboard Client</span>
        </button>
      </section>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {['All', 'Active', 'Review', 'Onboarding'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-pill text-xs font-medium transition-all ${
                filter === f
                  ? 'bg-surface text-ink shadow-subtle border border-border font-semibold'
                  : 'bg-transparent text-ink-secondary hover:text-ink hover:bg-surface-secondary'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input
            type="text"
            placeholder="Filter clients by name or industry..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-pill bg-surface border border-border text-xs text-ink placeholder:text-ink-muted focus:outline-none focus:border-ink/30 transition-all shadow-subtle"
          />
        </div>
      </div>

      {/* 1. Large Editorial Client Preview Cards (Top tier) */}
      <section className="space-y-4">
        <div className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
          Active Workspaces
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredClients.slice(0, 2).map((client) => (
            <div
              key={client.id}
              onClick={() => onSelectClient(client)}
              className="bg-surface rounded-card-lg p-8 border border-border shadow-float hover:border-ink/25 transition-all duration-200 cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <span className="text-[11px] font-mono uppercase tracking-wider text-ink-muted block mb-1">
                      {client.industry}
                    </span>
                    <h3 className="text-2xl font-normal tracking-tight text-ink group-hover:text-neutral-700 transition-colors">
                      {client.name}
                    </h3>
                  </div>

                  <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-pill border border-emerald-200 flex items-center gap-1.5 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {client.aiMemoryStatus}
                  </span>
                </div>

                <div className="bg-surface-secondary/50 rounded-card p-4 border border-border/80 my-5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted block mb-1">
                    Current Focus
                  </span>
                  <p className="text-sm font-medium text-ink">
                    {client.currentProject}
                  </p>
                </div>

                {/* Brand Personality preview chips */}
                <div className="space-y-1.5">
                  <span className="text-[10px] text-ink-muted block">Brand Memory DNA</span>
                  <div className="flex flex-wrap gap-1.5">
                    {client.brandPersonality.map((trait, i) => (
                      <span key={i} className="text-[11px] px-2.5 py-0.5 rounded-pill bg-canvas text-ink-secondary border border-border">
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom bar */}
              <div className="pt-6 mt-6 border-t border-border flex items-center justify-between text-xs text-ink-secondary">
                <span className="font-mono text-ink-muted">Active {client.lastActivity}</span>
                <span className="font-medium text-ink flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  Enter Dedicated Workspace <ArrowUpRight size={13} />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Spacious Editorial List Rows for All Clients */}
      <section className="space-y-4">
        <div className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
          All Studio Accounts
        </div>

        <div className="bg-surface rounded-card-lg border border-border shadow-float overflow-hidden">
          <div className="hidden md:grid grid-cols-12 gap-4 px-8 py-3.5 border-b border-border text-[11px] uppercase tracking-wider text-ink-muted font-medium bg-canvas/30">
            <span className="col-span-4">Company & Industry</span>
            <span className="col-span-4">Current Mandate</span>
            <span className="col-span-2">Memory Status</span>
            <span className="col-span-2 text-right">Last Action</span>
          </div>

          <div className="divide-y divide-border/70">
            {filteredClients.map((client) => (
              <div
                key={client.id}
                onClick={() => onSelectClient(client)}
                className="grid grid-cols-1 md:grid-cols-12 gap-4 px-8 py-5 hover:bg-surface-secondary/40 transition-colors cursor-pointer group items-center"
              >
                {/* Company Name & Industry */}
                <div className="col-span-4">
                  <h4 className="text-sm font-semibold text-ink group-hover:text-neutral-700 transition-colors">
                    {client.name}
                  </h4>
                  <p className="text-xs text-ink-secondary mt-0.5 font-light">
                    {client.industry}
                  </p>
                </div>

                {/* Current Project */}
                <div className="col-span-4">
                  <p className="text-xs text-ink font-medium">
                    {client.currentProject}
                  </p>
                  <span className="text-[11px] text-ink-muted">
                    {client.status} · Retainer active
                  </span>
                </div>

                {/* AI Memory Status */}
                <div className="col-span-2">
                  <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-pill border border-emerald-200 inline-flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {client.aiMemoryStatus}
                  </span>
                </div>

                {/* Last Activity & Arrow */}
                <div className="col-span-2 text-left md:text-right flex items-center md:justify-end gap-2">
                  <span className="font-mono text-xs text-ink-muted">
                    {client.lastActivity}
                  </span>
                  <ArrowUpRight size={14} className="text-ink-muted group-hover:text-ink transition-colors opacity-0 group-hover:opacity-100" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
