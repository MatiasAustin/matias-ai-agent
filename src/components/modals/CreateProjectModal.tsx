import React, { useState } from 'react';
import { X, Briefcase, Plus, Check } from 'lucide-react';

interface CreateProjectModalProps {
  isOpen: boolean;
  clientId: string;
  onClose: () => void;
  onSubmit: (data: {
    project_name: string;
    project_type: string;
    description: string;
    deadline: string;
    priority: string;
    estimated_budget?: string;
    project_notes?: string;
  }) => Promise<void>;
}

const PROJECT_TYPES = [
  'Brand Identity',
  'Brand System',
  'Social Media',
  'Design',
  'Video',
  'Web',
  'UI/UX',
  'Creative Campaign',
  'Other'
];

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  clientId,
  onClose,
  onSubmit
}) => {
  if (!isOpen) return null;

  const [projectName, setProjectName] = useState('');
  const [projectType, setProjectType] = useState('Brand System');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState(
    new Date(Date.now() + 86400000 * 21).toISOString().split('T')[0]
  );
  const [priority, setPriority] = useState('normal');
  const [estimatedBudget, setEstimatedBudget] = useState('');
  const [projectNotes, setProjectNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) {
      setError('Project name is required');
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await onSubmit({
        project_name: projectName.trim(),
        project_type: projectType,
        description,
        deadline,
        priority,
        estimated_budget: estimatedBudget || undefined,
        project_notes: projectNotes || undefined
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create project');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/25 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-xl bg-surface rounded-card-lg border border-border shadow-float p-8 space-y-6 relative"
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
            Project Initiative
          </span>
          <h2 className="text-2xl font-light tracking-tight text-ink mt-0.5">
            Add Client Project
          </h2>
          <p className="text-xs text-ink-secondary mt-1 font-light">
            Each project is strictly scoped to this client's autonomous intelligence and deliverables.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-card-sm bg-rose-50 border border-rose-200 text-xs text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-ink font-medium mb-1.5">Project Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Design Tokens v2.0 & Component Spec"
              value={projectName}
              onChange={e => setProjectName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-card-sm bg-canvas border border-border text-ink focus:outline-none focus:border-ink/40 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-ink font-medium mb-1.5">Project Type</label>
              <select
                value={projectType}
                onChange={e => setProjectType(e.target.value)}
                className="w-full px-3 py-2.5 rounded-card-sm bg-canvas border border-border text-ink focus:outline-none text-xs"
              >
                {PROJECT_TYPES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-ink font-medium mb-1.5">Priority</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value)}
                className="w-full px-3 py-2.5 rounded-card-sm bg-canvas border border-border text-ink focus:outline-none text-xs"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-ink font-medium mb-1.5">Target Deadline</label>
              <input
                type="date"
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
                className="w-full px-3.5 py-2 rounded-card-sm bg-canvas border border-border text-ink focus:outline-none text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-ink font-medium mb-1.5">Estimated Budget (Optional)</label>
              <input
                type="text"
                placeholder="$25,000"
                value={estimatedBudget}
                onChange={e => setEstimatedBudget(e.target.value)}
                className="w-full px-3.5 py-2 rounded-card-sm bg-canvas border border-border text-ink focus:outline-none text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-ink font-medium mb-1.5">Description & Deliverables</label>
            <textarea
              rows={3}
              placeholder="Outline high-level goals, deliverables, and aesthetic constraints..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-card-sm bg-canvas border border-border text-ink focus:outline-none text-xs"
            />
          </div>

          <div>
            <label className="block text-ink font-medium mb-1.5">Project Notes (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Requires approval before master branch merge"
              value={projectNotes}
              onChange={e => setProjectNotes(e.target.value)}
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
              {isSubmitting ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
