import { db } from '../db/database';
import { ClientMemoryRecord, MemoryCategory, MemoryStatus } from '../db/types';
import { ActivityService } from './activityService';

export class MemoryService {
  public static createMemory(
    organizationId: string,
    params: {
      client_id: string;
      category: MemoryCategory;
      key: string;
      value: string;
      status: MemoryStatus;
      confidence?: 'High' | 'Medium' | 'Low';
      source_type: string;
      source_id: string;
      reason_context?: string;
      actor_id?: string;
    }
  ): ClientMemoryRecord {
    if (!organizationId) throw new Error('organization_id is required');
    if (!params.client_id) throw new Error('client_id is required');

    // Verify client belongs to organization
    const clients = db.get('clients');
    const client = clients.find(c => c.id === params.client_id && c.organization_id === organizationId);
    if (!client) throw new Error('Client not found in this organization');

    const record: ClientMemoryRecord = {
      id: `mem_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      organization_id: organizationId,
      client_id: params.client_id,
      category: params.category,
      key: params.key.trim(),
      value: params.value.trim(),
      status: params.status,
      confidence: params.confidence,
      source_type: params.source_type,
      source_id: params.source_id,
      reason_context: params.reason_context,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      archived: false
    };

    db.update('client_memory', (list) => [...list, record]);

    ActivityService.logActivity({
      organization_id: organizationId,
      client_id: params.client_id,
      actor_id: params.actor_id || 'User',
      action: `Memory added: ${record.key} (${record.status})`,
      entity_type: 'client_memory',
      entity_id: record.id,
      result: `Stored in category ${record.category}`
    });

    return record;
  }

  public static getMemory(organizationId: string, memoryId: string): ClientMemoryRecord | null {
    const list = db.get('client_memory');
    return list.find(m => m.id === memoryId && m.organization_id === organizationId && !m.archived) || null;
  }

  public static getClientMemory(
    organizationId: string, 
    clientId: string, 
    category?: MemoryCategory
  ): ClientMemoryRecord[] {
    const list = db.get('client_memory');
    return list.filter(m => {
      const matchesOrg = m.organization_id === organizationId;
      const matchesClient = m.client_id === clientId;
      const notArchived = !m.archived;
      const matchesCategory = category ? m.category === category : true;
      return matchesOrg && matchesClient && notArchived && matchesCategory;
    });
  }

  /**
   * Strictly scopes search to the given organizationId AND clientId.
   * Client A / Org A memories NEVER leak into Client B / Org B context.
   */
  public static searchMemory(
    organizationId: string,
    clientId: string, 
    query: string, 
    category?: MemoryCategory
  ): ClientMemoryRecord[] {
    if (!organizationId || !clientId) return [];
    const clientMemories = this.getClientMemory(organizationId, clientId, category);
    if (!query || query.trim() === '') return clientMemories;

    const q = query.toLowerCase().trim();
    return clientMemories.filter(m => 
      m.key.toLowerCase().includes(q) ||
      m.value.toLowerCase().includes(q) ||
      (m.reason_context && m.reason_context.toLowerCase().includes(q)) ||
      m.source_id.toLowerCase().includes(q)
    );
  }

  public static updateMemory(
    organizationId: string,
    memoryId: string, 
    updates: Partial<Pick<ClientMemoryRecord, 'key' | 'value' | 'category' | 'status' | 'reason_context' | 'confidence'>>,
    actorId: string = 'User',
    allowOfficialOverwrite: boolean = false
  ): ClientMemoryRecord {
    let updatedRecord: ClientMemoryRecord | null = null;

    db.update('client_memory', (list) => {
      const idx = list.findIndex(m => m.id === memoryId && m.organization_id === organizationId);
      if (idx === -1) {
        throw new Error(`Memory record with ID ${memoryId} not found in this organization`);
      }

      const existing = list[idx];

      if (existing.status === 'OFFICIAL' && !allowOfficialOverwrite && updates.value && updates.value !== existing.value) {
        throw new Error('OFFICIAL memories cannot be casually overwritten. Explicit review required.');
      }

      updatedRecord = {
        ...existing,
        ...updates,
        updated_at: new Date().toISOString()
      };

      list[idx] = updatedRecord;
      return [...list];
    });

    if (updatedRecord) {
      ActivityService.logActivity({
        organization_id: organizationId,
        client_id: (updatedRecord as ClientMemoryRecord).client_id,
        actor_id: actorId,
        action: `Memory updated: ${(updatedRecord as ClientMemoryRecord).key}`,
        entity_type: 'client_memory',
        entity_id: memoryId,
        result: `Status: ${(updatedRecord as ClientMemoryRecord).status}`
      });
    }

    return updatedRecord!;
  }

  public static approveMemory(
    organizationId: string,
    memoryId: string, 
    approvedBy: string = 'User'
  ): ClientMemoryRecord {
    let approved: ClientMemoryRecord | null = null;

    db.update('client_memory', (list) => {
      const idx = list.findIndex(m => m.id === memoryId && m.organization_id === organizationId);
      if (idx === -1) {
        throw new Error(`Memory record with ID ${memoryId} not found in this organization`);
      }

      const current = list[idx];
      approved = {
        ...current,
        status: 'APPROVED',
        updated_at: new Date().toISOString()
      };

      list[idx] = approved;
      return [...list];
    });

    if (approved) {
      ActivityService.logActivity({
        organization_id: organizationId,
        client_id: (approved as ClientMemoryRecord).client_id,
        actor_id: approvedBy,
        action: `Memory approved: ${(approved as ClientMemoryRecord).key}`,
        entity_type: 'client_memory',
        entity_id: memoryId,
        result: 'Promoted to APPROVED'
      });
    }

    return approved!;
  }

  public static archiveMemory(
    organizationId: string,
    memoryId: string, 
    actorId: string = 'User'
  ): boolean {
    let clientId = '';
    let key = '';

    db.update('client_memory', (list) => {
      const idx = list.findIndex(m => m.id === memoryId && m.organization_id === organizationId);
      if (idx === -1) return list;
      clientId = list[idx].client_id;
      key = list[idx].key;
      list[idx] = {
        ...list[idx],
        archived: true,
        updated_at: new Date().toISOString()
      };
      return [...list];
    });

    if (clientId) {
      ActivityService.logActivity({
        organization_id: organizationId,
        client_id: clientId,
        actor_id: actorId,
        action: `Memory archived: ${key}`,
        entity_type: 'client_memory',
        entity_id: memoryId,
        result: 'Archived from active memory graph'
      });
      return true;
    }

    return false;
  }
}
