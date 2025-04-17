import { Pool, neonConfig } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-serverless'
import * as schema from './schema'
import ws from 'ws'

// Configure Neon for WebSocket
neonConfig.webSocketConstructor = ws

// Check if DATABASE_URL is defined
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL must be set. Did you forget to provision a database?')
}

// Create database connection
export const pool = new Pool({ connectionString: process.env.DATABASE_URL })
export const drizzleClient = drizzle(pool, { schema })

// Ensure we have a single instance of the database client in development
declare global {
  var dbClient: typeof drizzleClient | undefined
}

export const db = globalThis.dbClient || drizzleClient

// In development, maintain a single connection across hot reloads
if (process.env.NODE_ENV !== 'production') {
  globalThis.dbClient = db
}