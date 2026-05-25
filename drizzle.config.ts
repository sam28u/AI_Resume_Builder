export default {
  // Path to your TypeScript file where database tables are defined
  schema: "./lib/db/schema.ts", 
  
  // Folder where Drizzle will save auto-generated SQL migration files
  out: "./drizzle",         
  
  // Database dialect target
  dialect: "postgresql",    
  
  // Database connection credentials pulled from your environment file
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
};