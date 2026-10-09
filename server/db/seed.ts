import { DatabaseSchema } from './types';
import { AuthSecurity } from '../services/authSecurity';

const adminCreds = AuthSecurity.hashPassword(process.env.SUPER_ADMIN_PASSWORD || 'Admin123!');
const ownerCreds = AuthSecurity.hashPassword(process.env.OWNER_PASSWORD || 'Owner123!');
const memberCreds = AuthSecurity.hashPassword(process.env.MEMBER_PASSWORD || 'Member123!');

const DEFAULT_ORG_ID = 'org_matias_studio';

export const initialDevelopmentSeed: DatabaseSchema = {
  users: [
    {
      id: 'user_admin',
      email: 'admin@example.com',
      password_hash: adminCreds.hash,
      password_salt: adminCreds.salt,
      name: 'System Super Admin',
      platform_role: 'SUPER_ADMIN',
      status: 'active',
      last_active_at: new Date().toISOString(),
      created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'user_owner',
      email: 'owner@example.com',
      password_hash: ownerCreds.hash,
      password_salt: ownerCreds.salt,
      name: 'Matias Austin',
      platform_role: 'USER',
      status: 'active',
      last_active_at: new Date().toISOString(),
      created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'user_member',
      email: 'member@example.com',
      password_hash: memberCreds.hash,
      password_salt: memberCreds.salt,
      name: 'Elena Rostova',
      platform_role: 'USER',
      status: 'active',
      last_active_at: new Date().toISOString(),
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  organizations: [
    {
      id: DEFAULT_ORG_ID,
      name: 'Matias Studio',
      slug: 'matias-studio',
      status: 'active',
      plan: 'Studio',
      subscription_status: 'active',
      created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  organization_members: [
    {
      id: 'member_admin_studio',
      organization_id: DEFAULT_ORG_ID,
      user_id: 'user_admin',
      role: 'OWNER',
      created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'member_owner_studio',
      organization_id: DEFAULT_ORG_ID,
      user_id: 'user_owner',
      role: 'OWNER',
      created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'member_elena_studio',
      organization_id: DEFAULT_ORG_ID,
      user_id: 'user_member',
      role: 'MEMBER',
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  sessions: [],
  invitations: [],
  feature_flags: [
    {
      id: 'flag_slack',
      organization_id: DEFAULT_ORG_ID,
      key: 'slack_integration',
      enabled: false,
      description: 'Client Slack workspace synchronization',
      updated_at: new Date().toISOString()
    },
    {
      id: 'flag_figma',
      organization_id: DEFAULT_ORG_ID,
      key: 'figma_integration',
      enabled: false,
      description: 'Figma token and vector layout pipeline',
      updated_at: new Date().toISOString()
    },
    {
      id: 'flag_browser',
      organization_id: DEFAULT_ORG_ID,
      key: 'browser_agent',
      enabled: false,
      description: 'Autonomous web research worker',
      updated_at: new Date().toISOString()
    }
  ],
  clients: [
    {
      id: 'demo-xyz-ai',
      organization_id: DEFAULT_ORG_ID,
      company_name: 'Demo: XYZ Autonomous Systems',
      website: 'https://demo-xyz.ai',
      industry: 'Robotics & Autonomous Systems',
      company_size: '20-50',
      location: 'Zurich / Remote',
      timezone: 'Europe/Zurich (UTC+1)',
      company_description: 'Pioneering tactile robotics interfaces and spatial AI perception systems.',
      status: 'active',
      business_model: 'B2B Enterprise Licensing & Hardware Subscriptions',
      target_audience: 'Industrial design teams and aerospace robotics developers',
      primary_market: 'Global (North America & Western Europe)',
      positioning: 'Technical precision meets minimal aesthetic ergonomics',
      value_proposition: 'Decoupling complex sensory telemetry into actionable spatial interactions',
      main_products: 'XYZ Core Robotics OS, Spatial Sense Kit',
      competitors: 'Boston Dynamics, Figure AI',
      business_goals: 'Launch v2.0 spatial developer kit and establish studio brand guidelines',
      preferred_channel: 'Slack (#xyz-studio-sync)',
      communication_tone: 'Concise, direct, peer-to-peer technical clarity',
      response_style: 'Bullet points with direct decision proposals',
      working_hours: '09:00 - 18:00 CET',
      approval_process: 'All external communications and token exports require Matias or Sarah approval',
      who_can_approve: 'Sarah Lin (VP Product), Matias (Creative Partner)',
      important_communication_notes: 'Client values extreme brevity. Never use marketing buzzwords.',
      currency: 'USD',
      default_rate: '250',
      day_rate: '2000',
      hourly_rate: '250',
      payment_terms: 'Net 30',
      invoice_notes: 'Reference PO-XYZ-2026 on all billing vouchers',
      contract_notes: 'Retainer Active: Tier 1 Autonomous Studio Collaboration',
      created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  contacts: [
    {
      id: 'contact-demo-1',
      organization_id: DEFAULT_ORG_ID,
      client_id: 'demo-xyz-ai',
      name: 'Sarah Lin',
      role: 'VP Product & Brand Architecture',
      email: 'sarah.lin@demo-xyz.ai',
      phone: '+41 44 123 4567',
      preferred_channel: 'Slack',
      is_primary_contact: true,
      created_at: new Date(Date.now() - 86400000 * 3).toISOString()
    },
    {
      id: 'contact-demo-2',
      organization_id: DEFAULT_ORG_ID,
      client_id: 'demo-xyz-ai',
      name: 'John Vance',
      role: 'Lead Engineering Partner',
      email: 'john.v@demo-xyz.ai',
      phone: '+41 44 987 6543',
      preferred_channel: 'Email',
      is_primary_contact: false,
      created_at: new Date(Date.now() - 86400000 * 3).toISOString()
    }
  ],
  projects: [
    {
      project_id: 'proj-demo-1',
      organization_id: DEFAULT_ORG_ID,
      client_id: 'demo-xyz-ai',
      project_name: 'Brand OS & Generative UI System',
      project_type: 'Brand System',
      description: 'Developing high-contrast spatial token architecture, responsive component layouts, and visual design guidelines.',
      status: 'in_progress',
      deadline: '2026-10-24',
      priority: 'high',
      estimated_budget: '$45,000',
      project_notes: 'Initial component library review scheduled with Sarah Lin.',
      progress: 60,
      assigned_agents: ['Creative Director Agent', 'Design Automation Agent'],
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  tasks: [
    {
      id: 'task-demo-1',
      organization_id: DEFAULT_ORG_ID,
      client_id: 'demo-xyz-ai',
      project_id: 'proj-demo-1',
      title: 'Review high-contrast spatial card tokens',
      description: 'Validate border-radius tokens (24px to 28px) against WCAG AAA contrast standard on #F5F5F3 canvas.',
      assigned_agent: 'Design Automation Agent',
      status: 'running',
      priority: 'high',
      deadline: '2026-10-12',
      created_at: new Date(Date.now() - 86400000).toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'task-demo-2',
      organization_id: DEFAULT_ORG_ID,
      client_id: 'demo-xyz-ai',
      project_id: 'proj-demo-1',
      title: 'Consolidate feedback on rotary vibration curves',
      description: 'Process telemetry data received from engineering team.',
      assigned_agent: 'Creative Director Agent',
      status: 'waiting_approval',
      priority: 'normal',
      deadline: '2026-10-15',
      created_at: new Date(Date.now() - 86400000).toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  client_memory: [
    {
      id: 'mem-demo-1',
      organization_id: DEFAULT_ORG_ID,
      client_id: 'demo-xyz-ai',
      category: 'Brand',
      key: 'Brand Personality',
      value: 'Minimal, technical, premium, confident. Eliminate decorative redundancy.',
      status: 'OFFICIAL',
      source_type: 'Document',
      source_id: 'XYZ_Brand_Guidelines_v1.pdf',
      reason_context: 'Extracted from official executive onboarding workshop.',
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'mem-demo-2',
      organization_id: DEFAULT_ORG_ID,
      client_id: 'demo-xyz-ai',
      category: 'Communication',
      key: 'Client Messaging Cadence',
      value: 'Client prefers concise Slack communications with actionable bullet points. Never send unapproved client-facing messages.',
      status: 'APPROVED',
      source_type: 'Onboarding',
      source_id: 'Client Onboarding Form',
      reason_context: 'Explicitly indicated by VP Product Sarah Lin during kick-off.',
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'mem-demo-3',
      organization_id: DEFAULT_ORG_ID,
      client_id: 'demo-xyz-ai',
      category: 'Visual',
      key: 'Color & Contrast Rules',
      value: 'Strict monochrome base (#F5F5F3 canvas, #111111 ink, #E5E5E1 borders) with high-contrast dark sections (#121212) for technical telemetry.',
      status: 'OFFICIAL',
      source_type: 'Document',
      source_id: 'Design_System_Spec.pdf',
      reason_context: 'Official typography & color specifications approved by creative direction.',
      created_at: new Date(Date.now() - 86400000).toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'mem-demo-4',
      organization_id: DEFAULT_ORG_ID,
      client_id: 'demo-xyz-ai',
      category: 'Observations',
      key: 'Early Design Feedback Observation',
      value: 'Client team reacted positively to editorial asymmetrical compositions over traditional 12-column dashboard grids.',
      status: 'OBSERVED',
      source_type: 'Activity',
      source_id: 'Design Review Meeting #01',
      reason_context: 'Noted during initial layout presentation feedback round.',
      created_at: new Date(Date.now() - 86400000).toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  documents: [
    {
      file_id: 'doc-demo-1',
      organization_id: DEFAULT_ORG_ID,
      client_id: 'demo-xyz-ai',
      project_id: 'proj-demo-1',
      category: 'Brand',
      filename: 'XYZ_Brand_Guidelines_v1.pdf',
      file_size: '3.4 MB',
      uploaded_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      uploaded_by: 'Matias Austin',
      status: 'uploaded',
      notes: 'Authoritative brand manual defining typography hierarchy and color standards.'
    },
    {
      file_id: 'doc-demo-2',
      organization_id: DEFAULT_ORG_ID,
      client_id: 'demo-xyz-ai',
      project_id: 'proj-demo-1',
      category: 'Contract',
      filename: 'Master_Services_Agreement_2026.pdf',
      file_size: '1.2 MB',
      uploaded_at: new Date(Date.now() - 86400000 * 3).toISOString(),
      uploaded_by: 'Matias Austin',
      status: 'uploaded',
      notes: 'Executed MSA governing studio deliverables and commercial rates.'
    }
  ],
  client_permissions: [
    {
      id: 'perm-demo-1',
      organization_id: DEFAULT_ORG_ID,
      client_id: 'demo-xyz-ai',
      permissions: {
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
      },
      updated_at: new Date().toISOString()
    }
  ],
  activities: [
    {
      id: 'act-demo-1',
      organization_id: DEFAULT_ORG_ID,
      client_id: 'demo-xyz-ai',
      actor_type: 'user',
      actor_id: 'Matias',
      action: 'Client workspace created',
      entity_type: 'client',
      entity_id: 'demo-xyz-ai',
      result: 'Initialized workspace with 2 contacts and 1 project',
      created_at: new Date(Date.now() - 86400000 * 3).toISOString()
    },
    {
      id: 'act-demo-2',
      organization_id: DEFAULT_ORG_ID,
      client_id: 'demo-xyz-ai',
      project_id: 'proj-demo-1',
      actor_type: 'user',
      actor_id: 'Matias',
      action: 'Project created: Brand OS & Generative UI System',
      entity_type: 'project',
      entity_id: 'proj-demo-1',
      created_at: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    {
      id: 'act-demo-3',
      organization_id: DEFAULT_ORG_ID,
      client_id: 'demo-xyz-ai',
      actor_type: 'user',
      actor_id: 'Matias',
      action: 'Document uploaded: XYZ_Brand_Guidelines_v1.pdf',
      entity_type: 'document',
      entity_id: 'doc-demo-1',
      created_at: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    {
      id: 'act-demo-4',
      organization_id: DEFAULT_ORG_ID,
      client_id: 'demo-xyz-ai',
      actor_type: 'user',
      actor_id: 'Matias',
      action: 'Memory approved: Client Messaging Cadence',
      entity_type: 'client_memory',
      entity_id: 'mem-demo-2',
      created_at: new Date(Date.now() - 86400000).toISOString()
    }
  ],
  tools: [],
  agents: [
    {
      id: 'ag-cd',
      organization_id: DEFAULT_ORG_ID,
      name: 'Creative Director Agent',
      role: 'Art Direction, Taste Evaluation & Synthesis',
      description: 'Supervises aesthetic consistency, brand fidelity, and creative compositions.',
      status: 'Active',
      created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'ag-design',
      organization_id: DEFAULT_ORG_ID,
      name: 'Design Automation Agent',
      role: 'Figma Token Sync, Layout Spatialization & UI Spec',
      description: 'Automates token transformations, design systems, and export specifications.',
      status: 'Active',
      created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'ag-mem',
      organization_id: DEFAULT_ORG_ID,
      name: 'Memory Intelligence Engine',
      role: 'Knowledge Retrieval, Brand DNA & Client Habits',
      description: 'Continuously synthesizes and indexes long-term client context and habits.',
      status: 'Active',
      created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'ag-liaison',
      organization_id: DEFAULT_ORG_ID,
      name: 'Client Liaison Agent',
      role: 'Communications, Slack / Email Drafting, Approval Queue',
      description: 'Prepares client dispatches, summarizes communications, and routes approvals.',
      status: 'Standby',
      created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'ag-research',
      organization_id: DEFAULT_ORG_ID,
      name: 'Research & Discovery Agent',
      role: 'Brief Deconstruction, Market Mapping, Technical Papers',
      description: 'Analyzes project briefs, extracts market positioning, and benchmarks competitors.',
      status: 'Active',
      created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  agent_tools: [
    // Design Agent
    { id: 'at-1', organization_id: DEFAULT_ORG_ID, agent_id: 'ag-design', tool_id: 'projects.read', enabled: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'at-2', organization_id: DEFAULT_ORG_ID, agent_id: 'ag-design', tool_id: 'memory.read', enabled: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'at-3', organization_id: DEFAULT_ORG_ID, agent_id: 'ag-design', tool_id: 'documents.read', enabled: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'at-4', organization_id: DEFAULT_ORG_ID, agent_id: 'ag-design', tool_id: 'figma.publish', enabled: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'at-5', organization_id: DEFAULT_ORG_ID, agent_id: 'ag-design', tool_id: 'tasks.read', enabled: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'at-6', organization_id: DEFAULT_ORG_ID, agent_id: 'ag-design', tool_id: 'tasks.update', enabled: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    
    // Research Agent
    { id: 'at-7', organization_id: DEFAULT_ORG_ID, agent_id: 'ag-research', tool_id: 'documents.read', enabled: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'at-8', organization_id: DEFAULT_ORG_ID, agent_id: 'ag-research', tool_id: 'memory.read', enabled: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'at-9', organization_id: DEFAULT_ORG_ID, agent_id: 'ag-research', tool_id: 'clients.read', enabled: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'at-10', organization_id: DEFAULT_ORG_ID, agent_id: 'ag-research', tool_id: 'projects.read', enabled: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },

    // Client Liaison Agent
    { id: 'at-11', organization_id: DEFAULT_ORG_ID, agent_id: 'ag-liaison', tool_id: 'communication.send', enabled: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'at-12', organization_id: DEFAULT_ORG_ID, agent_id: 'ag-liaison', tool_id: 'clients.read', enabled: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'at-13', organization_id: DEFAULT_ORG_ID, agent_id: 'ag-liaison', tool_id: 'tasks.read', enabled: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },

    // Memory Intelligence Engine
    { id: 'at-14', organization_id: DEFAULT_ORG_ID, agent_id: 'ag-mem', tool_id: 'memory.read', enabled: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'at-15', organization_id: DEFAULT_ORG_ID, agent_id: 'ag-mem', tool_id: 'memory.create', enabled: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'at-16', organization_id: DEFAULT_ORG_ID, agent_id: 'ag-mem', tool_id: 'memory.update', enabled: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'at-17', organization_id: DEFAULT_ORG_ID, agent_id: 'ag-mem', tool_id: 'documents.read', enabled: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },

    // Creative Director Agent
    { id: 'at-18', organization_id: DEFAULT_ORG_ID, agent_id: 'ag-cd', tool_id: 'projects.read', enabled: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'at-19', organization_id: DEFAULT_ORG_ID, agent_id: 'ag-cd', tool_id: 'memory.read', enabled: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'at-20', organization_id: DEFAULT_ORG_ID, agent_id: 'ag-cd', tool_id: 'documents.read', enabled: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
  ],
  agent_permissions: [
    { id: 'ap-1', organization_id: DEFAULT_ORG_ID, agent_id: 'ag-design', permission: 'projects.read', enabled: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'ap-2', organization_id: DEFAULT_ORG_ID, agent_id: 'ag-design', permission: 'memory.read', enabled: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'ap-3', organization_id: DEFAULT_ORG_ID, agent_id: 'ag-design', permission: 'documents.read', enabled: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'ap-4', organization_id: DEFAULT_ORG_ID, agent_id: 'ag-design', permission: 'design.publish', enabled: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'ap-5', organization_id: DEFAULT_ORG_ID, agent_id: 'ag-design', permission: 'tasks.read', enabled: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'ap-6', organization_id: DEFAULT_ORG_ID, agent_id: 'ag-design', permission: 'tasks.update', enabled: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },

    { id: 'ap-7', organization_id: DEFAULT_ORG_ID, agent_id: 'ag-research', permission: 'documents.read', enabled: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'ap-8', organization_id: DEFAULT_ORG_ID, agent_id: 'ag-research', permission: 'memory.read', enabled: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'ap-9', organization_id: DEFAULT_ORG_ID, agent_id: 'ag-research', permission: 'clients.read', enabled: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'ap-10', organization_id: DEFAULT_ORG_ID, agent_id: 'ag-research', permission: 'projects.read', enabled: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },

    { id: 'ap-11', organization_id: DEFAULT_ORG_ID, agent_id: 'ag-liaison', permission: 'communication.send', enabled: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'ap-12', organization_id: DEFAULT_ORG_ID, agent_id: 'ag-liaison', permission: 'clients.read', enabled: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'ap-13', organization_id: DEFAULT_ORG_ID, agent_id: 'ag-liaison', permission: 'tasks.read', enabled: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },

    { id: 'ap-14', organization_id: DEFAULT_ORG_ID, agent_id: 'ag-mem', permission: 'memory.read', enabled: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'ap-15', organization_id: DEFAULT_ORG_ID, agent_id: 'ag-mem', permission: 'memory.create', enabled: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'ap-16', organization_id: DEFAULT_ORG_ID, agent_id: 'ag-mem', permission: 'memory.update', enabled: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'ap-17', organization_id: DEFAULT_ORG_ID, agent_id: 'ag-mem', permission: 'documents.read', enabled: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },

    { id: 'ap-18', organization_id: DEFAULT_ORG_ID, agent_id: 'ag-cd', permission: 'projects.read', enabled: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'ap-19', organization_id: DEFAULT_ORG_ID, agent_id: 'ag-cd', permission: 'memory.read', enabled: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'ap-20', organization_id: DEFAULT_ORG_ID, agent_id: 'ag-cd', permission: 'documents.read', enabled: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
  ],
  approvals: [
    {
      id: 'appr-seed-1',
      organization_id: DEFAULT_ORG_ID,
      client_id: 'demo-xyz-ai',
      project_id: 'proj-demo-1',
      requested_by_type: 'agent',
      requested_by_id: 'ag-liaison',
      tool_id: 'communication.send',
      risk_level: 'HIGH',
      status: 'pending',
      original_input: {
        channel: 'Slack',
        recipient: 'Sarah Connor',
        message: 'The initial draft of the spatial design token architecture has passed internal checks and is ready for your team review.'
      },
      reason: 'External Communication Gate: AI Agent requested dispatch of outbound Slack update to client stakeholder.',
      expires_at: new Date(Date.now() + 24 * 3600000).toISOString(),
      created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 2).toISOString()
    }
  ],
  tool_executions: [],
  governance_policies: [
    {
      id: `gov_${DEFAULT_ORG_ID}`,
      organization_id: DEFAULT_ORG_ID,
      official_truth_gate: true,
      external_communication_gate: true,
      design_publishing_gate: true,
      commercial_budget_enforcement: true,
      updated_at: new Date().toISOString()
    }
  ]
};
