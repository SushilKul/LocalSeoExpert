import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Check for DATABASE_URL
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set in your .env file. Did you forget to provision a database?",
  );
}

// Create Prisma client instance
export const prisma = new PrismaClient();

// Export as db for backward compatibility
export const db = prisma;

// Initialize database
export async function initializeDatabase() {
  console.log('🔄 Connecting to database...');
  
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    return prisma;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

// Close database connection
export async function closeDatabase() {
  await prisma.$disconnect();
  console.log('Database connection closed');
}