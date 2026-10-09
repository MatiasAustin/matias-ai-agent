import { db } from '../db/database';
import { UserRecord, PlatformRole, UserStatus } from '../db/types';
import { AuthSecurity } from './authSecurity';
import { ActivityService } from './activityService';

export class UserService {
  public static getAllUsers() {
    const users = db.get('users');
    const members = db.get('organization_members');
    const orgs = db.get('organizations');

    return users.map(u => {
      const userMemberships = members.filter(m => m.user_id === u.id);
      const userOrgs = userMemberships.map(m => {
        const org = orgs.find(o => o.id === m.organization_id);
        return {
          organization_id: m.organization_id,
          organization_name: org?.name || 'Unknown',
          role: m.role
        };
      });

      return {
        id: u.id,
        email: u.email,
        name: u.name,
        platform_role: u.platform_role,
        status: u.status,
        last_active_at: u.last_active_at,
        created_at: u.created_at,
        organizations: userOrgs
      };
    });
  }

  public static createUser(params: {
    name: string;
    email: string;
    password: string;
    platform_role?: PlatformRole;
    actor_name?: string;
  }) {
    const normalizedEmail = params.email.toLowerCase().trim();
    if (!normalizedEmail) throw new Error('Email is required');
    if (!params.password || params.password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    const users = db.get('users');
    if (users.some(u => u.email === normalizedEmail)) {
      throw new Error(`User with email "${normalizedEmail}" already exists`);
    }

    const { hash, salt } = AuthSecurity.hashPassword(params.password);
    const newUser: UserRecord = {
      id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      email: normalizedEmail,
      password_hash: hash,
      password_salt: salt,
      name: params.name.trim() || 'New User',
      platform_role: params.platform_role || 'USER',
      status: 'active',
      last_active_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    db.update('users', list => [...list, newUser]);

    ActivityService.logActivity({
      actor_id: params.actor_name || 'Admin',
      action: `USER_CREATED: ${newUser.email}`,
      entity_type: 'user',
      entity_id: newUser.id,
      result: `Role: ${newUser.platform_role}`
    });

    return {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      platform_role: newUser.platform_role,
      status: newUser.status,
      created_at: newUser.created_at
    };
  }

  public static setUserStatus(userId: string, status: UserStatus, actor_name: string = 'Super Admin') {
    let updated: UserRecord | null = null;

    db.update('users', list => {
      const idx = list.findIndex(u => u.id === userId);
      if (idx === -1) throw new Error('User not found');

      updated = {
        ...list[idx],
        status,
        updated_at: new Date().toISOString()
      };
      list[idx] = updated;
      return [...list];
    });

    ActivityService.logActivity({
      actor_id: actor_name,
      action: status === 'suspended' ? 'USER_SUSPENDED' : 'USER_REACTIVATED',
      entity_type: 'user',
      entity_id: userId,
      result: `Status set to ${status}`
    });

    return {
      id: updated!.id,
      email: updated!.email,
      name: updated!.name,
      status: updated!.status
    };
  }

  public static setUserPlatformRole(userId: string, platformRole: PlatformRole, actor_name: string = 'Super Admin') {
    let updated: UserRecord | null = null;

    db.update('users', list => {
      const idx = list.findIndex(u => u.id === userId);
      if (idx === -1) throw new Error('User not found');

      updated = {
        ...list[idx],
        platform_role: platformRole,
        updated_at: new Date().toISOString()
      };
      list[idx] = updated;
      return [...list];
    });

    ActivityService.logActivity({
      actor_id: actor_name,
      action: 'PLATFORM_ROLE_CHANGED',
      entity_type: 'user',
      entity_id: userId,
      result: `New platform role: ${platformRole}`
    });

    return {
      id: updated!.id,
      email: updated!.email,
      name: updated!.name,
      platform_role: updated!.platform_role
    };
  }
}
