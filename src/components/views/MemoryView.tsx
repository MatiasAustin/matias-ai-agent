import React, { useState } from 'react';
import { 
  BrainCircuit, 
  Sparkles, 
  ShieldCheck, 
  Search, 
  ExternalLink,
  Plus
} from 'lucide-react';
import { initialMemoryCategories } from '../../data/mockData';

export const MemoryView: React.FC = () => {
  const [selectedClient, setSelectedClient] = useState<string>('XYZ AI');

  return (
    <div className="space-y-12 pb-16 animate-fadeIn">
      {/* Editorial Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="text-xs uppercase tracking-widest text-ink-muted font-medium mb-2 block">
            Collective Intelligence
          </span>
          <h1 className="text-4xl md:text-5xl font-light tracking-tight text-ink">
            Studio Memory Graph
          </h1>
          <p className="text-sm text-ink-secondary mt-2 max-w-xl font-light">
            Structured knowledge models governing brand nuances, tone of voice, aesthetic principles, and past client decisions.
          </p>
        </div>

        <button className="flex items-center gap-2 px-5 py-2.5 rounded-pill bg-ink text-white text-xs font-medium hover:bg-neutral-800 transition-colors shadow-subtle self-start md:self-auto">
          <Plus size={14} />
          <span>Ingest New Memory</span>
        </button>
      </section>

      {/* Client selector tabs */}
      <div className="flex items-center gap-2">
        {['XYZ AI', 'Monolith Architectural', 'Arc Audio Systems', 'Celoxis Bio'].map((client) => (
          <button
            key={client}
            onClick={() => setSelectedClient(client)}
            className={`px-4 py-2 rounded-pill text-xs font-medium transition-all ${
              selectedClient === client
                ? 'bg-surface text-ink shadow-subtle border border-border font-semibold'
                : 'bg-transparent text-ink-secondary hover:text-ink hover:bg-surface-secondary'
            }`}
          >
            {client}
          </button>
        ))}
      </div>

      {/* Structured Knowledge Presentation (Not a database table!) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Brand Personality Card */}
        <div className="bg-surface rounded-card-lg p-8 border border-border shadow-float space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                Core Identity
              </span>
              <h3 className="text-2xl font-light tracking-tight text-ink mt-0.5">
                Brand Personality
              </h3>
            </div>
            <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-pill border border-emerald-200">
              99% Confidence
            </span>
          </div>

          <div className="space-y-4 pt-2">
            {[
              { title: 'Minimal', desc: 'Eliminate decorative redundancy. Every pixel and component serves clear utility.' },
              { title: 'Technical', desc: 'Rooted in precision engineering, code architecture, and mathematical typography grids.' },
              { title: 'Premium', desc: 'Generous negative space, tactile off-white surfaces, and editorial poise.' },
              { title: 'Confident', desc: 'Understated certainty. No apologetic explanations or excessive sales hyperbole.' }
            ].map((trait, i) => (
              <div key={i} className="p-4 rounded-card bg-surface-secondary/40 border border-border/80">
                <span className="text-sm font-semibold text-ink block">{trait.title}</span>
                <p className="text-xs text-ink-secondary mt-1 font-light leading-relaxed">{trait.desc}</p>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-border text-[11px] text-ink-muted flex items-center justify-between">
            <span>Source: Executive Onboarding & Strategy Workshop</span>
            <span className="font-mono">Updated 2d ago</span>
          </div>
        </div>

        {/* Communication Style Card */}
        <div className="bg-surface rounded-card-lg p-8 border border-border shadow-float space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                Linguistic Protocols
              </span>
              <h3 className="text-2xl font-light tracking-tight text-ink mt-0.5">
                Communication Tone
              </h3>
            </div>
            <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-pill border border-emerald-200">
              98% Confidence
            </span>
          </div>

          <div className="space-y-4 pt-2">
            {[
              { title: 'Concise', desc: 'Respect reader bandwidth. Compress sentences without compromising substance.' },
              { title: 'Direct', desc: 'State decisions and status first before providing supporting context.' },
              { title: 'Professional', desc: 'Peer-to-peer technical respect. Avoid superficial corporate buzzwords.' }
            ].map((tone, i) => (
              <div key={i} className="p-4 rounded-card bg-surface-secondary/40 border border-border/80">
                <span className="text-sm font-semibold text-ink block">{tone.title}</span>
                <p className="text-xs text-ink-secondary mt-1 font-light leading-relaxed">{tone.desc}</p>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-border text-[11px] text-ink-muted flex items-center justify-between">
            <span>Source: Slack Communications & Founder Interviews</span>
            <span className="font-mono">Updated 6h ago</span>
          </div>
        </div>

        {/* Visual Language Rules */}
        <div className="bg-surface rounded-card-lg p-8 border border-border shadow-float space-y-6 md:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                Design System Axioms
              </span>
              <h3 className="text-2xl font-light tracking-tight text-ink mt-0.5">
                Visual Language System
              </h3>
            </div>
            <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-pill border border-emerald-200">
              100% Confidence
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
            {[
              { label: 'Dark backgrounds', note: 'High-contrast focal points, dark mode cards for technical metrics' },
              { label: 'Large typography', note: 'Editorial display headings, tight tracking (-0.02em), sentence case' },
              { label: 'High contrast', note: 'Pure #111111 ink against warm off-white #F5F5F3 canvas' },
              { label: 'Minimal decoration', note: 'Zero arbitrary gradients, zero 3D bubbles or distracting glass' }
            ].map((axiom, idx) => (
              <div key={idx} className="p-5 rounded-card bg-surface-secondary/50 border border-border/80 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-semibold text-ink block mb-2">{axiom.label}</span>
                  <p className="text-xs text-ink-secondary leading-relaxed font-light">{axiom.note}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-border/60 text-[10px] text-ink-muted font-mono">
                  Token Set v2.4
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-border text-[11px] text-ink-muted flex items-center justify-between">
            <span>Source: Approved Master Figma Token Library</span>
            <span className="font-mono">Auto-synced</span>
          </div>
        </div>

      </div>
    </div>
  );
};
