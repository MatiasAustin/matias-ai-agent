import { db } from '../db/database';
import { DocumentCategory, DocumentRecord, DocumentStatus } from '../db/types';
import { ActivityService } from './activityService';

export class DocumentService {
  public static getDocuments(clientId?: string, category?: DocumentCategory): DocumentRecord[] {
    const list = db.get('documents');
    return list.filter(d => {
      const matchClient = clientId ? d.client_id === clientId : true;
      const matchCat = category ? d.category === category : true;
      return matchClient && matchCat;
    });
  }

  public static uploadDocument(params: {
    client_id: string;
    project_id?: string;
    category: DocumentCategory;
    filename: string;
    file_size?: string;
    uploaded_by?: string;
    notes?: string;
  }): DocumentRecord {
    if (!params.client_id) {
      throw new Error('client_id is required');
    }

    const record: DocumentRecord = {
      file_id: `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      client_id: params.client_id,
      project_id: params.project_id,
      category: params.category,
      filename: params.filename.trim(),
      file_size: params.file_size || 'Unknown size',
      uploaded_at: new Date().toISOString(),
      uploaded_by: params.uploaded_by || 'Matias',
      // Real status: files start as 'uploaded', not fake indexed!
      status: 'uploaded',
      notes: params.notes
    };

    db.update('documents', list => [record, ...list]);

    ActivityService.logActivity({
      client_id: params.client_id,
      project_id: params.project_id,
      actor_id: params.uploaded_by || 'Matias',
      action: `File uploaded: ${record.filename}`,
      entity_type: 'document',
      entity_id: record.file_id,
      result: `Stored under category ${record.category}`
    });

    return record;
  }

  public static updateDocumentStatus(fileId: string, status: DocumentStatus): DocumentRecord | null {
    let updated: DocumentRecord | null = null;
    db.update('documents', list => {
      const idx = list.findIndex(d => d.file_id === fileId);
      if (idx !== -1) {
        list[idx] = { ...list[idx], status };
        updated = list[idx];
      }
      return [...list];
    });
    return updated;
  }
}
