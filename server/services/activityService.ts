import { db } from '../db/database';
import { ActivityRecord } from '../db/types';

export class ActivityService {
  public static logActivity(params: {
    organization_id?: string;
    client_id?: string;
    project_id?: string;
    actor_type?: 'user' | 'agent' | 'system';
    actor_id?: string;
    action: string;
    entity_type: string;
    entity_id: string;
    result?: string;
    metadata?: Record<string, any>;
  }): ActivityRecord {
    const record: ActivityRecord = {
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      organization_id: params.organization_id,
      client_id: params.client_id,
      project_id: params.project_id,
      actor_type: params.actor_type || 'user',
      actor_id: params.actor_id || 'System',
      action: params.action,
      entity_type: params.entity_type,
      entity_id: params.entity_id,
      result: params.result,
      metadata: params.metadata,
      created_at: new Date().toISOString()
    };

    db.update('activities', (list) => [record, ...list]);
    return record;
  }

  public static getActivities(
    organizationId?: string, 
    clientId?: string, 
    limit: number = 50
  ): ActivityRecord[] {
    const all = db.get('activities');
    return all.filter(a => {
      const matchOrg = organizationId ? a.organization_id === organizationId : true;
      const matchClient = clientId ? a.client_id === clientId : true;
      return matchOrg && matchClient;
    }).slice(0, limit);
  }
}
