import React, { useState } from 'react';
import { X, Upload, FileText } from 'lucide-react';
import { DocumentCategory, ProjectRecord } from '../../../server/db/types';

interface UploadFileModalProps {
  isOpen: boolean;
  clientId: string;
  projects: ProjectRecord[];
  onClose: () => void;
  onSubmit: (data: {
    client_id: string;
    project_id?: string;
    category: DocumentCategory;
    filename: string;
    file_size?: string;
    notes?: string;
  }) => Promise<void>;
}

const CATEGORIES: DocumentCategory[] = [
  'Brand',
  'Brief',
  'Reference',
  'Contract',
  'Quotation',
  'Invoice',
  'MOU',
  'Project',
  'Other'
];

export const UploadFileModal: React.FC<UploadFileModalProps> = ({
  isOpen,
  clientId,
  projects,
  onClose,
  onSubmit
}) => {
  if (!isOpen) return null;

  const [filename, setFilename] = useState('');
  const [category, setCategory] = useState<DocumentCategory>('Brand');
  const [projectId, setProjectId] = useState<string>('');
  const [fileSize, setFileSize] = useState('2.4 MB');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!filename.trim()) {
      setError('File name is required');
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await onSubmit({
        client_id: clientId,
        project_id: projectId || undefined,
        category,
        filename: filename.trim(),
        file_size: fileSize,
        notes: notes.trim() || undefined
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to upload document');
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
            Artifact Repository
          </span>
          <h2 className="text-2xl font-light tracking-tight text-ink mt-0.5">
            Add Client File
          </h2>
          <p className="text-xs text-ink-secondary mt-1 font-light">
            Upload authoritative documents, design briefs, contracts, or reference artboards.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-card-sm bg-rose-50 border border-rose-200 text-xs text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-ink font-medium mb-1.5">File Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Master_Brand_Manual_2026.pdf"
              value={filename}
              onChange={e => setFilename(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-card-sm bg-canvas border border-border text-ink focus:outline-none text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-ink font-medium mb-1.5">Category *</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as DocumentCategory)}
                className="w-full px-3 py-2 rounded-card-sm bg-canvas border border-border text-ink focus:outline-none text-xs"
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-ink font-medium mb-1.5">Associated Project (Optional)</label>
              <select
                value={projectId}
                onChange={e => setProjectId(e.target.value)}
                className="w-full px-3 py-2 rounded-card-sm bg-canvas border border-border text-ink focus:outline-none text-xs"
              >
                <option value="">General Client Scope</option>
                {projects.map(p => (
                  <option key={p.project_id} value={p.project_id}>{p.project_name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-ink font-medium mb-1.5">Simulated File Size / Meta</label>
            <input
              type="text"
              value={fileSize}
              onChange={e => setFileSize(e.target.value)}
              className="w-full px-3.5 py-2 rounded-card-sm bg-canvas border border-border text-ink focus:outline-none text-xs font-mono"
            />
          </div>

          <div>
            <label className="block text-ink font-medium mb-1.5">Context / Notes (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Approved by legal on Oct 08"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-card-sm bg-canvas border border-border text-ink focus:outline-none text-xs"
            />
          </div>

          <div className="p-3 rounded-card-sm bg-surface-secondary/70 border border-border text-[11px] text-ink-secondary">
            Note: Files are stored with status <strong className="text-ink">uploaded</strong>. In accordance with studio rules, files are not claimed to be vectorized or indexed until an actual indexing pipeline executes.
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
              {isSubmitting ? 'Uploading...' : 'Add File'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
