import { db } from '../db/database';
import { TaskPriority, TaskRecord, TaskStatus } from '../db/types';
import { ActivityService } from './activityService';

export class TaskService {
  public static getTasks(clientId?: string, projectId?: string): TaskRecord[] {
    const all = db.get('tasks');
    return all.filter(t => {
      const matchClient = clientId ? t.client_id === clientId : true;
      const matchProj = projectId ? t.project_id === projectId : true;
      return matchClient && matchProj;
    });
  }

  public static createTask(params: {
    client_id: string;
    project_id?: string;
    title: string;
    description?: string;
    assigned_agent?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    deadline?: string;
    actor_id?: string;
  }): TaskRecord {
    if (!params.client_id) {
      throw new Error('client_id is required');
    }
    if (!params.title || params.title.trim() === '') {
      throw new Error('Task title is required');
    }

    const record: TaskRecord = {
      id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
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
      client_id: params.client_id,
      project_id: params.project_id,
      actor_id: params.actor_id || 'Matias',
      action: `Task created: ${record.title}`,
      entity_type: 'task',
      entity_id: record.id,
      result: `Status: ${record.status}`
    });

    return record;
  }

  public static updateTask(
    taskId: string,
    updates: Partial<Omit<TaskRecord, 'id' | 'client_id' | 'created_at'>>,
    actor_id: string = 'Matias'
  ): TaskRecord {
    let updated: TaskRecord | null = null;

    db.update('tasks', list => {
      const idx = list.findIndex(t => t.id === taskId);
      if (idx === -1) {
        throw new Error(`Task with ID ${taskId} not found`);
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
