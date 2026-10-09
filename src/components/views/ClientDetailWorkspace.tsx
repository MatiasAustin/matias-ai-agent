import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Sparkles, 
  FolderGit2, 
  BrainCircuit, 
  Mail, 
  Layers, 
  FileText, 
  ShieldCheck, 
  Activity,
  CreditCard,
  Clock,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { Client } from '../../types';

interface ClientDetailWorkspaceProps {
  client: Client;
  onBack: () => void;
}

type WorkspaceSubTab = 
  | 'Overview' 
  | 'Brand' 
  | 'Projects' 
  | 'Memory' 
  | 'Documents' 
  | 'Communication' 
  | 'Commercial' 
  | 'Activity';

export const ClientDetailWorkspace: React.FC<ClientDetailWorkspaceProps> = ({
  client,
  onBack
}) => {
  const [activeTab, setActiveTab] = useState<WorkspaceSubTab>('Overview');

  const tabs: WorkspaceSubTab[] = [
    'Overview',
    'Brand',
    'Projects',
    'Memory',
    'Documents',
    'Communication',
    'Commercial',
    'Activity'
  ];

  return (
    <div className="space-y-10 pb-16 animate-fadeIn">
      {/* Back button & Breadcrumb */}
      <div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-ink-secondary hover:text-ink transition-colors px-3 py-1.5 rounded-pill bg-surface border border-border shadow-subtle mb-4"
        >
          <ArrowLeft size={13} />
          <span>Back to Clients Directory</span>
        </button>
      </div>

      {/* Client Identity Header */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-border pb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider text-ink-muted">
              {client.industry}
            </span>
            <span className="text-border">·</span>
            <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-pill border border-emerald-200">
              ● AI Memory {client.aiMemoryStatus}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-light tracking-tight text-ink">
            {client.name}
          </h1>
          <p className="text-sm text-ink-secondary mt-2 max-w-2xl font-light">
            Dedicated studio workspace for autonomous brand evolution, live design system tokens, and client communications.
          </p>
        </div>

        {/* Quick Studio Metrics */}
        <div className="flex items-center gap-4">
          <div className="bg-surface rounded-card p-4 border border-border shadow-subtle min-w-[120px]">
            <span className="text-[11px] text-ink-muted block">Memory Nodes</span>
            <span className="text-2xl font-light text-ink mt-0.5 block">{client.metrics.memoryNodes}</span>
          </div>
          <div className="bg-surface rounded-card p-4 border border-border shadow-subtle min-w-[120px]">
            <span className="text-[11px] text-ink-muted block">Saved Studio Time</span>
            <span className="text-2xl font-light text-ink mt-0.5 block">{client.metrics.studioHoursSaved}</span>
          </div>
        </div>
      </section>

      {/* Contextual Sub-Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-border scrollbar-none">
        {tabs.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-pill text-xs font-medium transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-ink text-white shadow-subtle'
                  : 'bg-surface text-ink-secondary hover:text-ink hover:bg-surface-secondary border border-border/80'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Workspace Content Views */}
      {activeTab === 'Overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Column */}
          <div className="lg:col-span-7 space-y-8">
            <div className="bg-surface rounded-card-lg p-8 border border-border shadow-float">
              <div className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-2">
                Current Studio Mandate
              </div>
              <h2 className="text-2xl font-light tracking-tight text-ink mb-4">
                {client.currentProject}
              </h2>
              <p className="text-sm text-ink-secondary leading-relaxed mb-6 font-light">
                The AI Creative Employee is continuously balancing typography scale, Figma design components, and Slack partner inquiries. All assets adhere to the strict brand personality guidelines formulated in Q1.
              </p>

              <div className="p-4 rounded-card bg-surface-secondary/70 border border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-ink text-white flex items-center justify-center">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <h5 className="text-xs font-semibold text-ink">Active Token System</h5>
                    <p className="text-[11px] text-ink-muted">Synchronized across 4 Figma libraries</p>
                  </div>
                </div>
                <button className="text-xs font-medium text-ink underline underline-offset-4">
                  Open Vector Canvas
                </button>
              </div>
            </div>

            {/* Structured Knowledge Section (Brand Personality, Comm, Visual) */}
            <div className="bg-surface rounded-card-lg p-8 border border-border shadow-float space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                    Engineered Knowledge
                  </span>
                  <h3 className="text-xl font-normal tracking-tight text-ink mt-0.5">
                    Structured Brand Memory
                  </h3>
                </div>
                <span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-pill border border-emerald-200">
                  99% Confidence
                </span>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-card bg-surface-secondary/40 border border-border">
                  <span className="text-xs font-semibold text-ink block mb-2">Brand Personality</span>
                  <div className="flex flex-wrap gap-2">
                    {client.brandPersonality.map((trait, i) => (
                      <span key={i} className="px-3 py-1 rounded-pill bg-surface text-ink text-xs font-medium border border-border shadow-subtle">
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-card bg-surface-secondary/40 border border-border">
                  <span className="text-xs font-semibold text-ink block mb-2">Communication Tone</span>
                  <div className="flex flex-wrap gap-2">
                    {client.communicationStyle.map((tone, i) => (
                      <span key={i} className="px-3 py-1 rounded-pill bg-surface text-ink text-xs font-medium border border-border shadow-subtle">
                        {tone}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-card bg-surface-secondary/40 border border-border">
                  <span className="text-xs font-semibold text-ink block mb-2">Visual Language System</span>
                  <div className="flex flex-wrap gap-2">
                    {client.visualLanguage.map((vis, i) => (
                      <span key={i} className="px-3 py-1 rounded-pill bg-surface text-ink text-xs font-medium border border-border shadow-subtle">
                        {vis}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Side Column: Recent Workspaces & Activity */}
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-surface rounded-card-lg p-7 border border-border shadow-float">
              <h3 className="text-lg font-normal tracking-tight text-ink mb-4">
                Active Client Workspaces
              </h3>
              <div className="space-y-3">
                {client.recentWorkspaces.map((ws, i) => (
                  <div key={i} className="p-3.5 rounded-card bg-surface-secondary/40 border border-border flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <FolderGit2 size={15} className="text-ink-muted" />
                      <span className="font-medium text-ink">{ws}</span>
                    </div>
                    <ExternalLink size={13} className="text-ink-muted" />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-surface rounded-card-lg p-7 border border-border shadow-float">
              <h3 className="text-lg font-normal tracking-tight text-ink mb-4">
                Client Commercial Status
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-2 border-b border-border/80">
                  <span className="text-ink-secondary">Retainer Tier</span>
                  <span className="font-semibold text-ink">Tier 1 Autonomous Partner</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border/80">
                  <span className="text-ink-secondary">Next Renewal</span>
                  <span className="font-mono text-ink">December 01, 2026</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-ink-secondary">Liaison Agent</span>
                  <span className="font-medium text-emerald-700">● Connected</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* If sub-tab is Brand or Memory */}
      {(activeTab === 'Brand' || activeTab === 'Memory') && (
        <div className="bg-surface rounded-card-lg p-8 border border-border shadow-float space-y-8">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
              Deep Memory Ledger
            </span>
            <h2 className="text-2xl font-light tracking-tight text-ink mt-1">
              Autonomous Brand Intelligence for {client.name}
            </h2>
            <p className="text-xs text-ink-secondary mt-1 font-light">
              This structured memory guides every decision made by the Design, Research, and Communication agents.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-card bg-surface-secondary/40 border border-border space-y-3">
              <span className="text-xs font-semibold text-ink">Brand Philosophy & Stance</span>
              <p className="text-xs text-ink-secondary leading-relaxed">
                The brand rejects excessive ornamentalism. Every component must justify its existence through function, geometric precision, and high typographical rhythm.
              </p>
              <div className="pt-2 text-[10px] text-ink-muted font-mono">
                Source: Client Executive Onboarding · Verified 100%
              </div>
            </div>

            <div className="p-6 rounded-card bg-surface-secondary/40 border border-border space-y-3">
              <span className="text-xs font-semibold text-ink">Typographic Discipline</span>
              <p className="text-xs text-ink-secondary leading-relaxed">
                Prefer large neo-grotesk headlines with tight tracking (-0.02em). Sentence case is strictly required across all editorial headings.
              </p>
              <div className="pt-2 text-[10px] text-ink-muted font-mono">
                Source: Design Systems Manual 2026 · Verified 98%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fallback for other tabs */}
      {activeTab !== 'Overview' && activeTab !== 'Brand' && activeTab !== 'Memory' && (
        <div className="bg-surface rounded-card-lg p-12 border border-border shadow-float text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-surface-secondary flex items-center justify-center mx-auto text-ink">
            <Layers size={20} />
          </div>
          <h3 className="text-lg font-normal text-ink">
            {client.name} · {activeTab} Workspace
          </h3>
          <p className="text-xs text-ink-secondary max-w-md mx-auto font-light">
            Autonomous synchronization active. Artifacts and telemetry for {activeTab.toLowerCase()} are indexed and ready for studio review.
          </p>
        </div>
      )}
    </div>
  );
};
