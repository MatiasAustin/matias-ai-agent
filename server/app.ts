import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { AuthService } from './services/authService';
import { OrganizationService } from './services/organizationService';
import { UserService } from './services/userService';
import { ClientService } from './services/clientService';
import { ProjectService } from './services/projectService';
import { TaskService } from './services/taskService';
import { MemoryService } from './services/memoryService';
import { DocumentService } from './services/documentService';
import { ActivityService } from './services/activityService';
import { PermissionService } from './services/permissionService';
import { ContextService } from './services/contextService';
import { ToolRegistryService } from './services/toolRegistryService';
import { ToolExecutionService } from './services/toolExecutionService';
import { db } from './db/database';
import { isSupabaseConfigured } from './db/supabase';
import { 
  requireAuth, 
  requireSuperAdmin, 
  requireOrganization, 
  requireRole, 
  extractToken, 
  AuthenticatedRequest 
} from './middleware/auth';

export const app = express();

const param = (p: string | string[]): string => (Array.isArray(p) ? p[0] : p);

app.use(cors({
  origin: true,
  credentials: true
}));
app.use(cookieParser());
// Safely handle pre-parsed bodies on Vercel while supporting express.json() locally
app.use((req, res, next) => {
  if (typeof req.body === 'string') {
    try {
      req.body = JSON.parse(req.body);
    } catch {}
    return next();
  }
  if (req.body !== undefined && typeof req.body === 'object') {
    return next();
  }
  express.json()(req, res, next);
});

// Normalize URL: ensure /api prefix is present when invoked via serverless rewrite
app.use((req, res, next) => {
  if (req.url && !req.url.startsWith('/api') && req.url !== '/') {
    req.url = '/api' + req.url;
  }
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'Matias Studio OS API',
    database_provider: isSupabaseConfigured() ? 'Supabase PostgreSQL' : 'Local Persistence Engine',
    supabase_connected: isSupabaseConfigured(),
    timestamp: new Date().toISOString() 
  });
});

// ==========================================
// 1. AUTHENTICATION ROUTES
// ==========================================
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = AuthService.login(email, password);

    // Set secure HTTP-only cookie
    res.cookie('session_token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 86400000
    });

    const userOrgs = OrganizationService.getUserOrganizations(result.user.id);

    res.json({
      ...result,
      user_organizations: userOrgs
    });
  } catch (err: any) {
    res.status(401).json({ error: err.message });
  }
});

app.get('/api/auth/me', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const ctx = req.auth!;
    const userOrgs = OrganizationService.getUserOrganizations(ctx.user.id);
    res.json({
      user: ctx.user,
      organization: ctx.organization,
      role: ctx.role,
      user_organizations: userOrgs
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/switch-org', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const token = extractToken(req)!;
    const { organization_id } = req.body;
    if (!organization_id) {
      return res.status(400).json({ error: 'organization_id is required' });
    }

    const updatedCtx = AuthService.switchOrganization(token, organization_id);
    const userOrgs = OrganizationService.getUserOrganizations(updatedCtx.user.id);

    res.json({
      user: updatedCtx.user,
      organization: updatedCtx.organization,
      role: updatedCtx.role,
      user_organizations: userOrgs
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/auth/logout', (req, res) => {
  const token = extractToken(req);
  if (token) {
    AuthService.logout(token);
  }
  res.clearCookie('session_token');
  res.json({ status: 'ok', message: 'Logged out successfully' });
});

// ==========================================
// 2. SUPER ADMIN ROUTES (/api/admin/*)
// ==========================================
app.get('/api/admin/overview', requireAuth, requireSuperAdmin, (req, res) => {
  try {
    const orgs = OrganizationService.getAllOrganizations();
    const users = UserService.getAllUsers();
    const activities = ActivityService.getActivities(undefined, undefined, 20);

    const activeOrgs = orgs.filter(o => o.status === 'active').length;
    const suspendedOrgs = orgs.filter(o => o.status === 'suspended').length;
    const activeUsers = users.filter(u => u.status === 'active').length;

    res.json({
      total_organizations: orgs.length,
      active_organizations: activeOrgs,
      suspended_organizations: suspendedOrgs,
      total_users: users.length,
      active_users: activeUsers,
      recent_activities: activities
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/organizations', requireAuth, requireSuperAdmin, (req, res) => {
  try {
    const orgs = OrganizationService.getAllOrganizations();
    res.json(orgs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/organizations', requireAuth, requireSuperAdmin, (req: AuthenticatedRequest, res) => {
  try {
    const { name, slug, plan } = req.body;
    const created = OrganizationService.createOrganization({
      name,
      slug,
      plan,
      creator_user_id: req.auth!.user.id,
      actor_name: req.auth!.user.name
    });
    res.status(201).json(created);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.patch('/api/admin/organizations/:id/status', requireAuth, requireSuperAdmin, (req: AuthenticatedRequest, res) => {
  try {
    const { status } = req.body;
    const updated = OrganizationService.setOrganizationStatus(param(req.params.id), status, req.auth!.user.name);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/admin/users', requireAuth, requireSuperAdmin, (req, res) => {
  try {
    const users = UserService.getAllUsers();
    res.json(users);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/users', requireAuth, requireSuperAdmin, (req: AuthenticatedRequest, res) => {
  try {
    const { name, email, password, platform_role } = req.body;
    const user = UserService.createUser({
      name,
      email,
      password,
      platform_role,
      actor_name: req.auth!.user.name
    });
    res.status(201).json(user);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.patch('/api/admin/users/:id/status', requireAuth, requireSuperAdmin, (req: AuthenticatedRequest, res) => {
  try {
    const { status } = req.body;
    const updated = UserService.setUserStatus(param(req.params.id), status, req.auth!.user.name);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.patch('/api/admin/users/:id/role', requireAuth, requireSuperAdmin, (req: AuthenticatedRequest, res) => {
  try {
    const { platform_role } = req.body;
    const updated = UserService.setUserPlatformRole(param(req.params.id), platform_role, req.auth!.user.name);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/admin/activities', requireAuth, requireSuperAdmin, (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
    const activities = ActivityService.getActivities(undefined, undefined, limit);
    res.json(activities);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/flags', requireAuth, requireSuperAdmin, (req, res) => {
  try {
    const flags = db.get('feature_flags');
    res.json(flags);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 3. ORGANIZATION SETTINGS & MEMBERS (/api/organization/*)
// ==========================================
app.get('/api/organization/members', requireAuth, requireOrganization, (req: AuthenticatedRequest, res) => {
  try {
    const orgId = req.auth!.organization!.id;
    const members = OrganizationService.getOrganizationMembers(orgId);
    res.json(members);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/organization/invitations', requireAuth, requireOrganization, requireRole('ADMIN'), (req: AuthenticatedRequest, res) => {
  try {
    const orgId = req.auth!.organization!.id;
    const { email, role } = req.body;
    const invitation = OrganizationService.inviteMember({
      organization_id: orgId,
      email,
      role,
      invited_by_user_id: req.auth!.user.id,
      actor_name: req.auth!.user.name
    });
    res.status(201).json(invitation);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/organization/invitations', requireAuth, requireOrganization, (req: AuthenticatedRequest, res) => {
  try {
    const orgId = req.auth!.organization!.id;
    const invitations = OrganizationService.getInvitations(orgId);
    res.json(invitations);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/organization/members/:id/role', requireAuth, requireOrganization, requireRole('OWNER'), (req: AuthenticatedRequest, res) => {
  try {
    const orgId = req.auth!.organization!.id;
    const { role } = req.body;
    const updated = OrganizationService.updateMemberRole(orgId, param(req.params.id), role, req.auth!.user.name);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/organization/members/:id', requireAuth, requireOrganization, requireRole('ADMIN'), (req: AuthenticatedRequest, res) => {
  try {
    const orgId = req.auth!.organization!.id;
    const success = OrganizationService.removeMember(orgId, param(req.params.id), req.auth!.user.name);
    res.json({ success });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ==========================================
// 4. TENANT-SCOPED CLIENTS
// ==========================================
app.get('/api/clients', requireAuth, requireOrganization, (req: AuthenticatedRequest, res) => {
  try {
    const orgId = req.auth!.organization!.id;
    const clients = ClientService.getAllClients(orgId);
    res.json(clients);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/clients', requireAuth, requireOrganization, requireRole('MEMBER'), (req: AuthenticatedRequest, res) => {
  try {
    const orgId = req.auth!.organization!.id;
    const client = ClientService.createClient(orgId, req.body, req.auth!.user.name);
    res.status(201).json(client);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/clients/:clientId', requireAuth, requireOrganization, (req: AuthenticatedRequest, res) => {
  try {
    const orgId = req.auth!.organization!.id;
    const client = ClientService.getClientById(orgId, param(req.params.clientId));
    if (!client) {
      return res.status(404).json({ error: 'Client not found in this organization' });
    }
    const contacts = ClientService.getContacts(orgId, param(req.params.clientId));
    res.json({ ...client, contacts });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/clients/:clientId', requireAuth, requireOrganization, requireRole('MEMBER'), (req: AuthenticatedRequest, res) => {
  try {
    const orgId = req.auth!.organization!.id;
    const client = ClientService.updateClient(orgId, param(req.params.clientId), req.body, req.auth!.user.name);
    res.json(client);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Client Context for AI Agent Orchestration
app.get('/api/clients/:clientId/context', requireAuth, requireOrganization, (req: AuthenticatedRequest, res) => {
  try {
    const orgId = req.auth!.organization!.id;
    const projectId = req.query.projectId as string | undefined;
    const context = ContextService.getClientContext(orgId, param(req.params.clientId), projectId);
    res.json(context);
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
});

// ==========================================
// 5. TENANT-SCOPED PROJECTS
// ==========================================
app.get('/api/projects', requireAuth, requireOrganization, (req: AuthenticatedRequest, res) => {
  try {
    const orgId = req.auth!.organization!.id;
    const clientId = req.query.clientId as string | undefined;
    const projects = ProjectService.getProjects(orgId, clientId);
    res.json(projects);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/projects/:projectId', requireAuth, requireOrganization, (req: AuthenticatedRequest, res) => {
  try {
    const orgId = req.auth!.organization!.id;
    const project = ProjectService.getProjectById(orgId, param(req.params.projectId));
    if (!project) return res.status(404).json({ error: 'Project not found in this organization' });
    res.json(project);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/projects', requireAuth, requireOrganization, requireRole('MEMBER'), (req: AuthenticatedRequest, res) => {
  try {
    const orgId = req.auth!.organization!.id;
    const project = ProjectService.createProject(orgId, { ...req.body, actor_id: req.auth!.user.name });
    res.status(201).json(project);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.patch('/api/projects/:projectId', requireAuth, requireOrganization, requireRole('MEMBER'), (req: AuthenticatedRequest, res) => {
  try {
    const orgId = req.auth!.organization!.id;
    const project = ProjectService.updateProject(orgId, param(req.params.projectId), req.body, req.auth!.user.name);
    res.json(project);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ==========================================
// 6. TENANT-SCOPED TASKS
// ==========================================
app.get('/api/tasks', requireAuth, requireOrganization, (req: AuthenticatedRequest, res) => {
  try {
    const orgId = req.auth!.organization!.id;
    const clientId = req.query.clientId as string | undefined;
    const projectId = req.query.projectId as string | undefined;
    const tasks = TaskService.getTasks(orgId, clientId, projectId);
    res.json(tasks);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/tasks', requireAuth, requireOrganization, requireRole('MEMBER'), (req: AuthenticatedRequest, res) => {
  try {
    const orgId = req.auth!.organization!.id;
    const task = TaskService.createTask(orgId, { ...req.body, actor_id: req.auth!.user.name });
    res.status(201).json(task);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.patch('/api/tasks/:taskId', requireAuth, requireOrganization, requireRole('MEMBER'), (req: AuthenticatedRequest, res) => {
  try {
    const orgId = req.auth!.organization!.id;
    const task = TaskService.updateTask(orgId, param(req.params.taskId), req.body, req.auth!.user.name);
    res.json(task);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ==========================================
// 7. TENANT-SCOPED MEMORY ENGINE
// ==========================================
app.get('/api/memories', requireAuth, requireOrganization, (req: AuthenticatedRequest, res) => {
  try {
    const orgId = req.auth!.organization!.id;
    const clientId = req.query.clientId as string;
    if (!clientId) {
      return res.status(400).json({ error: 'clientId query parameter is required. Global memory access prohibited.' });
    }
    const query = req.query.q as string | undefined;
    const category = req.query.category as any;

    if (query) {
      const results = MemoryService.searchMemory(orgId, clientId, query, category);
      return res.json(results);
    }

    const memories = MemoryService.getClientMemory(orgId, clientId, category);
    res.json(memories);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/memories', requireAuth, requireOrganization, requireRole('MEMBER'), (req: AuthenticatedRequest, res) => {
  try {
    const orgId = req.auth!.organization!.id;
    const memory = MemoryService.createMemory(orgId, { ...req.body, actor_id: req.auth!.user.name });
    res.status(201).json(memory);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.patch('/api/memories/:memoryId', requireAuth, requireOrganization, requireRole('MEMBER'), (req: AuthenticatedRequest, res) => {
  try {
    const orgId = req.auth!.organization!.id;
    const allowOfficial = Boolean(req.body.allowOfficialOverwrite);
    const memory = MemoryService.updateMemory(orgId, param(req.params.memoryId), req.body, req.auth!.user.name, allowOfficial);
    res.json(memory);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/memories/:memoryId/approve', requireAuth, requireOrganization, requireRole('ADMIN'), (req: AuthenticatedRequest, res) => {
  try {
    const orgId = req.auth!.organization!.id;
    const approved = MemoryService.approveMemory(orgId, param(req.params.memoryId), req.auth!.user.name);
    res.json(approved);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/memories/:memoryId/archive', requireAuth, requireOrganization, requireRole('ADMIN'), (req: AuthenticatedRequest, res) => {
  try {
    const orgId = req.auth!.organization!.id;
    const success = MemoryService.archiveMemory(orgId, param(req.params.memoryId), req.auth!.user.name);
    res.json({ success });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ==========================================
// 8. TENANT-SCOPED DOCUMENTS
// ==========================================
app.get('/api/documents', requireAuth, requireOrganization, (req: AuthenticatedRequest, res) => {
  try {
    const orgId = req.auth!.organization!.id;
    const clientId = req.query.clientId as string | undefined;
    const category = req.query.category as any;
    const docs = DocumentService.getDocuments(orgId, clientId, category);
    res.json(docs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/documents', requireAuth, requireOrganization, requireRole('MEMBER'), (req: AuthenticatedRequest, res) => {
  try {
    const orgId = req.auth!.organization!.id;
    const doc = DocumentService.uploadDocument(orgId, { ...req.body, uploaded_by: req.auth!.user.name });
    res.status(201).json(doc);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ==========================================
// 9. TENANT-SCOPED PERMISSIONS & ACTIVITIES
// ==========================================
app.get('/api/permissions/:clientId', requireAuth, requireOrganization, (req: AuthenticatedRequest, res) => {
  try {
    const orgId = req.auth!.organization!.id;
    const perms = PermissionService.getPermissions(orgId, param(req.params.clientId));
    res.json(perms);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/permissions/:clientId', requireAuth, requireOrganization, requireRole('ADMIN'), (req: AuthenticatedRequest, res) => {
  try {
    const orgId = req.auth!.organization!.id;
    const perms = PermissionService.updatePermissions(orgId, param(req.params.clientId), req.body, req.auth!.user.name);
    res.json(perms);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/activities', requireAuth, requireOrganization, (req: AuthenticatedRequest, res) => {
  try {
    const orgId = req.auth!.organization!.id;
    const clientId = req.query.clientId as string | undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    const activities = ActivityService.getActivities(orgId, clientId, limit);
    res.json(activities);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 10. TOOL REGISTRY & EXECUTION GATEWAY
// ==========================================
app.get('/api/tools', requireAuth, requireOrganization, (req: AuthenticatedRequest, res) => {
  try {
    const tools = ToolRegistryService.listTools();
    res.json(tools);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/tools/execute', requireAuth, requireOrganization, async (req: AuthenticatedRequest, res) => {
  try {
    const orgId = req.auth!.organization!.id;
    const userId = req.auth!.user.id;
    const { 
      toolId, 
      clientId, 
      projectId, 
      agentId, 
      input = {}, 
      idempotencyKey, 
      approvalId,
      source = 'api'
    } = req.body;

    if (!toolId) {
      return res.status(400).json({
        success: false,
        errorCode: 'INVALID_INPUT',
        message: 'toolId is required'
      });
    }

    const result = await ToolExecutionService.executeTool({
      toolId,
      organizationId: orgId,
      userId,
      agentId,
      clientId,
      projectId,
      input,
      source,
      idempotencyKey,
      approvalId
    });

    const statusCode = result.success ? (result.status === 'waiting_approval' ? 202 : 200) : 400;
    res.status(statusCode).json(result);
  } catch (err: any) {
    res.status(500).json({
      success: false,
      errorCode: 'EXECUTION_FAILED',
      message: err.message
    });
  }
});

// ==========================================
// 11. AGENT ORCHESTRATION & BOUNDARIES
// ==========================================
app.get('/api/agents', requireAuth, requireOrganization, (req: AuthenticatedRequest, res) => {
  try {
    const orgId = req.auth!.organization!.id;
    const allTools = ToolRegistryService.listTools();
    const agents = (db.get('agents') || []).filter(a => a.organization_id === orgId);
    const agentTools = (db.get('agent_tools') || []).filter(at => at.organization_id === orgId);
    const agentPerms = (db.get('agent_permissions') || []).filter(ap => ap.organization_id === orgId);
    const executions = (db.get('tool_executions') || []).filter(e => e.organization_id === orgId);

    const detailedAgents = agents.map(agent => {
      const allowedToolIds = agentTools
        .filter(at => at.agent_id === agent.id && at.enabled)
        .map(at => at.tool_id);
      
      const allowedTools = allTools.filter(t => allowedToolIds.includes(t.id));
      const blockedTools = allTools.filter(t => !allowedToolIds.includes(t.id));
      const permissions = agentPerms
        .filter(ap => ap.agent_id === agent.id && ap.enabled)
        .map(ap => ap.permission);

      const agentExecutions = executions.filter(e => e.agent_id === agent.id);
      const recentFailures = agentExecutions.filter(e => e.status === 'failed').slice(0, 5);
      const recentExecutions = agentExecutions.slice(0, 5);

      return {
        ...agent,
        allowedTools,
        blockedTools,
        permissions,
        totalExecutions: agentExecutions.length,
        recentExecutions,
        recentFailures
      };
    });

    res.json(detailedAgents);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/agents/:id/tools', requireAuth, requireOrganization, requireRole('ADMIN'), (req: AuthenticatedRequest, res) => {
  try {
    const orgId = req.auth!.organization!.id;
    const agentId = param(req.params.id);
    const { toolId, enabled } = req.body;

    if (!toolId || typeof enabled !== 'boolean') {
      return res.status(400).json({ error: 'toolId and enabled (boolean) are required' });
    }

    db.update('agent_tools', list => {
      const existing = (list || []).find(
        at => at.organization_id === orgId && at.agent_id === agentId && at.tool_id === toolId
      );
      if (existing) {
        existing.enabled = enabled;
        existing.updated_at = new Date().toISOString();
        return [...list];
      }
      const newRecord = {
        id: `at_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        organization_id: orgId,
        agent_id: agentId,
        tool_id: toolId,
        enabled,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      return [...(list || []), newRecord];
    });

    ActivityService.logActivity({
      organization_id: orgId,
      actor_type: 'user',
      actor_id: req.auth!.user.name,
      action: 'Agent tool access modified',
      entity_type: 'agent_tools',
      entity_id: agentId,
      result: `Tool "${toolId}" set to ${enabled ? 'ENABLED' : 'BLOCKED'} for agent "${agentId}".`
    });

    res.json({ success: true, agentId, toolId, enabled });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ==========================================
// 12. APPROVALS WORKFLOW
// ==========================================
app.get('/api/approvals', requireAuth, requireOrganization, (req: AuthenticatedRequest, res) => {
  try {
    const orgId = req.auth!.organization!.id;
    const status = req.query.status as string | undefined;
    let approvals = (db.get('approvals') || []).filter(a => a.organization_id === orgId);

    // Auto-expire approvals past expires_at
    const now = new Date();
    approvals.forEach(a => {
      if (a.status === 'pending' && new Date(a.expires_at) < now) {
        a.status = 'expired';
        a.updated_at = now.toISOString();
      }
    });

    if (status) {
      approvals = approvals.filter(a => a.status === status);
    }

    // Sort newest first
    approvals.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    res.json(approvals);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/approvals/:id/approve', requireAuth, requireOrganization, requireRole('ADMIN'), async (req: AuthenticatedRequest, res) => {
  try {
    const orgId = req.auth!.organization!.id;
    const approvalId = param(req.params.id);
    const { editedInput } = req.body;

    const approvals = db.get('approvals') || [];
    const approval = approvals.find(a => a.id === approvalId && a.organization_id === orgId);

    if (!approval) {
      return res.status(404).json({ error: 'Approval request not found.' });
    }

    if (approval.status !== 'pending') {
      return res.status(400).json({ error: `Cannot approve item with status "${approval.status}".` });
    }

    if (new Date(approval.expires_at) < new Date()) {
      approval.status = 'expired';
      db.update('approvals', list => list.map(a => a.id === approval.id ? approval : a));
      return res.status(400).json({ 
        success: false, 
        errorCode: 'APPROVAL_EXPIRED', 
        message: 'This approval has expired.' 
      });
    }

    // Update approval with edited input if provided
    if (editedInput) {
      approval.approved_input = editedInput;
    } else {
      approval.approved_input = approval.original_input;
    }
    approval.status = 'approved';
    approval.reviewed_by = req.auth!.user.name;
    approval.reviewed_at = new Date().toISOString();
    approval.updated_at = new Date().toISOString();

    db.update('approvals', list => list.map(a => a.id === approval.id ? approval : a));

    ActivityService.logActivity({
      organization_id: orgId,
      client_id: approval.client_id,
      project_id: approval.project_id,
      actor_type: 'user',
      actor_id: req.auth!.user.name,
      action: 'TOOL_APPROVED',
      entity_type: 'approval',
      entity_id: approval.id,
      result: `Approved action for tool "${approval.tool_id}"`
    });

    // Execute the approved action immediately
    const executionResult = await ToolExecutionService.executeTool({
      toolId: approval.tool_id,
      organizationId: orgId,
      userId: req.auth!.user.id,
      clientId: approval.client_id,
      projectId: approval.project_id,
      input: approval.approved_input || approval.original_input || {},
      approvalId: approval.id
    });

    const finalApproval = (db.get('approvals') || []).find(a => a.id === approval.id) || approval;

    res.json({
      approval: finalApproval,
      execution: executionResult
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/approvals/:id/reject', requireAuth, requireOrganization, requireRole('ADMIN'), (req: AuthenticatedRequest, res) => {
  try {
    const orgId = req.auth!.organization!.id;
    const approvalId = param(req.params.id);
    const { reason = 'Rejected by studio operator' } = req.body;

    const approvals = db.get('approvals') || [];
    const approval = approvals.find(a => a.id === approvalId && a.organization_id === orgId);

    if (!approval) {
      return res.status(404).json({ error: 'Approval request not found.' });
    }

    if (approval.status !== 'pending') {
      return res.status(400).json({ error: `Cannot reject item with status "${approval.status}".` });
    }

    approval.status = 'rejected';
    approval.reviewed_by = req.auth!.user.name;
    approval.reviewed_at = new Date().toISOString();
    approval.updated_at = new Date().toISOString();

    db.update('approvals', list => list.map(a => a.id === approval.id ? approval : a));

    ActivityService.logActivity({
      organization_id: orgId,
      client_id: approval.client_id,
      project_id: approval.project_id,
      actor_type: 'user',
      actor_id: req.auth!.user.name,
      action: 'TOOL_REJECTED',
      entity_type: 'approval',
      entity_id: approval.id,
      result: `Rejected execution for tool "${approval.tool_id}": ${reason}`
    });

    res.json({ success: true, approval });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 13. TOOL EXECUTIONS TELEMETRY & LOGS
// ==========================================
app.get('/api/tool-executions', requireAuth, requireOrganization, (req: AuthenticatedRequest, res) => {
  try {
    const orgId = req.auth!.organization!.id;
    const agentId = req.query.agentId as string | undefined;
    const toolId = req.query.toolId as string | undefined;
    const status = req.query.status as any;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;

    let list = (db.get('tool_executions') || []).filter(e => e.organization_id === orgId);

    if (agentId) list = list.filter(e => e.agent_id === agentId);
    if (toolId) list = list.filter(e => e.tool_id === toolId);
    if (status) list = list.filter(e => e.status === status);

    list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    res.json(list.slice(0, limit));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 14. AI GOVERNANCE POLICIES
// ==========================================
app.get('/api/governance', requireAuth, requireOrganization, (req: AuthenticatedRequest, res) => {
  try {
    const orgId = req.auth!.organization!.id;
    const policies = db.get('governance_policies') || [];
    const policy = policies.find(p => p.organization_id === orgId) || {
      id: `gov_${orgId}`,
      organization_id: orgId,
      official_truth_gate: true,
      external_communication_gate: true,
      design_publishing_gate: true,
      commercial_budget_enforcement: true,
      updated_at: new Date().toISOString()
    };
    res.json(policy);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/governance', requireAuth, requireOrganization, requireRole('ADMIN'), (req: AuthenticatedRequest, res) => {
  try {
    const orgId = req.auth!.organization!.id;
    const { 
      official_truth_gate, 
      external_communication_gate, 
      design_publishing_gate, 
      commercial_budget_enforcement 
    } = req.body;

    let updatedPolicy: any;

    db.update('governance_policies', list => {
      const existingIdx = (list || []).findIndex(p => p.organization_id === orgId);
      if (existingIdx >= 0) {
        list[existingIdx] = {
          ...list[existingIdx],
          ...(official_truth_gate !== undefined && { official_truth_gate: Boolean(official_truth_gate) }),
          ...(external_communication_gate !== undefined && { external_communication_gate: Boolean(external_communication_gate) }),
          ...(design_publishing_gate !== undefined && { design_publishing_gate: Boolean(design_publishing_gate) }),
          ...(commercial_budget_enforcement !== undefined && { commercial_budget_enforcement: Boolean(commercial_budget_enforcement) }),
          updated_at: new Date().toISOString()
        };
        updatedPolicy = list[existingIdx];
        return [...list];
      } else {
        const newPolicy = {
          id: `gov_${orgId}`,
          organization_id: orgId,
          official_truth_gate: official_truth_gate !== undefined ? Boolean(official_truth_gate) : true,
          external_communication_gate: external_communication_gate !== undefined ? Boolean(external_communication_gate) : true,
          design_publishing_gate: design_publishing_gate !== undefined ? Boolean(design_publishing_gate) : true,
          commercial_budget_enforcement: commercial_budget_enforcement !== undefined ? Boolean(commercial_budget_enforcement) : true,
          updated_at: new Date().toISOString()
        };
        updatedPolicy = newPolicy;
        return [...(list || []), newPolicy];
      }
    });

    ActivityService.logActivity({
      organization_id: orgId,
      actor_type: 'user',
      actor_id: req.auth!.user.name,
      action: 'AI Governance policy modified',
      entity_type: 'governance_policies',
      entity_id: orgId,
      result: 'Updated organization AI governance gates'
    });

    res.json(updatedPolicy);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Development test helper
app.post('/api/seed/reset', (req, res) => {
  try {
    db.resetToSeed();
    res.json({ status: 'ok', message: 'Database reset to development seed with multi-tenant accounts' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
