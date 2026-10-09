import React, { useState } from 'react';
import { X, CheckSquare } from 'lucide-react';
import { ProjectRecord } from '../../../server/db/types';

interface CreateTaskModalProps {
  isOpen: boolean;
  clientId: string;
  projects: ProjectRecord[];
  onClose: () => void;
  onSubmit: (data: {
    client_id: string;
    project_id?: string;
    title: string;
    description?: string;
    assigned_agent?: string;
    priority?: string;
    deadline?: string;
  }) => Promise<void>;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  clientId,
  projects,
  onClose,
  onSubmit
}) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState('');
  const [projectId, setProjectId] = useState<string>(projects[0]?.project_id || '');
  const [description, setDescription] = useState('');
  const [assignedAgent, setAssignedAgent] = useState('Creative Director Agent');
  const [priority, setPriority] = useState('normal');
  const [deadline, setDeadline] = useState(
    new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0]
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required');
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await onSubmit({
        client_id: clientId,
        project_id: projectId || undefined,
        title: title.trim(),
        description: description || undefined,
        assigned_agent: assignedAgent,
        priority,
        deadline
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create task');
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
            Execution Queue
          </span>
          <h2 className="text-2xl font-light tracking-tight text-ink mt-0.5">
            Dispatch Task
          </h2>
          <p className="text-xs text-ink-secondary mt-1 font-light">
            Assign work to autonomous agents or human checkpoints within this client workspace.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-card-sm bg-rose-50 border border-rose-200 text-xs text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-ink font-medium mb-1.5">Task Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Audit color contrast ratios for dark mode cards"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-card-sm bg-canvas border border-border text-ink focus:outline-none focus:border-ink/40 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-ink font-medium mb-1.5">Project Context</label>
              <select
                value={projectId}
                onChange={e => setProjectId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-card-sm bg-canvas border border-border text-ink focus:outline-none text-xs"
              >
                <option value="">General Client Scope</option>
                {projects.map(p => (
                  <option key={p.project_id} value={p.project_id}>{p.project_name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-ink font-medium mb-1.5">Assigned Agent</label>
              <select
                value={assignedAgent}
                onChange={e => setAssignedAgent(e.target.value)}
                className="w-full px-3 py-2.5 rounded-card-sm bg-canvas border border-border text-ink focus:outline-none text-xs"
              >
                <option value="Creative Director Agent">Creative Director Agent</option>
                <option value="Design Automation Agent">Design Automation Agent</option>
                <option value="Research & Discovery Agent">Research Agent</option>
                <option value="Client Liaison Agent">Client Liaison Agent</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
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

            <div>
              <label className="block text-ink font-medium mb-1.5">Target Deadline</label>
              <input
                type="date"
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
                className="w-full px-3.5 py-2 rounded-card-sm bg-canvas border border-border text-ink focus:outline-none text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-ink font-medium mb-1.5">Task Description</label>
            <textarea
              rows={2}
              placeholder="Provide exact prompt, input criteria or vector files..."
              value={description}
              onChange={e => setDescription(e.target.value)}
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
              {isSubmitting ? 'Dispatching...' : 'Dispatch Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
