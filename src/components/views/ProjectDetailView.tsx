import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Plus, CheckSquare, FileText, ChevronRight, AlertCircle } from 'lucide-react';
import { ProjectRecord, TaskRecord, DocumentRecord } from '../../../server/db/types';
import { api } from '../../api/client';
import { CreateTaskModal } from '../modals/CreateTaskModal';

interface ProjectDetailViewProps {
  clientId: string;
  projectId: string;
  onBack: () => void;
}

export const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({
  clientId,
  projectId,
  onBack
}) => {
  const [project, setProject] = useState<ProjectRecord | null>(null);
  const [tasks, setTasks] = useState<TaskRecord[]>([]);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);

  const loadProject = async () => {
    setIsLoading(true);
    try {
      const [projData, tasksData, docsData] = await Promise.all([
        api.getProject(projectId),
        api.getTasks(clientId, projectId),
        api.getDocuments(clientId)
      ]);
      setProject(projData);
      setTasks(tasksData);
      setDocuments(docsData.filter(d => d.project_id === projectId));
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProject();
  }, [projectId]);

  const handleCreateTask = async (data: any) => {
    await api.createTask({ ...data, client_id: clientId, project_id: projectId });
    await loadProject();
  };

  if (isLoading || !project) {
    return (
      <div className="py-20 text-center text-xs text-ink-secondary">
        Loading project workspace...
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16 animate-fadeIn">
      <div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-ink-secondary hover:text-ink transition-colors px-3 py-1.5 rounded-pill bg-surface border border-border shadow-subtle mb-4"
        >
          <ArrowLeft size={13} />
          <span>Back to Client Workspace</span>
        </button>
      </div>

      {/* Project Header */}
      <section className="bg-surface rounded-card-lg p-8 border border-border shadow-float space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted">
              {project.project_type} · #{project.project_id}
            </span>
            <h1 className="text-3xl font-light tracking-tight text-ink mt-0.5">
              {project.project_name}
            </h1>
            <p className="text-xs text-ink-secondary mt-1 font-light max-w-2xl leading-relaxed">
              {project.description || 'No description provided.'}
            </p>
          </div>

          <span className="text-xs font-medium px-3 py-1 rounded-pill bg-surface-secondary text-ink border border-border self-start">
            {project.status}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-border text-xs">
          <div>
            <span className="text-ink-muted block text-[10px] uppercase">Target Deadline</span>
            <span className="font-mono text-ink font-medium">{project.deadline}</span>
          </div>
          <div>
            <span className="text-ink-muted block text-[10px] uppercase">Priority</span>
            <span className="text-ink font-medium capitalize">{project.priority}</span>
          </div>
          <div>
            <span className="text-ink-muted block text-[10px] uppercase">Budget</span>
            <span className="text-ink font-medium">{project.estimated_budget || 'Unspecified'}</span>
          </div>
          <div>
            <span className="text-ink-muted block text-[10px] uppercase">Assigned Agents</span>
            <span className="text-ink font-medium">{project.assigned_agents?.join(', ') || 'None'}</span>
          </div>
        </div>
      </section>

      {/* Tasks & Deliverables Section */}
      <div className="bg-surface rounded-card-lg p-8 border border-border shadow-float space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted block">
              Project Execution
            </span>
            <h3 className="text-xl font-normal text-ink">Project Tasks ({tasks.length})</h3>
          </div>
          <button
            onClick={() => setIsAddTaskOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-pill bg-ink text-white text-xs font-medium hover:bg-neutral-800 transition-colors"
          >
            <Plus size={13} />
            <span>Add Task</span>
          </button>
        </div>

        {tasks.length === 0 ? (
          <div className="p-8 text-center bg-surface-secondary/40 rounded-card border border-dashed border-border text-xs text-ink-secondary">
            No tasks specifically assigned to this project yet.
          </div>
        ) : (
          <div className="divide-y divide-border border border-border rounded-card overflow-hidden">
            {tasks.map(t => (
              <div key={t.id} className="p-4 flex items-center justify-between text-xs bg-surface">
                <div>
                  <h5 className="font-semibold text-ink">{t.title}</h5>
                  <span className="text-[10px] text-ink-muted font-mono">{t.assigned_agent}</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-pill bg-surface-secondary text-ink border border-border">
                  {t.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <CreateTaskModal
        isOpen={isAddTaskOpen}
        clientId={clientId}
        projects={[project]}
        onClose={() => setIsAddTaskOpen(false)}
        onSubmit={handleCreateTask}
      />
    </div>
  );
};
