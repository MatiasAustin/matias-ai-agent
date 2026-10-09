import React, { useState } from 'react';
import { 
  Plus, 
  Clock, 
  Cpu, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Filter
} from 'lucide-react';
import { Task } from '../../types';

interface TasksViewProps {
  tasks: Task[];
  onToggleTaskStatus?: (taskId: string) => void;
}

export const TasksView: React.FC<TasksViewProps> = ({ tasks }) => {
  const [filter, setFilter] = useState<string>('All');

  const filteredTasks = tasks.filter(t => {
    if (filter === 'All') return true;
    return t.status === filter;
  });

  const getPriorityBadge = (priority: Task['priority']) => {
    switch (priority) {
      case 'Urgent':
        return (
          <span className="text-[10px] font-medium text-rose-700 bg-rose-50 px-2 py-0.5 rounded-pill border border-rose-200">
            Urgent
          </span>
        );
      case 'High':
        return (
          <span className="text-[10px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-pill border border-amber-200">
            High
          </span>
        );
      case 'Normal':
        return (
          <span className="text-[10px] font-medium text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded-pill border border-neutral-200">
            Normal
          </span>
        );
    }
  };

  const getStatusBadge = (status: Task['status']) => {
    switch (status) {
      case 'Running':
        return (
          <span className="text-[11px] font-medium text-blue-700 bg-blue-50 px-2.5 py-1 rounded-pill border border-blue-200 inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            Running
          </span>
        );
      case 'Awaiting Feedback':
        return (
          <span className="text-[11px] font-medium text-amber-800 bg-amber-50 px-2.5 py-1 rounded-pill border border-amber-200 inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Awaiting Feedback
          </span>
        );
      case 'Queued':
        return (
          <span className="text-[11px] font-medium text-neutral-600 bg-neutral-100 px-2.5 py-1 rounded-pill border border-neutral-200 inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
            Queued
          </span>
        );
      case 'Done':
        return (
          <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-pill border border-emerald-200 inline-flex items-center gap-1.5">
            <CheckCircle2 size={12} className="text-emerald-600" />
            Done
          </span>
        );
    }
  };

  return (
    <div className="space-y-12 pb-16 animate-fadeIn">
      {/* Editorial Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="text-xs uppercase tracking-widest text-ink-muted font-medium mb-2 block">
            Execution Queue
          </span>
          <h1 className="text-4xl md:text-5xl font-light tracking-tight text-ink">
            Tasks & Workstreams
          </h1>
          <p className="text-sm text-ink-secondary mt-2 max-w-xl font-light">
            Autonomous agent subtasks, human review checkpoints, and collaborative delivery queues.
          </p>
        </div>

        <button className="flex items-center gap-2 px-5 py-2.5 rounded-pill bg-ink text-white text-xs font-medium hover:bg-neutral-800 transition-colors shadow-subtle self-start md:self-auto">
          <Plus size={14} />
          <span>Dispatch New Task</span>
        </button>
      </section>

      {/* Filter Options */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['All', 'Running', 'Awaiting Feedback', 'Queued', 'Done'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-pill text-xs font-medium transition-all ${
              filter === status
                ? 'bg-surface text-ink shadow-subtle border border-border font-semibold'
                : 'bg-transparent text-ink-secondary hover:text-ink hover:bg-surface-secondary'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Tasks Table / Floating List (Spacious & Editorial, Not Dense Kanban) */}
      <div className="bg-surface rounded-card-lg border border-border shadow-float overflow-hidden">
        <div className="hidden lg:grid grid-cols-12 gap-4 px-8 py-4 border-b border-border text-[11px] uppercase tracking-wider text-ink-muted font-medium bg-canvas/30">
          <span className="col-span-4">Task & Context</span>
          <span className="col-span-2">Client / Project</span>
          <span className="col-span-2">Assigned Agent</span>
          <span className="col-span-2">Status & Priority</span>
          <span className="col-span-2 text-right">Deadline</span>
        </div>

        <div className="divide-y divide-border/70">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className="grid grid-cols-1 lg:grid-cols-12 gap-4 px-8 py-5 hover:bg-surface-secondary/40 transition-colors items-center"
            >
              {/* Task Title */}
              <div className="lg:col-span-4">
                <h4 className="text-sm font-semibold text-ink leading-snug">
                  {task.title}
                </h4>
                <span className="text-[11px] text-ink-muted font-mono mt-0.5 block">
                  #{task.id}
                </span>
              </div>

              {/* Client & Project */}
              <div className="lg:col-span-2">
                <span className="text-xs font-medium text-ink block">
                  {task.client}
                </span>
                <span className="text-[11px] text-ink-secondary block line-clamp-1">
                  {task.project}
                </span>
              </div>

              {/* Assigned Agent */}
              <div className="lg:col-span-2">
                <span className="text-xs font-medium text-ink flex items-center gap-1.5">
                  <Cpu size={13} className="text-ink-muted" />
                  {task.agent}
                </span>
              </div>

              {/* Status & Priority */}
              <div className="lg:col-span-2 flex items-center gap-2">
                {getStatusBadge(task.status)}
                {getPriorityBadge(task.priority)}
              </div>

              {/* Deadline */}
              <div className="lg:col-span-2 text-left lg:text-right">
                <span className="font-mono text-xs text-ink-muted flex items-center lg:justify-end gap-1">
                  <Clock size={12} /> {task.deadline}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
