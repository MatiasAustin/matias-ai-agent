import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { DatabaseSchema } from './types';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

export const isSupabaseConfigured = (): boolean => {
  return Boolean(supabaseUrl && supabaseKey);
};

export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl!, supabaseKey!, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    })
  : null;

/**
 * Maps application table names to Supabase PostgreSQL table names
 */
const TABLE_MAP: Record<keyof DatabaseSchema, string> = {
  users: 'users',
  organizations: 'organizations',
  organization_members: 'organization_members',
  sessions: 'sessions',
  invitations: 'invitations',
  feature_flags: 'feature_flags',
  clients: 'clients',
  contacts: 'contacts',
  projects: 'projects',
  tasks: 'tasks',
  client_memory: 'client_memory',
  documents: 'documents',
  client_permissions: 'client_permissions',
  activities: 'activities',
  tools: 'tools',
  agents: 'agents',
  agent_tools: 'agent_tools',
  agent_permissions: 'agent_permissions',
  approvals: 'approvals',
  tool_executions: 'tool_executions',
  governance_policies: 'governance_policies',
  integrations: 'integrations',
  conversations: 'conversations',
  conversation_messages: 'conversation_messages',
  integration_events: 'integration_events',
  slack_channel_mappings: 'slack_channel_mappings',
  client_communication_links: 'client_communication_links',
  project_communication_links: 'project_communication_links'
};

/**
 * Primary key column name per table
 */
const PK_MAP: Record<keyof DatabaseSchema, string> = {
  users: 'id',
  organizations: 'id',
  organization_members: 'id',
  sessions: 'id',
  invitations: 'id',
  feature_flags: 'id',
  clients: 'id',
  contacts: 'id',
  projects: 'project_id',
  tasks: 'id',
  client_memory: 'id',
  documents: 'file_id',
  client_permissions: 'id',
  activities: 'id',
  tools: 'id',
  agents: 'id',
  agent_tools: 'id',
  agent_permissions: 'id',
  approvals: 'id',
  tool_executions: 'id',
  governance_policies: 'id',
  integrations: 'id',
  conversations: 'id',
  conversation_messages: 'id',
  integration_events: 'id',
  slack_channel_mappings: 'id',
  client_communication_links: 'id',
  project_communication_links: 'id'
};

/**
 * Loads all tables from Supabase into memory
 */
export async function loadFromSupabase(): Promise<Partial<DatabaseSchema> | null> {
  if (!supabase) return null;

  try {
    const results: Partial<DatabaseSchema> = {};
    const tables = Object.keys(TABLE_MAP) as (keyof DatabaseSchema)[];

    await Promise.all(
      tables.map(async (tableKey) => {
        const pgTable = TABLE_MAP[tableKey];
        const { data, error } = await supabase!.from(pgTable).select('*');
        if (error) {
          console.warn(`Supabase: failed to select from ${pgTable}:`, error.message);
          return;
        }
        if (data) {
          (results as any)[tableKey] = data;
        }
      })
    );

    return results;
  } catch (err) {
    console.error('Supabase loadFromSupabase unexpected error:', err);
    return null;
  }
}

/**
 * Upserts a single record into Supabase
 */
export async function upsertToSupabase<K extends keyof DatabaseSchema>(
  table: K,
  record: any
): Promise<void> {
  if (!supabase) return;

  const pgTable = TABLE_MAP[table];
  const pk = PK_MAP[table];

  try {
    const { error } = await (supabase as any).from(pgTable).upsert(record, { onConflict: pk });
    if (error) {
      console.warn(`Supabase upsert error on ${pgTable}:`, error.message);
    }
  } catch (err) {
    console.warn(`Supabase upsert exception on ${pgTable}:`, err);
  }
}

/**
 * Bulk upserts an array of records into Supabase
 */
export async function bulkUpsertToSupabase<K extends keyof DatabaseSchema>(
  table: K,
  records: any[]
): Promise<void> {
  if (!supabase || !records || records.length === 0) return;

  const pgTable = TABLE_MAP[table];
  const pk = PK_MAP[table];

  try {
    const { error } = await (supabase as any).from(pgTable).upsert(records, { onConflict: pk });
    if (error) {
      console.warn(`Supabase bulkUpsert error on ${pgTable}:`, error.message);
    }
  } catch (err) {
    console.warn(`Supabase bulkUpsert exception on ${pgTable}:`, err);
  }
}

/**
 * Deletes a record from Supabase by primary key
 */
export async function deleteFromSupabase<K extends keyof DatabaseSchema>(
  table: K,
  idValue: string
): Promise<void> {
  if (!supabase) return;

  const pgTable = TABLE_MAP[table];
  const pk = PK_MAP[table];

  try {
    const { error } = await (supabase as any).from(pgTable).delete().eq(pk, idValue);
    if (error) {
      console.warn(`Supabase delete error on ${pgTable}:`, error.message);
    }
  } catch (err) {
    console.warn(`Supabase delete exception on ${pgTable}:`, err);
  }
}
