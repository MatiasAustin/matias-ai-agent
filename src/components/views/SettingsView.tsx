import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { OrganizationMemberRecord, OrganizationRole, InvitationRecord, ToolDefinition, OrgGovernancePolicy } from '../../../server/db/types';
import { 
  Building2, 
  Users, 
  User, 
  ShieldCheck, 
  Bot, 
  Link2, 
  CreditCard, 
  Plus, 
  Trash2, 
  Mail, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  Lock,
  Wrench,
  Play,
  Terminal,
  Activity,
  MessageSquare,
  Settings2,
  RefreshCw,
  Hash
} from 'lucide-react';

type SettingsTab = 'profile' | 'organization' | 'members' | 'security' | 'tools' | 'ai' | 'integrations' | 'billing';

export const SettingsView: React.FC = () => {
  const { user, organization, role, refreshAuth } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>('tools');
  const [members, setMembers] = useState<OrganizationMemberRecord[]>([]);
  const [invitations, setInvitations] = useState<InvitationRecord[]>([]);
  const [tools, setTools] = useState<ToolDefinition[]>([]);
  const [governance, setGovernance] = useState<OrgGovernancePolicy | null>(null);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [executionResult, setExecutionResult] = useState<{ toolId: string; result: any } | null>(null);
  const [executingTool, setExecutingTool] = useState<string | null>(null);

  // Invite modal / state
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<OrganizationRole>('MEMBER');

  // Slack Integration state
  const [slackIntegration, setSlackIntegration] = useState<any>(null);
  const [slackChannels, setSlackChannels] = useState<any[]>([]);
  const [slackContacts, setSlackContacts] = useState<any[]>([]);
  const [showSlackConfigModal, setShowSlackConfigModal] = useState(false);
  const [slackConfigTab, setSlackConfigTab] = useState<'connection' | 'channels' | 'contacts' | 'permissions'>('connection');
  const [newChannelId, setNewChannelId] = useState('');
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelClientId, setNewChannelClientId] = useState('');
  const [newContactUserId, setNewContactUserId] = useState('');
  const [newContactClientId, setNewContactClientId] = useState('');
  const [allClientsList, setAllClientsList] = useState<any[]>([]);
  const [connectingSlack, setConnectingSlack] = useState(false);

  const canManageMembers = role === 'OWNER' || role === 'ADMIN';
  const isOwner = role === 'OWNER';

  const loadMembersAndInvites = async () => {
    if (!organization) return;
    setLoading(true);
    try {
      const [mems, invs] = await Promise.all([
        api.getOrgMembers(),
        api.getOrgInvitations()
      ]);
      setMembers(mems);
      setInvitations(invs);
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const loadTools = async () => {
    try {
      const toolList = await api.getTools();
      setTools(toolList);
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message });
    }
  };

  const loadGovernance = async () => {
    try {
      const gov = await api.getGovernance();
      setGovernance(gov);
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message });
    }
  };

  const loadSlackData = async () => {
    try {
      const [intg, chans, contacts, cls] = await Promise.all([
        api.getSlackIntegration(),
        api.getSlackChannels().catch(() => []),
        api.getSlackContacts().catch(() => []),
        api.getClients().catch(() => [])
      ]);
      setSlackIntegration(intg);
      setSlackChannels(chans);
      setSlackContacts(contacts);
      setAllClientsList(cls);
    } catch (err: any) {
      console.warn('Failed to load Slack integration:', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'members') loadMembersAndInvites();
    if (activeTab === 'tools') loadTools();
    if (activeTab === 'ai') loadGovernance();
    if (activeTab === 'integrations') loadSlackData();
  }, [activeTab, organization?.id]);

  const handleConnectSlack = async () => {
    if (!slackIntegration?.isConfigured) {
      setNotification({
        type: 'error',
        message: 'Slack is not configured. Set SLACK_CLIENT_ID and SLACK_CLIENT_SECRET environment variables.'
      });
      return;
    }
    setConnectingSlack(true);
    try {
      const res = await api.getSlackConnectUrl();
      if (res?.url) {
        window.location.href = res.url;
      }
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message });
    } finally {
      setConnectingSlack(false);
    }
  };

  const handleDisconnectSlack = async () => {
    if (!confirm('Disconnect Slack workspace from this organization?')) return;
    try {
      await api.disconnectSlack();
      setNotification({ type: 'success', message: 'Slack disconnected.' });
      loadSlackData();
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message });
    }
  };

  const handleSaveChannelMapping = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChannelId || !newChannelName) return;
    try {
      await api.saveSlackChannelMapping({
        channel_id: newChannelId,
        channel_name: newChannelName,
        client_id: newChannelClientId || undefined,
        enabled: true
      });
      setNewChannelId('');
      setNewChannelName('');
      setNewChannelClientId('');
      setNotification({ type: 'success', message: 'Channel mapped successfully.' });
      loadSlackData();
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message });
    }
  };

  const handleSaveContactLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactUserId || !newContactClientId) return;
    try {
      await api.saveSlackContactLink({
        external_user_id: newContactUserId,
        client_id: newContactClientId,
        confidence: 1.0
      });
      setNewContactUserId('');
      setNewContactClientId('');
      setNotification({ type: 'success', message: 'Contact mapped successfully.' });
      loadSlackData();
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message });
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;

    try {
      await api.inviteOrgMember({
        email: inviteEmail,
        role: inviteRole
      });
      setShowInviteModal(false);
      setInviteEmail('');
      setNotification({ type: 'success', message: `Invitation registered for ${inviteEmail}.` });
      loadMembersAndInvites();
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message });
    }
  };

  const handleUpdateRole = async (memberId: string, newRole: OrganizationRole) => {
    if (!isOwner) {
      setNotification({ type: 'error', message: 'Only Organization Owners can modify member roles.' });
      return;
    }
    try {
      await api.updateOrgMemberRole(memberId, newRole);
      setNotification({ type: 'success', message: 'Member role updated.' });
      loadMembersAndInvites();
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message });
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!canManageMembers) {
      setNotification({ type: 'error', message: 'Only Admins or Owners can remove members.' });
      return;
    }
    if (!confirm('Are you sure you want to remove this member from the organization?')) return;

    try {
      await api.removeOrgMember(memberId);
      setNotification({ type: 'success', message: 'Member removed.' });
      loadMembersAndInvites();
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message });
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto">
      {/* Page Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#E5E5E1]">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-[#6F6F6B] block mb-1">
            Studio Governance
          </span>
          <h1 className="text-3xl font-medium tracking-tight text-[#111111]">
            Organization Settings
          </h1>
          <p className="text-sm text-[#6F6F6B] mt-1">
            Manage organization members, security posture, AI governance, and subscription billing.
          </p>
        </div>

        {organization && (
          <div className="flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-full border border-[#E5E5E1] text-xs font-medium text-[#111111]">
            <Building2 className="w-3.5 h-3.5 text-[#6F6F6B]" />
            <span>{organization.name}</span>
            <span className="text-[#6F6F6B] font-mono text-[10px]">({role || 'MEMBER'})</span>
          </div>
        )}
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

      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#E5E5E1]">
        {[
          { id: 'tools', label: 'Tools Catalog', icon: Wrench },
          { id: 'ai', label: 'AI Agent Governance', icon: Bot },
          { id: 'members', label: 'Members & Roles', icon: Users },
          { id: 'organization', label: 'Organization Profile', icon: Building2 },
          { id: 'profile', label: 'My Profile', icon: User },
          { id: 'security', label: 'Security & Sessions', icon: ShieldCheck },
          { id: 'integrations', label: 'Integrations', icon: Link2 },
          { id: 'billing', label: 'Plans & Billing', icon: CreditCard },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as SettingsTab)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-[#111111] text-white shadow-sm'
                  : 'text-[#6F6F6B] hover:text-[#111111] hover:bg-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab: Tools Catalog */}
      {activeTab === 'tools' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-medium text-[#111111]">Central Tool Registry</h2>
              <p className="text-xs text-[#6F6F6B] mt-0.5">
                Strongly typed execution catalog with risk ratings, permission boundaries, and approval requirements.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono px-3 py-1 bg-white border border-[#E5E5E1] rounded-full text-[#111111]">
                {tools.length} Registered Tools
              </span>
            </div>
          </div>

          {/* Test Execution Feedback Banner */}
          {executionResult && (
            <div className="p-4 rounded-2xl bg-white border border-[#E5E5E1] shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-[#111111]" />
                  <span className="text-xs font-mono font-medium text-[#111111]">
                    Execution Result: {executionResult.toolId}
                  </span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                    executionResult.result.success ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {executionResult.result.status}
                  </span>
                </div>
                <button 
                  onClick={() => setExecutionResult(null)}
                  className="text-xs text-[#6F6F6B] hover:text-[#111111]"
                >
                  Dismiss
                </button>
              </div>
              <pre className="p-3 bg-[#F5F5F3] rounded-xl text-[11px] font-mono overflow-x-auto text-[#111111] max-h-48">
                {JSON.stringify(executionResult.result, null, 2)}
              </pre>
            </div>
          )}

          {/* Tools Table */}
          <div className="bg-white border border-[#E5E5E1] rounded-[24px] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F5F5F3]/60 border-b border-[#E5E5E1] text-[#6F6F6B] font-mono">
                    <th className="py-3 px-4 font-medium uppercase tracking-wider">Tool &amp; Identifier</th>
                    <th className="py-3 px-4 font-medium uppercase tracking-wider">Provider</th>
                    <th className="py-3 px-4 font-medium uppercase tracking-wider">Category</th>
                    <th className="py-3 px-4 font-medium uppercase tracking-wider">Risk Level</th>
                    <th className="py-3 px-4 font-medium uppercase tracking-wider">Required Permission</th>
                    <th className="py-3 px-4 font-medium uppercase tracking-wider">Status</th>
                    <th className="py-3 px-4 font-medium uppercase tracking-wider text-right">Gateway Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5E1]/60">
                  {tools.map((t) => {
                    const isCritical = t.risk_level === 'CRITICAL';
                    const isHigh = t.risk_level === 'HIGH';
                    const isMedium = t.risk_level === 'MEDIUM';
                    return (
                      <tr key={t.id} className="hover:bg-[#F5F5F3]/30 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-medium text-[#111111]">{t.name}</div>
                          <div className="font-mono text-[10px] text-[#6F6F6B] mt-0.5">{t.id}</div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[#6F6F6B] uppercase text-[11px]">
                          {t.provider}
                        </td>
                        <td className="py-3.5 px-4 text-[#111111] capitalize">
                          {t.category.replace('_', ' ')}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                            isCritical ? 'bg-red-50 text-red-700 border border-red-200' :
                            isHigh ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                            isMedium ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                            'bg-neutral-100 text-neutral-700 border border-neutral-200'
                          }`}>
                            {t.risk_level}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-[#6F6F6B]">
                          {t.required_permissions.join(', ') || 'none'}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            {t.requires_approval ? 'Approval Required' : 'Enabled'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={async () => {
                              setExecutingTool(t.id);
                              try {
                                const res = await api.executeTool({
                                  toolId: t.id,
                                  input: t.id === 'clients.create'
                                    ? { company_name: `Test Client ${Date.now()}`, industry: 'Creative Tech' }
                                    : t.id === 'communication.send'
                                    ? { channel: 'Slack', recipient: 'Lead Partner', message: 'Test message dispatch.' }
                                    : {}
                                });
                                setExecutionResult({ toolId: t.id, result: res });
                                setNotification({
                                  type: 'success',
                                  message: res.status === 'waiting_approval' 
                                    ? `Approval checkpoint created: ${res.message}` 
                                    : `Execution succeeded (${res.status})`
                                });
                              } catch (err: any) {
                                setNotification({ type: 'error', message: err.message });
                              } finally {
                                setExecutingTool(null);
                              }
                            }}
                            disabled={executingTool === t.id}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[#E5E5E1] bg-white hover:bg-[#F5F5F3] text-[11px] font-medium text-[#111111] transition-all disabled:opacity-50"
                          >
                            <Play className="w-3 h-3 text-[#6F6F6B]" />
                            <span>{executingTool === t.id ? 'Executing...' : 'Test Run'}</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab: AI Governance */}
      {activeTab === 'ai' && (
        <div className="bg-white border border-[#E5E5E1] rounded-[24px] p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-medium text-[#111111]">AI Agent Governance &amp; Gates</h2>
              <p className="text-xs text-[#6F6F6B] mt-1">
                Real database policy gates actively evaluated by ToolExecutionService before execution.
              </p>
            </div>
            <span className="font-mono text-xs px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
              Engine Status: Enforcing
            </span>
          </div>

          <div className="space-y-3 text-xs">
            {[
              { 
                key: 'official_truth_gate' as keyof OrgGovernancePolicy, 
                title: 'Official Truth Modification Gate', 
                desc: 'Require human review before observed facts or memory updates can elevate to official authoritative studio truth.',
                active: governance ? Boolean(governance.official_truth_gate) : true
              },
              { 
                key: 'external_communication_gate' as keyof OrgGovernancePolicy, 
                title: 'External Communication Gate', 
                desc: 'Require studio operator sign-off before AI agents dispatch outbound Slack, Email, or WhatsApp communications.',
                active: governance ? Boolean(governance.external_communication_gate) : true
              },
              { 
                key: 'design_publishing_gate' as keyof OrgGovernancePolicy, 
                title: 'Design Asset Publishing Gate', 
                desc: 'Hold client-facing Figma exports and deliverables in quarantine until design director confirmation.',
                active: governance ? Boolean(governance.design_publishing_gate) : true
              },
              { 
                key: 'commercial_budget_enforcement' as keyof OrgGovernancePolicy, 
                title: 'Commercial Budget Enforcement', 
                desc: 'Prevent agents from issuing invoices or quotations without formal finance confirmation.',
                active: governance ? Boolean(governance.commercial_budget_enforcement) : true
              },
            ].map((gate) => (
              <div key={gate.key} className="p-4 rounded-xl bg-[#F5F5F3] border border-[#E5E5E1] flex items-center justify-between">
                <div>
                  <div className="font-medium text-[#111111]">{gate.title}</div>
                  <div className="text-[#6F6F6B] text-[11px] mt-0.5">{gate.desc}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`font-mono text-[11px] px-2 py-0.5 rounded border ${
                    gate.active 
                      ? 'text-emerald-700 bg-emerald-50 border-emerald-200' 
                      : 'text-neutral-500 bg-neutral-100 border-neutral-200'
                  }`}>
                    {gate.active ? 'ACTIVE GATE' : 'BYPASSED'}
                  </span>
                  {canManageMembers && (
                    <button
                      onClick={async () => {
                        if (!governance) return;
                        try {
                          const updated = await api.updateGovernance({ [gate.key]: !gate.active });
                          setGovernance(updated);
                          setNotification({
                            type: 'success',
                            message: `Gate "${gate.title}" is now ${!gate.active ? 'ACTIVE' : 'BYPASSED'}.`
                          });
                        } catch (err: any) {
                          setNotification({ type: 'error', message: err.message });
                        }
                      }}
                      className="px-3 py-1 rounded-lg border border-[#E5E5E1] bg-white hover:bg-neutral-100 text-[11px] font-medium text-[#111111]"
                    >
                      {gate.active ? 'Disable' : 'Enable'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Integrations */}
      {activeTab === 'integrations' && (
        <div className="bg-white border border-[#E5E5E1] rounded-[24px] p-8 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-medium text-[#111111]">Studio Tool Integrations</h2>
            <p className="text-xs text-[#6F6F6B] mt-1">
              Tool registry execution gateway is live. External tool connectors connect through registered tool pipelines.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-emerald-200 bg-emerald-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="font-medium text-sm text-[#111111] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Core Studio Tools Gateway
              </div>
              <p className="text-[#6F6F6B] text-xs mt-1">
                25 strongly-typed core tools connected to database, tenant isolation, and risk engine.
              </p>
            </div>
            <span className="text-xs font-mono font-medium text-emerald-700 bg-white px-3 py-1 rounded-full border border-emerald-200 self-start sm:self-auto">
              Connected
            </span>
          </div>

          {/* Real Slack Integration Card */}
          <div className="p-6 rounded-[24px] border border-[#E5E5E1] bg-white space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-[#111111] text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-sm text-[#111111]">Slack Integration</h3>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                      slackIntegration?.status === 'connected'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : connectingSlack
                        ? 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
                        : 'bg-[#F5F5F3] text-[#6F6F6B] border-[#E5E5E1]'
                    }`}>
                      {slackIntegration?.status === 'connected' ? 'Connected' : connectingSlack ? 'Connecting...' : 'Not connected'}
                    </span>
                  </div>
                  <p className="text-xs text-[#6F6F6B] mt-1 max-w-xl">
                    Client communication gateway. Ingests Slack messages, loads client memory, drafts editorial responses, requires human approval, and synchronizes deliverables.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                {slackIntegration?.status === 'connected' ? (
                  <>
                    <button
                      onClick={() => setShowSlackConfigModal(true)}
                      className="px-3.5 py-1.5 rounded-xl border border-[#E5E5E1] bg-[#F5F5F3] hover:bg-[#E5E5E1] text-xs font-medium text-[#111111] flex items-center gap-1.5 transition-colors"
                    >
                      <Settings2 className="w-3.5 h-3.5" />
                      Configure
                    </button>
                    <button
                      onClick={handleDisconnectSlack}
                      className="px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-xs font-medium text-rose-700 transition-colors"
                    >
                      Disconnect
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleConnectSlack}
                    disabled={connectingSlack}
                    className="px-4 py-2 rounded-xl bg-[#111111] text-white text-xs font-medium hover:bg-neutral-800 disabled:opacity-40 transition-colors flex items-center gap-2"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Connect Slack</span>
                  </button>
                )}
              </div>
            </div>

            {/* If Connected Details */}
            {slackIntegration?.status === 'connected' && (
              <div className="pt-3 border-t border-[#E5E5E1] grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-[10px] text-[#6F6F6B] uppercase font-mono block">Workspace Name</span>
                  <span className="font-medium text-[#111111]">{slackIntegration.metadata?.team_name || slackIntegration.display_name}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#6F6F6B] uppercase font-mono block">Connected Bot Account</span>
                  <span className="font-mono text-[#111111]">{slackIntegration.metadata?.bot_user_id || 'Active'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#6F6F6B] uppercase font-mono block">Connected Since</span>
                  <span className="text-[#111111]">{new Date(slackIntegration.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            )}

            {/* If Not Configured in Server Env */}
            {slackIntegration && !slackIntegration.isConfigured && slackIntegration.status !== 'connected' && (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-medium">Slack OAuth credentials not configured:</strong>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    To enable live Slack connections, provide <code>SLACK_CLIENT_ID</code> and <code>SLACK_CLIENT_SECRET</code> in your environment variables.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Other External Tools Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            {[
              { name: 'Figma', desc: 'Design token publisher & component sync pipeline', status: 'Not connected' },
              { name: 'Linear', desc: 'Task coordination and milestone issue tracking', status: 'Not connected' },
              { name: 'Google Workspace', desc: 'Drive and Docs brief ingestion gateway', status: 'Not connected' },
            ].map((intg, i) => (
              <div key={i} className="p-5 rounded-2xl border border-[#E5E5E1] bg-white flex flex-col justify-between">
                <div>
                  <div className="font-medium text-sm text-[#111111]">{intg.name}</div>
                  <p className="text-[#6F6F6B] text-xs mt-1">{intg.desc}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#E5E5E1] flex items-center justify-between">
                  <span className="text-[10px] font-mono text-[#6F6F6B] bg-[#F5F5F3] px-2 py-0.5 rounded">
                    {intg.status}
                  </span>
                  <span className="text-[11px] text-[#6F6F6B] italic font-light">
                    Pending next milestone
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Slack Configuration Modal */}
      {showSlackConfigModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#E5E5E1] rounded-[24px] p-6 max-w-2xl w-full shadow-xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E1]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#111111] text-white flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-sm text-[#111111]">Slack Configuration</h3>
                  <p className="text-[11px] text-[#6F6F6B]">Manage channel routing, user mappings, and autonomous behaviors</p>
                </div>
              </div>
              <button
                onClick={() => setShowSlackConfigModal(false)}
                className="text-xs text-[#6F6F6B] hover:text-[#111111]"
              >
                Close
              </button>
            </div>

            {/* Modal Subtabs */}
            <div className="flex items-center gap-2 border-b border-[#E5E5E1] pb-2 text-xs">
              {[
                { id: 'connection', label: 'Connection' },
                { id: 'channels', label: 'Channel Mappings' },
                { id: 'contacts', label: 'Contact Links' },
                { id: 'permissions', label: 'Scopes & Security' }
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSlackConfigTab(t.id as any)}
                  className={`px-3 py-1.5 rounded-xl font-medium transition-colors ${
                    slackConfigTab === t.id
                      ? 'bg-[#111111] text-white'
                      : 'text-[#6F6F6B] hover:text-[#111111] hover:bg-[#F5F5F3]'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Tab: Connection */}
            {slackConfigTab === 'connection' && (
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-xl bg-[#F5F5F3] border border-[#E5E5E1] space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[#6F6F6B]">Workspace Name:</span>
                    <span className="font-medium text-[#111111]">{slackIntegration?.metadata?.team_name || 'Connected Workspace'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6F6F6B]">Team ID:</span>
                    <span className="font-mono text-[#111111]">{slackIntegration?.external_account_id || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6F6F6B]">Bot User ID:</span>
                    <span className="font-mono text-[#111111]">{slackIntegration?.metadata?.bot_user_id || 'Active'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6F6F6B]">Secret Token Storage:</span>
                    <span className="font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">AES-256-GCM Encrypted</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Channels */}
            {slackConfigTab === 'channels' && (
              <div className="space-y-4 text-xs">
                <form onSubmit={handleSaveChannelMapping} className="p-4 rounded-xl bg-[#F5F5F3] border border-[#E5E5E1] space-y-3">
                  <h4 className="font-medium text-[#111111]">Map Slack Channel to Client / Project</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Channel ID (e.g. C08123456)"
                      value={newChannelId}
                      onChange={(e) => setNewChannelId(e.target.value)}
                      required
                      className="bg-white border border-[#E5E5E1] rounded-lg px-2.5 py-1.5 text-xs text-[#111111]"
                    />
                    <input
                      type="text"
                      placeholder="Channel Name (e.g. #xyz-ai)"
                      value={newChannelName}
                      onChange={(e) => setNewChannelName(e.target.value)}
                      required
                      className="bg-white border border-[#E5E5E1] rounded-lg px-2.5 py-1.5 text-xs text-[#111111]"
                    />
                    <select
                      value={newChannelClientId}
                      onChange={(e) => setNewChannelClientId(e.target.value)}
                      className="bg-white border border-[#E5E5E1] rounded-lg px-2.5 py-1.5 text-xs text-[#111111]"
                    >
                      <option value="">Select Client (Optional)...</option>
                      {allClientsList.map((c) => (
                        <option key={c.id} value={c.id}>{c.company_name}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 rounded-lg bg-[#111111] text-white text-xs font-medium hover:bg-neutral-800"
                  >
                    Add Channel Mapping
                  </button>
                </form>

                <div className="space-y-2">
                  <h4 className="font-medium text-[#111111]">Configured Channels ({slackChannels.length})</h4>
                  {slackChannels.length === 0 ? (
                    <p className="text-[#6F6F6B] text-[11px] italic">No channels mapped yet.</p>
                  ) : (
                    slackChannels.map((c) => (
                      <div key={c.id} className="p-3 rounded-xl border border-[#E5E5E1] flex items-center justify-between">
                        <div>
                          <div className="font-medium text-[#111111]">{c.channel_name} ({c.channel_id})</div>
                          <div className="text-[10px] text-[#6F6F6B]">
                            Client: {allClientsList.find(cl => cl.id === c.client_id)?.company_name || 'Unassigned'}
                          </div>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">Active</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Tab: Contacts */}
            {slackConfigTab === 'contacts' && (
              <div className="space-y-4 text-xs">
                <form onSubmit={handleSaveContactLink} className="p-4 rounded-xl bg-[#F5F5F3] border border-[#E5E5E1] space-y-3">
                  <h4 className="font-medium text-[#111111]">Map Slack User to Client</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Slack User ID (e.g. U0998877)"
                      value={newContactUserId}
                      onChange={(e) => setNewContactUserId(e.target.value)}
                      required
                      className="bg-white border border-[#E5E5E1] rounded-lg px-2.5 py-1.5 text-xs text-[#111111]"
                    />
                    <select
                      value={newContactClientId}
                      onChange={(e) => setNewContactClientId(e.target.value)}
                      required
                      className="bg-white border border-[#E5E5E1] rounded-lg px-2.5 py-1.5 text-xs text-[#111111]"
                    >
                      <option value="">Select Client...</option>
                      {allClientsList.map((c) => (
                        <option key={c.id} value={c.id}>{c.company_name}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 rounded-lg bg-[#111111] text-white text-xs font-medium hover:bg-neutral-800"
                  >
                    Link Contact
                  </button>
                </form>

                <div className="space-y-2">
                  <h4 className="font-medium text-[#111111]">Linked Contacts ({slackContacts.length})</h4>
                  {slackContacts.length === 0 ? (
                    <p className="text-[#6F6F6B] text-[11px] italic">No contacts linked yet.</p>
                  ) : (
                    slackContacts.map((ct) => (
                      <div key={ct.id} className="p-3 rounded-xl border border-[#E5E5E1] flex items-center justify-between">
                        <div>
                          <div className="font-medium text-[#111111]">Slack User: {ct.external_user_id}</div>
                          <div className="text-[10px] text-[#6F6F6B]">
                            Linked Client: {allClientsList.find(cl => cl.id === ct.client_id)?.company_name || ct.client_id}
                          </div>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">Confidence: 100%</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Tab: Permissions */}
            {slackConfigTab === 'permissions' && (
              <div className="space-y-3 text-xs">
                <h4 className="font-medium text-[#111111]">Least Privilege Permissions</h4>
                <p className="text-[#6F6F6B] text-[11px]">
                  Matias AI Studio OS requests only essential scopes needed for communication:
                </p>
                <div className="divide-y divide-[#E5E5E1] border border-[#E5E5E1] rounded-xl overflow-hidden">
                  {[
                    { scope: 'channels:history', desc: 'Read conversation history in public channels' },
                    { scope: 'channels:read', desc: 'List public channels in workspace' },
                    { scope: 'chat:write', desc: 'Send approved responses to authorized channels' },
                    { scope: 'chat:write.public', desc: 'Post to authorized channels without joining first' },
                    { scope: 'users:read', desc: 'Identify sender display names and match client contacts' }
                  ].map((s) => (
                    <div key={s.scope} className="p-3 flex items-center justify-between bg-white">
                      <div>
                        <div className="font-mono font-medium text-[#111111]">{s.scope}</div>
                        <div className="text-[11px] text-[#6F6F6B]">{s.desc}</div>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">Granted</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Tab: Members */}
      {activeTab === 'members' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-medium text-[#111111]">Team Members</h2>
              <p className="text-xs text-[#6F6F6B] mt-0.5">
                Users with access to this tenant workspace and its clients, projects, and memory stores.
              </p>
            </div>
            {canManageMembers && (
              <button
                onClick={() => setShowInviteModal(true)}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium bg-[#111111] hover:bg-neutral-800 text-white transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Invite Team Member
              </button>
            )}
          </div>

          {/* Members Table */}
          <div className="bg-white border border-[#E5E5E1] rounded-[24px] overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F5F5F3]/60 border-b border-[#E5E5E1] text-[#6F6F6B] font-mono">
                  <th className="py-3 px-4 font-medium uppercase tracking-wider">Member ID</th>
                  <th className="py-3 px-4 font-medium uppercase tracking-wider">User ID</th>
                  <th className="py-3 px-4 font-medium uppercase tracking-wider">Tenant Role</th>
                  <th className="py-3 px-4 font-medium uppercase tracking-wider">Joined At</th>
                  <th className="py-3 px-4 font-medium uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E1]/60">
                {members.map((mem) => {
                  const isCurrent = mem.user_id === user?.id;
                  return (
                    <tr key={mem.id} className="hover:bg-[#F5F5F3]/30 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-[#6F6F6B]">
                        {mem.id}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-[#111111] flex items-center gap-1.5">
                          {mem.user_id}
                          {isCurrent && (
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-neutral-100 text-neutral-600">
                              (You)
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        {isOwner && !isCurrent ? (
                          <select
                            value={mem.role}
                            onChange={(e) => handleUpdateRole(mem.id, e.target.value as OrganizationRole)}
                            className="bg-[#F5F5F3] border border-[#E5E5E1] rounded-lg px-2 py-1 text-xs text-[#111111] focus:outline-none"
                          >
                            <option value="OWNER">OWNER</option>
                            <option value="ADMIN">ADMIN</option>
                            <option value="MEMBER">MEMBER</option>
                            <option value="VIEWER">VIEWER</option>
                          </select>
                        ) : (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                            mem.role === 'OWNER' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                            mem.role === 'ADMIN' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                            mem.role === 'MEMBER' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            'bg-neutral-100 text-neutral-700 border border-neutral-200'
                          }`}>
                            {mem.role}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-[#6F6F6B]">
                        {new Date(mem.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {canManageMembers && !isCurrent && mem.role !== 'OWNER' && (
                          <button
                            onClick={() => handleRemoveMember(mem.id)}
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors"
                            title="Remove member"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pending Invitations */}
          {invitations.length > 0 && (
            <div className="bg-white border border-[#E5E5E1] rounded-[24px] p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-medium text-[#111111]">Pending Invitations</h3>
              <div className="divide-y divide-[#E5E5E1]/60">
                {invitations.map((inv) => (
                  <div key={inv.id} className="py-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-[#6F6F6B]" />
                      <div>
                        <div className="font-medium text-[#111111]">{inv.email}</div>
                        <div className="text-[10px] text-[#6F6F6B] font-mono">Assigned Role: {inv.role} &middot; Sent {new Date(inv.created_at).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                      Pending acceptance
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: Organization Profile */}
      {activeTab === 'organization' && (
        <div className="bg-white border border-[#E5E5E1] rounded-[24px] p-8 shadow-sm space-y-6">
          <h2 className="text-lg font-medium text-[#111111]">Organization Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div>
              <span className="text-[#6F6F6B] block mb-1">Organization Name</span>
              <div className="p-3 bg-[#F5F5F3] rounded-xl font-medium text-[#111111]">
                {organization?.name || 'Matias Studio'}
              </div>
            </div>
            <div>
              <span className="text-[#6F6F6B] block mb-1">Organization Partition ID</span>
              <div className="p-3 bg-[#F5F5F3] rounded-xl font-mono text-[#111111]">
                {organization?.id || 'org_matias_studio'}
              </div>
            </div>
            <div>
              <span className="text-[#6F6F6B] block mb-1">Subdomain Slug</span>
              <div className="p-3 bg-[#F5F5F3] rounded-xl font-mono text-[#111111]">
                {organization?.slug || 'matias-studio'}
              </div>
            </div>
            <div>
              <span className="text-[#6F6F6B] block mb-1">Current Plan Tier</span>
              <div className="p-3 bg-[#F5F5F3] rounded-xl font-medium text-[#111111] flex items-center justify-between">
                <span>{organization?.plan || 'Studio'}</span>
                <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: My Profile */}
      {activeTab === 'profile' && (
        <div className="bg-white border border-[#E5E5E1] rounded-[24px] p-8 shadow-sm space-y-6">
          <h2 className="text-lg font-medium text-[#111111]">User Account Profile</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div>
              <span className="text-[#6F6F6B] block mb-1">Full Name</span>
              <div className="p-3 bg-[#F5F5F3] rounded-xl font-medium text-[#111111]">
                {user?.name || '-'}
              </div>
            </div>
            <div>
              <span className="text-[#6F6F6B] block mb-1">Email Address</span>
              <div className="p-3 bg-[#F5F5F3] rounded-xl font-mono text-[#111111]">
                {user?.email || '-'}
              </div>
            </div>
            <div>
              <span className="text-[#6F6F6B] block mb-1">Platform Role</span>
              <div className="p-3 bg-[#F5F5F3] rounded-xl font-mono text-[#111111]">
                {user?.platform_role || 'USER'}
              </div>
            </div>
            <div>
              <span className="text-[#6F6F6B] block mb-1">Active Organization Role</span>
              <div className="p-3 bg-[#F5F5F3] rounded-xl font-medium text-[#111111]">
                {role || 'MEMBER'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Security */}
      {activeTab === 'security' && (
        <div className="bg-white border border-[#E5E5E1] rounded-[24px] p-8 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-medium text-[#111111]">Workspace Security &amp; Tenant Boundary</h2>
            <p className="text-xs text-[#6F6F6B] mt-1">Tenant isolation enforcement and cryptographic measures.</p>
          </div>
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-[#F5F5F3] border border-[#E5E5E1] flex items-center justify-between">
              <div>
                <div className="font-medium text-[#111111]">Password Storage Cryptography</div>
                <div className="text-[#6F6F6B] text-[11px] mt-0.5">Scrypt algorithm with random 16-byte cryptographic salt per user.</div>
              </div>
              <span className="font-mono text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">Enforced</span>
            </div>
            <div className="p-4 rounded-xl bg-[#F5F5F3] border border-[#E5E5E1] flex items-center justify-between">
              <div>
                <div className="font-medium text-[#111111]">HttpOnly Cookie + Header Session Token</div>
                <div className="text-[#6F6F6B] text-[11px] mt-0.5">Protected against client-side script tampering with server session store.</div>
              </div>
              <span className="font-mono text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">Active</span>
            </div>
            <div className="p-4 rounded-xl bg-[#F5F5F3] border border-[#E5E5E1] flex items-center justify-between">
              <div>
                <div className="font-medium text-[#111111]">Multi-Tenant Partition Filter</div>
                <div className="text-[#6F6F6B] text-[11px] mt-0.5">Cross-tenant resource access blocked by server-side query filters.</div>
              </div>
              <span className="font-mono text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">Active</span>
            </div>
          </div>
        </div>
      )}


      {/* Tab: Billing */}
      {activeTab === 'billing' && (
        <div className="bg-white border border-[#E5E5E1] rounded-[24px] p-8 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-medium text-[#111111]">Subscription &amp; Billing</h2>
            <p className="text-xs text-[#6F6F6B] mt-1">Manage plan tier and payment methods.</p>
          </div>
          <div className="p-6 rounded-2xl bg-[#F5F5F3] border border-[#E5E5E1] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-[#6F6F6B]">Current Subscription</span>
              <div className="text-2xl font-medium text-[#111111] mt-1">{organization?.plan || 'Studio'} Plan</div>
              <div className="text-xs text-[#6F6F6B] mt-1">$299/month &middot; Unlimited Projects &amp; Context Intelligence</div>
            </div>
            <button className="px-4 py-2 rounded-xl bg-[#111111] text-white text-xs font-medium hover:bg-neutral-800 self-start sm:self-auto">
              Manage in Stripe Portal
            </button>
          </div>
        </div>
      )}

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#E5E5E1] rounded-[24px] p-6 max-w-md w-full shadow-lg">
            <h3 className="text-lg font-medium text-[#111111]">Invite Team Member</h3>
            <p className="text-xs text-[#6F6F6B] mt-1 mb-4">
              Send an invitation to join <strong className="text-[#111111]">{organization?.name}</strong>.
            </p>

            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#6F6F6B] uppercase mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="collaborator@agency.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full bg-[#F5F5F3] border border-[#E5E5E1] rounded-xl px-3.5 py-2.5 text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#6F6F6B] uppercase mb-1">Assigned Tenant Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as OrganizationRole)}
                  className="w-full bg-[#F5F5F3] border border-[#E5E5E1] rounded-xl px-3.5 py-2.5 text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
                >
                  <option value="MEMBER">MEMBER (Can work on clients, tasks, documents)</option>
                  <option value="ADMIN">ADMIN (Can manage team &amp; settings)</option>
                  <option value="VIEWER">VIEWER (Read-only access)</option>
                  {isOwner && <option value="OWNER">OWNER (Full control)</option>}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium border border-[#E5E5E1] text-[#6F6F6B] hover:text-[#111111]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-medium bg-[#111111] text-white hover:bg-neutral-800"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
