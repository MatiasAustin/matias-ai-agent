import fs from 'fs';
import path from 'path';
import { DatabaseSchema } from './types';
import { initialDevelopmentSeed } from './seed';
import { 
  isSupabaseConfigured, 
  loadFromSupabase, 
  bulkUpsertToSupabase 
} from './supabase';

class Database {
  private dbPath: string;
  private memoryCache: DatabaseSchema | null = null;
  private supabaseSyncInProgress: boolean = false;

  constructor() {
    const isServerless = process.env.VERCEL === '1' || process.env.AWS_LAMBDA_FUNCTION_NAME !== undefined;
    if (isServerless) {
      this.dbPath = path.join('/tmp', 'matias_studio_db.json');
      if (!fs.existsSync(this.dbPath)) {
        try {
          const repoDbPath = path.resolve(process.cwd(), 'data', 'db.json');
          if (fs.existsSync(repoDbPath)) {
            fs.copyFileSync(repoDbPath, this.dbPath);
          }
        } catch (e) {
          console.warn('Failed to copy initial data/db.json to /tmp:', e);
        }
      }
    } else {
      const dataDir = path.resolve(process.cwd(), 'data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      this.dbPath = path.join(dataDir, 'db.json');
    }

    this.init();

    // Trigger Supabase sync if credentials are configured
    if (isSupabaseConfigured()) {
      this.syncFromSupabase().catch(err => {
        console.warn('Supabase initial sync notification:', err);
      });
    }
  }

  private init(): void {
    try {
      if (fs.existsSync(this.dbPath)) {
        const raw = fs.readFileSync(this.dbPath, 'utf-8');
        const parsed = JSON.parse(raw);
        this.memoryCache = this.migrate(parsed);
      } else {
        this.memoryCache = JSON.parse(JSON.stringify(initialDevelopmentSeed));
        this.persist();
      }
    } catch (err) {
      console.error('Failed to load database file, falling back to seed in memory:', err);
      this.memoryCache = JSON.parse(JSON.stringify(initialDevelopmentSeed));
    }
  }

  /**
   * Syncs latest data from Supabase PostgreSQL tables into the in-memory cache
   */
  public async syncFromSupabase(): Promise<void> {
    if (!isSupabaseConfigured() || this.supabaseSyncInProgress) return;
    this.supabaseSyncInProgress = true;

    try {
      const data = await loadFromSupabase();
      if (data && this.memoryCache) {
        let changed = false;
        (Object.keys(data) as (keyof DatabaseSchema)[]).forEach((tbl) => {
          if (data[tbl] && Array.isArray(data[tbl]) && (data[tbl] as any[]).length > 0) {
            (this.memoryCache as any)[tbl] = data[tbl];
            changed = true;
          }
        });
        if (changed) {
          this.persist();
        }
      }
    } catch (err) {
      console.warn('Sync from Supabase failed:', err);
    } finally {
      this.supabaseSyncInProgress = false;
    }
  }

  /**
   * Safe non-destructive database migration ensuring all tables and organization_id exist.
   */
  private migrate(existing: any): DatabaseSchema {
    const schema: DatabaseSchema = {
      users: existing.users || initialDevelopmentSeed.users,
      organizations: existing.organizations || initialDevelopmentSeed.organizations,
      organization_members: existing.organization_members || initialDevelopmentSeed.organization_members,
      sessions: existing.sessions || [],
      invitations: existing.invitations || [],
      feature_flags: existing.feature_flags || initialDevelopmentSeed.feature_flags,
      clients: existing.clients || [],
      contacts: existing.contacts || [],
      projects: existing.projects || [],
      tasks: existing.tasks || [],
      client_memory: existing.client_memory || [],
      documents: existing.documents || [],
      client_permissions: existing.client_permissions || [],
      activities: existing.activities || []
    };

    const defaultOrgId = schema.organizations[0]?.id || 'org_matias_studio';

    // Ensure all organization-scoped records have organization_id
    schema.clients.forEach(c => {
      if (!c.organization_id) c.organization_id = defaultOrgId;
    });
    schema.contacts.forEach(c => {
      if (!c.organization_id) c.organization_id = defaultOrgId;
    });
    schema.projects.forEach(p => {
      if (!p.organization_id) p.organization_id = defaultOrgId;
    });
    schema.tasks.forEach(t => {
      if (!t.organization_id) t.organization_id = defaultOrgId;
    });
    schema.client_memory.forEach(m => {
      if (!m.organization_id) m.organization_id = defaultOrgId;
    });
    schema.documents.forEach(d => {
      if (!d.organization_id) d.organization_id = defaultOrgId;
    });
    schema.client_permissions.forEach(p => {
      if (!p.organization_id) p.organization_id = defaultOrgId;
    });
    schema.activities.forEach(a => {
      if (!a.organization_id) a.organization_id = defaultOrgId;
    });

    // If users table was empty or missing admin
    if (!schema.users || schema.users.length === 0) {
      schema.users = initialDevelopmentSeed.users;
    }
    if (!schema.organizations || schema.organizations.length === 0) {
      schema.organizations = initialDevelopmentSeed.organizations;
    }
    if (!schema.organization_members || schema.organization_members.length === 0) {
      schema.organization_members = initialDevelopmentSeed.organization_members;
    }

    this.memoryCache = schema;
    this.persist();
    return schema;
  }

  public persist(): void {
    if (!this.memoryCache) return;
    try {
      const serialized = JSON.stringify(this.memoryCache, null, 2);
      fs.writeFileSync(this.dbPath, serialized, 'utf-8');
    } catch (err) {
      console.warn('Persistence to filesystem failed:', err);
    }
  }

  public get<K extends keyof DatabaseSchema>(table: K): DatabaseSchema[K] {
    if (!this.memoryCache) this.init();
    return this.memoryCache![table];
  }

  public update<K extends keyof DatabaseSchema>(
    table: K, 
    updater: (current: DatabaseSchema[K]) => DatabaseSchema[K]
  ): DatabaseSchema[K] {
    if (!this.memoryCache) this.init();
    const updated = updater(this.memoryCache![table]);
    this.memoryCache![table] = updated;
    this.persist();

    // Persist to Supabase if configured
    if (isSupabaseConfigured() && Array.isArray(updated)) {
      bulkUpsertToSupabase(table, updated).catch(err => {
        console.warn(`Background sync to Supabase table "${table}" failed:`, err);
      });
    }

    return updated;
  }

  public getFullSchema(): DatabaseSchema {
    if (!this.memoryCache) this.init();
    return JSON.parse(JSON.stringify(this.memoryCache!));
  }

  public resetToSeed(): void {
    this.memoryCache = JSON.parse(JSON.stringify(initialDevelopmentSeed));
    this.persist();
    if (isSupabaseConfigured() && this.memoryCache) {
      (Object.keys(initialDevelopmentSeed) as (keyof DatabaseSchema)[]).forEach(tbl => {
        const records = (this.memoryCache as any)[tbl];
        if (Array.isArray(records) && records.length > 0) {
          bulkUpsertToSupabase(tbl, records).catch(() => {});
        }
      });
    }
  }
}

export const db = new Database();
