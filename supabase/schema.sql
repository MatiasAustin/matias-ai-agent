-- ==============================================================================
-- MATIAS AI STUDIO OS - SUPABASE POSTGRESQL DATABASE SCHEMA
-- Multi-Tenant SaaS Architecture with strict organization-scoped isolation
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ORGANIZATIONS
CREATE TABLE IF NOT EXISTS organizations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    logo TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'trial', 'cancelled')),
    plan TEXT NOT NULL DEFAULT 'Studio' CHECK (plan IN ('Free', 'Pro', 'Studio', 'Enterprise')),
    subscription_status TEXT DEFAULT 'active',
    trial_ends_at TIMESTAMPTZ,
    billing_customer_id TEXT,
    subscription_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. USERS
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    password_salt TEXT NOT NULL,
    name TEXT NOT NULL,
    platform_role TEXT NOT NULL DEFAULT 'USER' CHECK (platform_role IN ('SUPER_ADMIN', 'USER')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
    last_active_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. ORGANIZATION MEMBERS (Many-to-Many with Role)
CREATE TABLE IF NOT EXISTS organization_members (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'MEMBER' CHECK (role IN ('OWNER', 'ADMIN', 'MEMBER', 'VIEWER')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(organization_id, user_id)
);

-- 5. SESSIONS
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    token TEXT UNIQUE NOT NULL,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    active_organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. INVITATIONS
CREATE TABLE IF NOT EXISTS invitations (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'MEMBER' CHECK (role IN ('OWNER', 'ADMIN', 'MEMBER', 'VIEWER')),
    invited_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'revoked')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. FEATURE FLAGS
CREATE TABLE IF NOT EXISTS feature_flags (
    id TEXT PRIMARY KEY,
    organization_id TEXT REFERENCES organizations(id) ON DELETE CASCADE,
    key TEXT NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT true,
    description TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. CLIENTS
CREATE TABLE IF NOT EXISTS clients (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    website TEXT,
    industry TEXT NOT NULL,
    company_size TEXT,
    location TEXT,
    timezone TEXT,
    company_description TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'review', 'onboarding', 'archived')),
    business_model TEXT,
    target_audience TEXT,
    primary_market TEXT,
    positioning TEXT,
    value_proposition TEXT,
    main_products TEXT,
    competitors TEXT,
    business_goals TEXT,
    preferred_channel TEXT,
    communication_tone TEXT,
    response_style TEXT,
    working_hours TEXT,
    approval_process TEXT,
    who_can_approve TEXT,
    important_communication_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. CONTACTS
CREATE TABLE IF NOT EXISTS contacts (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    preferred_channel TEXT,
    is_primary_contact BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. PROJECTS
CREATE TABLE IF NOT EXISTS projects (
    project_id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    project_name TEXT NOT NULL,
    project_type TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'in_progress',
    deadline TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'normal',
    estimated_budget TEXT,
    project_notes TEXT,
    progress INT DEFAULT 0,
    assigned_agents TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. TASKS
CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    project_id TEXT,
    title TEXT NOT NULL,
    description TEXT,
    assigned_agent TEXT,
    status TEXT NOT NULL DEFAULT 'queued',
    priority TEXT NOT NULL DEFAULT 'normal',
    deadline TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. CLIENT MEMORY ENGINE
CREATE TABLE IF NOT EXISTS client_memory (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    key TEXT NOT NULL,
    value TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('OFFICIAL', 'APPROVED', 'OBSERVED', 'TEMPORARY')),
    confidence TEXT DEFAULT 'Medium' CHECK (confidence IN ('High', 'Medium', 'Low')),
    source_type TEXT NOT NULL,
    source_id TEXT NOT NULL,
    reason_context TEXT,
    archived BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. DOCUMENTS
CREATE TABLE IF NOT EXISTS documents (
    file_id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    project_id TEXT,
    category TEXT NOT NULL,
    filename TEXT NOT NULL,
    file_size TEXT,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    uploaded_by TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'uploaded',
    notes TEXT
);

-- 14. CLIENT PERMISSIONS
CREATE TABLE IF NOT EXISTS client_permissions (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    permissions JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. ACTIVITIES / AUDIT LOG
CREATE TABLE IF NOT EXISTS activities (
    id TEXT PRIMARY KEY,
    organization_id TEXT REFERENCES organizations(id) ON DELETE CASCADE,
    client_id TEXT,
    project_id TEXT,
    actor_type TEXT NOT NULL,
    actor_id TEXT NOT NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    result TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- INDEXES FOR MULTI-TENANT QUERY ACCELERATION
CREATE INDEX IF NOT EXISTS idx_org_members_org ON organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user ON organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_clients_org ON clients(organization_id);
CREATE INDEX IF NOT EXISTS idx_projects_org ON projects(organization_id);
CREATE INDEX IF NOT EXISTS idx_tasks_org ON tasks(organization_id);
CREATE INDEX IF NOT EXISTS idx_memory_client ON client_memory(organization_id, client_id);
CREATE INDEX IF NOT EXISTS idx_documents_org ON documents(organization_id);
CREATE INDEX IF NOT EXISTS idx_activities_org ON activities(organization_id);

-- ==============================================================================
-- SEED INITIAL DATA (Default Organization, Demo Users, Baseline Workspace)
-- ==============================================================================

-- Default Organization
INSERT INTO organizations (id, name, slug, status, plan, subscription_status)
VALUES ('org_matias_studio', 'Matias Studio', 'matias-studio', 'active', 'Studio', 'active')
ON CONFLICT (id) DO NOTHING;

-- Seed Users (scrypt hashes for 'Admin123!', 'Owner123!', 'Member123!')
-- Admin (SUPER_ADMIN)
INSERT INTO users (id, email, password_hash, password_salt, name, platform_role, status)
VALUES (
    'user_admin',
    'admin@example.com',
    '8b613f360ef3b0064f2759e66c7ca322f7b884d5915d6666eb12f518e1d6706e93892742ddb13ad174f8c495cb8ee2fe8db60bf976ae589136128038b3cf4a17',
    '15264b5e28aefd84cf9b08f8bb1aef71',
    'System Super Admin',
    'SUPER_ADMIN',
    'active'
) ON CONFLICT (id) DO NOTHING;

-- Owner (Matias Austin)
INSERT INTO users (id, email, password_hash, password_salt, name, platform_role, status)
VALUES (
    'user_owner',
    'owner@example.com',
    '0a845cf156d64ea499a0767cb6cb774ef1aeb2cfc525fbe355a2988ebfec55355ebec5b51268ee7f082e6d63604f326a0ec6a52479e3c9035f4b59e5e7834515',
    'ec113a35b1c86f7c5e2ec7b3adfcb154',
    'Matias Austin',
    'USER',
    'active'
) ON CONFLICT (id) DO NOTHING;

-- Member (Elena Rostova)
INSERT INTO users (id, email, password_hash, password_salt, name, platform_role, status)
VALUES (
    'user_member',
    'member@example.com',
    '4a70659cb5e486016aa91b157ad76e03c2fa0236a29ec62c2f4df91ee9336d8174574972e9d27572d41b636606ebbf480ba0882e379234857d42cf38fbbdcb93',
    '33ee35cb670d9cfdca1f5be587aeb4a4',
    'Elena Rostova',
    'USER',
    'active'
) ON CONFLICT (id) DO NOTHING;

-- Memberships
INSERT INTO organization_members (id, organization_id, user_id, role)
VALUES 
    ('mem_admin_studio', 'org_matias_studio', 'user_admin', 'OWNER'),
    ('mem_owner_studio', 'org_matias_studio', 'user_owner', 'OWNER'),
    ('mem_member_studio', 'org_matias_studio', 'user_member', 'MEMBER')
ON CONFLICT (id) DO NOTHING;

-- Default Feature Flags
INSERT INTO feature_flags (id, organization_id, key, enabled, description)
VALUES
    ('ff_1', NULL, 'multi_tenant_v2', true, 'Strict multi-tenant resource filtering'),
    ('ff_2', NULL, 'autonomous_agent_orchestration', true, 'Autonomous agent task creation and memory lookup'),
    ('ff_3', NULL, 'official_truth_guard', true, 'Protect authoritative memory from unapproved writes')
ON CONFLICT (id) DO NOTHING;

-- Seed Client (Acme Creative Labs)
INSERT INTO clients (
    id, organization_id, company_name, website, industry, company_size, location, timezone,
    company_description, status, business_model, positioning, value_proposition,
    preferred_channel, communication_tone, response_style
) VALUES (
    'client_acme_demo',
    'org_matias_studio',
    'Acme Creative Labs',
    'https://acme-labs.example.com',
    'Creative Tech & AI Design',
    '20-50',
    'San Francisco, CA',
    'UTC-8',
    'Pioneering spatial brand identities and generative systems.',
    'active',
    'B2B Enterprise Retainers',
    'Premium Design & AI Engineering',
    'Autonomous studio execution with human direction',
    'Slack',
    'Direct, editorial, concise',
    'Quick summaries with deliverable links'
) ON CONFLICT (id) DO NOTHING;

-- Seed Contact
INSERT INTO contacts (id, organization_id, client_id, name, role, email, is_primary_contact, preferred_channel)
VALUES ('contact_acme_1', 'org_matias_studio', 'client_acme_demo', 'Sarah Connor', 'VP of Brand', 'sarah@acme-labs.example.com', true, 'Slack')
ON CONFLICT (id) DO NOTHING;

-- Seed Project
INSERT INTO projects (
    project_id, organization_id, client_id, project_name, project_type,
    description, status, deadline, priority, progress, assigned_agents
) VALUES (
    'proj_brand_system',
    'org_matias_studio',
    'client_acme_demo',
    'Spatial Brand System & Token Architecture',
    'Brand Identity',
    'Complete overhaul of design tokens, editorial hierarchy, and spatial guidelines.',
    'in_progress',
    '2026-11-15',
    'high',
    65,
    ARRAY['Design Director Agent', 'Token Synthesizer']
) ON CONFLICT (project_id) DO NOTHING;

-- Seed Memories
INSERT INTO client_memory (id, organization_id, client_id, category, key, value, status, confidence, source_type, source_id)
VALUES
    ('mem_seed_1', 'org_matias_studio', 'client_acme_demo', 'Brand', 'primary_color', '#111111 High-contrast monochrome', 'OFFICIAL', 'High', 'Brand Book', 'doc_brand_v1'),
    ('mem_seed_2', 'org_matias_studio', 'client_acme_demo', 'Communication', 'preferred_format', 'Client prefers Slack bullets, avoid long paragraphs', 'OFFICIAL', 'High', 'Onboarding', 'onboarding_01'),
    ('mem_seed_3', 'org_matias_studio', 'client_acme_demo', 'Workflow', 'approval_gate', 'Deliverables require Sarah Connor confirmation before publishing', 'APPROVED', 'High', 'Meeting Notes', 'call_20261001')
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- TOOL REGISTRY, PERMISSIONS, APPROVALS & EXECUTION PIPELINE
-- ==============================================================================

-- 16. TOOLS (Registry)
CREATE TABLE IF NOT EXISTS tools (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    provider TEXT NOT NULL DEFAULT 'core',
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    version TEXT NOT NULL DEFAULT '1.0.0',
    risk_level TEXT NOT NULL CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    requires_approval BOOLEAN NOT NULL DEFAULT false,
    enabled BOOLEAN NOT NULL DEFAULT true,
    input_schema JSONB NOT NULL DEFAULT '{}'::jsonb,
    output_schema JSONB NOT NULL DEFAULT '{}'::jsonb,
    required_permissions TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 17. AGENTS
CREATE TABLE IF NOT EXISTS agents (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'Active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 18. AGENT TOOLS (Allowed Tool Mapping)
CREATE TABLE IF NOT EXISTS agent_tools (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    agent_id TEXT NOT NULL,
    tool_id TEXT NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(organization_id, agent_id, tool_id)
);

-- 19. AGENT PERMISSIONS (Agent Boundary)
CREATE TABLE IF NOT EXISTS agent_permissions (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    agent_id TEXT NOT NULL,
    permission TEXT NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(organization_id, agent_id, permission)
);

-- 20. APPROVALS
CREATE TABLE IF NOT EXISTS approvals (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    client_id TEXT REFERENCES clients(id) ON DELETE SET NULL,
    project_id TEXT,
    requested_by_type TEXT NOT NULL CHECK (requested_by_type IN ('user', 'agent')),
    requested_by_id TEXT NOT NULL,
    tool_id TEXT NOT NULL,
    risk_level TEXT NOT NULL CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired', 'cancelled', 'executed', 'failed')),
    original_input JSONB NOT NULL DEFAULT '{}'::jsonb,
    approved_input JSONB,
    reason TEXT NOT NULL,
    reviewed_by TEXT,
    reviewed_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 21. TOOL EXECUTIONS
CREATE TABLE IF NOT EXISTS tool_executions (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    tool_id TEXT NOT NULL,
    agent_id TEXT,
    user_id TEXT NOT NULL,
    client_id TEXT,
    project_id TEXT,
    approval_id TEXT REFERENCES approvals(id) ON DELETE SET NULL,
    risk_level TEXT NOT NULL CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'running', 'waiting_approval', 'completed', 'failed', 'cancelled')),
    input JSONB NOT NULL DEFAULT '{}'::jsonb,
    output JSONB,
    error JSONB,
    idempotency_key TEXT,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 22. GOVERNANCE POLICIES
CREATE TABLE IF NOT EXISTS governance_policies (
    id TEXT PRIMARY KEY,
    organization_id TEXT UNIQUE NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    official_truth_gate BOOLEAN NOT NULL DEFAULT true,
    external_communication_gate BOOLEAN NOT NULL DEFAULT true,
    design_publishing_gate BOOLEAN NOT NULL DEFAULT true,
    commercial_budget_enforcement BOOLEAN NOT NULL DEFAULT true,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- INDEXES FOR NEW ENTITIES
CREATE INDEX IF NOT EXISTS idx_agent_tools_org ON agent_tools(organization_id, agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_perms_org ON agent_permissions(organization_id, agent_id);
CREATE INDEX IF NOT EXISTS idx_approvals_org ON approvals(organization_id);
CREATE INDEX IF NOT EXISTS idx_approvals_org_client ON approvals(organization_id, client_id);
CREATE INDEX IF NOT EXISTS idx_approvals_org_status ON approvals(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_tool_exec_org ON tool_executions(organization_id);
CREATE INDEX IF NOT EXISTS idx_tool_exec_idempotency ON tool_executions(organization_id, idempotency_key);
CREATE INDEX IF NOT EXISTS idx_tool_exec_agent ON tool_executions(organization_id, agent_id);
CREATE INDEX IF NOT EXISTS idx_tool_exec_approval ON tool_executions(approval_id);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE agent_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE governance_policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access their organization agent_tools" ON agent_tools
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM organization_members WHERE user_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can access their organization agent_permissions" ON agent_permissions
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM organization_members WHERE user_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can access their organization approvals" ON approvals
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM organization_members WHERE user_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can access their organization tool_executions" ON tool_executions
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM organization_members WHERE user_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can access their organization governance_policies" ON governance_policies
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM organization_members WHERE user_id = auth.uid()::text
        )
    );

