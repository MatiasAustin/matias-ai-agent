import React from 'react';
import { 
  ShieldCheck, 
  Check, 
  X, 
  Edit3, 
  Sparkles, 
  Clock, 
  MessageSquare, 
  Send,
  AlertTriangle 
} from 'lucide-react';
import { ApprovalItem } from '../../types';

interface ApprovalsViewProps {
  approvals: ApprovalItem[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onEdit: (id: string) => void;
}

export const ApprovalsView: React.FC<ApprovalsViewProps> = ({
  approvals,
  onApprove,
  onReject,
  onEdit
}) => {
  const pending = approvals.filter(a => a.status === 'pending');
  const past = approvals.filter(a => a.status !== 'pending');

  return (
    <div className="space-y-12 pb-16 animate-fadeIn">
      {/* Editorial Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="text-xs uppercase tracking-widest text-ink-muted font-medium mb-2 block">
            Autonomous Checkpoints
          </span>
          <h1 className="text-4xl md:text-5xl font-light tracking-tight text-ink">
            Studio Approvals
          </h1>
          <p className="text-sm text-ink-secondary mt-2 max-w-xl font-light">
            Every high-impact external action, outbound communication, and code merge requires human consent before dispatch.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-ink bg-surface px-4 py-2 rounded-pill border border-border shadow-subtle">
            {pending.length} Actions Awaiting Review
          </span>
        </div>
      </section>

      {/* Pending Approvals List */}
      <section className="space-y-6">
        <div className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
          Active Decision Requests
        </div>

        {pending.length === 0 ? (
          <div className="p-12 text-center bg-surface rounded-card-lg border border-border shadow-subtle space-y-2">
            <ShieldCheck size={28} className="mx-auto text-emerald-600" />
            <h4 className="text-base font-medium text-ink">Queue is completely clear</h4>
            <p className="text-xs text-ink-secondary">
              No autonomous actions are currently blocked waiting for approval.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {pending.map((app) => (
              <div
                key={app.id}
                className="bg-surface rounded-card-lg p-8 border border-border shadow-float hover:border-ink/20 transition-all space-y-6"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[11px] font-mono uppercase tracking-wider text-ink-muted">
                        {app.client}
                      </span>
                      <span className="text-border">·</span>
                      <span className="text-[11px] text-ink-secondary">
                        {app.project}
                      </span>
                      <span className="text-border">·</span>
                      <span className="text-[11px] font-mono text-ink-muted">
                        {app.time}
                      </span>
                    </div>
                    <h3 className="text-xl font-medium tracking-tight text-ink">
                      {app.title}
                    </h3>
                  </div>

                  <span className="text-xs font-mono font-medium text-emerald-700 bg-emerald-50 px-3 py-1 rounded-pill border border-emerald-200 self-start">
                    {app.confidence}% Confidence
                  </span>
                </div>

                {/* Structured Intent Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-card bg-surface-secondary/40 border border-border">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted block mb-1">
                      Proposed Action
                    </span>
                    <p className="text-sm font-medium text-ink">
                      {app.proposedAction}
                    </p>
                  </div>

                  <div className="p-4 rounded-card bg-surface-secondary/40 border border-border">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted block mb-1">
                      System Rationale
                    </span>
                    <p className="text-xs text-ink-secondary leading-relaxed">
                      {app.reason}
                    </p>
                  </div>
                </div>

                {/* Preview Content */}
                {app.previewContent && (
                  <div className="p-5 rounded-card bg-canvas border border-border/80">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted block mb-2">
                      Generated Dispatch Payload
                    </span>
                    <p className="text-sm font-light text-ink leading-relaxed italic font-serif">
                      {app.previewContent}
                    </p>
                  </div>
                )}

                {/* Calm and Intentional Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border">
                  <span className="text-xs text-ink-muted flex items-center gap-1.5 self-start sm:self-auto">
                    <Sparkles size={13} className="text-ink" />
                    Action verified against {app.client} brand memory
                  </span>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                    <button
                      onClick={() => onReject(app.id)}
                      className="px-4 py-2 rounded-pill bg-surface text-ink-secondary hover:text-rose-600 hover:bg-rose-50 border border-border text-xs font-medium transition-all"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => onEdit(app.id)}
                      className="px-4 py-2 rounded-pill bg-surface text-ink hover:bg-surface-secondary border border-border text-xs font-medium transition-all"
                    >
                      Edit Payload
                    </button>
                    <button
                      onClick={() => onApprove(app.id)}
                      className="px-5 py-2 rounded-pill bg-ink text-white hover:bg-neutral-800 text-xs font-medium shadow-subtle transition-all flex items-center gap-1.5"
                    >
                      <Check size={13} strokeWidth={2.5} />
                      <span>Approve & Dispatch</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Historical Approvals */}
      {past.length > 0 && (
        <section className="space-y-4 pt-6">
          <div className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
            Recently Resolved Checkpoints
          </div>
          <div className="bg-surface rounded-card-lg border border-border overflow-hidden divide-y divide-border">
            {past.map(p => (
              <div key={p.id} className="p-5 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-ink">{p.title}</span>
                  <span className="text-ink-muted ml-2">({p.client})</span>
                </div>
                <span className={`px-2.5 py-0.5 rounded-pill font-medium uppercase text-[10px] ${
                  p.status === 'approved' ? 'bg-emerald-50 text-emerald-700' : 'bg-neutral-100 text-neutral-600'
                }`}>
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
