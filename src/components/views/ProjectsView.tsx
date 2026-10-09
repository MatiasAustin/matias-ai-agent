import React, { useState } from 'react';
import { 
  Plus, 
  ArrowUpRight, 
  Clock, 
  FolderGit2, 
  Layers, 
  CheckCircle2, 
  Sparkles,
  Users
} from 'lucide-react';
import { Project } from '../../types';

interface ProjectsViewProps {
  projects: Project[];
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({ projects }) => {
  const [filter, setFilter] = useState<string>('All');

  const filteredProjects = projects.filter(p => {
    if (filter === 'All') return true;
    return p.status === filter;
  });

  return (
    <div className="space-y-12 pb-16 animate-fadeIn">
      {/* Editorial Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="text-xs uppercase tracking-widest text-ink-muted font-medium mb-2 block">
            Creative Initiatives
          </span>
          <h1 className="text-4xl md:text-5xl font-light tracking-tight text-ink">
            Active Projects
          </h1>
          <p className="text-sm text-ink-secondary mt-2 max-w-xl font-light">
            Dynamic workspaces bridging human direction, autonomous multi-agent generation, and continuous client deliverables.
          </p>
        </div>

        <button className="flex items-center gap-2 px-5 py-2.5 rounded-pill bg-ink text-white text-xs font-medium hover:bg-neutral-800 transition-colors shadow-subtle self-start md:self-auto">
          <Plus size={14} />
          <span>New Studio Project</span>
        </button>
      </section>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['All', 'In Progress', 'Client Review', 'Discovery', 'Completed'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-pill text-xs font-medium transition-all ${
              filter === tab
                ? 'bg-surface text-ink shadow-subtle border border-border font-semibold'
                : 'bg-transparent text-ink-secondary hover:text-ink hover:bg-surface-secondary'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Large Project Cards (Prompt: "Use large project cards where appropriate.") */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filteredProjects.map((project) => (
          <div
            key={project.id}
            className="bg-surface rounded-card-lg p-8 border border-border shadow-float hover:border-ink/25 transition-all group flex flex-col justify-between"
          >
            <div>
              {/* Top Meta */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted block mb-1">
                    {project.client}
                  </span>
                  <h3 className="text-2xl font-normal tracking-tight text-ink group-hover:text-neutral-700 transition-colors">
                    {project.title}
                  </h3>
                </div>

                <span className="text-xs font-medium text-ink bg-surface-secondary px-3 py-1 rounded-pill border border-border/80 shrink-0">
                  {project.status}
                </span>
              </div>

              {/* Progress Bar & Metric */}
              <div className="my-6 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-ink-secondary font-medium">Workspace Completion</span>
                  <span className="font-mono text-ink font-semibold">{project.progress}%</span>
                </div>
                <div className="w-full h-1.5 rounded-pill bg-surface-secondary overflow-hidden">
                  <div 
                    className="h-full bg-ink rounded-pill transition-all duration-500" 
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>

              {/* Current Task & Recent Activity Modules */}
              <div className="space-y-3 my-6">
                <div className="p-4 rounded-card bg-surface-secondary/50 border border-border/80">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted block mb-1">
                    Current Task Running
                  </span>
                  <p className="text-xs font-medium text-ink">
                    {project.currentTask}
                  </p>
                </div>

                <div className="px-4 py-2 text-xs text-ink-secondary flex items-center justify-between">
                  <span>Recent activity:</span>
                  <span className="font-medium text-ink">{project.recentActivity}</span>
                </div>
              </div>

              {/* Assigned Agents */}
              <div className="flex items-center gap-2 pt-2">
                <span className="text-[11px] text-ink-muted">Assigned Agents:</span>
                <div className="flex flex-wrap gap-1.5">
                  {project.assignedAgents.map((ag, i) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 rounded-pill bg-surface-secondary text-ink border border-border font-medium">
                      {ag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Card Footer */}
            <div className="pt-6 mt-6 border-t border-border flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-ink-muted font-mono">
                <Clock size={12} /> Deadline: {project.deadline}
              </span>
              <button className="flex items-center gap-1 font-semibold text-ink hover:text-ink-secondary transition-colors">
                <span>Open Studio Canvas</span>
                <ArrowUpRight size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
