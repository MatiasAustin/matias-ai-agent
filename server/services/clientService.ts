import { db } from '../db/database';
import { 
  ClientRecord, 
  ContactRecord, 
  ProjectRecord, 
  DocumentRecord, 
  ClientPermissions,
  MemoryCategory,
  MemoryStatus
} from '../db/types';
import { ActivityService } from './activityService';
import { PermissionService } from './permissionService';
import { MemoryService } from './memoryService';

export interface CreateClientPayload {
  identity: {
    company_name: string;
    website?: string;
    industry: string;
    company_size?: string;
    location?: string;
    timezone?: string;
    company_description?: string;
  };
  people: {
    name: string;
    role: string;
    email: string;
    phone?: string;
    preferred_channel?: string;
    is_primary_contact: boolean;
  }[];
  business?: {
    business_model?: string;
    target_audience?: string;
    primary_market?: string;
    positioning?: string;
    value_proposition?: string;
    main_products?: string;
    competitors?: string;
    business_goals?: string;
  };
  brand?: {
    brand_personality?: string;
    brand_voice?: string;
    design_style?: string;
    visual_principles?: string;
    primary_colors?: string;
    secondary_colors?: string;
    typography?: string;
    logo_notes?: string;
    things_to_avoid?: string;
    brand_status?: MemoryStatus;
  };
  communication?: {
    preferred_channel?: string;
    communication_tone?: string;
    response_style?: string;
    working_hours?: string;
    approval_process?: string;
    who_can_approve?: string;
    important_communication_notes?: string;
  };
  projects?: {
    project_name: string;
    project_type: string;
    description: string;
    status?: string;
    deadline: string;
    priority?: string;
    estimated_budget?: string;
    project_notes?: string;
  }[];
  commercial?: {
    currency?: string;
    default_rate?: string;
    day_rate?: string;
    hourly_rate?: string;
    payment_terms?: string;
    invoice_notes?: string;
    contract_notes?: string;
    quotation_settings?: string;
    invoice_settings?: string;
    mou_settings?: string;
  };
  files?: {
    category: string;
    filename: string;
    file_size?: string;
    notes?: string;
    status_classification?: MemoryStatus;
  }[];
  ai_setup?: Partial<ClientPermissions>;
}

export class ClientService {
  public static getAllClients(): ClientRecord[] {
    return db.get('clients');
  }

  public static getClientById(clientId: string): ClientRecord | null {
    const clients = db.get('clients');
    return clients.find(c => c.id === clientId) || null;
  }

  public static getContacts(clientId: string): ContactRecord[] {
    const contacts = db.get('contacts');
    return contacts.filter(c => c.client_id === clientId);
  }

  public static createClient(payload: CreateClientPayload, actorId: string = 'Matias'): ClientRecord {
    if (!payload.identity || !payload.identity.company_name || payload.identity.company_name.trim() === '') {
      throw new Error('company_name is required');
    }

    // Generate clean slug or unique id
    const slugBase = payload.identity.company_name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    const clientId = `client_${slugBase}_${Math.random().toString(36).substring(2, 6)}`;

    const newClient: ClientRecord = {
      id: clientId,
      company_name: payload.identity.company_name.trim(),
      website: payload.identity.website,
      industry: payload.identity.industry || 'Creative / Technology',
      company_size: payload.identity.company_size,
      location: payload.identity.location,
      timezone: payload.identity.timezone,
      company_description: payload.identity.company_description,
      status: 'active',
      // Business
      business_model: payload.business?.business_model,
      target_audience: payload.business?.target_audience,
      primary_market: payload.business?.primary_market,
      positioning: payload.business?.positioning,
      value_proposition: payload.business?.value_proposition,
      main_products: payload.business?.main_products,
      competitors: payload.business?.competitors,
      business_goals: payload.business?.business_goals,
      // Communication
      preferred_channel: payload.communication?.preferred_channel,
      communication_tone: payload.communication?.communication_tone,
      response_style: payload.communication?.response_style,
      working_hours: payload.communication?.working_hours,
      approval_process: payload.communication?.approval_process,
      who_can_approve: payload.communication?.who_can_approve,
      important_communication_notes: payload.communication?.important_communication_notes,
      // Commercial
      currency: payload.commercial?.currency || 'USD',
      default_rate: payload.commercial?.default_rate,
      day_rate: payload.commercial?.day_rate,
      hourly_rate: payload.commercial?.hourly_rate,
      payment_terms: payload.commercial?.payment_terms || 'Net 30',
      invoice_notes: payload.commercial?.invoice_notes,
      contract_notes: payload.commercial?.contract_notes,
      quotation_settings: payload.commercial?.quotation_settings,
      invoice_settings: payload.commercial?.invoice_settings,
      mou_settings: payload.commercial?.mou_settings,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // 1. Save client
    db.update('clients', list => [newClient, ...list]);

    // 2. Save contacts
    if (payload.people && payload.people.length > 0) {
      const contactsToSave: ContactRecord[] = payload.people.map((p, idx) => ({
        id: `contact_${Date.now()}_${idx}`,
        client_id: clientId,
        name: p.name,
        role: p.role,
        email: p.email,
        phone: p.phone,
        preferred_channel: p.preferred_channel,
        is_primary_contact: p.is_primary_contact ?? (idx === 0),
        created_at: new Date().toISOString()
      }));
      db.update('contacts', list => [...list, ...contactsToSave]);
    }

    // 3. Save initial projects
    if (payload.projects && payload.projects.length > 0) {
      const projectsToSave: ProjectRecord[] = payload.projects.map((proj, idx) => ({
        project_id: `proj_${Date.now()}_${idx}`,
        client_id: clientId,
        project_name: proj.project_name,
        project_type: proj.project_type || 'Brand System',
        description: proj.description || '',
        status: (proj.status as any) || 'planning',
        deadline: proj.deadline || new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0],
        priority: (proj.priority as any) || 'normal',
        estimated_budget: proj.estimated_budget,
        project_notes: proj.project_notes,
        progress: 0,
        assigned_agents: ['Creative Director Agent'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));
      db.update('projects', list => [...list, ...projectsToSave]);
    }

    // 4. Save uploaded files
    if (payload.files && payload.files.length > 0) {
      const docsToSave: DocumentRecord[] = payload.files.map((f, idx) => ({
        file_id: `doc_${Date.now()}_${idx}`,
        client_id: clientId,
        category: (f.category as any) || 'Brand',
        filename: f.filename,
        file_size: f.file_size || '1.5 MB',
        uploaded_at: new Date().toISOString(),
        uploaded_by: actorId,
        status: 'uploaded', // Real status
        notes: f.notes
      }));
      db.update('documents', list => [...list, ...docsToSave]);
    }

    // 5. Create initial structured memory records from onboarding
    const brandStatus: MemoryStatus = payload.brand?.brand_status || 'OFFICIAL';

    if (payload.brand?.brand_personality) {
      MemoryService.createMemory({
        client_id: clientId,
        category: 'Brand',
        key: 'Brand Personality',
        value: payload.brand.brand_personality,
        status: brandStatus,
        source_type: 'Onboarding',
        source_id: 'Client Onboarding Form',
        reason_context: 'Defined during client onboarding setup.',
        actor_id: actorId
      });
    }

    if (payload.brand?.brand_voice) {
      MemoryService.createMemory({
        client_id: clientId,
        category: 'Brand',
        key: 'Brand Voice',
        value: payload.brand.brand_voice,
        status: brandStatus,
        source_type: 'Onboarding',
        source_id: 'Client Onboarding Form',
        reason_context: 'Brand voice established at onboarding.',
        actor_id: actorId
      });
    }

    if (payload.brand?.design_style) {
      MemoryService.createMemory({
        client_id: clientId,
        category: 'Visual',
        key: 'Design Style',
        value: payload.brand.design_style,
        status: brandStatus,
        source_type: 'Onboarding',
        source_id: 'Client Onboarding Form',
        reason_context: 'Aesthetic guidelines provided during onboarding.',
        actor_id: actorId
      });
    }

    if (payload.brand?.visual_principles) {
      MemoryService.createMemory({
        client_id: clientId,
        category: 'Visual',
        key: 'Visual Principles',
        value: payload.brand.visual_principles,
        status: brandStatus,
        source_type: 'Onboarding',
        source_id: 'Client Onboarding Form',
        reason_context: 'Primary visual axioms for creative work.',
        actor_id: actorId
      });
    }

    if (payload.brand?.things_to_avoid) {
      MemoryService.createMemory({
        client_id: clientId,
        category: 'Restrictions',
        key: 'Things to Avoid',
        value: payload.brand.things_to_avoid,
        status: 'OFFICIAL',
        source_type: 'Onboarding',
        source_id: 'Client Onboarding Form',
        reason_context: 'Explicit client prohibitions and negative constraints.',
        actor_id: actorId
      });
    }

    if (payload.communication?.communication_tone || payload.communication?.important_communication_notes) {
      const commVal = [
        payload.communication.communication_tone ? `Tone: ${payload.communication.communication_tone}` : '',
        payload.communication.preferred_channel ? `Preferred Channel: ${payload.communication.preferred_channel}` : '',
        payload.communication.important_communication_notes || ''
      ].filter(Boolean).join('. ');

      MemoryService.createMemory({
        client_id: clientId,
        category: 'Communication',
        key: 'Communication Protocols',
        value: commVal,
        status: 'APPROVED',
        source_type: 'Onboarding',
        source_id: 'Client Onboarding Form',
        reason_context: 'Communication preferences collected from onboarding.',
        actor_id: actorId
      });
    }

    if (payload.business?.positioning || payload.business?.value_proposition) {
      MemoryService.createMemory({
        client_id: clientId,
        category: 'Positioning',
        key: 'Market Positioning & Value Proposition',
        value: `${payload.business.positioning || ''} ${payload.business.value_proposition || ''}`.trim(),
        status: 'APPROVED',
        source_type: 'Onboarding',
        source_id: 'Client Onboarding Form',
        reason_context: 'Business value positioning documented at onboarding.',
        actor_id: actorId
      });
    }

    // 6. Set AI permissions
    if (payload.ai_setup) {
      PermissionService.updatePermissions(clientId, payload.ai_setup, actorId);
    } else {
      PermissionService.getPermissions(clientId); // initializes defaults
    }

    // 7. Log single real activity
    ActivityService.logActivity({
      client_id: clientId,
      actor_id: actorId,
      action: 'Client workspace created',
      entity_type: 'client',
      entity_id: clientId,
      result: `Initialized workspace with ${payload.people?.length || 0} contacts and ${payload.projects?.length || 0} projects`
    });

    return newClient;
  }

  public static updateClient(
    clientId: string, 
    updates: Partial<Omit<ClientRecord, 'id' | 'created_at'>>,
    actorId: string = 'Matias'
  ): ClientRecord {
    let updated: ClientRecord | null = null;

    db.update('clients', list => {
      const idx = list.findIndex(c => c.id === clientId);
      if (idx === -1) {
        throw new Error(`Client with ID ${clientId} not found`);
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
        client_id: clientId,
        actor_id: actorId,
        action: `Client profile updated: ${(updated as ClientRecord).company_name}`,
        entity_type: 'client',
        entity_id: clientId
      });
    }

    return updated!;
  }
}
