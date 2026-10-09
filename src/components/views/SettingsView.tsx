import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { OrganizationMemberRecord, OrganizationRole, InvitationRecord } from '../../../server/db/types';
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
  Lock
} from 'lucide-react';

type SettingsTab = 'profile' | 'organization' | 'members' | 'security' | 'ai' | 'integrations' | 'billing';

export const SettingsView: React.FC = () => {
  const { user, organization, role, refreshAuth } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>('members');
  const [members, setMembers] = useState<OrganizationMemberRecord[]>([]);
  const [invitations, setInvitations] = useState<InvitationRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Invite modal / state
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<OrganizationRole>('MEMBER');

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

  useEffect(() => {
    if (activeTab === 'members') {
      loadMembersAndInvites();
    }
  }, [activeTab, organization?.id]);

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
          { id: 'members', label: 'Members & Roles', icon: Users },
          { id: 'organization', label: 'Organization Profile', icon: Building2 },
          { id: 'profile', label: 'My Profile', icon: User },
          { id: 'security', label: 'Security & Sessions', icon: ShieldCheck },
          { id: 'ai', label: 'AI Agent Governance', icon: Bot },
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

      {/* Tab: AI Governance */}
      {activeTab === 'ai' && (
        <div className="bg-white border border-[#E5E5E1] rounded-[24px] p-8 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-medium text-[#111111]">AI Agent Governance &amp; Approvals</h2>
            <p className="text-xs text-[#6F6F6B] mt-1">Configure autonomy bounds and approval gates for autonomous studio workers.</p>
          </div>
          <div className="space-y-3 text-xs">
            {[
              { title: 'Official Truth Modification Gate', desc: 'Require human review before observed facts can overwrite official brand memories.', state: 'Active' },
              { title: 'External Communication Gate', desc: 'Require studio operator sign-off before AI agents send messages to external channels.', state: 'Active' },
              { title: 'Design Asset Publishing Gate', desc: 'Hold client-facing deliverables until design lead confirmation.', state: 'Active' },
              { title: 'Commercial Budget Enforcement', desc: 'Prevent agent from issuing quotes exceeding project baseline estimates.', state: 'Active' },
            ].map((gate, i) => (
              <div key={i} className="p-4 rounded-xl bg-[#F5F5F3] border border-[#E5E5E1] flex items-center justify-between">
                <div>
                  <div className="font-medium text-[#111111]">{gate.title}</div>
                  <div className="text-[#6F6F6B] text-[11px] mt-0.5">{gate.desc}</div>
                </div>
                <span className="font-mono text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">{gate.state}</span>
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
            <p className="text-xs text-[#6F6F6B] mt-1">Connect external creative pipelines to the Matias intelligence engine.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {[
              { name: 'Figma', desc: 'Extract tokens, frames, and brand system components', status: 'Ready to connect' },
              { name: 'Slack', desc: 'Ingest client channels for background communication notes', status: 'Ready to connect' },
              { name: 'Linear', desc: 'Synchronize agent tasks with engineering deliverables', status: 'Ready to connect' },
              { name: 'Google Workspace', desc: 'Ingest Docs briefs, Drive assets, and project files', status: 'Ready to connect' },
            ].map((intg, i) => (
              <div key={i} className="p-5 rounded-2xl border border-[#E5E5E1] bg-white flex flex-col justify-between">
                <div>
                  <div className="font-medium text-sm text-[#111111]">{intg.name}</div>
                  <p className="text-[#6F6F6B] text-xs mt-1">{intg.desc}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#E5E5E1] flex items-center justify-between">
                  <span className="text-[10px] font-mono text-[#6F6F6B]">{intg.status}</span>
                  <button className="px-3 py-1 rounded-lg border border-[#E5E5E1] hover:bg-[#F5F5F3] text-xs font-medium">
                    Connect
                  </button>
                </div>
              </div>
            ))}
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
