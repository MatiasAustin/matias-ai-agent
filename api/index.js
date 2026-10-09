// server/app.ts
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

// server/db/database.ts
import fs from "fs";
import path from "path";

// server/services/authSecurity.ts
import crypto from "crypto";
var AuthSecurity = class {
  /**
   * Hashes a password using crypto.scrypt with a cryptographically secure random salt.
   */
  static hashPassword(password) {
    const salt = crypto.randomBytes(16).toString("hex");
    const hash = crypto.scryptSync(password, salt, 64).toString("hex");
    return { hash, salt };
  }
  /**
   * Verifies a password against stored scrypt hash and salt with constant-time comparison.
   */
  static verifyPassword(password, hash, salt) {
    try {
      const derivedHash = crypto.scryptSync(password, salt, 64);
      const storedHash = Buffer.from(hash, "hex");
      if (derivedHash.length !== storedHash.length) {
        return false;
      }
      return crypto.timingSafeEqual(derivedHash, storedHash);
    } catch {
      return false;
    }
  }
  /**
   * Generates a 64-character secure hexadecimal session token.
   */
  static generateSessionToken() {
    return crypto.randomBytes(32).toString("hex");
  }
};

// server/db/seed.ts
var adminCreds = AuthSecurity.hashPassword(process.env.SUPER_ADMIN_PASSWORD || "Admin123!");
var ownerCreds = AuthSecurity.hashPassword(process.env.OWNER_PASSWORD || "Owner123!");
var memberCreds = AuthSecurity.hashPassword(process.env.MEMBER_PASSWORD || "Member123!");
var DEFAULT_ORG_ID = "org_matias_studio";
var initialDevelopmentSeed = {
  users: [
    {
      id: "user_admin",
      email: "admin@example.com",
      password_hash: adminCreds.hash,
      password_salt: adminCreds.salt,
      name: "System Super Admin",
      platform_role: "SUPER_ADMIN",
      status: "active",
      last_active_at: (/* @__PURE__ */ new Date()).toISOString(),
      created_at: new Date(Date.now() - 864e5 * 10).toISOString(),
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    },
    {
      id: "user_owner",
      email: "owner@example.com",
      password_hash: ownerCreds.hash,
      password_salt: ownerCreds.salt,
      name: "Matias Austin",
      platform_role: "USER",
      status: "active",
      last_active_at: (/* @__PURE__ */ new Date()).toISOString(),
      created_at: new Date(Date.now() - 864e5 * 5).toISOString(),
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    },
    {
      id: "user_member",
      email: "member@example.com",
      password_hash: memberCreds.hash,
      password_salt: memberCreds.salt,
      name: "Elena Rostova",
      platform_role: "USER",
      status: "active",
      last_active_at: (/* @__PURE__ */ new Date()).toISOString(),
      created_at: new Date(Date.now() - 864e5 * 2).toISOString(),
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    }
  ],
  organizations: [
    {
      id: DEFAULT_ORG_ID,
      name: "Matias Studio",
      slug: "matias-studio",
      status: "active",
      plan: "Studio",
      subscription_status: "active",
      created_at: new Date(Date.now() - 864e5 * 10).toISOString(),
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    }
  ],
  organization_members: [
    {
      id: "member_admin_studio",
      organization_id: DEFAULT_ORG_ID,
      user_id: "user_admin",
      role: "OWNER",
      created_at: new Date(Date.now() - 864e5 * 10).toISOString(),
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    },
    {
      id: "member_owner_studio",
      organization_id: DEFAULT_ORG_ID,
      user_id: "user_owner",
      role: "OWNER",
      created_at: new Date(Date.now() - 864e5 * 5).toISOString(),
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    },
    {
      id: "member_elena_studio",
      organization_id: DEFAULT_ORG_ID,
      user_id: "user_member",
      role: "MEMBER",
      created_at: new Date(Date.now() - 864e5 * 2).toISOString(),
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    }
  ],
  sessions: [],
  invitations: [],
  feature_flags: [
    {
      id: "flag_slack",
      organization_id: DEFAULT_ORG_ID,
      key: "slack_integration",
      enabled: false,
      description: "Client Slack workspace synchronization",
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    },
    {
      id: "flag_figma",
      organization_id: DEFAULT_ORG_ID,
      key: "figma_integration",
      enabled: false,
      description: "Figma token and vector layout pipeline",
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    },
    {
      id: "flag_browser",
      organization_id: DEFAULT_ORG_ID,
      key: "browser_agent",
      enabled: false,
      description: "Autonomous web research worker",
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    }
  ],
  clients: [
    {
      id: "demo-xyz-ai",
      organization_id: DEFAULT_ORG_ID,
      company_name: "Demo: XYZ Autonomous Systems",
      website: "https://demo-xyz.ai",
      industry: "Robotics & Autonomous Systems",
      company_size: "20-50",
      location: "Zurich / Remote",
      timezone: "Europe/Zurich (UTC+1)",
      company_description: "Pioneering tactile robotics interfaces and spatial AI perception systems.",
      status: "active",
      business_model: "B2B Enterprise Licensing & Hardware Subscriptions",
      target_audience: "Industrial design teams and aerospace robotics developers",
      primary_market: "Global (North America & Western Europe)",
      positioning: "Technical precision meets minimal aesthetic ergonomics",
      value_proposition: "Decoupling complex sensory telemetry into actionable spatial interactions",
      main_products: "XYZ Core Robotics OS, Spatial Sense Kit",
      competitors: "Boston Dynamics, Figure AI",
      business_goals: "Launch v2.0 spatial developer kit and establish studio brand guidelines",
      preferred_channel: "Slack (#xyz-studio-sync)",
      communication_tone: "Concise, direct, peer-to-peer technical clarity",
      response_style: "Bullet points with direct decision proposals",
      working_hours: "09:00 - 18:00 CET",
      approval_process: "All external communications and token exports require Matias or Sarah approval",
      who_can_approve: "Sarah Lin (VP Product), Matias (Creative Partner)",
      important_communication_notes: "Client values extreme brevity. Never use marketing buzzwords.",
      currency: "USD",
      default_rate: "250",
      day_rate: "2000",
      hourly_rate: "250",
      payment_terms: "Net 30",
      invoice_notes: "Reference PO-XYZ-2026 on all billing vouchers",
      contract_notes: "Retainer Active: Tier 1 Autonomous Studio Collaboration",
      created_at: new Date(Date.now() - 864e5 * 3).toISOString(),
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    }
  ],
  contacts: [
    {
      id: "contact-demo-1",
      organization_id: DEFAULT_ORG_ID,
      client_id: "demo-xyz-ai",
      name: "Sarah Lin",
      role: "VP Product & Brand Architecture",
      email: "sarah.lin@demo-xyz.ai",
      phone: "+41 44 123 4567",
      preferred_channel: "Slack",
      is_primary_contact: true,
      created_at: new Date(Date.now() - 864e5 * 3).toISOString()
    },
    {
      id: "contact-demo-2",
      organization_id: DEFAULT_ORG_ID,
      client_id: "demo-xyz-ai",
      name: "John Vance",
      role: "Lead Engineering Partner",
      email: "john.v@demo-xyz.ai",
      phone: "+41 44 987 6543",
      preferred_channel: "Email",
      is_primary_contact: false,
      created_at: new Date(Date.now() - 864e5 * 3).toISOString()
    }
  ],
  projects: [
    {
      project_id: "proj-demo-1",
      organization_id: DEFAULT_ORG_ID,
      client_id: "demo-xyz-ai",
      project_name: "Brand OS & Generative UI System",
      project_type: "Brand System",
      description: "Developing high-contrast spatial token architecture, responsive component layouts, and visual design guidelines.",
      status: "in_progress",
      deadline: "2026-10-24",
      priority: "high",
      estimated_budget: "$45,000",
      project_notes: "Initial component library review scheduled with Sarah Lin.",
      progress: 60,
      assigned_agents: ["Creative Director Agent", "Design Automation Agent"],
      created_at: new Date(Date.now() - 864e5 * 2).toISOString(),
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    }
  ],
  tasks: [
    {
      id: "task-demo-1",
      organization_id: DEFAULT_ORG_ID,
      client_id: "demo-xyz-ai",
      project_id: "proj-demo-1",
      title: "Review high-contrast spatial card tokens",
      description: "Validate border-radius tokens (24px to 28px) against WCAG AAA contrast standard on #F5F5F3 canvas.",
      assigned_agent: "Design Automation Agent",
      status: "running",
      priority: "high",
      deadline: "2026-10-12",
      created_at: new Date(Date.now() - 864e5).toISOString(),
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    },
    {
      id: "task-demo-2",
      organization_id: DEFAULT_ORG_ID,
      client_id: "demo-xyz-ai",
      project_id: "proj-demo-1",
      title: "Consolidate feedback on rotary vibration curves",
      description: "Process telemetry data received from engineering team.",
      assigned_agent: "Creative Director Agent",
      status: "waiting_approval",
      priority: "normal",
      deadline: "2026-10-15",
      created_at: new Date(Date.now() - 864e5).toISOString(),
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    }
  ],
  client_memory: [
    {
      id: "mem-demo-1",
      organization_id: DEFAULT_ORG_ID,
      client_id: "demo-xyz-ai",
      category: "Brand",
      key: "Brand Personality",
      value: "Minimal, technical, premium, confident. Eliminate decorative redundancy.",
      status: "OFFICIAL",
      source_type: "Document",
      source_id: "XYZ_Brand_Guidelines_v1.pdf",
      reason_context: "Extracted from official executive onboarding workshop.",
      created_at: new Date(Date.now() - 864e5 * 2).toISOString(),
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    },
    {
      id: "mem-demo-2",
      organization_id: DEFAULT_ORG_ID,
      client_id: "demo-xyz-ai",
      category: "Communication",
      key: "Client Messaging Cadence",
      value: "Client prefers concise Slack communications with actionable bullet points. Never send unapproved client-facing messages.",
      status: "APPROVED",
      source_type: "Onboarding",
      source_id: "Client Onboarding Form",
      reason_context: "Explicitly indicated by VP Product Sarah Lin during kick-off.",
      created_at: new Date(Date.now() - 864e5 * 2).toISOString(),
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    },
    {
      id: "mem-demo-3",
      organization_id: DEFAULT_ORG_ID,
      client_id: "demo-xyz-ai",
      category: "Visual",
      key: "Color & Contrast Rules",
      value: "Strict monochrome base (#F5F5F3 canvas, #111111 ink, #E5E5E1 borders) with high-contrast dark sections (#121212) for technical telemetry.",
      status: "OFFICIAL",
      source_type: "Document",
      source_id: "Design_System_Spec.pdf",
      reason_context: "Official typography & color specifications approved by creative direction.",
      created_at: new Date(Date.now() - 864e5).toISOString(),
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    },
    {
      id: "mem-demo-4",
      organization_id: DEFAULT_ORG_ID,
      client_id: "demo-xyz-ai",
      category: "Observations",
      key: "Early Design Feedback Observation",
      value: "Client team reacted positively to editorial asymmetrical compositions over traditional 12-column dashboard grids.",
      status: "OBSERVED",
      source_type: "Activity",
      source_id: "Design Review Meeting #01",
      reason_context: "Noted during initial layout presentation feedback round.",
      created_at: new Date(Date.now() - 864e5).toISOString(),
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    }
  ],
  documents: [
    {
      file_id: "doc-demo-1",
      organization_id: DEFAULT_ORG_ID,
      client_id: "demo-xyz-ai",
      project_id: "proj-demo-1",
      category: "Brand",
      filename: "XYZ_Brand_Guidelines_v1.pdf",
      file_size: "3.4 MB",
      uploaded_at: new Date(Date.now() - 864e5 * 2).toISOString(),
      uploaded_by: "Matias Austin",
      status: "uploaded",
      notes: "Authoritative brand manual defining typography hierarchy and color standards."
    },
    {
      file_id: "doc-demo-2",
      organization_id: DEFAULT_ORG_ID,
      client_id: "demo-xyz-ai",
      project_id: "proj-demo-1",
      category: "Contract",
      filename: "Master_Services_Agreement_2026.pdf",
      file_size: "1.2 MB",
      uploaded_at: new Date(Date.now() - 864e5 * 3).toISOString(),
      uploaded_by: "Matias Austin",
      status: "uploaded",
      notes: "Executed MSA governing studio deliverables and commercial rates."
    }
  ],
  client_permissions: [
    {
      id: "perm-demo-1",
      organization_id: DEFAULT_ORG_ID,
      client_id: "demo-xyz-ai",
      permissions: {
        read_client_messages: "allowed",
        read_project_files: "allowed",
        read_brand_guidelines: "allowed",
        create_tasks: "allowed",
        update_tasks: "allowed",
        create_documents: "allowed",
        draft_client_messages: "allowed",
        send_client_messages: "approval_required",
        modify_client_memory: "approval_required",
        publish_design: "approval_required",
        send_invoice: "approval_required",
        send_quotation: "approval_required"
      },
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    }
  ],
  activities: [
    {
      id: "act-demo-1",
      organization_id: DEFAULT_ORG_ID,
      client_id: "demo-xyz-ai",
      actor_type: "user",
      actor_id: "Matias",
      action: "Client workspace created",
      entity_type: "client",
      entity_id: "demo-xyz-ai",
      result: "Initialized workspace with 2 contacts and 1 project",
      created_at: new Date(Date.now() - 864e5 * 3).toISOString()
    },
    {
      id: "act-demo-2",
      organization_id: DEFAULT_ORG_ID,
      client_id: "demo-xyz-ai",
      project_id: "proj-demo-1",
      actor_type: "user",
      actor_id: "Matias",
      action: "Project created: Brand OS & Generative UI System",
      entity_type: "project",
      entity_id: "proj-demo-1",
      created_at: new Date(Date.now() - 864e5 * 2).toISOString()
    },
    {
      id: "act-demo-3",
      organization_id: DEFAULT_ORG_ID,
      client_id: "demo-xyz-ai",
      actor_type: "user",
      actor_id: "Matias",
      action: "Document uploaded: XYZ_Brand_Guidelines_v1.pdf",
      entity_type: "document",
      entity_id: "doc-demo-1",
      created_at: new Date(Date.now() - 864e5 * 2).toISOString()
    },
    {
      id: "act-demo-4",
      organization_id: DEFAULT_ORG_ID,
      client_id: "demo-xyz-ai",
      actor_type: "user",
      actor_id: "Matias",
      action: "Memory approved: Client Messaging Cadence",
      entity_type: "client_memory",
      entity_id: "mem-demo-2",
      created_at: new Date(Date.now() - 864e5).toISOString()
    }
  ]
};

// server/db/supabase.ts
import { createClient } from "@supabase/supabase-js";
var supabaseUrl = process.env.SUPABASE_URL;
var supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
var isSupabaseConfigured = () => {
  return Boolean(supabaseUrl && supabaseKey);
};
var supabase = isSupabaseConfigured() ? createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
}) : null;
var TABLE_MAP = {
  users: "users",
  organizations: "organizations",
  organization_members: "organization_members",
  sessions: "sessions",
  invitations: "invitations",
  feature_flags: "feature_flags",
  clients: "clients",
  contacts: "contacts",
  projects: "projects",
  tasks: "tasks",
  client_memory: "client_memory",
  documents: "documents",
  client_permissions: "client_permissions",
  activities: "activities"
};
var PK_MAP = {
  users: "id",
  organizations: "id",
  organization_members: "id",
  sessions: "id",
  invitations: "id",
  feature_flags: "id",
  clients: "id",
  contacts: "id",
  projects: "project_id",
  tasks: "id",
  client_memory: "id",
  documents: "file_id",
  client_permissions: "id",
  activities: "id"
};
async function loadFromSupabase() {
  if (!supabase) return null;
  try {
    const results = {};
    const tables = Object.keys(TABLE_MAP);
    await Promise.all(
      tables.map(async (tableKey) => {
        const pgTable = TABLE_MAP[tableKey];
        const { data, error } = await supabase.from(pgTable).select("*");
        if (error) {
          console.warn(`Supabase: failed to select from ${pgTable}:`, error.message);
          return;
        }
        if (data) {
          results[tableKey] = data;
        }
      })
    );
    return results;
  } catch (err) {
    console.error("Supabase loadFromSupabase unexpected error:", err);
    return null;
  }
}
async function bulkUpsertToSupabase(table, records) {
  if (!supabase || !records || records.length === 0) return;
  const pgTable = TABLE_MAP[table];
  const pk = PK_MAP[table];
  try {
    const { error } = await supabase.from(pgTable).upsert(records, { onConflict: pk });
    if (error) {
      console.warn(`Supabase bulkUpsert error on ${pgTable}:`, error.message);
    }
  } catch (err) {
    console.warn(`Supabase bulkUpsert exception on ${pgTable}:`, err);
  }
}

// server/db/database.ts
var Database = class {
  dbPath;
  memoryCache = null;
  supabaseSyncInProgress = false;
  constructor() {
    const isServerless = process.env.VERCEL === "1" || process.env.AWS_LAMBDA_FUNCTION_NAME !== void 0;
    if (isServerless) {
      this.dbPath = path.join("/tmp", "matias_studio_db.json");
      if (!fs.existsSync(this.dbPath)) {
        try {
          const repoDbPath = path.resolve(process.cwd(), "data", "db.json");
          if (fs.existsSync(repoDbPath)) {
            fs.copyFileSync(repoDbPath, this.dbPath);
          }
        } catch (e) {
          console.warn("Failed to copy initial data/db.json to /tmp:", e);
        }
      }
    } else {
      const dataDir = path.resolve(process.cwd(), "data");
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      this.dbPath = path.join(dataDir, "db.json");
    }
    this.init();
    if (isSupabaseConfigured()) {
      this.syncFromSupabase().catch((err) => {
        console.warn("Supabase initial sync notification:", err);
      });
    }
  }
  init() {
    try {
      if (fs.existsSync(this.dbPath)) {
        const raw = fs.readFileSync(this.dbPath, "utf-8");
        const parsed = JSON.parse(raw);
        this.memoryCache = this.migrate(parsed);
      } else {
        this.memoryCache = JSON.parse(JSON.stringify(initialDevelopmentSeed));
        this.persist();
      }
    } catch (err) {
      console.error("Failed to load database file, falling back to seed in memory:", err);
      this.memoryCache = JSON.parse(JSON.stringify(initialDevelopmentSeed));
    }
  }
  /**
   * Syncs latest data from Supabase PostgreSQL tables into the in-memory cache
   */
  async syncFromSupabase() {
    if (!isSupabaseConfigured() || this.supabaseSyncInProgress) return;
    this.supabaseSyncInProgress = true;
    try {
      const data = await loadFromSupabase();
      if (data && this.memoryCache) {
        let changed = false;
        Object.keys(data).forEach((tbl) => {
          if (data[tbl] && Array.isArray(data[tbl]) && data[tbl].length > 0) {
            this.memoryCache[tbl] = data[tbl];
            changed = true;
          }
        });
        if (changed) {
          this.persist();
        }
      }
    } catch (err) {
      console.warn("Sync from Supabase failed:", err);
    } finally {
      this.supabaseSyncInProgress = false;
    }
  }
  /**
   * Safe non-destructive database migration ensuring all tables and organization_id exist.
   */
  migrate(existing) {
    const schema = {
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
    const defaultOrgId = schema.organizations[0]?.id || "org_matias_studio";
    schema.clients.forEach((c) => {
      if (!c.organization_id) c.organization_id = defaultOrgId;
    });
    schema.contacts.forEach((c) => {
      if (!c.organization_id) c.organization_id = defaultOrgId;
    });
    schema.projects.forEach((p) => {
      if (!p.organization_id) p.organization_id = defaultOrgId;
    });
    schema.tasks.forEach((t) => {
      if (!t.organization_id) t.organization_id = defaultOrgId;
    });
    schema.client_memory.forEach((m) => {
      if (!m.organization_id) m.organization_id = defaultOrgId;
    });
    schema.documents.forEach((d) => {
      if (!d.organization_id) d.organization_id = defaultOrgId;
    });
    schema.client_permissions.forEach((p) => {
      if (!p.organization_id) p.organization_id = defaultOrgId;
    });
    schema.activities.forEach((a) => {
      if (!a.organization_id) a.organization_id = defaultOrgId;
    });
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
  persist() {
    if (!this.memoryCache) return;
    try {
      const serialized = JSON.stringify(this.memoryCache, null, 2);
      fs.writeFileSync(this.dbPath, serialized, "utf-8");
    } catch (err) {
      console.warn("Persistence to filesystem failed:", err);
    }
  }
  get(table) {
    if (!this.memoryCache) this.init();
    return this.memoryCache[table];
  }
  update(table, updater) {
    if (!this.memoryCache) this.init();
    const updated = updater(this.memoryCache[table]);
    this.memoryCache[table] = updated;
    this.persist();
    if (isSupabaseConfigured() && Array.isArray(updated)) {
      bulkUpsertToSupabase(table, updated).catch((err) => {
        console.warn(`Background sync to Supabase table "${table}" failed:`, err);
      });
    }
    return updated;
  }
  getFullSchema() {
    if (!this.memoryCache) this.init();
    return JSON.parse(JSON.stringify(this.memoryCache));
  }
  resetToSeed() {
    this.memoryCache = JSON.parse(JSON.stringify(initialDevelopmentSeed));
    this.persist();
    if (isSupabaseConfigured() && this.memoryCache) {
      Object.keys(initialDevelopmentSeed).forEach((tbl) => {
        const records = this.memoryCache[tbl];
        if (Array.isArray(records) && records.length > 0) {
          bulkUpsertToSupabase(tbl, records).catch(() => {
          });
        }
      });
    }
  }
};
var db = new Database();

// server/services/activityService.ts
var ActivityService = class {
  static logActivity(params) {
    const record = {
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      organization_id: params.organization_id,
      client_id: params.client_id,
      project_id: params.project_id,
      actor_type: params.actor_type || "user",
      actor_id: params.actor_id || "System",
      action: params.action,
      entity_type: params.entity_type,
      entity_id: params.entity_id,
      result: params.result,
      metadata: params.metadata,
      created_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    db.update("activities", (list) => [record, ...list]);
    return record;
  }
  static getActivities(organizationId, clientId, limit = 50) {
    const all = db.get("activities");
    return all.filter((a) => {
      const matchOrg = organizationId ? a.organization_id === organizationId : true;
      const matchClient = clientId ? a.client_id === clientId : true;
      return matchOrg && matchClient;
    }).slice(0, limit);
  }
};

// server/services/authService.ts
var AuthService = class {
  static login(email, password) {
    const normalizedEmail = email.toLowerCase().trim();
    const users = db.get("users");
    const user = users.find((u) => u.email === normalizedEmail);
    if (!user) {
      ActivityService.logActivity({
        actor_id: normalizedEmail,
        action: "LOGIN_FAILED",
        entity_type: "auth",
        entity_id: normalizedEmail,
        result: "Invalid credentials - user not found"
      });
      throw new Error("Invalid email or password");
    }
    if (user.status === "suspended") {
      ActivityService.logActivity({
        actor_id: user.id,
        action: "LOGIN_FAILED",
        entity_type: "auth",
        entity_id: user.id,
        result: "Account suspended"
      });
      throw new Error("Account has been suspended. Please contact platform support.");
    }
    const isValid = AuthSecurity.verifyPassword(password, user.password_hash, user.password_salt);
    if (!isValid) {
      ActivityService.logActivity({
        actor_id: user.id,
        action: "LOGIN_FAILED",
        entity_type: "auth",
        entity_id: user.id,
        result: "Invalid credentials - password mismatch"
      });
      throw new Error("Invalid email or password");
    }
    const members = db.get("organization_members");
    const userMemberships = members.filter((m) => m.user_id === user.id);
    const orgs = db.get("organizations");
    let activeOrgId = userMemberships[0]?.organization_id || orgs[0]?.id || "";
    const activeOrg = orgs.find((o) => o.id === activeOrgId) || null;
    const activeMembership = userMemberships.find((m) => m.organization_id === activeOrgId) || null;
    const token = AuthSecurity.generateSessionToken();
    const expiresAt = new Date(Date.now() + 7 * 864e5).toISOString();
    const session = {
      id: `sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      token,
      user_id: user.id,
      active_organization_id: activeOrgId,
      expires_at: expiresAt,
      created_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    db.update("sessions", (list) => [...list, session]);
    db.update("users", (list) => {
      const idx = list.findIndex((u) => u.id === user.id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], last_active_at: (/* @__PURE__ */ new Date()).toISOString() };
      }
      return [...list];
    });
    ActivityService.logActivity({
      organization_id: activeOrgId || void 0,
      actor_id: user.name,
      action: "LOGIN_SUCCESS",
      entity_type: "auth",
      entity_id: user.id,
      result: `Authenticated as ${user.platform_role} (Org: ${activeOrg?.name || "Platform"})`
    });
    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        platform_role: user.platform_role,
        status: user.status
      },
      organization: activeOrg,
      role: activeMembership?.role || (user.platform_role === "SUPER_ADMIN" ? "OWNER" : null)
    };
  }
  static validateSession(token) {
    if (!token) return null;
    const sessions = db.get("sessions");
    const session = sessions.find((s) => s.token === token);
    if (!session) return null;
    if (new Date(session.expires_at).getTime() < Date.now()) {
      db.update("sessions", (list) => list.filter((s) => s.id !== session.id));
      return null;
    }
    const users = db.get("users");
    const user = users.find((u) => u.id === session.user_id);
    if (!user || user.status === "suspended") return null;
    const orgs = db.get("organizations");
    const members = db.get("organization_members");
    let organization = orgs.find((o) => o.id === session.active_organization_id) || null;
    let membership = members.find((m) => m.organization_id === session.active_organization_id && m.user_id === user.id) || null;
    if (!membership && user.platform_role !== "SUPER_ADMIN") {
      const userMemberships = members.filter((m) => m.user_id === user.id);
      if (userMemberships.length > 0) {
        membership = userMemberships[0];
        organization = orgs.find((o) => o.id === membership.organization_id) || null;
        session.active_organization_id = membership.organization_id;
        db.persist();
      }
    }
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        platform_role: user.platform_role,
        status: user.status
      },
      organization,
      membership,
      role: membership?.role || (user.platform_role === "SUPER_ADMIN" ? "OWNER" : null)
    };
  }
  static switchOrganization(token, newOrgId) {
    const ctx = this.validateSession(token);
    if (!ctx) throw new Error("Unauthenticated session");
    const members = db.get("organization_members");
    const isMember = members.some((m) => m.user_id === ctx.user.id && m.organization_id === newOrgId);
    if (!isMember && ctx.user.platform_role !== "SUPER_ADMIN") {
      throw new Error("Access denied: You do not belong to this organization.");
    }
    const orgs = db.get("organizations");
    const targetOrg = orgs.find((o) => o.id === newOrgId);
    if (!targetOrg) throw new Error("Organization not found");
    db.update("sessions", (list) => {
      const idx = list.findIndex((s) => s.token === token);
      if (idx !== -1) {
        list[idx] = { ...list[idx], active_organization_id: newOrgId };
      }
      return [...list];
    });
    const updatedCtx = this.validateSession(token);
    if (!updatedCtx) throw new Error("Failed to resolve context after organization switch");
    return updatedCtx;
  }
  static logout(token) {
    const sessions = db.get("sessions");
    const session = sessions.find((s) => s.token === token);
    if (session) {
      const users = db.get("users");
      const user = users.find((u) => u.id === session.user_id);
      ActivityService.logActivity({
        organization_id: session.active_organization_id,
        actor_id: user?.name || session.user_id,
        action: "LOGOUT",
        entity_type: "auth",
        entity_id: session.user_id
      });
      db.update("sessions", (list) => list.filter((s) => s.token !== token));
    }
  }
};

// server/services/organizationService.ts
var OrganizationService = class {
  static getAllOrganizations() {
    return db.get("organizations");
  }
  static getOrganization(orgId) {
    const orgs = db.get("organizations");
    return orgs.find((o) => o.id === orgId) || null;
  }
  static createOrganization(params) {
    const trimmedName = params.name.trim();
    const cleanSlug = params.slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, "-");
    if (!trimmedName) throw new Error("Organization name is required");
    if (!cleanSlug) throw new Error("Organization slug is required");
    const orgs = db.get("organizations");
    if (orgs.some((o) => o.slug === cleanSlug)) {
      throw new Error(`Organization slug "${cleanSlug}" is already taken. Please choose another.`);
    }
    const orgId = `org_${cleanSlug}_${Math.random().toString(36).substring(2, 6)}`;
    const newOrg = {
      id: orgId,
      name: trimmedName,
      slug: cleanSlug,
      status: "active",
      plan: params.plan || "Studio",
      subscription_status: "active",
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    db.update("organizations", (list) => [...list, newOrg]);
    const membership = {
      id: `member_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      organization_id: orgId,
      user_id: params.creator_user_id,
      role: "OWNER",
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    db.update("organization_members", (list) => [...list, membership]);
    ActivityService.logActivity({
      organization_id: orgId,
      actor_id: params.actor_name || params.creator_user_id,
      action: `Organization created: ${newOrg.name}`,
      entity_type: "organization",
      entity_id: orgId,
      result: `Plan: ${newOrg.plan}`
    });
    return newOrg;
  }
  static updateOrganization(orgId, updates, actor_name = "Admin") {
    let updated = null;
    db.update("organizations", (list) => {
      const idx = list.findIndex((o) => o.id === orgId);
      if (idx === -1) throw new Error("Organization not found");
      updated = {
        ...list[idx],
        ...updates,
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      };
      list[idx] = updated;
      return [...list];
    });
    ActivityService.logActivity({
      organization_id: orgId,
      actor_id: actor_name,
      action: `ORGANIZATION_UPDATED: ${updated.name}`,
      entity_type: "organization",
      entity_id: orgId
    });
    return updated;
  }
  static setOrganizationStatus(orgId, status, actor_name = "Super Admin") {
    let updated = null;
    db.update("organizations", (list) => {
      const idx = list.findIndex((o) => o.id === orgId);
      if (idx === -1) throw new Error("Organization not found");
      updated = {
        ...list[idx],
        status,
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      };
      list[idx] = updated;
      return [...list];
    });
    ActivityService.logActivity({
      organization_id: orgId,
      actor_id: actor_name,
      action: status === "suspended" ? "ORGANIZATION_SUSPENDED" : "ORGANIZATION_REACTIVATED",
      entity_type: "organization",
      entity_id: orgId,
      result: `Status set to ${status}`
    });
    return updated;
  }
  static getOrganizationMembers(orgId) {
    const members = db.get("organization_members").filter((m) => m.organization_id === orgId);
    const users = db.get("users");
    return members.map((m) => {
      const u = users.find((user) => user.id === m.user_id);
      return {
        id: m.id,
        user_id: m.user_id,
        name: u?.name || "Unknown",
        email: u?.email || "Unknown",
        role: m.role,
        status: u?.status || "active",
        created_at: m.created_at,
        last_active_at: u?.last_active_at || m.created_at
      };
    });
  }
  static inviteMember(params) {
    const normalizedEmail = params.email.toLowerCase().trim();
    if (!normalizedEmail) throw new Error("Email is required");
    const users = db.get("users");
    const existingUser = users.find((u) => u.email === normalizedEmail);
    if (existingUser) {
      const members = db.get("organization_members");
      if (members.some((m) => m.organization_id === params.organization_id && m.user_id === existingUser.id)) {
        throw new Error("User is already a member of this organization");
      }
    }
    const invitation = {
      id: `inv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      organization_id: params.organization_id,
      email: normalizedEmail,
      role: params.role || "MEMBER",
      invited_by_user_id: params.invited_by_user_id,
      status: "pending",
      created_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    db.update("invitations", (list) => [...list, invitation]);
    ActivityService.logActivity({
      organization_id: params.organization_id,
      actor_id: params.actor_name || params.invited_by_user_id,
      action: `MEMBER_INVITED: ${invitation.email}`,
      entity_type: "invitation",
      entity_id: invitation.id,
      result: `Role: ${invitation.role}. Invitation created.`
    });
    return invitation;
  }
  static getInvitations(orgId) {
    return db.get("invitations").filter((i) => i.organization_id === orgId && i.status === "pending");
  }
  static updateMemberRole(orgId, membershipId, newRole, actor_name = "Owner") {
    let updated = null;
    db.update("organization_members", (list) => {
      const idx = list.findIndex((m) => m.id === membershipId && m.organization_id === orgId);
      if (idx === -1) throw new Error("Membership not found");
      updated = {
        ...list[idx],
        role: newRole,
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      };
      list[idx] = updated;
      return [...list];
    });
    ActivityService.logActivity({
      organization_id: orgId,
      actor_id: actor_name,
      action: `ROLE_CHANGED`,
      entity_type: "organization_member",
      entity_id: membershipId,
      result: `New role: ${newRole}`
    });
    return updated;
  }
  static removeMember(orgId, membershipId, actor_name = "Owner") {
    let removedUserId = "";
    db.update("organization_members", (list) => {
      const target = list.find((m) => m.id === membershipId && m.organization_id === orgId);
      if (!target) return list;
      removedUserId = target.user_id;
      return list.filter((m) => m.id !== membershipId);
    });
    if (removedUserId) {
      ActivityService.logActivity({
        organization_id: orgId,
        actor_id: actor_name,
        action: `MEMBER_REMOVED`,
        entity_type: "organization_member",
        entity_id: membershipId,
        result: `User ${removedUserId} removed from organization`
      });
      return true;
    }
    return false;
  }
  static getUserOrganizations(userId) {
    const members = db.get("organization_members").filter((m) => m.user_id === userId);
    const orgs = db.get("organizations");
    return members.map((m) => {
      const org = orgs.find((o) => o.id === m.organization_id);
      return {
        organization: org,
        role: m.role
      };
    }).filter((item) => item.organization !== void 0);
  }
};

// server/services/userService.ts
var UserService = class {
  static getAllUsers() {
    const users = db.get("users");
    const members = db.get("organization_members");
    const orgs = db.get("organizations");
    return users.map((u) => {
      const userMemberships = members.filter((m) => m.user_id === u.id);
      const userOrgs = userMemberships.map((m) => {
        const org = orgs.find((o) => o.id === m.organization_id);
        return {
          organization_id: m.organization_id,
          organization_name: org?.name || "Unknown",
          role: m.role
        };
      });
      return {
        id: u.id,
        email: u.email,
        name: u.name,
        platform_role: u.platform_role,
        status: u.status,
        last_active_at: u.last_active_at,
        created_at: u.created_at,
        organizations: userOrgs
      };
    });
  }
  static createUser(params) {
    const normalizedEmail = params.email.toLowerCase().trim();
    if (!normalizedEmail) throw new Error("Email is required");
    if (!params.password || params.password.length < 6) {
      throw new Error("Password must be at least 6 characters long");
    }
    const users = db.get("users");
    if (users.some((u) => u.email === normalizedEmail)) {
      throw new Error(`User with email "${normalizedEmail}" already exists`);
    }
    const { hash, salt } = AuthSecurity.hashPassword(params.password);
    const newUser = {
      id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      email: normalizedEmail,
      password_hash: hash,
      password_salt: salt,
      name: params.name.trim() || "New User",
      platform_role: params.platform_role || "USER",
      status: "active",
      last_active_at: (/* @__PURE__ */ new Date()).toISOString(),
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    db.update("users", (list) => [...list, newUser]);
    ActivityService.logActivity({
      actor_id: params.actor_name || "Admin",
      action: `USER_CREATED: ${newUser.email}`,
      entity_type: "user",
      entity_id: newUser.id,
      result: `Role: ${newUser.platform_role}`
    });
    return {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      platform_role: newUser.platform_role,
      status: newUser.status,
      created_at: newUser.created_at
    };
  }
  static setUserStatus(userId, status, actor_name = "Super Admin") {
    let updated = null;
    db.update("users", (list) => {
      const idx = list.findIndex((u) => u.id === userId);
      if (idx === -1) throw new Error("User not found");
      updated = {
        ...list[idx],
        status,
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      };
      list[idx] = updated;
      return [...list];
    });
    ActivityService.logActivity({
      actor_id: actor_name,
      action: status === "suspended" ? "USER_SUSPENDED" : "USER_REACTIVATED",
      entity_type: "user",
      entity_id: userId,
      result: `Status set to ${status}`
    });
    return {
      id: updated.id,
      email: updated.email,
      name: updated.name,
      status: updated.status
    };
  }
  static setUserPlatformRole(userId, platformRole, actor_name = "Super Admin") {
    let updated = null;
    db.update("users", (list) => {
      const idx = list.findIndex((u) => u.id === userId);
      if (idx === -1) throw new Error("User not found");
      updated = {
        ...list[idx],
        platform_role: platformRole,
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      };
      list[idx] = updated;
      return [...list];
    });
    ActivityService.logActivity({
      actor_id: actor_name,
      action: "PLATFORM_ROLE_CHANGED",
      entity_type: "user",
      entity_id: userId,
      result: `New platform role: ${platformRole}`
    });
    return {
      id: updated.id,
      email: updated.email,
      name: updated.name,
      platform_role: updated.platform_role
    };
  }
};

// server/services/permissionService.ts
var defaultPermissions = {
  read_client_messages: "allowed",
  read_project_files: "allowed",
  read_brand_guidelines: "allowed",
  create_tasks: "allowed",
  update_tasks: "allowed",
  create_documents: "allowed",
  draft_client_messages: "allowed",
  send_client_messages: "approval_required",
  modify_client_memory: "approval_required",
  publish_design: "approval_required",
  send_invoice: "approval_required",
  send_quotation: "approval_required"
};
var PermissionService = class {
  static getPermissions(organizationId, clientId) {
    const records = db.get("client_permissions");
    const existing = records.find((p) => p.client_id === clientId && p.organization_id === organizationId);
    if (existing) {
      return existing.permissions;
    }
    const newRecord = {
      id: `perm_${Date.now()}`,
      organization_id: organizationId,
      client_id: clientId,
      permissions: { ...defaultPermissions },
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    db.update("client_permissions", (list) => [...list, newRecord]);
    return newRecord.permissions;
  }
  static updatePermissions(organizationId, clientId, newPermissions, actorId = "User") {
    let result = { ...defaultPermissions };
    db.update("client_permissions", (list) => {
      const idx = list.findIndex((p) => p.client_id === clientId && p.organization_id === organizationId);
      if (idx >= 0) {
        const merged = { ...list[idx].permissions, ...newPermissions };
        list[idx] = {
          ...list[idx],
          permissions: merged,
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        };
        result = merged;
        return [...list];
      } else {
        const merged = { ...defaultPermissions, ...newPermissions };
        const record = {
          id: `perm_${Date.now()}`,
          organization_id: organizationId,
          client_id: clientId,
          permissions: merged,
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        };
        result = merged;
        return [...list, record];
      }
    });
    ActivityService.logActivity({
      organization_id: organizationId,
      client_id: clientId,
      actor_id: actorId,
      action: "AI permissions updated",
      entity_type: "client_permissions",
      entity_id: clientId,
      result: "Updated AI permissions boundary"
    });
    return result;
  }
};

// server/services/memoryService.ts
var MemoryService = class {
  static createMemory(organizationId, params) {
    if (!organizationId) throw new Error("organization_id is required");
    if (!params.client_id) throw new Error("client_id is required");
    const clients = db.get("clients");
    const client = clients.find((c) => c.id === params.client_id && c.organization_id === organizationId);
    if (!client) throw new Error("Client not found in this organization");
    const record = {
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
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      updated_at: (/* @__PURE__ */ new Date()).toISOString(),
      archived: false
    };
    db.update("client_memory", (list) => [...list, record]);
    ActivityService.logActivity({
      organization_id: organizationId,
      client_id: params.client_id,
      actor_id: params.actor_id || "User",
      action: `Memory added: ${record.key} (${record.status})`,
      entity_type: "client_memory",
      entity_id: record.id,
      result: `Stored in category ${record.category}`
    });
    return record;
  }
  static getMemory(organizationId, memoryId) {
    const list = db.get("client_memory");
    return list.find((m) => m.id === memoryId && m.organization_id === organizationId && !m.archived) || null;
  }
  static getClientMemory(organizationId, clientId, category) {
    const list = db.get("client_memory");
    return list.filter((m) => {
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
  static searchMemory(organizationId, clientId, query, category) {
    if (!organizationId || !clientId) return [];
    const clientMemories = this.getClientMemory(organizationId, clientId, category);
    if (!query || query.trim() === "") return clientMemories;
    const q = query.toLowerCase().trim();
    return clientMemories.filter(
      (m) => m.key.toLowerCase().includes(q) || m.value.toLowerCase().includes(q) || m.reason_context && m.reason_context.toLowerCase().includes(q) || m.source_id.toLowerCase().includes(q)
    );
  }
  static updateMemory(organizationId, memoryId, updates, actorId = "User", allowOfficialOverwrite = false) {
    let updatedRecord = null;
    db.update("client_memory", (list) => {
      const idx = list.findIndex((m) => m.id === memoryId && m.organization_id === organizationId);
      if (idx === -1) {
        throw new Error(`Memory record with ID ${memoryId} not found in this organization`);
      }
      const existing = list[idx];
      if (existing.status === "OFFICIAL" && !allowOfficialOverwrite && updates.value && updates.value !== existing.value) {
        throw new Error("OFFICIAL memories cannot be casually overwritten. Explicit review required.");
      }
      updatedRecord = {
        ...existing,
        ...updates,
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      };
      list[idx] = updatedRecord;
      return [...list];
    });
    if (updatedRecord) {
      ActivityService.logActivity({
        organization_id: organizationId,
        client_id: updatedRecord.client_id,
        actor_id: actorId,
        action: `Memory updated: ${updatedRecord.key}`,
        entity_type: "client_memory",
        entity_id: memoryId,
        result: `Status: ${updatedRecord.status}`
      });
    }
    return updatedRecord;
  }
  static approveMemory(organizationId, memoryId, approvedBy = "User") {
    let approved = null;
    db.update("client_memory", (list) => {
      const idx = list.findIndex((m) => m.id === memoryId && m.organization_id === organizationId);
      if (idx === -1) {
        throw new Error(`Memory record with ID ${memoryId} not found in this organization`);
      }
      const current = list[idx];
      approved = {
        ...current,
        status: "APPROVED",
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      };
      list[idx] = approved;
      return [...list];
    });
    if (approved) {
      ActivityService.logActivity({
        organization_id: organizationId,
        client_id: approved.client_id,
        actor_id: approvedBy,
        action: `Memory approved: ${approved.key}`,
        entity_type: "client_memory",
        entity_id: memoryId,
        result: "Promoted to APPROVED"
      });
    }
    return approved;
  }
  static archiveMemory(organizationId, memoryId, actorId = "User") {
    let clientId = "";
    let key = "";
    db.update("client_memory", (list) => {
      const idx = list.findIndex((m) => m.id === memoryId && m.organization_id === organizationId);
      if (idx === -1) return list;
      clientId = list[idx].client_id;
      key = list[idx].key;
      list[idx] = {
        ...list[idx],
        archived: true,
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      };
      return [...list];
    });
    if (clientId) {
      ActivityService.logActivity({
        organization_id: organizationId,
        client_id: clientId,
        actor_id: actorId,
        action: `Memory archived: ${key}`,
        entity_type: "client_memory",
        entity_id: memoryId,
        result: "Archived from active memory graph"
      });
      return true;
    }
    return false;
  }
};

// server/services/clientService.ts
var ClientService = class {
  static getAllClients(organizationId) {
    const clients = db.get("clients");
    return clients.filter((c) => c.organization_id === organizationId);
  }
  static getClientById(organizationId, clientId) {
    const clients = db.get("clients");
    return clients.find((c) => c.id === clientId && c.organization_id === organizationId) || null;
  }
  static getContacts(organizationId, clientId) {
    const contacts = db.get("contacts");
    return contacts.filter((c) => c.client_id === clientId && c.organization_id === organizationId);
  }
  static createClient(organizationId, payload, actorId = "User") {
    if (!organizationId) {
      throw new Error("organization_id is required for creating a client");
    }
    if (!payload.identity || !payload.identity.company_name || payload.identity.company_name.trim() === "") {
      throw new Error("company_name is required");
    }
    const slugBase = payload.identity.company_name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
    const clientId = `client_${slugBase}_${Math.random().toString(36).substring(2, 6)}`;
    const newClient = {
      id: clientId,
      organization_id: organizationId,
      company_name: payload.identity.company_name.trim(),
      website: payload.identity.website,
      industry: payload.identity.industry || "Creative / Technology",
      company_size: payload.identity.company_size,
      location: payload.identity.location,
      timezone: payload.identity.timezone,
      company_description: payload.identity.company_description,
      status: "active",
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
      currency: payload.commercial?.currency || "USD",
      default_rate: payload.commercial?.default_rate,
      day_rate: payload.commercial?.day_rate,
      hourly_rate: payload.commercial?.hourly_rate,
      payment_terms: payload.commercial?.payment_terms || "Net 30",
      invoice_notes: payload.commercial?.invoice_notes,
      contract_notes: payload.commercial?.contract_notes,
      quotation_settings: payload.commercial?.quotation_settings,
      invoice_settings: payload.commercial?.invoice_settings,
      mou_settings: payload.commercial?.mou_settings,
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    db.update("clients", (list) => [newClient, ...list]);
    if (payload.people && payload.people.length > 0) {
      const contactsToSave = payload.people.map((p, idx) => ({
        id: `contact_${Date.now()}_${idx}`,
        organization_id: organizationId,
        client_id: clientId,
        name: p.name,
        role: p.role,
        email: p.email,
        phone: p.phone,
        preferred_channel: p.preferred_channel,
        is_primary_contact: p.is_primary_contact ?? idx === 0,
        created_at: (/* @__PURE__ */ new Date()).toISOString()
      }));
      db.update("contacts", (list) => [...list, ...contactsToSave]);
    }
    if (payload.projects && payload.projects.length > 0) {
      const projectsToSave = payload.projects.map((proj, idx) => ({
        project_id: `proj_${Date.now()}_${idx}`,
        organization_id: organizationId,
        client_id: clientId,
        project_name: proj.project_name,
        project_type: proj.project_type || "Brand System",
        description: proj.description || "",
        status: proj.status || "planning",
        deadline: proj.deadline || new Date(Date.now() + 864e5 * 30).toISOString().split("T")[0],
        priority: proj.priority || "normal",
        estimated_budget: proj.estimated_budget,
        project_notes: proj.project_notes,
        progress: 0,
        assigned_agents: ["Creative Director Agent"],
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      }));
      db.update("projects", (list) => [...list, ...projectsToSave]);
    }
    if (payload.files && payload.files.length > 0) {
      const docsToSave = payload.files.map((f, idx) => ({
        file_id: `doc_${Date.now()}_${idx}`,
        organization_id: organizationId,
        client_id: clientId,
        category: f.category || "Brand",
        filename: f.filename,
        file_size: f.file_size || "1.5 MB",
        uploaded_at: (/* @__PURE__ */ new Date()).toISOString(),
        uploaded_by: actorId,
        status: "uploaded",
        notes: f.notes
      }));
      db.update("documents", (list) => [...list, ...docsToSave]);
    }
    const brandStatus = payload.brand?.brand_status || "OFFICIAL";
    if (payload.brand?.brand_personality) {
      MemoryService.createMemory(organizationId, {
        client_id: clientId,
        category: "Brand",
        key: "Brand Personality",
        value: payload.brand.brand_personality,
        status: brandStatus,
        source_type: "Onboarding",
        source_id: "Client Onboarding Form",
        reason_context: "Defined during client onboarding setup.",
        actor_id: actorId
      });
    }
    if (payload.brand?.brand_voice) {
      MemoryService.createMemory(organizationId, {
        client_id: clientId,
        category: "Brand",
        key: "Brand Voice",
        value: payload.brand.brand_voice,
        status: brandStatus,
        source_type: "Onboarding",
        source_id: "Client Onboarding Form",
        reason_context: "Brand voice established at onboarding.",
        actor_id: actorId
      });
    }
    if (payload.brand?.design_style) {
      MemoryService.createMemory(organizationId, {
        client_id: clientId,
        category: "Visual",
        key: "Design Style",
        value: payload.brand.design_style,
        status: brandStatus,
        source_type: "Onboarding",
        source_id: "Client Onboarding Form",
        reason_context: "Aesthetic guidelines provided during onboarding.",
        actor_id: actorId
      });
    }
    if (payload.brand?.visual_principles) {
      MemoryService.createMemory(organizationId, {
        client_id: clientId,
        category: "Visual",
        key: "Visual Principles",
        value: payload.brand.visual_principles,
        status: brandStatus,
        source_type: "Onboarding",
        source_id: "Client Onboarding Form",
        reason_context: "Primary visual axioms for creative work.",
        actor_id: actorId
      });
    }
    if (payload.brand?.things_to_avoid) {
      MemoryService.createMemory(organizationId, {
        client_id: clientId,
        category: "Restrictions",
        key: "Things to Avoid",
        value: payload.brand.things_to_avoid,
        status: "OFFICIAL",
        source_type: "Onboarding",
        source_id: "Client Onboarding Form",
        reason_context: "Explicit client prohibitions and negative constraints.",
        actor_id: actorId
      });
    }
    if (payload.communication?.communication_tone || payload.communication?.important_communication_notes) {
      const commVal = [
        payload.communication.communication_tone ? `Tone: ${payload.communication.communication_tone}` : "",
        payload.communication.preferred_channel ? `Preferred Channel: ${payload.communication.preferred_channel}` : "",
        payload.communication.important_communication_notes || ""
      ].filter(Boolean).join(". ");
      MemoryService.createMemory(organizationId, {
        client_id: clientId,
        category: "Communication",
        key: "Communication Protocols",
        value: commVal,
        status: "APPROVED",
        source_type: "Onboarding",
        source_id: "Client Onboarding Form",
        reason_context: "Communication preferences collected from onboarding.",
        actor_id: actorId
      });
    }
    if (payload.business?.positioning || payload.business?.value_proposition) {
      MemoryService.createMemory(organizationId, {
        client_id: clientId,
        category: "Positioning",
        key: "Market Positioning & Value Proposition",
        value: `${payload.business.positioning || ""} ${payload.business.value_proposition || ""}`.trim(),
        status: "APPROVED",
        source_type: "Onboarding",
        source_id: "Client Onboarding Form",
        reason_context: "Business value positioning documented at onboarding.",
        actor_id: actorId
      });
    }
    if (payload.ai_setup) {
      PermissionService.updatePermissions(organizationId, clientId, payload.ai_setup, actorId);
    } else {
      PermissionService.getPermissions(organizationId, clientId);
    }
    ActivityService.logActivity({
      organization_id: organizationId,
      client_id: clientId,
      actor_id: actorId,
      action: "Client workspace created",
      entity_type: "client",
      entity_id: clientId,
      result: `Initialized workspace with ${payload.people?.length || 0} contacts and ${payload.projects?.length || 0} projects`
    });
    return newClient;
  }
  static updateClient(organizationId, clientId, updates, actorId = "User") {
    let updated = null;
    db.update("clients", (list) => {
      const idx = list.findIndex((c) => c.id === clientId && c.organization_id === organizationId);
      if (idx === -1) {
        throw new Error(`Client with ID ${clientId} not found in this organization`);
      }
      updated = {
        ...list[idx],
        ...updates,
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      };
      list[idx] = updated;
      return [...list];
    });
    if (updated) {
      ActivityService.logActivity({
        organization_id: organizationId,
        client_id: clientId,
        actor_id: actorId,
        action: `Client profile updated: ${updated.company_name}`,
        entity_type: "client",
        entity_id: clientId
      });
    }
    return updated;
  }
};

// server/services/projectService.ts
var ProjectService = class {
  static getProjects(organizationId, clientId) {
    const all = db.get("projects");
    return all.filter((p) => {
      const matchOrg = p.organization_id === organizationId;
      const matchClient = clientId ? p.client_id === clientId : true;
      return matchOrg && matchClient;
    });
  }
  static getProjectById(organizationId, projectId) {
    const all = db.get("projects");
    return all.find((p) => p.project_id === projectId && p.organization_id === organizationId) || null;
  }
  static createProject(organizationId, params) {
    if (!organizationId) throw new Error("organization_id is required");
    if (!params.client_id) throw new Error("client_id is required");
    if (!params.project_name || params.project_name.trim() === "") {
      throw new Error("project_name is required");
    }
    const clients = db.get("clients");
    const client = clients.find((c) => c.id === params.client_id && c.organization_id === organizationId);
    if (!client) {
      throw new Error("Client not found in this organization");
    }
    const record = {
      project_id: `proj_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      organization_id: organizationId,
      client_id: params.client_id,
      project_name: params.project_name.trim(),
      project_type: params.project_type || "Brand System",
      description: params.description || "",
      status: params.status || "planning",
      deadline: params.deadline || new Date(Date.now() + 864e5 * 14).toISOString().split("T")[0],
      priority: params.priority || "normal",
      estimated_budget: params.estimated_budget,
      project_notes: params.project_notes,
      progress: 0,
      assigned_agents: params.assigned_agents || ["Creative Director Agent"],
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    db.update("projects", (list) => [...list, record]);
    ActivityService.logActivity({
      organization_id: organizationId,
      client_id: params.client_id,
      project_id: record.project_id,
      actor_id: params.actor_id || "User",
      action: `Project created: ${record.project_name}`,
      entity_type: "project",
      entity_id: record.project_id,
      result: `Type: ${record.project_type}`
    });
    return record;
  }
  static updateProject(organizationId, projectId, updates, actor_id = "User") {
    let updated = null;
    db.update("projects", (list) => {
      const idx = list.findIndex((p) => p.project_id === projectId && p.organization_id === organizationId);
      if (idx === -1) {
        throw new Error(`Project with ID ${projectId} not found in this organization`);
      }
      updated = {
        ...list[idx],
        ...updates,
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      };
      list[idx] = updated;
      return [...list];
    });
    if (updated) {
      ActivityService.logActivity({
        organization_id: organizationId,
        client_id: updated.client_id,
        project_id: projectId,
        actor_id,
        action: `Project updated: ${updated.project_name}`,
        entity_type: "project",
        entity_id: projectId
      });
    }
    return updated;
  }
};

// server/services/taskService.ts
var TaskService = class {
  static getTasks(organizationId, clientId, projectId) {
    const all = db.get("tasks");
    return all.filter((t) => {
      const matchOrg = t.organization_id === organizationId;
      const matchClient = clientId ? t.client_id === clientId : true;
      const matchProj = projectId ? t.project_id === projectId : true;
      return matchOrg && matchClient && matchProj;
    });
  }
  static createTask(organizationId, params) {
    if (!organizationId) throw new Error("organization_id is required");
    if (!params.client_id) throw new Error("client_id is required");
    if (!params.title || params.title.trim() === "") {
      throw new Error("Task title is required");
    }
    const clients = db.get("clients");
    const client = clients.find((c) => c.id === params.client_id && c.organization_id === organizationId);
    if (!client) throw new Error("Client not found in this organization");
    const record = {
      id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      organization_id: organizationId,
      client_id: params.client_id,
      project_id: params.project_id,
      title: params.title.trim(),
      description: params.description,
      assigned_agent: params.assigned_agent || "Creative Director Agent",
      status: params.status || "queued",
      priority: params.priority || "normal",
      deadline: params.deadline,
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    db.update("tasks", (list) => [record, ...list]);
    ActivityService.logActivity({
      organization_id: organizationId,
      client_id: params.client_id,
      project_id: params.project_id,
      actor_id: params.actor_id || "User",
      action: `Task created: ${record.title}`,
      entity_type: "task",
      entity_id: record.id,
      result: `Status: ${record.status}`
    });
    return record;
  }
  static updateTask(organizationId, taskId, updates, actor_id = "User") {
    let updated = null;
    db.update("tasks", (list) => {
      const idx = list.findIndex((t) => t.id === taskId && t.organization_id === organizationId);
      if (idx === -1) {
        throw new Error(`Task with ID ${taskId} not found in this organization`);
      }
      updated = {
        ...list[idx],
        ...updates,
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      };
      list[idx] = updated;
      return [...list];
    });
    if (updated) {
      ActivityService.logActivity({
        organization_id: organizationId,
        client_id: updated.client_id,
        project_id: updated.project_id,
        actor_id,
        action: `Task updated: ${updated.title}`,
        entity_type: "task",
        entity_id: taskId,
        result: `Status changed to ${updated.status}`
      });
    }
    return updated;
  }
};

// server/services/documentService.ts
var DocumentService = class {
  static getDocuments(organizationId, clientId, category) {
    const list = db.get("documents");
    return list.filter((d) => {
      const matchOrg = d.organization_id === organizationId;
      const matchClient = clientId ? d.client_id === clientId : true;
      const matchCat = category ? d.category === category : true;
      return matchOrg && matchClient && matchCat;
    });
  }
  static uploadDocument(organizationId, params) {
    if (!organizationId) throw new Error("organization_id is required");
    if (!params.client_id) throw new Error("client_id is required");
    const clients = db.get("clients");
    const client = clients.find((c) => c.id === params.client_id && c.organization_id === organizationId);
    if (!client) throw new Error("Client not found in this organization");
    const record = {
      file_id: `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      organization_id: organizationId,
      client_id: params.client_id,
      project_id: params.project_id,
      category: params.category,
      filename: params.filename.trim(),
      file_size: params.file_size || "Unknown size",
      uploaded_at: (/* @__PURE__ */ new Date()).toISOString(),
      uploaded_by: params.uploaded_by || "User",
      status: "uploaded",
      notes: params.notes
    };
    db.update("documents", (list) => [record, ...list]);
    ActivityService.logActivity({
      organization_id: organizationId,
      client_id: params.client_id,
      project_id: params.project_id,
      actor_id: params.uploaded_by || "User",
      action: `File uploaded: ${record.filename}`,
      entity_type: "document",
      entity_id: record.file_id,
      result: `Stored under category ${record.category}`
    });
    return record;
  }
  static updateDocumentStatus(organizationId, fileId, status) {
    let updated = null;
    db.update("documents", (list) => {
      const idx = list.findIndex((d) => d.file_id === fileId && d.organization_id === organizationId);
      if (idx !== -1) {
        list[idx] = { ...list[idx], status };
        updated = list[idx];
      }
      return [...list];
    });
    return updated;
  }
};

// server/services/contextService.ts
var ContextService = class {
  /**
   * Scoped context retrieval for future AI agent orchestration.
   * Strictly verifies client belongs to organization and scopes all memories to organization_id + client_id.
   */
  static getClientContext(organizationId, clientId, projectId) {
    if (!organizationId) throw new Error("organization_id is required");
    if (!clientId) throw new Error("client_id is required");
    const client = ClientService.getClientById(organizationId, clientId);
    if (!client) {
      throw new Error(`Client with ID ${clientId} not found in this organization`);
    }
    const contacts = ClientService.getContacts(organizationId, clientId);
    const primaryContact = contacts.find((c) => c.is_primary_contact) || (contacts[0] || null);
    const allMemories = MemoryService.getClientMemory(organizationId, clientId);
    const approvedMemories = allMemories.filter((m) => m.status === "APPROVED");
    const observedMemories = allMemories.filter((m) => m.status === "OBSERVED");
    const officialMemories = allMemories.filter((m) => m.status === "OFFICIAL");
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
};

// server/middleware/auth.ts
var ROLE_HIERARCHY = {
  OWNER: 4,
  ADMIN: 3,
  MEMBER: 2,
  VIEWER: 1
};
var extractToken = (req) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7).trim();
  }
  if (req.cookies && req.cookies.session_token) {
    return req.cookies.session_token;
  }
  return null;
};
var requireAuth = (req, res, next) => {
  const token = extractToken(req);
  if (!token) {
    return res.status(401).json({ error: "Authentication required. Please sign in." });
  }
  const context = AuthService.validateSession(token);
  if (!context) {
    return res.status(401).json({ error: "Session expired or invalid. Please sign in again." });
  }
  req.auth = context;
  next();
};
var requireSuperAdmin = (req, res, next) => {
  if (!req.auth) {
    return res.status(401).json({ error: "Authentication required." });
  }
  if (req.auth.user.platform_role !== "SUPER_ADMIN") {
    return res.status(403).json({ error: "Access denied: Requires platform Super Admin privileges." });
  }
  next();
};
var requireOrganization = (req, res, next) => {
  if (!req.auth || !req.auth.organization) {
    return res.status(400).json({ error: "No active organization resolved for this session." });
  }
  if (req.auth.organization.status === "suspended" && req.auth.user.platform_role !== "SUPER_ADMIN") {
    return res.status(403).json({ error: "This organization is suspended. Please contact platform support." });
  }
  next();
};
var requireRole = (minRole) => {
  return (req, res, next) => {
    if (!req.auth) {
      return res.status(401).json({ error: "Authentication required." });
    }
    if (req.auth.user.platform_role === "SUPER_ADMIN") {
      return next();
    }
    if (!req.auth.role) {
      return res.status(403).json({ error: "Access denied: You are not a member of this organization." });
    }
    const currentLevel = ROLE_HIERARCHY[req.auth.role] || 0;
    const requiredLevel = ROLE_HIERARCHY[minRole] || 0;
    if (currentLevel < requiredLevel) {
      return res.status(403).json({
        error: `Access denied: Requires ${minRole} privileges. Your role is ${req.auth.role}.`
      });
    }
    next();
  };
};

// server/app.ts
var app = express();
var param = (p) => Array.isArray(p) ? p[0] : p;
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(cookieParser());
app.use((req, res, next) => {
  if (typeof req.body === "string") {
    try {
      req.body = JSON.parse(req.body);
    } catch {
    }
    return next();
  }
  if (req.body !== void 0 && typeof req.body === "object") {
    return next();
  }
  express.json()(req, res, next);
});
app.use((req, res, next) => {
  if (req.url && !req.url.startsWith("/api") && req.url !== "/") {
    req.url = "/api" + req.url;
  }
  next();
});
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "Matias Studio OS API",
    database_provider: isSupabaseConfigured() ? "Supabase PostgreSQL" : "Local Persistence Engine",
    supabase_connected: isSupabaseConfigured(),
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
app.post("/api/auth/login", (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    const result = AuthService.login(email, password);
    res.cookie("session_token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 864e5
    });
    const userOrgs = OrganizationService.getUserOrganizations(result.user.id);
    res.json({
      ...result,
      user_organizations: userOrgs
    });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});
app.get("/api/auth/me", requireAuth, (req, res) => {
  try {
    const ctx = req.auth;
    const userOrgs = OrganizationService.getUserOrganizations(ctx.user.id);
    res.json({
      user: ctx.user,
      organization: ctx.organization,
      role: ctx.role,
      user_organizations: userOrgs
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post("/api/auth/switch-org", requireAuth, (req, res) => {
  try {
    const token = extractToken(req);
    const { organization_id } = req.body;
    if (!organization_id) {
      return res.status(400).json({ error: "organization_id is required" });
    }
    const updatedCtx = AuthService.switchOrganization(token, organization_id);
    const userOrgs = OrganizationService.getUserOrganizations(updatedCtx.user.id);
    res.json({
      user: updatedCtx.user,
      organization: updatedCtx.organization,
      role: updatedCtx.role,
      user_organizations: userOrgs
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
app.post("/api/auth/logout", (req, res) => {
  const token = extractToken(req);
  if (token) {
    AuthService.logout(token);
  }
  res.clearCookie("session_token");
  res.json({ status: "ok", message: "Logged out successfully" });
});
app.get("/api/admin/overview", requireAuth, requireSuperAdmin, (req, res) => {
  try {
    const orgs = OrganizationService.getAllOrganizations();
    const users = UserService.getAllUsers();
    const activities = ActivityService.getActivities(void 0, void 0, 20);
    const activeOrgs = orgs.filter((o) => o.status === "active").length;
    const suspendedOrgs = orgs.filter((o) => o.status === "suspended").length;
    const activeUsers = users.filter((u) => u.status === "active").length;
    res.json({
      total_organizations: orgs.length,
      active_organizations: activeOrgs,
      suspended_organizations: suspendedOrgs,
      total_users: users.length,
      active_users: activeUsers,
      recent_activities: activities
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/admin/organizations", requireAuth, requireSuperAdmin, (req, res) => {
  try {
    const orgs = OrganizationService.getAllOrganizations();
    res.json(orgs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post("/api/admin/organizations", requireAuth, requireSuperAdmin, (req, res) => {
  try {
    const { name, slug, plan } = req.body;
    const created = OrganizationService.createOrganization({
      name,
      slug,
      plan,
      creator_user_id: req.auth.user.id,
      actor_name: req.auth.user.name
    });
    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
app.patch("/api/admin/organizations/:id/status", requireAuth, requireSuperAdmin, (req, res) => {
  try {
    const { status } = req.body;
    const updated = OrganizationService.setOrganizationStatus(param(req.params.id), status, req.auth.user.name);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
app.get("/api/admin/users", requireAuth, requireSuperAdmin, (req, res) => {
  try {
    const users = UserService.getAllUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post("/api/admin/users", requireAuth, requireSuperAdmin, (req, res) => {
  try {
    const { name, email, password, platform_role } = req.body;
    const user = UserService.createUser({
      name,
      email,
      password,
      platform_role,
      actor_name: req.auth.user.name
    });
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
app.patch("/api/admin/users/:id/status", requireAuth, requireSuperAdmin, (req, res) => {
  try {
    const { status } = req.body;
    const updated = UserService.setUserStatus(param(req.params.id), status, req.auth.user.name);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
app.patch("/api/admin/users/:id/role", requireAuth, requireSuperAdmin, (req, res) => {
  try {
    const { platform_role } = req.body;
    const updated = UserService.setUserPlatformRole(param(req.params.id), platform_role, req.auth.user.name);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
app.get("/api/admin/activities", requireAuth, requireSuperAdmin, (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 100;
    const activities = ActivityService.getActivities(void 0, void 0, limit);
    res.json(activities);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/admin/flags", requireAuth, requireSuperAdmin, (req, res) => {
  try {
    const flags = db.get("feature_flags");
    res.json(flags);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/organization/members", requireAuth, requireOrganization, (req, res) => {
  try {
    const orgId = req.auth.organization.id;
    const members = OrganizationService.getOrganizationMembers(orgId);
    res.json(members);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post("/api/organization/invitations", requireAuth, requireOrganization, requireRole("ADMIN"), (req, res) => {
  try {
    const orgId = req.auth.organization.id;
    const { email, role } = req.body;
    const invitation = OrganizationService.inviteMember({
      organization_id: orgId,
      email,
      role,
      invited_by_user_id: req.auth.user.id,
      actor_name: req.auth.user.name
    });
    res.status(201).json(invitation);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
app.get("/api/organization/invitations", requireAuth, requireOrganization, (req, res) => {
  try {
    const orgId = req.auth.organization.id;
    const invitations = OrganizationService.getInvitations(orgId);
    res.json(invitations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.patch("/api/organization/members/:id/role", requireAuth, requireOrganization, requireRole("OWNER"), (req, res) => {
  try {
    const orgId = req.auth.organization.id;
    const { role } = req.body;
    const updated = OrganizationService.updateMemberRole(orgId, param(req.params.id), role, req.auth.user.name);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
app.delete("/api/organization/members/:id", requireAuth, requireOrganization, requireRole("ADMIN"), (req, res) => {
  try {
    const orgId = req.auth.organization.id;
    const success = OrganizationService.removeMember(orgId, param(req.params.id), req.auth.user.name);
    res.json({ success });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
app.get("/api/clients", requireAuth, requireOrganization, (req, res) => {
  try {
    const orgId = req.auth.organization.id;
    const clients = ClientService.getAllClients(orgId);
    res.json(clients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post("/api/clients", requireAuth, requireOrganization, requireRole("MEMBER"), (req, res) => {
  try {
    const orgId = req.auth.organization.id;
    const client = ClientService.createClient(orgId, req.body, req.auth.user.name);
    res.status(201).json(client);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
app.get("/api/clients/:clientId", requireAuth, requireOrganization, (req, res) => {
  try {
    const orgId = req.auth.organization.id;
    const client = ClientService.getClientById(orgId, param(req.params.clientId));
    if (!client) {
      return res.status(404).json({ error: "Client not found in this organization" });
    }
    const contacts = ClientService.getContacts(orgId, param(req.params.clientId));
    res.json({ ...client, contacts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.patch("/api/clients/:clientId", requireAuth, requireOrganization, requireRole("MEMBER"), (req, res) => {
  try {
    const orgId = req.auth.organization.id;
    const client = ClientService.updateClient(orgId, param(req.params.clientId), req.body, req.auth.user.name);
    res.json(client);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
app.get("/api/clients/:clientId/context", requireAuth, requireOrganization, (req, res) => {
  try {
    const orgId = req.auth.organization.id;
    const projectId = req.query.projectId;
    const context = ContextService.getClientContext(orgId, param(req.params.clientId), projectId);
    res.json(context);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});
app.get("/api/projects", requireAuth, requireOrganization, (req, res) => {
  try {
    const orgId = req.auth.organization.id;
    const clientId = req.query.clientId;
    const projects = ProjectService.getProjects(orgId, clientId);
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/projects/:projectId", requireAuth, requireOrganization, (req, res) => {
  try {
    const orgId = req.auth.organization.id;
    const project = ProjectService.getProjectById(orgId, param(req.params.projectId));
    if (!project) return res.status(404).json({ error: "Project not found in this organization" });
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post("/api/projects", requireAuth, requireOrganization, requireRole("MEMBER"), (req, res) => {
  try {
    const orgId = req.auth.organization.id;
    const project = ProjectService.createProject(orgId, { ...req.body, actor_id: req.auth.user.name });
    res.status(201).json(project);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
app.patch("/api/projects/:projectId", requireAuth, requireOrganization, requireRole("MEMBER"), (req, res) => {
  try {
    const orgId = req.auth.organization.id;
    const project = ProjectService.updateProject(orgId, param(req.params.projectId), req.body, req.auth.user.name);
    res.json(project);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
app.get("/api/tasks", requireAuth, requireOrganization, (req, res) => {
  try {
    const orgId = req.auth.organization.id;
    const clientId = req.query.clientId;
    const projectId = req.query.projectId;
    const tasks = TaskService.getTasks(orgId, clientId, projectId);
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post("/api/tasks", requireAuth, requireOrganization, requireRole("MEMBER"), (req, res) => {
  try {
    const orgId = req.auth.organization.id;
    const task = TaskService.createTask(orgId, { ...req.body, actor_id: req.auth.user.name });
    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
app.patch("/api/tasks/:taskId", requireAuth, requireOrganization, requireRole("MEMBER"), (req, res) => {
  try {
    const orgId = req.auth.organization.id;
    const task = TaskService.updateTask(orgId, param(req.params.taskId), req.body, req.auth.user.name);
    res.json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
app.get("/api/memories", requireAuth, requireOrganization, (req, res) => {
  try {
    const orgId = req.auth.organization.id;
    const clientId = req.query.clientId;
    if (!clientId) {
      return res.status(400).json({ error: "clientId query parameter is required. Global memory access prohibited." });
    }
    const query = req.query.q;
    const category = req.query.category;
    if (query) {
      const results = MemoryService.searchMemory(orgId, clientId, query, category);
      return res.json(results);
    }
    const memories = MemoryService.getClientMemory(orgId, clientId, category);
    res.json(memories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post("/api/memories", requireAuth, requireOrganization, requireRole("MEMBER"), (req, res) => {
  try {
    const orgId = req.auth.organization.id;
    const memory = MemoryService.createMemory(orgId, { ...req.body, actor_id: req.auth.user.name });
    res.status(201).json(memory);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
app.patch("/api/memories/:memoryId", requireAuth, requireOrganization, requireRole("MEMBER"), (req, res) => {
  try {
    const orgId = req.auth.organization.id;
    const allowOfficial = Boolean(req.body.allowOfficialOverwrite);
    const memory = MemoryService.updateMemory(orgId, param(req.params.memoryId), req.body, req.auth.user.name, allowOfficial);
    res.json(memory);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
app.post("/api/memories/:memoryId/approve", requireAuth, requireOrganization, requireRole("ADMIN"), (req, res) => {
  try {
    const orgId = req.auth.organization.id;
    const approved = MemoryService.approveMemory(orgId, param(req.params.memoryId), req.auth.user.name);
    res.json(approved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
app.post("/api/memories/:memoryId/archive", requireAuth, requireOrganization, requireRole("ADMIN"), (req, res) => {
  try {
    const orgId = req.auth.organization.id;
    const success = MemoryService.archiveMemory(orgId, param(req.params.memoryId), req.auth.user.name);
    res.json({ success });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
app.get("/api/documents", requireAuth, requireOrganization, (req, res) => {
  try {
    const orgId = req.auth.organization.id;
    const clientId = req.query.clientId;
    const category = req.query.category;
    const docs = DocumentService.getDocuments(orgId, clientId, category);
    res.json(docs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post("/api/documents", requireAuth, requireOrganization, requireRole("MEMBER"), (req, res) => {
  try {
    const orgId = req.auth.organization.id;
    const doc = DocumentService.uploadDocument(orgId, { ...req.body, uploaded_by: req.auth.user.name });
    res.status(201).json(doc);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
app.get("/api/permissions/:clientId", requireAuth, requireOrganization, (req, res) => {
  try {
    const orgId = req.auth.organization.id;
    const perms = PermissionService.getPermissions(orgId, param(req.params.clientId));
    res.json(perms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.patch("/api/permissions/:clientId", requireAuth, requireOrganization, requireRole("ADMIN"), (req, res) => {
  try {
    const orgId = req.auth.organization.id;
    const perms = PermissionService.updatePermissions(orgId, param(req.params.clientId), req.body, req.auth.user.name);
    res.json(perms);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
app.get("/api/activities", requireAuth, requireOrganization, (req, res) => {
  try {
    const orgId = req.auth.organization.id;
    const clientId = req.query.clientId;
    const limit = req.query.limit ? parseInt(req.query.limit) : 50;
    const activities = ActivityService.getActivities(orgId, clientId, limit);
    res.json(activities);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post("/api/seed/reset", (req, res) => {
  try {
    db.resetToSeed();
    res.json({ status: "ok", message: "Database reset to development seed with multi-tenant accounts" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// server/serverless.ts
var serverless_default = app;
export {
  serverless_default as default
};
