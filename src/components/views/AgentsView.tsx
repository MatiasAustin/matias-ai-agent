import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  Sparkles, 
  BrainCircuit, 
  Activity, 
  CheckCircle2, 
  Sliders, 
  RefreshCw,
  Shield,
  Lock,
  Unlock,
  AlertTriangle,
  Play,
  Check,
  X,
  ChevronRight
} from 'lucide-react';
import { api } from '../../api/client';
import { ToolDefinition } from '../../../server/db/types';

interface DetailedAgent {
  id: string;
  organization_id: string;
  name: string;
  role: string;
  description: string;
  status: 'Active' | 'Standby' | 'Processing';
  allowedTools: ToolDefinition[];
  blockedTools: ToolDefinition[];
  permissions: string[];
  totalExecutions: number;
  recentExecutions: any[];
  recentFailures: any[];
}

export const AgentsView: React.FC = () => {
  const [agents, setAgents] = useState<DetailedAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<DetailedAgent | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const data = await api.getAgents();
      setAgents(data);
      if (selectedAgent) {
        const refreshed = data.find((a: DetailedAgent) => a.id === selectedAgent.id);
        if (refreshed) setSelectedAgent(refreshed);
      }
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const handleToggleTool = async (agentId: string, toolId: string, currentAllowed: boolean) => {
    setActionLoading(true);
    try {
      await api.updateAgentTools(agentId, toolId, !currentAllowed);
      setNotification({
        type: 'success',
        message: `Tool "${toolId}" is now ${!currentAllowed ? 'ALLOWED' : 'BLOCKED'} for agent.`
      });
      await fetchAgents();
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-12 pb-16 animate-fadeIn">
      {/* Editorial Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="text-xs uppercase tracking-widest text-ink-muted font-medium mb-2 block">
            Synthetic Workforce &amp; Boundaries
          </span>
          <h1 className="text-4xl md:text-5xl font-light tracking-tight text-ink">
            Studio AI Agents
          </h1>
          <p className="text-sm text-ink-secondary mt-2 max-w-xl font-light">
            Autonomous specialists operating within strict tool registries, risk policies, and human confirmation gates.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={fetchAgents}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-pill bg-surface border border-border text-xs font-medium text-ink hover:border-ink/20 shadow-subtle transition-all disabled:opacity-50"
          >
            <RefreshCw size={13} className={`text-ink-muted ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Telemetry</span>
          </button>
        </div>
      </section>

      {notification && (
        <div className={`p-4 rounded-xl text-xs flex items-center justify-between ${
          notification.type === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          <div className="flex items-center gap-2">
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="opacity-60 hover:opacity-100">&times;</button>
        </div>
      )}

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent) => (
          <div
            key={agent.id}
            onClick={() => setSelectedAgent(agent)}
            className="bg-surface rounded-card-lg p-7 border border-border shadow-float flex flex-col justify-between group hover:border-ink/20 transition-all cursor-pointer relative"
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

              <h3 className="text-lg font-semibold text-ink group-hover:text-ink/80 transition-colors">
                {agent.name}
              </h3>
              <p className="text-xs text-ink-secondary mt-1 font-light leading-relaxed">
                {agent.role}
              </p>

              {/* Description */}
              <p className="text-xs text-ink-muted mt-3 font-light line-clamp-2">
                {agent.description}
              </p>

              {/* Allowed Tools Pill Preview */}
              <div className="mt-5 space-y-2">
                <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-ink-muted">
                  <span>Allowed Tools</span>
                  <span className="font-mono text-ink">{agent.allowedTools.length}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {agent.allowedTools.slice(0, 4).map((tool) => (
                    <span 
                      key={tool.id} 
                      className="px-2 py-0.5 rounded bg-surface-secondary text-[10px] font-mono text-ink border border-border"
                    >
                      {tool.id}
                    </span>
                  ))}
                  {agent.allowedTools.length > 4 && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono text-ink-muted">
                      +{agent.allowedTools.length - 4} more
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Real Database Telemetry (No fake metrics) */}
            <div className="pt-4 mt-6 border-t border-border/70 flex items-center justify-between text-xs text-ink-muted">
              <span>Real Executions: <strong className="text-ink font-mono font-medium">{agent.totalExecutions}</strong></span>
              <span className="text-[11px] text-ink font-medium flex items-center gap-1">
                Configure Tools <ChevronRight size={12} />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Agent Detail / Tool Boundary Modal */}
      {selectedAgent && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/30 backdrop-blur-sm animate-fadeIn"
          onClick={() => setSelectedAgent(null)}
        >
          <div 
            className="w-full max-w-2xl bg-surface rounded-card-lg border border-border shadow-float p-8 space-y-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-border">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-ink-muted block mb-1">
                  Agent Boundary Spec &middot; {selectedAgent.id}
                </span>
                <h2 className="text-2xl font-light text-ink">
                  {selectedAgent.name}
                </h2>
                <p className="text-xs text-ink-secondary mt-1">{selectedAgent.role}</p>
              </div>
              <button 
                onClick={() => setSelectedAgent(null)}
                className="p-1.5 rounded-full hover:bg-surface-secondary text-ink-muted hover:text-ink"
              >
                <X size={18} />
              </button>
            </div>

            {/* Policy & Permissions Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-surface-secondary border border-border">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted block mb-1">
                  Assigned Granular Permissions
                </span>
                <div className="flex flex-wrap gap-1 mt-2">
                  {selectedAgent.permissions.length > 0 ? (
                    selectedAgent.permissions.map((p) => (
                      <span key={p} className="px-2 py-0.5 rounded bg-white text-[10px] font-mono border border-border text-ink">
                        {p}
                      </span>
                    ))
                  ) : (
                    <span className="text-ink-muted text-[11px] italic">Inherits tool-level mapping only</span>
                  )}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-surface-secondary border border-border">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted block mb-1">
                  Active Execution Policy
                </span>
                <p className="text-ink font-light mt-1">
                  External dispatches require human sign-off; read actions execute automatically.
                </p>
              </div>
            </div>

            {/* Allowed Tools Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-ink">
                  Allowed Tools ({selectedAgent.allowedTools.length})
                </h4>
                <span className="text-[10px] text-ink-muted">Click to revoke access</span>
              </div>
              <div className="space-y-2">
                {selectedAgent.allowedTools.length === 0 ? (
                  <div className="p-4 rounded-xl bg-surface-secondary text-center text-xs text-ink-muted">
                    No tools currently permitted.
                  </div>
                ) : (
                  selectedAgent.allowedTools.map((t) => (
                    <div 
                      key={t.id} 
                      className="p-3 rounded-xl border border-border bg-white flex items-center justify-between hover:border-ink/20"
                    >
                      <div>
                        <div className="font-medium text-xs text-ink">{t.name}</div>
                        <div className="font-mono text-[10px] text-ink-muted">{t.id} &middot; Risk: {t.risk_level}</div>
                      </div>
                      <button
                        onClick={() => handleToggleTool(selectedAgent.id, t.id, true)}
                        disabled={actionLoading}
                        className="px-3 py-1 rounded-lg border border-red-200 text-red-700 bg-red-50 hover:bg-red-100 text-[11px] font-medium"
                      >
                        Block Access
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Blocked Tools Section */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                  Blocked Tools ({selectedAgent.blockedTools.length})
                </h4>
                <span className="text-[10px] text-ink-muted">Click to grant access</span>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {selectedAgent.blockedTools.map((t) => (
                  <div 
                    key={t.id} 
                    className="p-3 rounded-xl border border-border/80 bg-surface-secondary/40 flex items-center justify-between opacity-80 hover:opacity-100"
                  >
                    <div>
                      <div className="font-medium text-xs text-ink">{t.name}</div>
                      <div className="font-mono text-[10px] text-ink-muted">{t.id} &middot; Risk: {t.risk_level}</div>
                    </div>
                    <button
                      onClick={() => handleToggleTool(selectedAgent.id, t.id, false)}
                      disabled={actionLoading}
                      className="px-3 py-1 rounded-lg border border-border bg-white hover:bg-surface-secondary text-[11px] font-medium text-ink"
                    >
                      Allow Access
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Real Executions History (Real Data Only) */}
            <div className="space-y-2 pt-2 border-t border-border">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted block">
                Recent Real Executions
              </span>
              {selectedAgent.recentExecutions.length === 0 ? (
                <div className="p-4 rounded-xl bg-surface-secondary text-center text-xs text-ink-muted">
                  No executions yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedAgent.recentExecutions.map((e) => (
                    <div key={e.id} className="p-2.5 rounded-lg border border-border bg-white text-xs flex items-center justify-between">
                      <div className="font-mono text-[11px] text-ink">{e.tool_id}</div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                        e.status === 'completed' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                      }`}>
                        {e.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
