import React, { useState, useEffect } from 'react';
import { api, AdminOverview, AuthUser } from '../../api/client';
import { OrganizationRecord, OrganizationStatus, OrganizationPlan, PlatformRole, UserStatus, FeatureFlagRecord, ActivityRecord } from '../../../server/db/types';
import { 
  Building2, 
  Users, 
  Layers, 
  BarChart3, 
  Activity, 
  Flag, 
  Sliders, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  ShieldAlert, 
  ExternalLink,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

type AdminTab = 'overview' | 'organizations' | 'users' | 'plans' | 'usage' | 'activities' | 'flags' | 'settings';

export const SuperAdminView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [organizations, setOrganizations] = useState<OrganizationRecord[]>([]);
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [flags, setFlags] = useState<FeatureFlagRecord[]>([]);
  const [activities, setActivities] = useState<ActivityRecord[]>([]);
  const [notification, setNotification] = useState<string | null>(null);

  // New org modal / state
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgSlug, setNewOrgSlug] = useState('');
  const [newOrgPlan, setNewOrgPlan] = useState<OrganizationPlan>('Studio');
  const [showOrgModal, setShowOrgModal] = useState(false);

  // New user modal / state
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPass, setNewUserPass] = useState('');
  const [newUserRole, setNewUserRole] = useState<PlatformRole>('USER');
  const [showUserModal, setShowUserModal] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [ov, orgs, usr, flg, act] = await Promise.all([
        api.getAdminOverview(),
        api.getAdminOrganizations(),
        api.getAdminUsers(),
        api.getAdminFeatureFlags(),
        api.getAdminActivities(50)
      ]);
      setOverview(ov);
      setOrganizations(orgs);
      setUsers(usr);
      setFlags(flg);
      setActivities(act);
    } catch (err: any) {
      setNotification(`Failed to load admin data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleOrgStatus = async (org: OrganizationRecord) => {
    const nextStatus: OrganizationStatus = org.status === 'active' ? 'suspended' : 'active';
    try {
      await api.setAdminOrganizationStatus(org.id, nextStatus);
      setNotification(`Organization "${org.name}" status updated to ${nextStatus}.`);
      loadData();
    } catch (err: any) {
      setNotification(`Error: ${err.message}`);
    }
  };

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName) return;
    try {
      await api.createAdminOrganization({
        name: newOrgName,
        slug: newOrgSlug || undefined,
        plan: newOrgPlan
      });
      setShowOrgModal(false);
      setNewOrgName('');
      setNewOrgSlug('');
      setNotification(`Created organization "${newOrgName}".`);
      loadData();
    } catch (err: any) {
      setNotification(`Error: ${err.message}`);
    }
  };

  const handleToggleUserStatus = async (user: AuthUser) => {
    const nextStatus: UserStatus = user.status === 'active' ? 'suspended' : 'active';
    try {
      await api.setAdminUserStatus(user.id, nextStatus);
      setNotification(`User "${user.name}" status updated to ${nextStatus}.`);
      loadData();
    } catch (err: any) {
      setNotification(`Error: ${err.message}`);
    }
  };

  const handleToggleUserRole = async (user: AuthUser) => {
    const nextRole: PlatformRole = user.platform_role === 'SUPER_ADMIN' ? 'USER' : 'SUPER_ADMIN';
    try {
      await api.setAdminUserPlatformRole(user.id, nextRole);
      setNotification(`User "${user.name}" platform role updated to ${nextRole}.`);
      loadData();
    } catch (err: any) {
      setNotification(`Error: ${err.message}`);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail || !newUserPass) return;
    try {
      await api.createAdminUser({
        name: newUserName,
        email: newUserEmail,
        password: newUserPass,
        platform_role: newUserRole
      });
      setShowUserModal(false);
      setNewUserName('');
      setNewUserEmail('');
      setNewUserPass('');
      setNotification(`User "${newUserName}" created.`);
      loadData();
    } catch (err: any) {
      setNotification(`Error: ${err.message}`);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner / Heading */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#E5E5E1]">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-red-100 text-red-800 border border-red-200">
              <ShieldAlert className="w-3 h-3" />
              RESTRICTED AREA &middot; PLATFORM SUPER ADMIN
            </span>
          </div>
          <h1 className="text-3xl font-medium tracking-tight text-[#111111]">
            Platform Governance
          </h1>
          <p className="text-sm text-[#6F6F6B] mt-1">
            Multi-tenant control plane, organization partitions, global security, and SaaS infrastructure.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium border border-[#E5E5E1] bg-white hover:bg-[#F5F5F3] text-[#111111] transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh State
        </button>
      </div>

      {notification && (
        <div className="p-3.5 bg-neutral-900 text-white text-xs rounded-xl flex items-center justify-between shadow-sm">
          <span>{notification}</span>
          <button onClick={() => setNotification(null)} className="text-neutral-400 hover:text-white ml-4">
            &times;
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#E5E5E1]">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'organizations', label: 'Organizations', icon: Building2 },
          { id: 'users', label: 'Users', icon: Users },
          { id: 'plans', label: 'Plans & Tiers', icon: Layers },
          { id: 'usage', label: 'Usage & Quotas', icon: Activity },
          { id: 'activities', label: 'Audit Log', icon: Activity },
          { id: 'flags', label: 'Feature Flags', icon: Flag },
          { id: 'settings', label: 'System Settings', icon: Sliders },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AdminTab)}
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

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-[#E5E5E1] rounded-[24px] p-6 shadow-sm">
              <span className="text-xs font-mono uppercase tracking-wider text-[#6F6F6B]">Total Organizations</span>
              <div className="text-3xl font-medium text-[#111111] mt-2">
                {overview?.total_organizations ?? 0}
              </div>
              <div className="text-xs text-emerald-600 mt-2 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                {overview?.active_organizations ?? 0} active &middot; {overview?.suspended_organizations ?? 0} suspended
              </div>
            </div>

            <div className="bg-white border border-[#E5E5E1] rounded-[24px] p-6 shadow-sm">
              <span className="text-xs font-mono uppercase tracking-wider text-[#6F6F6B]">Registered Users</span>
              <div className="text-3xl font-medium text-[#111111] mt-2">
                {overview?.total_users ?? 0}
              </div>
              <div className="text-xs text-[#6F6F6B] mt-2 font-medium">
                {overview?.active_users ?? 0} active accounts
              </div>
            </div>

            <div className="bg-white border border-[#E5E5E1] rounded-[24px] p-6 shadow-sm">
              <span className="text-xs font-mono uppercase tracking-wider text-[#6F6F6B]">Database Isolation</span>
              <div className="text-xl font-medium text-[#111111] mt-2 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                Strict Tenant Scope
              </div>
              <div className="text-xs text-[#6F6F6B] mt-2">
                All records partitioned by organization_id
              </div>
            </div>

            <div className="bg-white border border-[#E5E5E1] rounded-[24px] p-6 shadow-sm">
              <span className="text-xs font-mono uppercase tracking-wider text-[#6F6F6B]">Security Engine</span>
              <div className="text-xl font-medium text-[#111111] mt-2">
                Scrypt + Timed Token
              </div>
              <div className="text-xs text-[#6F6F6B] mt-2">
                7-day sliding session invalidation
              </div>
            </div>
          </div>

          {/* Quick lists */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-[#E5E5E1] rounded-[24px] p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-sm text-[#111111]">Organizations</h3>
                <button
                  onClick={() => setActiveTab('organizations')}
                  className="text-xs text-[#6F6F6B] hover:text-[#111111] flex items-center gap-1"
                >
                  View all <ExternalLink className="w-3 h-3" />
                </button>
              </div>
              <div className="divide-y divide-[#E5E5E1]/60">
                {organizations.slice(0, 5).map(org => (
                  <div key={org.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-medium text-[#111111]">{org.name}</div>
                      <div className="text-[#6F6F6B] font-mono text-[10px]">{org.id} &middot; Plan: {org.plan}</div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      org.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      {org.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-[#E5E5E1] rounded-[24px] p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-sm text-[#111111]">System Activity Feed</h3>
                <button
                  onClick={() => setActiveTab('activities')}
                  className="text-xs text-[#6F6F6B] hover:text-[#111111] flex items-center gap-1"
                >
                  Full audit log <ExternalLink className="w-3 h-3" />
                </button>
              </div>
              <div className="divide-y divide-[#E5E5E1]/60">
                {activities.slice(0, 5).map(act => (
                  <div key={act.id} className="py-3 text-xs">
                    <div className="flex items-center justify-between text-[#6F6F6B] text-[10px] mb-1">
                      <span className="font-medium text-[#111111]">{act.actor_id}</span>
                      <span>{new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="text-[#111111]">{act.result || act.action}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Organizations */}
      {activeTab === 'organizations' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-[#111111]">Tenant Organizations</h2>
            <button
              onClick={() => setShowOrgModal(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium bg-[#111111] hover:bg-neutral-800 text-white transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Provision Organization
            </button>
          </div>

          <div className="bg-white border border-[#E5E5E1] rounded-[24px] overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F5F5F3]/60 border-b border-[#E5E5E1] text-[#6F6F6B] font-mono">
                  <th className="py-3 px-4 font-medium uppercase tracking-wider">Name / ID</th>
                  <th className="py-3 px-4 font-medium uppercase tracking-wider">Slug</th>
                  <th className="py-3 px-4 font-medium uppercase tracking-wider">Plan</th>
                  <th className="py-3 px-4 font-medium uppercase tracking-wider">Status</th>
                  <th className="py-3 px-4 font-medium uppercase tracking-wider">Created</th>
                  <th className="py-3 px-4 font-medium uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E1]/60">
                {organizations.map((org) => (
                  <tr key={org.id} className="hover:bg-[#F5F5F3]/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-[#111111]">{org.name}</div>
                      <div className="font-mono text-[10px] text-[#6F6F6B]">{org.id}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[#6F6F6B]">
                      {org.slug}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-neutral-100 text-neutral-800 border border-neutral-200">
                        {org.plan}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        org.status === 'active' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        {org.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[#6F6F6B]">
                      {new Date(org.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleToggleOrgStatus(org)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
                          org.status === 'active'
                            ? 'border-red-200 text-red-600 hover:bg-red-50'
                            : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                        }`}
                      >
                        {org.status === 'active' ? 'Suspend Org' : 'Activate Org'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Users */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-[#111111]">Platform Users</h2>
            <button
              onClick={() => setShowUserModal(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium bg-[#111111] hover:bg-neutral-800 text-white transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Create Platform User
            </button>
          </div>

          <div className="bg-white border border-[#E5E5E1] rounded-[24px] overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F5F5F3]/60 border-b border-[#E5E5E1] text-[#6F6F6B] font-mono">
                  <th className="py-3 px-4 font-medium uppercase tracking-wider">User</th>
                  <th className="py-3 px-4 font-medium uppercase tracking-wider">Email</th>
                  <th className="py-3 px-4 font-medium uppercase tracking-wider">Platform Role</th>
                  <th className="py-3 px-4 font-medium uppercase tracking-wider">Status</th>
                  <th className="py-3 px-4 font-medium uppercase tracking-wider">Last Active</th>
                  <th className="py-3 px-4 font-medium uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E1]/60">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-[#F5F5F3]/30 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-[#111111]">
                      {u.name}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[#6F6F6B]">
                      {u.email}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        u.platform_role === 'SUPER_ADMIN'
                          ? 'bg-purple-100 text-purple-800 border border-purple-200'
                          : 'bg-neutral-100 text-neutral-800 border border-neutral-200'
                      }`}>
                        {u.platform_role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        u.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[#6F6F6B]">
                      {new Date(u.last_active_at).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleToggleUserRole(u)}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium border border-[#E5E5E1] hover:bg-[#F5F5F3] text-[#111111]"
                      >
                        {u.platform_role === 'SUPER_ADMIN' ? 'Demote to User' : 'Make Super Admin'}
                      </button>
                      <button
                        onClick={() => handleToggleUserStatus(u)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                          u.status === 'active'
                            ? 'border-red-200 text-red-600 hover:bg-red-50'
                            : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                        }`}
                      >
                        {u.status === 'active' ? 'Suspend' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Plans */}
      {activeTab === 'plans' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-medium text-[#111111]">Commercial Plans &amp; SaaS Tiers</h2>
            <p className="text-xs text-[#6F6F6B] mt-1">
              Resource envelopes, AI token allotments, and tenant feature capabilities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                name: 'Free',
                price: '$0',
                cadence: 'Forever',
                description: 'Evaluation tier for single creators and design experimentation.',
                limits: ['1 Active Project', '10 Client Memories', '1 Agent Worker', 'Community Support'],
                active: organizations.filter(o => o.plan === 'Free').length
              },
              {
                name: 'Pro',
                price: '$99',
                cadence: 'per month',
                description: 'Boutique design studios managing recurring client engagements.',
                limits: ['5 Active Projects', '100 Client Memories', '3 Autonomous Agents', 'Context Synthesis Engine'],
                active: organizations.filter(o => o.plan === 'Pro').length
              },
              {
                name: 'Studio',
                price: '$299',
                cadence: 'per month',
                description: 'Full creative agencies requiring multi-agent execution & approvals.',
                limits: ['Unlimited Projects', 'Official Truth Memory Guard', 'Full Multi-Tenant Roles', 'Audit Logging & APIs'],
                active: organizations.filter(o => o.plan === 'Studio').length
              },
              {
                name: 'Enterprise',
                price: 'Custom',
                cadence: 'annual agreement',
                description: 'Global design systems, dedicated cloud partitions & SLA.',
                limits: ['Custom LLM fine-tuning', 'Dedicated tenant clusters', 'Single Sign-On (SAML/Okta)', '24/7 Dedicated Support'],
                active: organizations.filter(o => o.plan === 'Enterprise').length
              }
            ].map(plan => (
              <div key={plan.name} className="bg-white border border-[#E5E5E1] rounded-[24px] p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono uppercase tracking-wider text-[#6F6F6B]">{plan.name} Tier</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-neutral-100 text-neutral-700">
                      {plan.active} orgs
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-3xl font-medium text-[#111111]">{plan.price}</span>
                    <span className="text-xs text-[#6F6F6B]">/{plan.cadence}</span>
                  </div>
                  <p className="text-xs text-[#6F6F6B] mt-3 leading-relaxed">
                    {plan.description}
                  </p>
                  <div className="mt-6 pt-4 border-t border-[#E5E5E1] space-y-2">
                    {plan.limits.map((lim, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-[#111111]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        <span>{lim}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-[#E5E5E1]/60">
                  <span className="text-[11px] font-mono text-[#6F6F6B]">Payment integration: Stripe Connect (Ready)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Usage */}
      {activeTab === 'usage' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-medium text-[#111111]">SaaS Tenant Usage &amp; Quotas</h2>
            <p className="text-xs text-[#6F6F6B] mt-1">Real-time metrics computed directly from active tenant records.</p>
          </div>

          <div className="bg-white border border-[#E5E5E1] rounded-[24px] p-6 shadow-sm">
            <h3 className="text-sm font-medium text-[#111111] mb-4">Partition Status Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 rounded-xl bg-[#F5F5F3] border border-[#E5E5E1]">
                <div className="text-xs text-[#6F6F6B]">Tenant Record Segregation</div>
                <div className="text-lg font-medium text-[#111111] mt-1">100% Enforced</div>
                <div className="text-[11px] text-[#6F6F6B] mt-1">Every table query requires organization_id verification</div>
              </div>
              <div className="p-4 rounded-xl bg-[#F5F5F3] border border-[#E5E5E1]">
                <div className="text-xs text-[#6F6F6B]">Storage Engine</div>
                <div className="text-lg font-medium text-[#111111] mt-1">JSON Atomic File Engine</div>
                <div className="text-[11px] text-[#6F6F6B] mt-1">data/db.json with automatic memory commit</div>
              </div>
              <div className="p-4 rounded-xl bg-[#F5F5F3] border border-[#E5E5E1]">
                <div className="text-xs text-[#6F6F6B]">Active Super Admin Sessions</div>
                <div className="text-lg font-medium text-[#111111] mt-1">Active</div>
                <div className="text-[11px] text-[#6F6F6B] mt-1">HttpOnly session cookie + Authorization token</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Activities */}
      {activeTab === 'activities' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium text-[#111111]">Platform Audit Log</h2>
              <p className="text-xs text-[#6F6F6B] mt-1">System-wide operational history across organizations.</p>
            </div>
            <span className="font-mono text-xs text-[#6F6F6B]">{activities.length} entries</span>
          </div>

          <div className="bg-white border border-[#E5E5E1] rounded-[24px] overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F5F5F3]/60 border-b border-[#E5E5E1] text-[#6F6F6B] font-mono">
                  <th className="py-3 px-4 font-medium uppercase tracking-wider">Timestamp</th>
                  <th className="py-3 px-4 font-medium uppercase tracking-wider">Actor</th>
                  <th className="py-3 px-4 font-medium uppercase tracking-wider">Action</th>
                  <th className="py-3 px-4 font-medium uppercase tracking-wider">Summary</th>
                  <th className="py-3 px-4 font-medium uppercase tracking-wider">Target</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E1]/60">
                {activities.map((act) => (
                  <tr key={act.id} className="hover:bg-[#F5F5F3]/30 transition-colors">
                    <td className="py-3 px-4 font-mono text-[#6F6F6B]">
                      {new Date(act.created_at).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-medium text-[#111111]">
                      {act.actor_id}
                    </td>
                    <td className="py-3 px-4 font-mono">
                      <span className="px-2 py-0.5 rounded bg-neutral-100 text-neutral-700">
                        {act.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#111111]">
                      {act.result || act.action}
                    </td>
                    <td className="py-3 px-4 font-mono text-[10px] text-[#6F6F6B]">
                      {act.entity_type} ({act.entity_id || '-'})
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 7: Feature Flags */}
      {activeTab === 'flags' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-medium text-[#111111]">Global &amp; Tenant Feature Flags</h2>
            <p className="text-xs text-[#6F6F6B] mt-1">Control progressive rollout of experimental agent modules.</p>
          </div>

          <div className="bg-white border border-[#E5E5E1] rounded-[24px] overflow-hidden shadow-sm">
            <div className="divide-y divide-[#E5E5E1]/60">
              {flags.map((flag) => (
                <div key={flag.id} className="p-4 flex items-center justify-between text-xs hover:bg-[#F5F5F3]/30 transition-colors">
                  <div>
                    <div className="font-mono font-medium text-[#111111]">{flag.key}</div>
                    <div className="text-[#6F6F6B] mt-0.5">{flag.description}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium ${
                      flag.enabled ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-neutral-100 text-neutral-600 border border-neutral-200'
                    }`}>
                      {flag.enabled ? 'Active / Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 8: System Settings */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-medium text-[#111111]">System Architecture &amp; Settings</h2>
            <p className="text-xs text-[#6F6F6B] mt-1">Platform-level environmental variables and security parameters.</p>
          </div>

          <div className="bg-white border border-[#E5E5E1] rounded-[24px] p-6 shadow-sm space-y-4 text-xs">
            <div className="flex items-center justify-between py-2 border-b border-[#E5E5E1]/60">
              <span className="text-[#6F6F6B]">Authentication Algorithm</span>
              <span className="font-mono text-[#111111]">Node.js crypto.scrypt (N=16384, r=8, p=1)</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-[#E5E5E1]/60">
              <span className="text-[#6F6F6B]">Session Security</span>
              <span className="font-mono text-[#111111]">Cryptographic 32-byte hex token, HttpOnly + Bearer</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-[#E5E5E1]/60">
              <span className="text-[#6F6F6B]">Session Lifetime</span>
              <span className="font-mono text-[#111111]">7 Days with active extension</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-[#E5E5E1]/60">
              <span className="text-[#6F6F6B]">Default Tenant Workspace</span>
              <span className="font-mono text-[#111111]">org_matias_studio (Matias Studio)</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-[#6F6F6B]">Isolation Enforcement Layer</span>
              <span className="font-mono text-emerald-600 font-medium">Active (requireOrganization middleware)</span>
            </div>
          </div>
        </div>
      )}

      {/* Provision Org Modal */}
      {showOrgModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#E5E5E1] rounded-[24px] p-6 max-w-md w-full shadow-lg">
            <h3 className="text-lg font-medium text-[#111111]">Provision New Organization</h3>
            <p className="text-xs text-[#6F6F6B] mt-1 mb-4">Create an isolated SaaS tenant partition.</p>

            <form onSubmit={handleCreateOrg} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#6F6F6B] uppercase mb-1">Organization Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Creative Agency"
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  className="w-full bg-[#F5F5F3] border border-[#E5E5E1] rounded-xl px-3.5 py-2.5 text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#6F6F6B] uppercase mb-1">Subdomain Slug (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. acme-creative"
                  value={newOrgSlug}
                  onChange={(e) => setNewOrgSlug(e.target.value)}
                  className="w-full bg-[#F5F5F3] border border-[#E5E5E1] rounded-xl px-3.5 py-2.5 text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#6F6F6B] uppercase mb-1">Plan</label>
                <select
                  value={newOrgPlan}
                  onChange={(e) => setNewOrgPlan(e.target.value as OrganizationPlan)}
                  className="w-full bg-[#F5F5F3] border border-[#E5E5E1] rounded-xl px-3.5 py-2.5 text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
                >
                  <option value="Free">Free</option>
                  <option value="Pro">Pro</option>
                  <option value="Studio">Studio</option>
                  <option value="Enterprise">Enterprise</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowOrgModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium border border-[#E5E5E1] text-[#6F6F6B] hover:text-[#111111]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-medium bg-[#111111] text-white hover:bg-neutral-800"
                >
                  Create Organization
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Provision User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#E5E5E1] rounded-[24px] p-6 max-w-md w-full shadow-lg">
            <h3 className="text-lg font-medium text-[#111111]">Create Platform User</h3>
            <p className="text-xs text-[#6F6F6B] mt-1 mb-4">Provision a new global account.</p>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#6F6F6B] uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Connor"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full bg-[#F5F5F3] border border-[#E5E5E1] rounded-xl px-3.5 py-2.5 text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#6F6F6B] uppercase mb-1">Email</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. sarah@domain.com"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full bg-[#F5F5F3] border border-[#E5E5E1] rounded-xl px-3.5 py-2.5 text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#6F6F6B] uppercase mb-1">Initial Password</label>
                <input
                  type="password"
                  required
                  placeholder="Minimum 6 characters"
                  value={newUserPass}
                  onChange={(e) => setNewUserPass(e.target.value)}
                  className="w-full bg-[#F5F5F3] border border-[#E5E5E1] rounded-xl px-3.5 py-2.5 text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#6F6F6B] uppercase mb-1">Platform Role</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as PlatformRole)}
                  className="w-full bg-[#F5F5F3] border border-[#E5E5E1] rounded-xl px-3.5 py-2.5 text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
                >
                  <option value="USER">USER (Standard Member)</option>
                  <option value="SUPER_ADMIN">SUPER_ADMIN (Platform Administrator)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium border border-[#E5E5E1] text-[#6F6F6B] hover:text-[#111111]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-medium bg-[#111111] text-white hover:bg-neutral-800"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
