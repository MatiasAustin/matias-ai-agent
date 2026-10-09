import { db } from '../db/database';
import { 
  OrganizationRecord, 
  OrganizationMemberRecord, 
  InvitationRecord, 
  OrganizationRole, 
  OrganizationStatus, 
  OrganizationPlan 
} from '../db/types';
import { ActivityService } from './activityService';

export class OrganizationService {
  public static getAllOrganizations(): OrganizationRecord[] {
    return db.get('organizations');
  }

  public static getOrganization(orgId: string): OrganizationRecord | null {
    const orgs = db.get('organizations');
    return orgs.find(o => o.id === orgId) || null;
  }

  public static createOrganization(params: {
    name: string;
    slug: string;
    plan?: OrganizationPlan;
    creator_user_id: string;
    actor_name?: string;
  }): OrganizationRecord {
    const trimmedName = params.name.trim();
    const cleanSlug = params.slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-');

    if (!trimmedName) throw new Error('Organization name is required');
    if (!cleanSlug) throw new Error('Organization slug is required');

    const orgs = db.get('organizations');
    if (orgs.some(o => o.slug === cleanSlug)) {
      throw new Error(`Organization slug "${cleanSlug}" is already taken. Please choose another.`);
    }

    const orgId = `org_${cleanSlug}_${Math.random().toString(36).substring(2, 6)}`;
    const newOrg: OrganizationRecord = {
      id: orgId,
      name: trimmedName,
      slug: cleanSlug,
      status: 'active',
      plan: params.plan || 'Studio',
      subscription_status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    db.update('organizations', list => [...list, newOrg]);

    // Assign creator as OWNER
    const membership: OrganizationMemberRecord = {
      id: `member_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      organization_id: orgId,
      user_id: params.creator_user_id,
      role: 'OWNER',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    db.update('organization_members', list => [...list, membership]);

    ActivityService.logActivity({
      organization_id: orgId,
      actor_id: params.actor_name || params.creator_user_id,
      action: `Organization created: ${newOrg.name}`,
      entity_type: 'organization',
      entity_id: orgId,
      result: `Plan: ${newOrg.plan}`
    });

    return newOrg;
  }

  public static updateOrganization(
    orgId: string, 
    updates: Partial<Pick<OrganizationRecord, 'name' | 'logo' | 'plan'>>,
    actor_name: string = 'Admin'
  ): OrganizationRecord {
    let updated: OrganizationRecord | null = null;

    db.update('organizations', list => {
      const idx = list.findIndex(o => o.id === orgId);
      if (idx === -1) throw new Error('Organization not found');

      updated = {
        ...list[idx],
        ...updates,
        updated_at: new Date().toISOString()
      };
      list[idx] = updated;
      return [...list];
    });

    ActivityService.logActivity({
      organization_id: orgId,
      actor_id: actor_name,
      action: `ORGANIZATION_UPDATED: ${updated!.name}`,
      entity_type: 'organization',
      entity_id: orgId
    });

    return updated!;
  }

  public static setOrganizationStatus(
    orgId: string, 
    status: OrganizationStatus,
    actor_name: string = 'Super Admin'
  ): OrganizationRecord {
    let updated: OrganizationRecord | null = null;

    db.update('organizations', list => {
      const idx = list.findIndex(o => o.id === orgId);
      if (idx === -1) throw new Error('Organization not found');

      updated = {
        ...list[idx],
        status,
        updated_at: new Date().toISOString()
      };
      list[idx] = updated;
      return [...list];
    });

    ActivityService.logActivity({
      organization_id: orgId,
      actor_id: actor_name,
      action: status === 'suspended' ? 'ORGANIZATION_SUSPENDED' : 'ORGANIZATION_REACTIVATED',
      entity_type: 'organization',
      entity_id: orgId,
      result: `Status set to ${status}`
    });

    return updated!;
  }

  public static getOrganizationMembers(orgId: string) {
    const members = db.get('organization_members').filter(m => m.organization_id === orgId);
    const users = db.get('users');

    return members.map(m => {
      const u = users.find(user => user.id === m.user_id);
      return {
        id: m.id,
        user_id: m.user_id,
        name: u?.name || 'Unknown',
        email: u?.email || 'Unknown',
        role: m.role,
        status: u?.status || 'active',
        created_at: m.created_at,
        last_active_at: u?.last_active_at || m.created_at
      };
    });
  }

  public static inviteMember(params: {
    organization_id: string;
    email: string;
    role: OrganizationRole;
    invited_by_user_id: string;
    actor_name?: string;
  }): InvitationRecord {
    const normalizedEmail = params.email.toLowerCase().trim();
    if (!normalizedEmail) throw new Error('Email is required');

    // Check if user is already a member
    const users = db.get('users');
    const existingUser = users.find(u => u.email === normalizedEmail);
    if (existingUser) {
      const members = db.get('organization_members');
      if (members.some(m => m.organization_id === params.organization_id && m.user_id === existingUser.id)) {
        throw new Error('User is already a member of this organization');
      }
    }

    const invitation: InvitationRecord = {
      id: `inv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      organization_id: params.organization_id,
      email: normalizedEmail,
      role: params.role || 'MEMBER',
      invited_by_user_id: params.invited_by_user_id,
      status: 'pending',
      created_at: new Date().toISOString()
    };

    db.update('invitations', list => [...list, invitation]);

    ActivityService.logActivity({
      organization_id: params.organization_id,
      actor_id: params.actor_name || params.invited_by_user_id,
      action: `MEMBER_INVITED: ${invitation.email}`,
      entity_type: 'invitation',
      entity_id: invitation.id,
      result: `Role: ${invitation.role}. Invitation created.`
    });

    return invitation;
  }

  public static getInvitations(orgId: string): InvitationRecord[] {
    return db.get('invitations').filter(i => i.organization_id === orgId && i.status === 'pending');
  }

  public static updateMemberRole(
    orgId: string, 
    membershipId: string, 
    newRole: OrganizationRole,
    actor_name: string = 'Owner'
  ): OrganizationMemberRecord {
    let updated: OrganizationMemberRecord | null = null;

    db.update('organization_members', list => {
      const idx = list.findIndex(m => m.id === membershipId && m.organization_id === orgId);
      if (idx === -1) throw new Error('Membership not found');

      updated = {
        ...list[idx],
        role: newRole,
        updated_at: new Date().toISOString()
      };
      list[idx] = updated;
      return [...list];
    });

    ActivityService.logActivity({
      organization_id: orgId,
      actor_id: actor_name,
      action: `ROLE_CHANGED`,
      entity_type: 'organization_member',
      entity_id: membershipId,
      result: `New role: ${newRole}`
    });

    return updated!;
  }

  public static removeMember(
    orgId: string, 
    membershipId: string, 
    actor_name: string = 'Owner'
  ): boolean {
    let removedUserId = '';

    db.update('organization_members', list => {
      const target = list.find(m => m.id === membershipId && m.organization_id === orgId);
      if (!target) return list;
      removedUserId = target.user_id;
      return list.filter(m => m.id !== membershipId);
    });

    if (removedUserId) {
      ActivityService.logActivity({
        organization_id: orgId,
        actor_id: actor_name,
        action: `MEMBER_REMOVED`,
        entity_type: 'organization_member',
        entity_id: membershipId,
        result: `User ${removedUserId} removed from organization`
      });
      return true;
    }
    return false;
  }

  public static getUserOrganizations(userId: string) {
    const members = db.get('organization_members').filter(m => m.user_id === userId);
    const orgs = db.get('organizations');

    return members.map(m => {
      const org = orgs.find(o => o.id === m.organization_id);
      return {
        organization: org,
        role: m.role
      };
    }).filter(item => item.organization !== undefined);
  }
}
