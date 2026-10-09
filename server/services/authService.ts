import { db } from '../db/database';
import { UserRecord, SessionRecord, OrganizationMemberRecord, OrganizationRecord, PlatformRole, OrganizationRole } from '../db/types';
import { AuthSecurity } from './authSecurity';
import { ActivityService } from './activityService';

export interface AuthenticatedContext {
  user: {
    id: string;
    email: string;
    name: string;
    platform_role: PlatformRole;
    status: string;
  };
  organization: OrganizationRecord | null;
  membership: OrganizationMemberRecord | null;
  role: OrganizationRole | null;
}

export class AuthService {
  public static login(email: string, password: string): { token: string; user: any; organization: any; role: string | null } {
    const normalizedEmail = email.toLowerCase().trim();
    const users = db.get('users');
    const user = users.find(u => u.email === normalizedEmail);

    if (!user) {
      ActivityService.logActivity({
        actor_id: normalizedEmail,
        action: 'LOGIN_FAILED',
        entity_type: 'auth',
        entity_id: normalizedEmail,
        result: 'Invalid credentials - user not found'
      });
      throw new Error('Invalid email or password');
    }

    if (user.status === 'suspended') {
      ActivityService.logActivity({
        actor_id: user.id,
        action: 'LOGIN_FAILED',
        entity_type: 'auth',
        entity_id: user.id,
        result: 'Account suspended'
      });
      throw new Error('Account has been suspended. Please contact platform support.');
    }

    const isValid = AuthSecurity.verifyPassword(password, user.password_hash, user.password_salt);
    if (!isValid) {
      ActivityService.logActivity({
        actor_id: user.id,
        action: 'LOGIN_FAILED',
        entity_type: 'auth',
        entity_id: user.id,
        result: 'Invalid credentials - password mismatch'
      });
      throw new Error('Invalid email or password');
    }

    // Resolve organizations for user
    const members = db.get('organization_members');
    const userMemberships = members.filter(m => m.user_id === user.id);
    const orgs = db.get('organizations');

    // Default to first active org, or null if platform super admin with no orgs
    let activeOrgId = userMemberships[0]?.organization_id || orgs[0]?.id || '';
    const activeOrg = orgs.find(o => o.id === activeOrgId) || null;
    const activeMembership = userMemberships.find(m => m.organization_id === activeOrgId) || null;

    // Generate secure session token (expires in 7 days)
    const token = AuthSecurity.generateSessionToken();
    const expiresAt = new Date(Date.now() + 7 * 86400000).toISOString();

    const session: SessionRecord = {
      id: `sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      token,
      user_id: user.id,
      active_organization_id: activeOrgId,
      expires_at: expiresAt,
      created_at: new Date().toISOString()
    };

    db.update('sessions', list => [...list, session]);

    // Update user's last active timestamp
    db.update('users', list => {
      const idx = list.findIndex(u => u.id === user.id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], last_active_at: new Date().toISOString() };
      }
      return [...list];
    });

    ActivityService.logActivity({
      organization_id: activeOrgId || undefined,
      actor_id: user.name,
      action: 'LOGIN_SUCCESS',
      entity_type: 'auth',
      entity_id: user.id,
      result: `Authenticated as ${user.platform_role} (Org: ${activeOrg?.name || 'Platform'})`
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        platform_role: user.platform_role,
        status: user.status
      },
      organization: activeOrg,
      role: activeMembership?.role || (user.platform_role === 'SUPER_ADMIN' ? 'OWNER' : null)
    };
  }

  public static validateSession(token: string): AuthenticatedContext | null {
    if (!token) return null;

    const sessions = db.get('sessions');
    const session = sessions.find(s => s.token === token);
    if (!session) return null;

    // Check expiry
    if (new Date(session.expires_at).getTime() < Date.now()) {
      // Session expired, remove it
      db.update('sessions', list => list.filter(s => s.id !== session.id));
      return null;
    }

    const users = db.get('users');
    const user = users.find(u => u.id === session.user_id);
    if (!user || user.status === 'suspended') return null;

    const orgs = db.get('organizations');
    const members = db.get('organization_members');

    // Find active organization
    let organization = orgs.find(o => o.id === session.active_organization_id) || null;
    let membership = members.find(m => m.organization_id === session.active_organization_id && m.user_id === user.id) || null;

    // If user has no active organization membership in current session org, check if super admin or fallback
    if (!membership && user.platform_role !== 'SUPER_ADMIN') {
      const userMemberships = members.filter(m => m.user_id === user.id);
      if (userMemberships.length > 0) {
        membership = userMemberships[0];
        organization = orgs.find(o => o.id === membership!.organization_id) || null;
        // Update session
        session.active_organization_id = membership.organization_id;
        db.persist();
      }
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        platform_role: user.platform_role,
        status: user.status
      },
      organization,
      membership,
      role: membership?.role || (user.platform_role === 'SUPER_ADMIN' ? 'OWNER' : null)
    };
  }

  public static switchOrganization(token: string, newOrgId: string): AuthenticatedContext {
    const ctx = this.validateSession(token);
    if (!ctx) throw new Error('Unauthenticated session');

    // Verify user actually belongs to newOrgId (unless SUPER_ADMIN)
    const members = db.get('organization_members');
    const isMember = members.some(m => m.user_id === ctx.user.id && m.organization_id === newOrgId);

    if (!isMember && ctx.user.platform_role !== 'SUPER_ADMIN') {
      throw new Error('Access denied: You do not belong to this organization.');
    }

    const orgs = db.get('organizations');
    const targetOrg = orgs.find(o => o.id === newOrgId);
    if (!targetOrg) throw new Error('Organization not found');

    db.update('sessions', list => {
      const idx = list.findIndex(s => s.token === token);
      if (idx !== -1) {
        list[idx] = { ...list[idx], active_organization_id: newOrgId };
      }
      return [...list];
    });

    const updatedCtx = this.validateSession(token);
    if (!updatedCtx) throw new Error('Failed to resolve context after organization switch');
    return updatedCtx;
  }

  public static logout(token: string): void {
    const sessions = db.get('sessions');
    const session = sessions.find(s => s.token === token);
    if (session) {
      const users = db.get('users');
      const user = users.find(u => u.id === session.user_id);

      ActivityService.logActivity({
        organization_id: session.active_organization_id,
        actor_id: user?.name || session.user_id,
        action: 'LOGOUT',
        entity_type: 'auth',
        entity_id: session.user_id
      });

      db.update('sessions', list => list.filter(s => s.token !== token));
    }
  }
}
