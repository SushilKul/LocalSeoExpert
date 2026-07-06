import { z } from "zod";

// This file contains Zod schemas for validation
// The actual database schema is defined in server/prisma/schema.prisma

export const UserSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string().email(),
  password: z.string(),
  fullName: z.string(),
  role: z.enum(["business_owner", "agency_manager"]).default("business_owner"),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const insertUserSchema = UserSchema.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const LocationSchema = z.object({
  id: z.number(),
  userId: z.number(),
  name: z.string().min(1, "Name is required"),
  address: z.string().min(1, "Address is required"),
  phone: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  category: z.string().optional(),
  description: z.string().optional(),
  hours: z.any().optional(),
  gmbPlaceId: z.string().optional(),
  gmbAccountId: z.string().optional(),
  status: z.enum(["verified", "pending", "suspended"]).default("pending"),
  rating: z.number().optional(),
  reviewCount: z.number().default(0),
  totalViews: z.number().default(0),
  totalCalls: z.number().default(0),
  totalClicks: z.number().default(0),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const insertLocationSchema = LocationSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const ReviewSchema = z.object({
  id: z.number(),
  locationId: z.number(),
  gmbReviewId: z.string().optional(),
  customerName: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
  reply: z.string().optional(),
  repliedAt: z.date().optional(),
  sentiment: z.string().optional(),
  createdAt: z.date(),
});

export const insertReviewSchema = ReviewSchema.omit({
  id: true,
  createdAt: true
});

export const PostSchema = z.object({
  id: z.number(),
  locationId: z.number(),
  userId: z.number(),
  type: z.enum(["whats_new", "offer", "event", "product"]),
  title: z.string().min(1),
  content: z.string().min(1),
  imageUrl: z.string().optional(),
  callToAction: z.string().optional(),
  actionUrl: z.string().optional(),
  scheduledAt: z.date().optional(),
  publishedAt: z.date().optional(),
  status: z.enum(["draft", "scheduled", "published"]).default("draft"),
  views: z.number().default(0),
  clicks: z.number().default(0),
  createdAt: z.date(),
});

export const insertPostSchema = PostSchema.omit({
  id: true,
  createdAt: true
});

export const PhotoSchema = z.object({
  id: z.number(),
  locationId: z.number(),
  userId: z.number(),
  url: z.string().url(),
  caption: z.string().optional(),
  category: z.string().optional(),
  isProfilePhoto: z.boolean().default(false),
  uploadedAt: z.date(),
});

export const insertPhotoSchema = PhotoSchema.omit({
  id: true,
  uploadedAt: true
});

export const KeywordSchema = z.object({
  id: z.number(),
  locationId: z.number(),
  keyword: z.string().min(1),
  currentRank: z.number().optional(),
  previousRank: z.number().optional(),
  searchVolume: z.number().optional(),
  competition: z.enum(["low", "medium", "high"]).optional(),
  lastChecked: z.date().optional(),
  createdAt: z.date(),
});

export const insertKeywordSchema = KeywordSchema.omit({
  id: true,
  createdAt: true
});

export type User = z.infer<typeof UserSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Location = z.infer<typeof LocationSchema>;
export type InsertLocation = z.infer<typeof insertLocationSchema>;
export type Review = z.infer<typeof ReviewSchema>;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Post = z.infer<typeof PostSchema>;
export type InsertPost = z.infer<typeof insertPostSchema>;
export type Photo = z.infer<typeof PhotoSchema>;
export type InsertPhoto = z.infer<typeof insertPhotoSchema>;
export type Keyword = z.infer<typeof KeywordSchema>;
export type InsertKeyword = z.infer<typeof insertKeywordSchema>;
