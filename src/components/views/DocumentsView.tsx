import React from 'react';
import { 
  FileText, 
  Search, 
  Plus, 
  ArrowUpRight, 
  Download, 
  Sparkles,
  Lock
} from 'lucide-react';

export const DocumentsView: React.FC = () => {
  const documents = [
    {
      title: 'XYZ AI Brand Strategy & Visual Direction Brief',
      client: 'XYZ AI',
      type: 'PDF · Strategic Brief',
      size: '4.2 MB',
      updated: 'Yesterday, 18:20',
      syncedMemory: '100% Vectorized'
    },
    {
      title: 'Monolith Architectural Design System Axioms v2.4',
      client: 'Monolith Architectural',
      type: 'Figma Token Spec',
      size: '1.8 MB',
      updated: 'Oct 04, 2026',
      syncedMemory: 'Active in Engine'
    },
    {
      title: 'Arc Audio Haptic Synthesis Research Paper',
      client: 'Arc Audio Systems',
      type: 'Technical Paper',
      size: '8.1 MB',
      updated: 'Sep 29, 2026',
      syncedMemory: 'Indexed'
    },
    {
      title: 'Celoxis Bio Scientific Nomenclature Guidelines',
      client: 'Celoxis Bio',
      type: 'Markdown Documentation',
      size: '340 KB',
      updated: 'Sep 25, 2026',
      syncedMemory: 'Indexing'
    }
  ];

  return (
    <div className="space-y-12 pb-16 animate-fadeIn">
      {/* Editorial Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="text-xs uppercase tracking-widest text-ink-muted font-medium mb-2 block">
            Studio Repository
          </span>
          <h1 className="text-4xl md:text-5xl font-light tracking-tight text-ink">
            Documents & Artifacts
          </h1>
          <p className="text-sm text-ink-secondary mt-2 max-w-xl font-light">
            Foundational creative briefs, Figma design specifications, client contracts, and parsed knowledge corpora.
          </p>
        </div>

        <button className="flex items-center gap-2 px-5 py-2.5 rounded-pill bg-ink text-white text-xs font-medium hover:bg-neutral-800 transition-colors shadow-subtle self-start md:self-auto">
          <Plus size={14} />
          <span>Upload Document</span>
        </button>
      </section>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {documents.map((doc, idx) => (
          <div
            key={idx}
            className="bg-surface rounded-card-lg p-7 border border-border shadow-float hover:border-ink/20 transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-surface-secondary flex items-center justify-center text-ink border border-border">
                  <FileText size={18} />
                </div>
                <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-pill border border-emerald-200">
                  {doc.syncedMemory}
                </span>
              </div>

              <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted block mb-1">
                {doc.client}
              </span>
              <h3 className="text-lg font-medium text-ink leading-snug group-hover:text-neutral-700 transition-colors">
                {doc.title}
              </h3>
              <p className="text-xs text-ink-secondary mt-2 font-mono">
                {doc.type} · {doc.size}
              </p>
            </div>

            <div className="pt-6 mt-6 border-t border-border flex items-center justify-between text-xs text-ink-muted">
              <span className="font-mono">Updated {doc.updated}</span>
              <button className="flex items-center gap-1 font-medium text-ink hover:text-ink-secondary transition-colors">
                <span>View Artifact</span>
                <ArrowUpRight size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
