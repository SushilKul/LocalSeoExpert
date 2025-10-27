// Remove all Drizzle and Neon imports
// import { Pool, neonConfig } from '@neondatabase/serverless';
// import { drizzle } from 'drizzle-orm/neon-serverless';
// import ws from "ws";
// import * as schema from "@shared/schema";

// neonConfig.webSocketConstructor = ws;

// if (!process.env.DATABASE_URL) {
//   throw new Error(
//     "DATABASE_URL must be set. Did you forget to provision a database?",
//   );
// }

// export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
// export const db = drizzle({ client: pool, schema });

// --- Replace with Prisma setup below ---

import { PrismaClient } from '@prisma/client';
export const db = new PrismaClient();

const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

module.exports = pool;


import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { db, pool } from './db.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Run migrations
async function runMigrations() {
  console.log('🔄 Running database migrations...');
  
  try {
    await migrate(db, { migrationsFolder: './drizzle' });
    console.log('✅ Migrations completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    // Close the pool when done
    await pool.end();
  }
}

runMigrations();