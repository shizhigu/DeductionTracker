import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "./schema";

// This is needed for Neon serverless
neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });

// When using Next.js server components, we need to make sure 
// not to initialize the db client more than once
declare global {
  var dbClient: typeof db | undefined;
}

// Initialize only once in development
export const drizzleClient = globalThis.dbClient || db;

if (process.env.NODE_ENV !== "production") {
  globalThis.dbClient = db;
}