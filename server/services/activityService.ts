import { db } from '../db/database';
import { ActivityRecord } from '../db/types';

export class ActivityService {
  public static logActivity(params: {
    client_id: string;
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
      client_id: params.client_id,
      project_id: params.project_id,
      actor_type: params.actor_type || 'user',
      actor_id: params.actor_id || 'Matias',
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

  public static getActivities(clientId?: string, limit: number = 50): ActivityRecord[] {
    const all = db.get('activities');
    if (clientId) {
      return all.filter(a => a.client_id === clientId).slice(0, limit);
    }
    return all.slice(0, limit);
  }
}
