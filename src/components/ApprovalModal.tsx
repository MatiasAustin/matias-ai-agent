import React, { useState } from 'react';
import { 
  X, 
  Check, 
  Sparkles, 
  MessageSquare, 
  ShieldCheck, 
  CornerDownRight, 
  ArrowRight 
} from 'lucide-react';
import { ApprovalItem } from '../types';

interface ApprovalModalProps {
  item: ApprovalItem | null;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onSaveAndApprove: (id: string, newContent: string) => void;
}

export const ApprovalModal: React.FC<ApprovalModalProps> = ({
  item,
  onClose,
  onApprove,
  onReject,
  onSaveAndApprove
}) => {
  if (!item) return null;

  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(item.previewContent || '');

  const handleApprove = () => {
    if (isEditing) {
      onSaveAndApprove(item.id, content);
    } else {
      onApprove(item.id);
    }
    onClose();
  };

  const handleReject = () => {
    onReject(item.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/30 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-2xl bg-surface rounded-card-lg border border-border shadow-float p-8 space-y-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full text-ink-muted hover:text-ink hover:bg-surface-secondary transition-colors"
        >
          <X size={16} />
        </button>

        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-ink-muted">
              {item.client}
            </span>
            <span className="text-border">·</span>
            <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-pill border border-emerald-200">
              {item.confidence}% Match
            </span>
          </div>
          <h2 className="text-2xl font-light tracking-tight text-ink">
            {item.title}
          </h2>
        </div>

        {/* Action Specs */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-card bg-surface-secondary/40 border border-border">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted block mb-1">
              Proposed Action
            </span>
            <p className="text-xs font-medium text-ink">
              {item.proposedAction}
            </p>
          </div>

          <div className="p-4 rounded-card bg-surface-secondary/40 border border-border">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted block mb-1">
              Reason
            </span>
            <p className="text-xs text-ink-secondary leading-relaxed font-light">
              {item.reason}
            </p>
          </div>
        </div>

        {/* Message Payload Editor / Viewer */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
              Outbound Message Payload
            </span>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="text-xs text-ink font-medium underline underline-offset-4 hover:text-ink-secondary transition-colors"
            >
              {isEditing ? 'Preview Mode' : 'Edit Before Sending'}
            </button>
          </div>

          {isEditing ? (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className="w-full p-4 rounded-card bg-surface-secondary/30 border border-border text-xs text-ink focus:outline-none focus:border-ink/40 font-mono leading-relaxed"
            />
          ) : (
            <div className="p-5 rounded-card bg-canvas border border-border/80 text-xs text-ink font-light leading-relaxed italic">
              {content}
            </div>
          )}
        </div>

        {/* Footer Intent Actions */}
        <div className="pt-4 border-t border-border flex items-center justify-between">
          <span className="text-xs text-ink-muted flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-emerald-600" />
            Human approval gatekeeper active
          </span>

          <div className="flex items-center gap-3">
            <button
              onClick={handleReject}
              className="px-4 py-2 rounded-pill bg-surface text-ink-secondary hover:text-rose-600 hover:bg-rose-50 border border-border text-xs font-medium transition-all"
            >
              Reject Action
            </button>

            <button
              onClick={handleApprove}
              className="px-6 py-2.5 rounded-pill bg-ink text-white hover:bg-neutral-800 text-xs font-medium shadow-subtle transition-all flex items-center gap-2"
            >
              <Check size={14} strokeWidth={2.5} />
              <span>{isEditing ? 'Save & Dispatch' : 'Approve & Dispatch'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
