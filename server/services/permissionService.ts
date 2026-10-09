import { db } from '../db/database';
import { ClientPermissions, ClientPermissionsRecord } from '../db/types';
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

export class PermissionService {
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
