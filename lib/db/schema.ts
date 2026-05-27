import {
  pgTable,
  uuid,
  text,
  timestamp,
  jsonb,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const roleEnum = pgEnum("role", ["user", "admin"]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").unique().notNull(),
  passwordHash: text("password_hash").notNull(),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const refreshTokens = pgTable("refresh_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  token: text("token").unique().notNull(),
  isRevoked: boolean("is_revoked").default(false).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==========================================
// 3. USER PROFILE (BASELINE DATA)
// ==========================================
export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull()
    .unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  githubUrl: text("github_url"),
  linkedinUrl: text("linkedin_url"),
  portfolioUrl: text("portfolio_url"),
});

export const experiences = pgTable("experiences", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  company: text("company").notNull(),
  title: text("title").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"), // null = present
  descriptionBullets: jsonb("description_bullets").default([]).notNull(), // Array of strings
});

export const educations = pgTable("educations", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  institution: text("institution").notNull(),
  degree: text("degree").notNull(),
  fieldOfStudy: text("field_of_study").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
});

// export const skills = pgTable("skills", {
//   id: uuid("id").primaryKey().defaultRandom(),
//   userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
//   category: text("category").notNull(), // e.g., "Languages", "Frameworks"
//   items: jsonb("items").default([]).notNull(), // e.g., ["React", "Next.js", "Node"]
// });

// export const projects = pgTable("projects", {
//   id: uuid("id").primaryKey().defaultRandom(),
//   userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
//   name: text("name").notNull(),
//   description: text("description").notNull(),
//   technologies: jsonb("technologies").default([]).notNull(),
//   link: text("link"),
//   githubLink: text("github_link"),
// });

// // ==========================================
// // 4. AI GENERATED RESUMES (THE OUTPUT)
// // ==========================================
// export const resumes = pgTable("resumes", {
//   id: uuid("id").primaryKey().defaultRandom(),
//   userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
//   jobDescription: text("job_description").notNull(),
//   generatedContent: jsonb("generated_content").notNull(), // The strict JSON payload from the LLM
//   createdAt: timestamp("created_at").defaultNow().notNull(),
// });

// // ==========================================
// // 5. DRIZZLE RELATIONS (For easy querying)
// // ==========================================

// export const usersRelations = relations(users, ({ one, many }) => ({
//   profile: one(profiles, {
//     fields: [users.id],
//     references: [profiles.userId],
//   }),
//   refreshTokens: many(refreshTokens),
//   experiences: many(experiences),
//   educations: many(educations),
//   skills: many(skills),
//   projects: many(projects),
//   resumes: many(resumes),
// }));

// // Example of a reverse relation for experiences back to the user
// export const experiencesRelations = relations(experiences, ({ one }) => ({
//   user: one(users, {
//     fields: [experiences.userId],
//     references: [users.id],
//   }),
// }));
