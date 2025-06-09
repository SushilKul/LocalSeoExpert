import { pgTable, text, serial, integer, boolean, timestamp, decimal, varchar, json } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  role: text("role").notNull().default("business_owner"), // business_owner, agency_manager
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const locations = pgTable("locations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  phone: text("phone"),
  website: text("website"),
  category: text("category"),
  description: text("description"),
  hours: json("hours").$type<Record<string, string>>(),
  gmbPlaceId: text("gmb_place_id"),
  gmbAccountId: text("gmb_account_id"),
  status: text("status").notNull().default("pending"), // verified, pending, suspended
  rating: decimal("rating", { precision: 3, scale: 2 }),
  reviewCount: integer("review_count").default(0),
  totalViews: integer("total_views").default(0),
  totalCalls: integer("total_calls").default(0),
  totalClicks: integer("total_clicks").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  locationId: integer("location_id").references(() => locations.id).notNull(),
  gmbReviewId: text("gmb_review_id").unique(),
  customerName: text("customer_name").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  reply: text("reply"),
  repliedAt: timestamp("replied_at"),
  sentiment: text("sentiment"), // positive, negative, neutral
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  locationId: integer("location_id").references(() => locations.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  type: text("type").notNull(), // whats_new, offer, event, product
  title: text("title").notNull(),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  callToAction: text("call_to_action"),
  actionUrl: text("action_url"),
  scheduledAt: timestamp("scheduled_at"),
  publishedAt: timestamp("published_at"),
  status: text("status").notNull().default("draft"), // draft, scheduled, published
  views: integer("views").default(0),
  clicks: integer("clicks").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const photos = pgTable("photos", {
  id: serial("id").primaryKey(),
  locationId: integer("location_id").references(() => locations.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  url: text("url").notNull(),
  caption: text("caption"),
  category: text("category"), // exterior, interior, team, products, menu
  isProfilePhoto: boolean("is_profile_photo").default(false),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

export const keywords = pgTable("keywords", {
  id: serial("id").primaryKey(),
  locationId: integer("location_id").references(() => locations.id).notNull(),
  keyword: text("keyword").notNull(),
  currentRank: integer("current_rank"),
  previousRank: integer("previous_rank"),
  searchVolume: integer("search_volume"),
  competition: text("competition"), // low, medium, high
  lastChecked: timestamp("last_checked"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const analytics = pgTable("analytics", {
  id: serial("id").primaryKey(),
  locationId: integer("location_id").references(() => locations.id).notNull(),
  date: timestamp("date").notNull(),
  views: integer("views").default(0),
  searches: integer("searches").default(0),
  calls: integer("calls").default(0),
  directions: integer("directions").default(0),
  websiteClicks: integer("website_clicks").default(0),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  locations: many(locations),
  posts: many(posts),
  photos: many(photos),
}));

export const locationsRelations = relations(locations, ({ one, many }) => ({
  user: one(users, {
    fields: [locations.userId],
    references: [users.id],
  }),
  reviews: many(reviews),
  posts: many(posts),
  photos: many(photos),
  keywords: many(keywords),
  analytics: many(analytics),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  location: one(locations, {
    fields: [reviews.locationId],
    references: [locations.id],
  }),
}));

export const postsRelations = relations(posts, ({ one }) => ({
  location: one(locations, {
    fields: [posts.locationId],
    references: [locations.id],
  }),
  user: one(users, {
    fields: [posts.userId],
    references: [users.id],
  }),
}));

export const photosRelations = relations(photos, ({ one }) => ({
  location: one(locations, {
    fields: [photos.locationId],
    references: [locations.id],
  }),
  user: one(users, {
    fields: [photos.userId],
    references: [users.id],
  }),
}));

export const keywordsRelations = relations(keywords, ({ one }) => ({
  location: one(locations, {
    fields: [keywords.locationId],
    references: [locations.id],
  }),
}));

export const analyticsRelations = relations(analytics, ({ one }) => ({
  location: one(locations, {
    fields: [analytics.locationId],
    references: [locations.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLocationSchema = createInsertSchema(locations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
});

export const insertPostSchema = createInsertSchema(posts).omit({
  id: true,
  createdAt: true,
});

export const insertPhotoSchema = createInsertSchema(photos).omit({
  id: true,
  uploadedAt: true,
});

export const insertKeywordSchema = createInsertSchema(keywords).omit({
  id: true,
  createdAt: true,
});

export const insertAnalyticsSchema = createInsertSchema(analytics).omit({
  id: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Location = typeof locations.$inferSelect;
export type InsertLocation = z.infer<typeof insertLocationSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Post = typeof posts.$inferSelect;
export type InsertPost = z.infer<typeof insertPostSchema>;
export type Photo = typeof photos.$inferSelect;
export type InsertPhoto = z.infer<typeof insertPhotoSchema>;
export type Keyword = typeof keywords.$inferSelect;
export type InsertKeyword = z.infer<typeof insertKeywordSchema>;
export type Analytics = typeof analytics.$inferSelect;
export type InsertAnalytics = z.infer<typeof insertAnalyticsSchema>;
