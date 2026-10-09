import React, { useState } from 'react';
import { X, BrainCircuit } from 'lucide-react';
import { MemoryCategory, MemoryStatus } from '../../../server/db/types';

interface CreateMemoryModalProps {
  isOpen: boolean;
  clientId: string;
  onClose: () => void;
  onSubmit: (data: {
    client_id: string;
    category: MemoryCategory;
    key: string;
    value: string;
    status: MemoryStatus;
    confidence?: 'High' | 'Medium' | 'Low';
    source_type: string;
    source_id: string;
    reason_context?: string;
  }) => Promise<void>;
}

const CATEGORIES: MemoryCategory[] = [
  'Brand',
  'Visual',
  'Communication',
  'Business',
  'Positioning',
  'Audience',
  'Preferences',
  'Workflow',
  'Commercial',
  'Restrictions',
  'Observations'
];

export const CreateMemoryModal: React.FC<CreateMemoryModalProps> = ({
  isOpen,
  clientId,
  onClose,
  onSubmit
}) => {
  if (!isOpen) return null;

  const [category, setCategory] = useState<MemoryCategory>('Brand');
  const [key, setKey] = useState('');
  const [value, setValue] = useState('');
  const [status, setStatus] = useState<MemoryStatus>('APPROVED');
  const [sourceType, setSourceType] = useState('Direct Input');
  const [sourceId, setSourceId] = useState('Studio Creative Direction');
  const [reasonContext, setReasonContext] = useState('');
  const [confidence, setConfidence] = useState<'High' | 'Medium' | 'Low' | ''>('High');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!key.trim() || !value.trim()) {
      setError('Key and Value are required');
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await onSubmit({
        client_id: clientId,
        category,
        key: key.trim(),
        value: value.trim(),
        status,
        confidence: confidence ? (confidence as any) : undefined,
        source_type: sourceType,
        source_id: sourceId.trim() || 'Direct Input',
        reason_context: reasonContext.trim() || undefined
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to record memory');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/25 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-lg bg-surface rounded-card-lg border border-border shadow-float p-8 space-y-6 relative"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full text-ink-muted hover:text-ink hover:bg-surface-secondary transition-colors"
        >
          <X size={16} />
        </button>

        <div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted">
            Knowledge Ingestion
          </span>
          <h2 className="text-2xl font-light tracking-tight text-ink mt-0.5">
            Add Client Memory
          </h2>
          <p className="text-xs text-ink-secondary mt-1 font-light">
            Memories govern how autonomous agents synthesize design, craft messages, and respect client constraints.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-card-sm bg-rose-50 border border-rose-200 text-xs text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-ink font-medium mb-1.5">Category *</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as MemoryCategory)}
                className="w-full px-3 py-2 rounded-card-sm bg-canvas border border-border text-ink focus:outline-none text-xs"
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-ink font-medium mb-1.5">Authority Status *</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as MemoryStatus)}
                className="w-full px-3 py-2 rounded-card-sm bg-canvas border border-border text-ink focus:outline-none text-xs"
              >
                <option value="OFFICIAL">OFFICIAL (Authoritative)</option>
                <option value="APPROVED">APPROVED (Verified)</option>
                <option value="OBSERVED">OBSERVED (Pattern detected)</option>
                <option value="TEMPORARY">TEMPORARY (Ephemeral)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-ink font-medium mb-1.5">Memory Key / Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Design Philosophy, Tone in Slack, Prohibited Phrases"
              value={key}
              onChange={e => setKey(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-card-sm bg-canvas border border-border text-ink focus:outline-none text-xs"
            />
          </div>

          <div>
            <label className="block text-ink font-medium mb-1.5">Knowledge Value / Rule *</label>
            <textarea
              rows={3}
              required
              placeholder="e.g. Strictly use sentence case for all editorial headings. Never use uppercase labels on buttons."
              value={value}
              onChange={e => setValue(e.target.value)}
              className="w-full px-3.5 py-2 rounded-card-sm bg-canvas border border-border text-ink focus:outline-none text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-ink font-medium mb-1.5">Source Type</label>
              <select
                value={sourceType}
                onChange={e => setSourceType(e.target.value)}
                className="w-full px-3 py-2 rounded-card-sm bg-canvas border border-border text-ink focus:outline-none text-xs"
              >
                <option value="Direct Input">Direct Input</option>
                <option value="Document">Document</option>
                <option value="Onboarding">Onboarding Form</option>
                <option value="Conversation">Conversation</option>
                <option value="Activity">Observed Activity</option>
              </select>
            </div>

            <div>
              <label className="block text-ink font-medium mb-1.5">Source Reference / Citation</label>
              <input
                type="text"
                placeholder="e.g. Brand_Guidelines_v1.pdf"
                value={sourceId}
                onChange={e => setSourceId(e.target.value)}
                className="w-full px-3.5 py-2 rounded-card-sm bg-canvas border border-border text-ink focus:outline-none text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-ink font-medium mb-1.5">Context / Reason</label>
            <input
              type="text"
              placeholder="e.g. Explicitly requested by founder in onboarding review"
              value={reasonContext}
              onChange={e => setReasonContext(e.target.value)}
              className="w-full px-3.5 py-2 rounded-card-sm bg-canvas border border-border text-ink focus:outline-none text-xs"
            />
          </div>

          <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-pill bg-surface text-ink-secondary hover:text-ink border border-border text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 rounded-pill bg-ink text-white hover:bg-neutral-800 text-xs font-medium transition-colors shadow-subtle disabled:opacity-50"
            >
              {isSubmitting ? 'Storing...' : 'Save to Memory'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
