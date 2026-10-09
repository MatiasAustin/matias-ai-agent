import { ClientService } from './clientService';
import { MemoryService } from './memoryService';
import { ProjectService } from './projectService';
import { DocumentService } from './documentService';
import { PermissionService } from './permissionService';
import { 
  ClientRecord, 
  ContactRecord, 
  ProjectRecord, 
  ClientMemoryRecord, 
  DocumentRecord, 
  ClientPermissions 
} from '../db/types';

export interface ClientContextPayload {
  organization_id: string;
  client_id: string;
  profile: ClientRecord | null;
  primary_contact: ContactRecord | null;
  contacts: ContactRecord[];
  business_context: {
    model?: string;
    audience?: string;
    market?: string;
    positioning?: string;
    value_prop?: string;
    products?: string;
    competitors?: string;
    goals?: string;
  };
  communication_preferences: {
    preferred_channel?: string;
    tone?: string;
    response_style?: string;
    working_hours?: string;
    approval_process?: string;
    who_can_approve?: string;
    notes?: string;
  };
  commercial_defaults: {
    currency?: string;
    default_rate?: string;
    day_rate?: string;
    hourly_rate?: string;
    payment_terms?: string;
    quotation_settings?: string;
    invoice_settings?: string;
  };
  permissions: ClientPermissions;
  active_projects: ProjectRecord[];
  selected_project?: ProjectRecord | null;
  files: DocumentRecord[];
  approved_memories: ClientMemoryRecord[];
  observed_memories: ClientMemoryRecord[];
  official_brand_memories: ClientMemoryRecord[];
}

export class ContextService {
  /**
   * Scoped context retrieval for future AI agent orchestration.
   * Strictly verifies client belongs to organization and scopes all memories to organization_id + client_id.
   */
  public static getClientContext(
    organizationId: string, 
    clientId: string, 
    projectId?: string
  ): ClientContextPayload {
    if (!organizationId) throw new Error('organization_id is required');
    if (!clientId) throw new Error('client_id is required');

    const client = ClientService.getClientById(organizationId, clientId);
    if (!client) {
      throw new Error(`Client with ID ${clientId} not found in this organization`);
    }

    const contacts = ClientService.getContacts(organizationId, clientId);
    const primaryContact = contacts.find(c => c.is_primary_contact) || (contacts[0] || null);

    const allMemories = MemoryService.getClientMemory(organizationId, clientId);
    const approvedMemories = allMemories.filter(m => m.status === 'APPROVED');
    const observedMemories = allMemories.filter(m => m.status === 'OBSERVED');
    const officialMemories = allMemories.filter(m => m.status === 'OFFICIAL');

    const projects = ProjectService.getProjects(organizationId, clientId);
    const selectedProject = projectId ? ProjectService.getProjectById(organizationId, projectId) : null;
    const files = DocumentService.getDocuments(organizationId, clientId);
    const permissions = PermissionService.getPermissions(organizationId, clientId);

    return {
      organization_id: organizationId,
      client_id: clientId,
      profile: client,
      primary_contact: primaryContact,
      contacts,
      business_context: {
        model: client.business_model,
        audience: client.target_audience,
        market: client.primary_market,
        positioning: client.positioning,
        value_prop: client.value_proposition,
        products: client.main_products,
        competitors: client.competitors,
        goals: client.business_goals
      },
      communication_preferences: {
        preferred_channel: client.preferred_channel,
        tone: client.communication_tone,
        response_style: client.response_style,
        working_hours: client.working_hours,
        approval_process: client.approval_process,
        who_can_approve: client.who_can_approve,
        notes: client.important_communication_notes
      },
      commercial_defaults: {
        currency: client.currency,
        default_rate: client.default_rate,
        day_rate: client.day_rate,
        hourly_rate: client.hourly_rate,
        payment_terms: client.payment_terms,
        quotation_settings: client.quotation_settings,
        invoice_settings: client.invoice_settings
      },
      permissions,
      active_projects: projects,
      selected_project: selectedProject,
      files,
      approved_memories: approvedMemories,
      observed_memories: observedMemories,
      official_brand_memories: officialMemories
    };
  }
}
