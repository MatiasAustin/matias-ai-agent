import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { ClientService } from './services/clientService';
import { ProjectService } from './services/projectService';
import { TaskService } from './services/taskService';
import { MemoryService } from './services/memoryService';
import { DocumentService } from './services/documentService';
import { ActivityService } from './services/activityService';
import { PermissionService } from './services/permissionService';
import { ContextService } from './services/contextService';
import { db } from './db/database';

export const app = express();

app.use(cors());
app.use(express.json());

// Authentication & Studio Authorization Middleware
const requireStudioAuth = (req: Request, res: Response, next: NextFunction) => {
  // In studio runtime, authenticated session is Matias Austin
  const actor = req.headers['x-actor-id'] as string || 'Matias';
  (req as any).actor = actor;
  next();
};

app.use(requireStudioAuth);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Matias Studio OS API', timestamp: new Date().toISOString() });
});

// ==========================================
// 1. CLIENTS
// ==========================================
app.get('/api/clients', (req, res) => {
  try {
    const clients = ClientService.getAllClients();
    res.json(clients);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/clients', (req, res) => {
  try {
    const actor = (req as any).actor || 'Matias';
    const client = ClientService.createClient(req.body, actor);
    res.status(201).json(client);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/clients/:clientId', (req, res) => {
  try {
    const client = ClientService.getClientById(req.params.clientId);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    const contacts = ClientService.getContacts(req.params.clientId);
    res.json({ ...client, contacts });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/clients/:clientId', (req, res) => {
  try {
    const actor = (req as any).actor || 'Matias';
    const client = ClientService.updateClient(req.params.clientId, req.body, actor);
    res.json(client);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ==========================================
// 2. CLIENT CONTEXT (AI ORCHESTRATOR API)
// ==========================================
app.get('/api/clients/:clientId/context', (req, res) => {
  try {
    const projectId = req.query.projectId as string | undefined;
    const context = ContextService.getClientContext(req.params.clientId, projectId);
    res.json(context);
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
});

// ==========================================
// 3. PROJECTS
// ==========================================
app.get('/api/projects', (req, res) => {
  try {
    const clientId = req.query.clientId as string | undefined;
    const projects = ProjectService.getProjects(clientId);
    res.json(projects);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/projects/:projectId', (req, res) => {
  try {
    const project = ProjectService.getProjectById(req.params.projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/projects', (req, res) => {
  try {
    const actor = (req as any).actor || 'Matias';
    const project = ProjectService.createProject({ ...req.body, actor_id: actor });
    res.status(201).json(project);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.patch('/api/projects/:projectId', (req, res) => {
  try {
    const actor = (req as any).actor || 'Matias';
    const project = ProjectService.updateProject(req.params.projectId, req.body, actor);
    res.json(project);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ==========================================
// 4. TASKS
// ==========================================
app.get('/api/tasks', (req, res) => {
  try {
    const clientId = req.query.clientId as string | undefined;
    const projectId = req.query.projectId as string | undefined;
    const tasks = TaskService.getTasks(clientId, projectId);
    res.json(tasks);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/tasks', (req, res) => {
  try {
    const actor = (req as any).actor || 'Matias';
    const task = TaskService.createTask({ ...req.body, actor_id: actor });
    res.status(201).json(task);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.patch('/api/tasks/:taskId', (req, res) => {
  try {
    const actor = (req as any).actor || 'Matias';
    const task = TaskService.updateTask(req.params.taskId, req.body, actor);
    res.json(task);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ==========================================
// 5. CLIENT MEMORY ENGINE
// ==========================================
app.get('/api/memories', (req, res) => {
  try {
    const clientId = req.query.clientId as string;
    if (!clientId) {
      return res.status(400).json({ error: 'clientId query parameter is required. Global memory access prohibited.' });
    }
    const query = req.query.q as string | undefined;
    const category = req.query.category as any;

    if (query) {
      const results = MemoryService.searchMemory(clientId, query, category);
      return res.json(results);
    }

    const memories = MemoryService.getClientMemory(clientId, category);
    res.json(memories);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/memories', (req, res) => {
  try {
    const actor = (req as any).actor || 'Matias';
    const memory = MemoryService.createMemory({ ...req.body, actor_id: actor });
    res.status(201).json(memory);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.patch('/api/memories/:memoryId', (req, res) => {
  try {
    const actor = (req as any).actor || 'Matias';
    const allowOfficial = Boolean(req.body.allowOfficialOverwrite);
    const memory = MemoryService.updateMemory(req.params.memoryId, req.body, actor, allowOfficial);
    res.json(memory);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/memories/:memoryId/approve', (req, res) => {
  try {
    const actor = (req as any).actor || 'Matias';
    const approved = MemoryService.approveMemory(req.params.memoryId, actor);
    res.json(approved);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/memories/:memoryId/archive', (req, res) => {
  try {
    const actor = (req as any).actor || 'Matias';
    const success = MemoryService.archiveMemory(req.params.memoryId, actor);
    res.json({ success });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ==========================================
// 6. DOCUMENTS
// ==========================================
app.get('/api/documents', (req, res) => {
  try {
    const clientId = req.query.clientId as string | undefined;
    const category = req.query.category as any;
    const docs = DocumentService.getDocuments(clientId, category);
    res.json(docs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/documents', (req, res) => {
  try {
    const actor = (req as any).actor || 'Matias';
    const doc = DocumentService.uploadDocument({ ...req.body, uploaded_by: actor });
    res.status(201).json(doc);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ==========================================
// 7. AI PERMISSIONS
// ==========================================
app.get('/api/permissions/:clientId', (req, res) => {
  try {
    const perms = PermissionService.getPermissions(req.params.clientId);
    res.json(perms);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/permissions/:clientId', (req, res) => {
  try {
    const actor = (req as any).actor || 'Matias';
    const perms = PermissionService.updatePermissions(req.params.clientId, req.body, actor);
    res.json(perms);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ==========================================
// 8. ACTIVITIES
// ==========================================
app.get('/api/activities', (req, res) => {
  try {
    const clientId = req.query.clientId as string | undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    const activities = ActivityService.getActivities(clientId, limit);
    res.json(activities);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Dev helper: reset to seed
app.post('/api/seed/reset', (req, res) => {
  try {
    db.resetToSeed();
    res.json({ status: 'ok', message: 'Database reset to development seed' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
