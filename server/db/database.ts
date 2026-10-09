import fs from 'fs';
import path from 'path';
import { DatabaseSchema } from './types';
import { initialDevelopmentSeed } from './seed';

class Database {
  private dbPath: string;
  private memoryCache: DatabaseSchema | null = null;

  constructor() {
    // Choose appropriate persistence path for local vs serverless
    const isServerless = process.env.VERCEL === '1' || process.env.AWS_LAMBDA_FUNCTION_NAME !== undefined;
    if (isServerless) {
      this.dbPath = path.join('/tmp', 'matias_studio_db.json');
    } else {
      const dataDir = path.resolve(process.cwd(), 'data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      this.dbPath = path.join(dataDir, 'db.json');
    }

    this.init();
  }

  private init(): void {
    try {
      if (fs.existsSync(this.dbPath)) {
        const raw = fs.readFileSync(this.dbPath, 'utf-8');
        this.memoryCache = JSON.parse(raw);
      } else {
        // Initialize with seed data
        this.memoryCache = JSON.parse(JSON.stringify(initialDevelopmentSeed));
        this.persist();
      }
    } catch (err) {
      console.error('Failed to load database file, falling back to seed in memory:', err);
      this.memoryCache = JSON.parse(JSON.stringify(initialDevelopmentSeed));
    }
  }

  private persist(): void {
    if (!this.memoryCache) return;
    try {
      const serialized = JSON.stringify(this.memoryCache, null, 2);
      fs.writeFileSync(this.dbPath, serialized, 'utf-8');
    } catch (err) {
      console.warn('Persistence to filesystem failed (e.g. read-only env):', err);
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
    return updated;
  }

  public getFullSchema(): DatabaseSchema {
    if (!this.memoryCache) this.init();
    return JSON.parse(JSON.stringify(this.memoryCache!));
  }

  public resetToSeed(): void {
    this.memoryCache = JSON.parse(JSON.stringify(initialDevelopmentSeed));
    this.persist();
  }
}

export const db = new Database();
