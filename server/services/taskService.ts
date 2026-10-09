import { db } from '../db/database';
import { TaskPriority, TaskRecord, TaskStatus } from '../db/types';
import { ActivityService } from './activityService';

export class TaskService {
  public static getTasks(organizationId: string, clientId?: string, projectId?: string): TaskRecord[] {
    const all = db.get('tasks');
    return all.filter(t => {
      const matchOrg = t.organization_id === organizationId;
      const matchClient = clientId ? t.client_id === clientId : true;
      const matchProj = projectId ? t.project_id === projectId : true;
      return matchOrg && matchClient && matchProj;
    });
  }

  public static createTask(
    organizationId: string,
    params: {
      client_id: string;
      project_id?: string;
      title: string;
      description?: string;
      assigned_agent?: string;
      status?: TaskStatus;
      priority?: TaskPriority;
      deadline?: string;
      actor_id?: string;
    }
  ): TaskRecord {
    if (!organizationId) throw new Error('organization_id is required');
    if (!params.client_id) throw new Error('client_id is required');
    if (!params.title || params.title.trim() === '') {
      throw new Error('Task title is required');
    }

    const clients = db.get('clients');
    const client = clients.find(c => c.id === params.client_id && c.organization_id === organizationId);
    if (!client) throw new Error('Client not found in this organization');

    const record: TaskRecord = {
      id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      organization_id: organizationId,
      client_id: params.client_id,
      project_id: params.project_id,
      title: params.title.trim(),
      description: params.description,
      assigned_agent: params.assigned_agent || 'Creative Director Agent',
      status: params.status || 'queued',
      priority: params.priority || 'normal',
      deadline: params.deadline,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    db.update('tasks', list => [record, ...list]);

    ActivityService.logActivity({
      organization_id: organizationId,
      client_id: params.client_id,
      project_id: params.project_id,
      actor_id: params.actor_id || 'User',
      action: `Task created: ${record.title}`,
      entity_type: 'task',
      entity_id: record.id,
      result: `Status: ${record.status}`
    });

    return record;
  }

  public static updateTask(
    organizationId: string,
    taskId: string,
    updates: Partial<Omit<TaskRecord, 'id' | 'organization_id' | 'client_id' | 'created_at'>>,
    actor_id: string = 'User'
  ): TaskRecord {
    let updated: TaskRecord | null = null;

    db.update('tasks', list => {
      const idx = list.findIndex(t => t.id === taskId && t.organization_id === organizationId);
      if (idx === -1) {
        throw new Error(`Task with ID ${taskId} not found in this organization`);
      }
      updated = {
        ...list[idx],
        ...updates,
        updated_at: new Date().toISOString()
      };
      list[idx] = updated;
      return [...list];
    });

    if (updated) {
      ActivityService.logActivity({
        organization_id: organizationId,
        client_id: (updated as TaskRecord).client_id,
        project_id: (updated as TaskRecord).project_id,
        actor_id,
        action: `Task updated: ${(updated as TaskRecord).title}`,
        entity_type: 'task',
        entity_id: taskId,
        result: `Status changed to ${(updated as TaskRecord).status}`
      });
    }

    return updated!;
  }
}
