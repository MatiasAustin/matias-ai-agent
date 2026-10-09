import React, { useState, useEffect } from 'react';
import { 
  Inbox, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Bot, 
  Hash, 
  User, 
  Building2, 
  Briefcase, 
  ShieldAlert, 
  RefreshCw, 
  Search, 
  MessageSquare,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Filter,
  Check,
  X,
  Edit3
} from 'lucide-react';
import { 
  ConversationRecord, 
  ConversationMessageRecord, 
  ClientRecord, 
  ProjectRecord, 
  TaskRecord, 
  ApprovalRecord 
} from '../../../server/db/types';
import { api } from '../../api/client';

export const InboxView: React.FC = () => {
  const [conversations, setConversations] = useState<ConversationRecord[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [detailsLoading, setDetailsLoading] = useState<boolean>(false);

  // Selected Conversation Detailed State
  const [activeConversation, setActiveConversation] = useState<ConversationRecord | null>(null);
  const [messages, setMessages] = useState<ConversationMessageRecord[]>([]);
  const [activeClient, setActiveClient] = useState<ClientRecord | null>(null);
  const [activeProject, setActiveProject] = useState<ProjectRecord | null>(null);
  const [activeTask, setActiveTask] = useState<TaskRecord | null>(null);
  const [activeApprovals, setActiveApprovals] = useState<ApprovalRecord[]>([]);
  const [clientContext, setClientContext] = useState<any>(null);

  // Assignment & Composer state
  const [allClients, setAllClients] = useState<ClientRecord[]>([]);
  const [clientProjects, setClientProjects] = useState<ProjectRecord[]>([]);
  const [selectedAssignClientId, setSelectedAssignClientId] = useState<string>('');
  const [selectedAssignProjectId, setSelectedAssignProjectId] = useState<string>('');
  const [replyText, setReplyText] = useState<string>('');
  const [sendingReply, setSendingReply] = useState<boolean>(false);

  // Editing Approval Draft
  const [isEditingDraft, setIsEditingDraft] = useState<boolean>(false);
  const [editedDraftText, setEditedDraftText] = useState<string>('');
  const [actionInProgress, setActionInProgress] = useState<boolean>(false);

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Load conversations list
  const loadConversations = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await api.getInboxConversations(
        activeFilter === 'all' ? undefined : activeFilter,
        searchQuery || undefined
      );
      setConversations(data);
      if (data.length > 0 && !selectedConversationId) {
        setSelectedConversationId(data[0].id);
      }
    } catch (err: any) {
      console.error('Failed to load inbox:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Load all clients for assignment dropdowns
  useEffect(() => {
    api.getClients().then(setAllClients).catch(() => {});
  }, []);

  useEffect(() => {
    loadConversations();
  }, [activeFilter, searchQuery]);

  // Load detailed conversation thread
  useEffect(() => {
    if (!selectedConversationId) {
      setActiveConversation(null);
      setMessages([]);
      return;
    }

    setDetailsLoading(true);
    api.getInboxConversationDetails(selectedConversationId)
      .then((data) => {
        setActiveConversation(data.conversation);
        setMessages(data.messages);
        setActiveClient(data.client);
        setActiveProject(data.project);
        setActiveTask(data.task);
        setActiveApprovals(data.approvals);
        setClientContext(data.context);

        if (data.conversation.ai_draft_response) {
          setEditedDraftText(data.conversation.ai_draft_response);
        }

        if (data.client?.id) {
          api.getProjects(data.client.id).then(setClientProjects).catch(() => {});
        }
      })
      .catch((err) => {
        setNotification({ type: 'error', message: err.message });
      })
      .finally(() => {
        setDetailsLoading(false);
      });
  }, [selectedConversationId]);

  // Assign Client
  const handleAssignClient = async () => {
    if (!selectedConversationId || !selectedAssignClientId) return;
    try {
      await api.assignConversationClient(selectedConversationId, selectedAssignClientId);
      setNotification({ type: 'success', message: 'Client assigned successfully.' });
      loadConversations(true);
      // reload details
      const details = await api.getInboxConversationDetails(selectedConversationId);
      setActiveConversation(details.conversation);
      setActiveClient(details.client);
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message });
    }
  };

  // Assign Project
  const handleAssignProject = async () => {
    if (!selectedConversationId || !selectedAssignProjectId) return;
    try {
      await api.assignConversationProject(selectedConversationId, selectedAssignProjectId);
      setNotification({ type: 'success', message: 'Project linked successfully.' });
      loadConversations(true);
      const details = await api.getInboxConversationDetails(selectedConversationId);
      setActiveConversation(details.conversation);
      setActiveProject(details.project);
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message });
    }
  };

  // Handle Approve from Thread Banner
  const handleApproveDraft = async (approvalId: string, customText?: string) => {
    setActionInProgress(true);
    try {
      const payload = customText ? { message: customText } : undefined;
      await api.approveAction(approvalId, payload);
      setNotification({ type: 'success', message: 'Response approved and dispatched to Slack!' });
      setIsEditingDraft(false);
      // Reload thread
      if (selectedConversationId) {
        const details = await api.getInboxConversationDetails(selectedConversationId);
        setActiveConversation(details.conversation);
        setMessages(details.messages);
        setActiveApprovals(details.approvals);
      }
      loadConversations(true);
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message });
    } finally {
      setActionInProgress(false);
    }
  };

  // Handle Reject
  const handleRejectDraft = async (approvalId: string) => {
    if (!confirm('Reject this AI response draft? It will not be sent to Slack.')) return;
    setActionInProgress(true);
    try {
      await api.rejectAction(approvalId, 'Rejected by studio operator in Inbox');
      setNotification({ type: 'success', message: 'Draft response rejected.' });
      if (selectedConversationId) {
        const details = await api.getInboxConversationDetails(selectedConversationId);
        setActiveConversation(details.conversation);
        setActiveApprovals(details.approvals);
      }
      loadConversations(true);
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message });
    } finally {
      setActionInProgress(false);
    }
  };

  // Manual Reply via Tool Registry
  const handleSendManualReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConversationId || !replyText.trim()) return;

    setSendingReply(true);
    try {
      await api.replyToConversation(selectedConversationId, replyText.trim());
      setReplyText('');
      setNotification({ type: 'success', message: 'Reply submitted for dispatch.' });
      if (selectedConversationId) {
        const details = await api.getInboxConversationDetails(selectedConversationId);
        setActiveConversation(details.conversation);
        setMessages(details.messages);
        setActiveApprovals(details.approvals);
      }
      loadConversations(true);
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message });
    } finally {
      setSendingReply(false);
    }
  };

  // Status Badge Helper
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'waiting_approval':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1"><Clock className="w-2.5 h-2.5" /> Waiting Approval</span>;
      case 'needs_client':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-rose-50 text-rose-700 border border-rose-200">Needs Client</span>;
      case 'needs_project':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-orange-50 text-orange-700 border border-orange-200">Needs Project</span>;
      case 'ai_draft':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1"><Sparkles className="w-2.5 h-2.5" /> AI Draft</span>;
      case 'completed':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">Completed</span>;
      case 'processing':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-neutral-100 text-neutral-600 animate-pulse">Processing</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-neutral-100 text-neutral-600">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#E5E5E1]">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-[#6F6F6B] block mb-1">
            Studio Communications
          </span>
          <h1 className="text-3xl font-medium tracking-tight text-[#111111]">
            Unified Inbox
          </h1>
          <p className="text-sm text-[#6F6F6B] mt-1">
            Real-time client conversations routed from Slack with autonomous classification, task synthesis, and approval controls.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => loadConversations()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#E5E5E1] text-xs font-medium text-[#111111] hover:bg-[#F5F5F3] transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Inbox</span>
          </button>
        </div>
      </div>

      {notification && (
        <div className={`p-4 rounded-xl text-xs flex items-center justify-between ${
          notification.type === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="opacity-60 hover:opacity-100">&times;</button>
        </div>
      )}

      {/* 3-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ==================================================== */}
        {/* COLUMN 1: Conversation List (3.5 / 12) */}
        {/* ==================================================== */}
        <div className="lg:col-span-4 bg-white border border-[#E5E5E1] rounded-[24px] p-4 shadow-sm space-y-4">
          {/* Search & Filters */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-[#6F6F6B]" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#F5F5F3] border border-[#E5E5E1] rounded-xl pl-9 pr-3 py-2 text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
              {[
                { id: 'all', label: 'All' },
                { id: 'needs_attention', label: 'Needs Attention' },
                { id: 'waiting_approval', label: 'Waiting Approval' },
                { id: 'ai_draft', label: 'AI Draft' },
                { id: 'completed', label: 'Completed' },
                { id: 'slack', label: 'Slack' }
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setActiveFilter(f.id)}
                  className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-colors ${
                    activeFilter === f.id
                      ? 'bg-[#111111] text-white font-medium'
                      : 'bg-[#F5F5F3] text-[#6F6F6B] hover:text-[#111111]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* List */}
          <div className="divide-y divide-[#E5E5E1]/60 max-h-[620px] overflow-y-auto">
            {loading ? (
              <div className="py-12 text-center text-xs text-[#6F6F6B]">
                <RefreshCw className="w-5 h-5 mx-auto mb-2 animate-spin text-[#6F6F6B]" />
                Loading conversations...
              </div>
            ) : conversations.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#6F6F6B] space-y-2">
                <MessageSquare className="w-8 h-8 mx-auto text-[#6F6F6B]/40" />
                <p className="font-medium text-[#111111]">No conversations found</p>
                <p className="text-[11px]">Incoming messages from connected Slack channels will appear here automatically.</p>
              </div>
            ) : (
              conversations.map((conv) => {
                const isSelected = conv.id === selectedConversationId;
                return (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversationId(conv.id)}
                    className={`w-full text-left p-3.5 rounded-2xl transition-all flex flex-col gap-1.5 ${
                      isSelected
                        ? 'bg-[#F5F5F3] border border-[#E5E5E1]'
                        : 'hover:bg-[#F5F5F3]/50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-xs text-[#111111] truncate flex items-center gap-1.5">
                        <Hash className="w-3 h-3 text-[#6F6F6B]" />
                        {conv.title}
                      </span>
                      <span className="text-[10px] font-mono text-[#6F6F6B] whitespace-nowrap">
                        {new Date(conv.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {conv.ai_draft_response && (
                      <p className="text-[11px] text-[#6F6F6B] line-clamp-1 italic">
                        &ldquo;{conv.ai_draft_response}&rdquo;
                      </p>
                    )}

                    <div className="flex items-center justify-between gap-2 mt-1">
                      <div className="flex items-center gap-1">
                        {getStatusBadge(conv.status)}
                      </div>
                      {conv.classification && (
                        <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-white border border-[#E5E5E1] text-[#6F6F6B]">
                          {conv.classification.category.replace('_', ' ')}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ==================================================== */}
        {/* COLUMN 2: Conversation Thread & Actions (5 / 12) */}
        {/* ==================================================== */}
        <div className="lg:col-span-5 bg-white border border-[#E5E5E1] rounded-[24px] p-6 shadow-sm flex flex-col min-h-[680px] justify-between">
          {detailsLoading ? (
            <div className="flex-1 flex items-center justify-center text-xs text-[#6F6F6B]">
              <RefreshCw className="w-5 h-5 animate-spin mr-2" />
              Loading thread...
            </div>
          ) : !activeConversation ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-[#6F6F6B] space-y-2">
              <Inbox className="w-10 h-10 text-[#6F6F6B]/30" />
              <div className="font-medium text-sm text-[#111111]">Select a conversation</div>
              <p className="text-xs max-w-xs">Pick a conversation thread from the left list to review messages, AI synthesis, and draft responses.</p>
            </div>
          ) : (
            <>
              {/* Thread Header */}
              <div className="pb-4 border-b border-[#E5E5E1] flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-medium text-sm text-[#111111]">{activeConversation.title}</h2>
                    {getStatusBadge(activeConversation.status)}
                  </div>
                  <p className="text-[11px] text-[#6F6F6B] mt-0.5 flex items-center gap-2">
                    <span>Slack Channel: #{activeConversation.external_channel_id}</span>
                    <span>&middot;</span>
                    <span>Thread: {activeConversation.external_thread_id}</span>
                  </p>
                </div>
              </div>

              {/* Messages Thread */}
              <div className="flex-1 py-4 space-y-4 overflow-y-auto max-h-[380px] pr-1">
                {messages.length === 0 ? (
                  <div className="text-center py-8 text-xs text-[#6F6F6B]">No recorded messages in this thread.</div>
                ) : (
                  messages.map((m) => {
                    const isUser = m.sender_type === 'user';
                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col ${isUser ? 'items-start' : 'items-end'}`}
                      >
                        <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] text-[#6F6F6B]">
                          <span className="font-medium text-[#111111]">{m.sender_name}</span>
                          <span>&middot;</span>
                          <span className="font-mono">{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div
                          className={`max-w-[85%] rounded-2xl p-3.5 text-xs ${
                            isUser
                              ? 'bg-[#F5F5F3] text-[#111111] border border-[#E5E5E1] rounded-tl-sm'
                              : 'bg-[#111111] text-white rounded-tr-sm'
                          }`}
                        >
                          <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
                        </div>
                      </div>
                    );
                  })
                )}

                {/* AI Approval Checkpoint Banner */}
                {activeConversation.status === 'waiting_approval' && activeApprovals.length > 0 && (
                  <div className="mt-4 p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-amber-900 font-medium">
                        <ShieldAlert className="w-4 h-4 text-amber-600" />
                        <span>External Communication Gate (Approval Required)</span>
                      </div>
                      <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-white text-amber-800 border border-amber-300">
                        Risk: HIGH
                      </span>
                    </div>

                    <p className="text-amber-800 text-[11px] leading-relaxed">
                      AI Client Liaison Agent has prepared a response aligned with brand communication rules. 
                      Review and authorize dispatch to client Slack channel:
                    </p>

                    <div className="p-3 bg-white rounded-xl border border-amber-200 text-[#111111]">
                      {isEditingDraft ? (
                        <textarea
                          rows={3}
                          value={editedDraftText}
                          onChange={(e) => setEditedDraftText(e.target.value)}
                          className="w-full bg-[#F5F5F3] border border-[#E5E5E1] rounded-lg p-2 text-xs text-[#111111] focus:outline-none"
                        />
                      ) : (
                        <p className="italic leading-relaxed">&ldquo;{editedDraftText}&rdquo;</p>
                      )}
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        onClick={() => setIsEditingDraft(!isEditingDraft)}
                        className="px-3 py-1.5 rounded-xl border border-amber-300 bg-white text-amber-900 text-[11px] font-medium hover:bg-amber-100/50 flex items-center gap-1"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>{isEditingDraft ? 'Cancel Edit' : 'Edit Response'}</span>
                      </button>

                      <button
                        onClick={() => handleRejectDraft(activeApprovals[0].id)}
                        disabled={actionInProgress}
                        className="px-3 py-1.5 rounded-xl border border-rose-300 bg-white text-rose-700 text-[11px] font-medium hover:bg-rose-50 flex items-center gap-1"
                      >
                        <X className="w-3 h-3" />
                        <span>Reject</span>
                      </button>

                      <button
                        onClick={() => handleApproveDraft(activeApprovals[0].id, isEditingDraft ? editedDraftText : undefined)}
                        disabled={actionInProgress}
                        className="px-4 py-1.5 rounded-xl bg-[#111111] text-white text-[11px] font-medium hover:bg-neutral-800 flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" />
                        <span>{isEditingDraft ? 'Save & Send to Slack' : 'Approve & Send to Slack'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Composer */}
              <form onSubmit={handleSendManualReply} className="pt-3 border-t border-[#E5E5E1] space-y-2">
                <div className="relative">
                  <textarea
                    rows={2}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type a manual reply to dispatch to Slack channel..."
                    className="w-full bg-[#F5F5F3] border border-[#E5E5E1] rounded-xl p-3 pr-12 text-xs text-[#111111] focus:outline-none focus:border-[#111111] resize-none"
                  />
                  <button
                    type="submit"
                    disabled={sendingReply || !replyText.trim()}
                    className="absolute right-2.5 bottom-3.5 p-2 rounded-lg bg-[#111111] text-white hover:bg-neutral-800 disabled:opacity-40 transition-opacity"
                    title="Send via Tool Registry"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex items-center justify-between text-[10px] text-[#6F6F6B]">
                  <span>Messages execute through Tool Registry gateway with audit trail.</span>
                  <span className="font-mono">Provider: Slack Web API</span>
                </div>
              </form>
            </>
          )}
        </div>

        {/* ==================================================== */}
        {/* COLUMN 3: Context & Intelligence Panel (3.5 / 12) */}
        {/* ==================================================== */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* Client Identification Card */}
          <div className="bg-white border border-[#E5E5E1] rounded-[24px] p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#6F6F6B]">
                Client Identity
              </span>
              <Building2 className="w-3.5 h-3.5 text-[#6F6F6B]" />
            </div>

            {activeClient ? (
              <div className="space-y-2">
                <div className="text-sm font-medium text-[#111111]">{activeClient.company_name}</div>
                <div className="text-[11px] text-[#6F6F6B] space-y-1">
                  <div>Industry: <span className="text-[#111111]">{activeClient.industry}</span></div>
                  <div>Channel: <span className="text-[#111111]">{activeClient.preferred_channel || 'Slack'}</span></div>
                  <div>Tone: <span className="text-[#111111]">{activeClient.communication_tone || 'Editorial, concise'}</span></div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-[11px]">
                  <strong>Unassigned Client:</strong> The AI cannot identify the client with high confidence. Assign to link memories.
                </div>
                <select
                  value={selectedAssignClientId}
                  onChange={(e) => setSelectedAssignClientId(e.target.value)}
                  className="w-full bg-[#F5F5F3] border border-[#E5E5E1] rounded-xl px-2.5 py-1.5 text-xs text-[#111111] focus:outline-none"
                >
                  <option value="">Select Client...</option>
                  {allClients.map((c) => (
                    <option key={c.id} value={c.id}>{c.company_name}</option>
                  ))}
                </select>
                <button
                  onClick={handleAssignClient}
                  disabled={!selectedAssignClientId}
                  className="w-full py-1.5 rounded-xl bg-[#111111] text-white text-xs font-medium hover:bg-neutral-800 disabled:opacity-40"
                >
                  Assign Client
                </button>
              </div>
            )}
          </div>

          {/* Project Identification Card */}
          <div className="bg-white border border-[#E5E5E1] rounded-[24px] p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#6F6F6B]">
                Project Scope
              </span>
              <Briefcase className="w-3.5 h-3.5 text-[#6F6F6B]" />
            </div>

            {activeProject ? (
              <div className="space-y-2">
                <div className="text-sm font-medium text-[#111111]">{activeProject.project_name}</div>
                <div className="text-[11px] text-[#6F6F6B] space-y-1">
                  <div>Status: <span className="text-[#111111]">{activeProject.status}</span></div>
                  <div>Target: <span className="text-[#111111]">{activeProject.deadline || 'Active'}</span></div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-2.5 rounded-xl bg-[#F5F5F3] border border-[#E5E5E1] text-[#6F6F6B] text-[11px]">
                  No project linked to this Slack conversation.
                </div>
                {activeClient && clientProjects.length > 0 && (
                  <>
                    <select
                      value={selectedAssignProjectId}
                      onChange={(e) => setSelectedAssignProjectId(e.target.value)}
                      className="w-full bg-[#F5F5F3] border border-[#E5E5E1] rounded-xl px-2.5 py-1.5 text-xs text-[#111111] focus:outline-none"
                    >
                      <option value="">Link Project...</option>
                      {clientProjects.map((p) => (
                        <option key={p.project_id} value={p.project_id}>{p.project_name}</option>
                      ))}
                    </select>
                    <button
                      onClick={handleAssignProject}
                      disabled={!selectedAssignProjectId}
                      className="w-full py-1.5 rounded-xl bg-[#111111] text-white text-xs font-medium hover:bg-neutral-800 disabled:opacity-40"
                    >
                      Link Project
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* AI Classification & Synthesis Card */}
          {activeConversation?.classification && (
            <div className="bg-white border border-[#E5E5E1] rounded-[24px] p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#6F6F6B]">
                  AI Classification
                </span>
                <Bot className="w-3.5 h-3.5 text-[#6F6F6B]" />
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#6F6F6B]">Category:</span>
                  <span className="font-medium text-[#111111] capitalize">
                    {activeConversation.classification.category.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#6F6F6B]">Urgency:</span>
                  <span className={`font-mono px-2 py-0.5 rounded text-[10px] ${
                    activeConversation.classification.urgency === 'high' ? 'bg-rose-50 text-rose-700' : 'bg-[#F5F5F3] text-[#111111]'
                  }`}>
                    {activeConversation.classification.urgency.toUpperCase()}
                  </span>
                </div>
                <div className="text-[11px] text-[#6F6F6B] bg-[#F5F5F3] p-2.5 rounded-xl border border-[#E5E5E1] mt-2">
                  {activeConversation.classification.reason}
                </div>
              </div>
            </div>
          )}

          {/* Linked Task Card */}
          {activeTask && (
            <div className="bg-white border border-[#E5E5E1] rounded-[24px] p-5 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#6F6F6B]">
                  Auto-Created Task
                </span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-xs font-medium text-[#111111]">{activeTask.title}</div>
              <div className="text-[10px] text-[#6F6F6B] flex items-center justify-between pt-1">
                <span>Priority: {activeTask.priority}</span>
                <span>Status: {activeTask.status}</span>
              </div>
            </div>
          )}

          {/* Relevant Client Memory */}
          {clientContext?.memories && clientContext.memories.length > 0 && (
            <div className="bg-white border border-[#E5E5E1] rounded-[24px] p-5 shadow-sm space-y-3">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#6F6F6B] block">
                Relevant Client Memory ({clientContext.memories.length})
              </span>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {clientContext.memories.slice(0, 3).map((m: any) => (
                  <div key={m.id} className="p-2.5 rounded-xl bg-[#F5F5F3] border border-[#E5E5E1] text-[11px]">
                    <div className="font-medium text-[#111111] flex items-center justify-between">
                      <span>{m.category}</span>
                      <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded ${
                        m.status === 'Official' ? 'bg-purple-100 text-purple-800' : 'bg-neutral-200 text-neutral-700'
                      }`}>
                        {m.status}
                      </span>
                    </div>
                    <p className="text-[#6F6F6B] mt-1 line-clamp-2">{m.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
