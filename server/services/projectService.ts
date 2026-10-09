import { db } from '../db/database';
import { ProjectRecord, ProjectStatus, TaskPriority } from '../db/types';
import { ActivityService } from './activityService';

export class ProjectService {
  public static getProjects(clientId?: string): ProjectRecord[] {
    const all = db.get('projects');
    if (clientId) {
      return all.filter(p => p.client_id === clientId);
    }
    return all;
  }

  public static getProjectById(projectId: string): ProjectRecord | null {
    const all = db.get('projects');
    return all.find(p => p.project_id === projectId) || null;
  }

  public static createProject(params: {
    client_id: string;
    project_name: string;
    project_type: string;
    description: string;
    status?: ProjectStatus;
    deadline: string;
    priority?: TaskPriority;
    estimated_budget?: string;
    project_notes?: string;
    assigned_agents?: string[];
    actor_id?: string;
  }): ProjectRecord {
    if (!params.client_id) {
      throw new Error('client_id is required');
    }
    if (!params.project_name || params.project_name.trim() === '') {
      throw new Error('project_name is required');
    }

    const record: ProjectRecord = {
      project_id: `proj_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      client_id: params.client_id,
      project_name: params.project_name.trim(),
      project_type: params.project_type || 'Brand System',
      description: params.description || '',
      status: params.status || 'planning',
      deadline: params.deadline || new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0],
      priority: params.priority || 'normal',
      estimated_budget: params.estimated_budget,
      project_notes: params.project_notes,
      progress: 0,
      assigned_agents: params.assigned_agents || ['Creative Director Agent'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    db.update('projects', list => [...list, record]);

    ActivityService.logActivity({
      client_id: params.client_id,
      project_id: record.project_id,
      actor_id: params.actor_id || 'Matias',
      action: `Project created: ${record.project_name}`,
      entity_type: 'project',
      entity_id: record.project_id,
      result: `Type: ${record.project_type}`
    });

    return record;
  }

  public static updateProject(
    projectId: string, 
    updates: Partial<Omit<ProjectRecord, 'project_id' | 'client_id' | 'created_at'>>,
    actor_id: string = 'Matias'
  ): ProjectRecord {
    let updated: ProjectRecord | null = null;

    db.update('projects', list => {
      const idx = list.findIndex(p => p.project_id === projectId);
      if (idx === -1) {
        throw new Error(`Project with ID ${projectId} not found`);
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
        client_id: (updated as ProjectRecord).client_id,
        project_id: projectId,
        actor_id,
        action: `Project updated: ${(updated as ProjectRecord).project_name}`,
        entity_type: 'project',
        entity_id: projectId
      });
    }

    return updated!;
  }
}
