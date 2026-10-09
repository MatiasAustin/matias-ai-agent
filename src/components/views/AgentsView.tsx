import React from 'react';
import { 
  Cpu, 
  Sparkles, 
  BrainCircuit, 
  Activity, 
  CheckCircle2, 
  Sliders, 
  RefreshCw 
} from 'lucide-react';
import { initialAgents } from '../../data/mockData';

export const AgentsView: React.FC = () => {
  return (
    <div className="space-y-12 pb-16 animate-fadeIn">
      {/* Editorial Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="text-xs uppercase tracking-widest text-ink-muted font-medium mb-2 block">
            Synthetic Workforce
          </span>
          <h1 className="text-4xl md:text-5xl font-light tracking-tight text-ink">
            Studio AI Agents
          </h1>
          <p className="text-sm text-ink-secondary mt-2 max-w-xl font-light">
            Specialized autonomous agents operating asynchronously across design synthesis, brand retrieval, client liaison, and vector generation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-pill bg-surface border border-border text-xs font-medium text-ink hover:border-ink/20 shadow-subtle transition-all">
            <RefreshCw size={13} className="text-ink-muted" />
            <span>Re-calibrate Weights</span>
          </button>
        </div>
      </section>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {initialAgents.map((agent) => (
          <div
            key={agent.id}
            className="bg-surface rounded-card-lg p-7 border border-border shadow-float flex flex-col justify-between group hover:border-ink/20 transition-all"
          >
            <div>
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-surface-secondary flex items-center justify-center text-ink border border-border">
                  <Cpu size={18} />
                </div>
                <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-pill border inline-flex items-center gap-1.5 ${
                  agent.status === 'Active'
                    ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                    : 'text-neutral-600 bg-neutral-100 border-neutral-200'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    agent.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-neutral-400'
                  }`} />
                  {agent.status}
                </span>
              </div>

              <h3 className="text-lg font-semibold text-ink">
                {agent.name}
              </h3>
              <p className="text-xs text-ink-secondary mt-1 font-light leading-relaxed">
                {agent.role}
              </p>

              {/* Current Autonomous Action */}
              <div className="bg-surface-secondary/60 rounded-card p-4 border border-border/80 my-5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted block mb-1">
                  Active Thread
                </span>
                <p className="text-xs text-ink font-medium leading-relaxed">
                  {agent.currentAction}
                </p>
              </div>
            </div>

            {/* Metrics */}
            <div className="pt-4 border-t border-border/70 flex items-center justify-between text-xs text-ink-muted">
              <span>Memory: <strong className="text-ink font-mono font-medium">{agent.memoryLoaded}</strong></span>
              <span>Efficiency: <strong className="text-ink font-mono font-medium">{agent.efficiency}</strong></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
