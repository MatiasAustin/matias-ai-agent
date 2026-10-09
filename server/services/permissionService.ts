import { db } from '../db/database';
import { 
  ClientPermissions, 
  ClientPermissionsRecord, 
  PlatformRole, 
  OrganizationRole 
} from '../db/types';
import { ActivityService } from './activityService';

export const defaultPermissions: ClientPermissions = {
  read_client_messages: 'allowed',
  read_project_files: 'allowed',
  read_brand_guidelines: 'allowed',
  create_tasks: 'allowed',
  update_tasks: 'allowed',
  create_documents: 'allowed',
  draft_client_messages: 'allowed',
  send_client_messages: 'approval_required',
  modify_client_memory: 'approval_required',
  publish_design: 'approval_required',
  send_invoice: 'approval_required',
  send_quotation: 'approval_required'
};

/**
 * Role Permission Mapping as specified in the Architecture
 */
const ROLE_PERMISSIONS: Record<OrganizationRole, string[]> = {
  OWNER: [
    '*', // Full access
    'clients.read', 'clients.create', 'clients.update', 'clients.delete',
    'projects.read', 'projects.create', 'projects.update', 'projects.delete',
    'tasks.read', 'tasks.create', 'tasks.update', 'tasks.delete',
    'memory.read', 'memory.create', 'memory.update', 'memory.approve', 'memory.archive',
    'documents.read', 'documents.create', 'documents.update', 'documents.delete', 'documents.publish',
    'communication.read', 'communication.draft', 'communication.send',
    'integrations.read', 'integrations.manage',
    'agents.read', 'agents.execute', 'agents.configure',
    'approvals.read', 'approvals.create', 'approvals.resolve',
    'organization.manage', 'members.manage', 'billing.manage',
    'system:read', 'design.publish', 'credential_access'
  ],
  ADMIN: [
    'clients.read', 'clients.create', 'clients.update',
    'projects.read', 'projects.create', 'projects.update', 'projects.delete',
    'tasks.read', 'tasks.create', 'tasks.update', 'tasks.delete',
    'memory.read', 'memory.create', 'memory.update', 'memory.approve', 'memory.archive',
    'documents.read', 'documents.create', 'documents.update', 'documents.delete', 'documents.publish',
    'communication.read', 'communication.draft', 'communication.send',
    'integrations.read',
    'agents.read', 'agents.execute', 'agents.configure',
    'approvals.read', 'approvals.create', 'approvals.resolve',
    'members.manage',
    'system:read', 'design.publish'
  ],
  MEMBER: [
    'clients.read', 'clients.create',
    'projects.read', 'projects.create',
    'tasks.read', 'tasks.create', 'tasks.update',
    'memory.read', 'memory.create', 'memory.update',
    'documents.read', 'documents.create',
    'communication.read', 'communication.draft', 'communication.send',
    'integrations.read',
    'agents.read', 'agents.execute',
    'approvals.read',
    'system:read'
  ],
  VIEWER: [
    'clients.read',
    'projects.read',
    'tasks.read',
    'memory.read',
    'documents.read',
    'communication.read',
    'integrations.read',
    'agents.read',
    'approvals.read',
    'system:read'
  ]
};

export class PermissionService {
  /**
   * Evaluates if a given role possesses a requested permission
   */
  public static hasPermission(
    role: PlatformRole | OrganizationRole, 
    permission: string
  ): boolean {
    if (role === 'SUPER_ADMIN') {
      return true;
    }

    const orgRole = role as OrganizationRole;
    const permissions = ROLE_PERMISSIONS[orgRole] || [];

    if (permissions.includes('*')) {
      return true;
    }

    return permissions.includes(permission);
  }

  /**
   * Throws an error if the role lacks the required permission
   */
  public static requirePermission(
    role: PlatformRole | OrganizationRole, 
    permission: string
  ): void {
    if (!this.hasPermission(role, permission)) {
      throw new Error(`PERMISSION_DENIED: Role "${role}" lacks required permission "${permission}".`);
    }
  }

  /**
   * Returns list of permissions granted to an organization role
   */
  public static getRolePermissions(role: OrganizationRole): string[] {
    return ROLE_PERMISSIONS[role] || [];
  }

  /**
   * Checks if a user role can execute a tool based on required permissions
   */
  public static canExecuteTool(
    role: PlatformRole | OrganizationRole,
    toolId: string,
    requiredPermissions: string[]
  ): boolean {
    if (role === 'SUPER_ADMIN') return true;

    // Must satisfy all required permissions for the tool
    for (const perm of requiredPermissions) {
      if (!this.hasPermission(role, perm)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Evaluates agent tool boundary and permissions
   */
  public static canAgentExecuteTool(
    organizationId: string,
    agentId: string,
    toolId: string,
    requiredPermissions: string[]
  ): { allowed: boolean; reason?: string } {
    // 1. Check if tool is assigned to the agent
    const agentTools = db.get('agent_tools') || [];
    const mapping = agentTools.find(
      at => at.organization_id === organizationId && at.agent_id === agentId && at.tool_id === toolId
    );

    if (!mapping || !mapping.enabled) {
      return {
        allowed: false,
        reason: `AGENT_NOT_ALLOWED: Agent "${agentId}" does not have tool "${toolId}" in its allowed tools catalog.`
      };
    }

    // 2. Check if agent has required permissions assigned
    const agentPerms = db.get('agent_permissions') || [];
    const activePerms = agentPerms
      .filter(ap => ap.organization_id === organizationId && ap.agent_id === agentId && ap.enabled)
      .map(ap => ap.permission);

    // If no specific agent_permissions records exist yet, the tool mapping itself grants tool execution rights
    // but if permissions are defined, verify they are satisfied
    if (activePerms.length > 0) {
      for (const reqPerm of requiredPermissions) {
        if (!activePerms.includes(reqPerm) && !activePerms.includes('*')) {
          return {
            allowed: false,
            reason: `PERMISSION_DENIED: Agent "${agentId}" lacks granular permission "${reqPerm}".`
          };
        }
      }
    }

    return { allowed: true };
  }

  // ==========================================
  // Client-Level Permission Overrides (Legacy & UI support)
  // ==========================================

  public static getPermissions(organizationId: string, clientId: string): ClientPermissions {
    const records = db.get('client_permissions');
    const existing = records.find(p => p.client_id === clientId && p.organization_id === organizationId);
    if (existing) {
      return existing.permissions;
    }
    const newRecord: ClientPermissionsRecord = {
      id: `perm_${Date.now()}`,
      organization_id: organizationId,
      client_id: clientId,
      permissions: { ...defaultPermissions },
      updated_at: new Date().toISOString()
    };
    db.update('client_permissions', list => [...list, newRecord]);
    return newRecord.permissions;
  }

  public static updatePermissions(
    organizationId: string,
    clientId: string, 
    newPermissions: Partial<ClientPermissions>,
    actorId: string = 'User'
  ): ClientPermissions {
    let result: ClientPermissions = { ...defaultPermissions };

    db.update('client_permissions', (list) => {
      const idx = list.findIndex(p => p.client_id === clientId && p.organization_id === organizationId);
      if (idx >= 0) {
        const merged = { ...list[idx].permissions, ...newPermissions };
        list[idx] = {
          ...list[idx],
          permissions: merged,
          updated_at: new Date().toISOString()
        };
        result = merged;
        return [...list];
      } else {
        const merged = { ...defaultPermissions, ...newPermissions };
        const record: ClientPermissionsRecord = {
          id: `perm_${Date.now()}`,
          organization_id: organizationId,
          client_id: clientId,
          permissions: merged,
          updated_at: new Date().toISOString()
        };
        result = merged;
        return [...list, record];
      }
    });

    ActivityService.logActivity({
      organization_id: organizationId,
      client_id: clientId,
      actor_id: actorId,
      action: 'AI permissions updated',
      entity_type: 'client_permissions',
      entity_id: clientId,
      result: 'Updated AI permissions boundary'
    });

    return result;
  }
}
