import { 
  users, locations, reviews, posts, photos, keywords, analytics,
  type User, type InsertUser, type Location, type InsertLocation,
  type Review, type InsertReview, type Post, type InsertPost,
  type Photo, type InsertPhoto, type Keyword, type InsertKeyword,
  type Analytics, type InsertAnalytics
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, gte, lte } from "drizzle-orm";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;

  // Location methods
  getLocationsByUserId(userId: number): Promise<Location[]>;
  getLocation(id: number): Promise<Location | undefined>;
  createLocation(location: InsertLocation): Promise<Location>;
  updateLocation(id: number, location: Partial<InsertLocation>): Promise<Location | undefined>;
  deleteLocation(id: number): Promise<boolean>;

  // Review methods
  getReviewsByLocationId(locationId: number, limit?: number): Promise<Review[]>;
  getReview(id: number): Promise<Review | undefined>;
  createReview(review: InsertReview): Promise<Review>;
  updateReview(id: number, review: Partial<InsertReview>): Promise<Review | undefined>;
  getUnrepliedReviews(userId: number): Promise<Review[]>;

  // Post methods
  getPostsByLocationId(locationId: number, limit?: number): Promise<Post[]>;
  getPostsByUserId(userId: number, limit?: number): Promise<Post[]>;
  getPost(id: number): Promise<Post | undefined>;
  createPost(post: InsertPost): Promise<Post>;
  updatePost(id: number, post: Partial<InsertPost>): Promise<Post | undefined>;
  deletePost(id: number): Promise<boolean>;

  // Photo methods
  getPhotosByLocationId(locationId: number): Promise<Photo[]>;
  createPhoto(photo: InsertPhoto): Promise<Photo>;
  deletePhoto(id: number): Promise<boolean>;

  // Keyword methods
  getKeywordsByLocationId(locationId: number): Promise<Keyword[]>;
  createKeyword(keyword: InsertKeyword): Promise<Keyword>;
  updateKeyword(id: number, keyword: Partial<InsertKeyword>): Promise<Keyword | undefined>;
  deleteKeyword(id: number): Promise<boolean>;

  // Analytics methods
  getAnalyticsByLocationId(locationId: number, startDate: Date, endDate: Date): Promise<Analytics[]>;
  createAnalytics(analytics: InsertAnalytics): Promise<Analytics>;
  
  // Dashboard methods
  getDashboardStats(userId: number): Promise<{
    totalLocations: number;
    totalReviews: number;
    averageRating: number;
    totalViews: number;
    pendingReviews: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        updatedAt: new Date(),
      })
      .returning();
    return user;
  }

  async updateUser(id: number, updateUser: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({
        ...updateUser,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async getLocationsByUserId(userId: number): Promise<Location[]> {
    return await db.select().from(locations).where(eq(locations.userId, userId));
  }

  async getLocation(id: number): Promise<Location | undefined> {
    const [location] = await db.select().from(locations).where(eq(locations.id, id));
    return location || undefined;
  }

  async createLocation(insertLocation: InsertLocation): Promise<Location> {
    const [location] = await db
      .insert(locations)
      .values({
        ...insertLocation,
        updatedAt: new Date(),
      })
      .returning();
    return location;
  }

  async updateLocation(id: number, updateLocation: Partial<InsertLocation>): Promise<Location | undefined> {
    const [location] = await db
      .update(locations)
      .set({
        ...updateLocation,
        updatedAt: new Date(),
      })
      .where(eq(locations.id, id))
      .returning();
    return location || undefined;
  }

  async deleteLocation(id: number): Promise<boolean> {
    const result = await db.delete(locations).where(eq(locations.id, id));
    return result.rowCount > 0;
  }

  async getReviewsByLocationId(locationId: number, limit = 50): Promise<Review[]> {
    return await db
      .select()
      .from(reviews)
      .where(eq(reviews.locationId, locationId))
      .orderBy(desc(reviews.createdAt))
      .limit(limit);
  }

  async getReview(id: number): Promise<Review | undefined> {
    const [review] = await db.select().from(reviews).where(eq(reviews.id, id));
    return review || undefined;
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const [review] = await db.insert(reviews).values(insertReview).returning();
    return review;
  }

  async updateReview(id: number, updateReview: Partial<InsertReview>): Promise<Review | undefined> {
    const [review] = await db
      .update(reviews)
      .set(updateReview)
      .where(eq(reviews.id, id))
      .returning();
    return review || undefined;
  }

  async getUnrepliedReviews(userId: number): Promise<Review[]> {
    return await db
      .select()
      .from(reviews)
      .innerJoin(locations, eq(reviews.locationId, locations.id))
      .where(and(
        eq(locations.userId, userId),
        sql`${reviews.reply} IS NULL`
      ))
      .orderBy(desc(reviews.createdAt));
  }

  async getPostsByLocationId(locationId: number, limit = 20): Promise<Post[]> {
    return await db
      .select()
      .from(posts)
      .where(eq(posts.locationId, locationId))
      .orderBy(desc(posts.createdAt))
      .limit(limit);
  }

  async getPostsByUserId(userId: number, limit = 20): Promise<Post[]> {
    return await db
      .select()
      .from(posts)
      .where(eq(posts.userId, userId))
      .orderBy(desc(posts.createdAt))
      .limit(limit);
  }

  async getPost(id: number): Promise<Post | undefined> {
    const [post] = await db.select().from(posts).where(eq(posts.id, id));
    return post || undefined;
  }

  async createPost(insertPost: InsertPost): Promise<Post> {
    const [post] = await db.insert(posts).values(insertPost).returning();
    return post;
  }

  async updatePost(id: number, updatePost: Partial<InsertPost>): Promise<Post | undefined> {
    const [post] = await db
      .update(posts)
      .set(updatePost)
      .where(eq(posts.id, id))
      .returning();
    return post || undefined;
  }

  async deletePost(id: number): Promise<boolean> {
    const result = await db.delete(posts).where(eq(posts.id, id));
    return result.rowCount > 0;
  }

  async getPhotosByLocationId(locationId: number): Promise<Photo[]> {
    return await db
      .select()
      .from(photos)
      .where(eq(photos.locationId, locationId))
      .orderBy(desc(photos.uploadedAt));
  }

  async createPhoto(insertPhoto: InsertPhoto): Promise<Photo> {
    const [photo] = await db.insert(photos).values(insertPhoto).returning();
    return photo;
  }

  async deletePhoto(id: number): Promise<boolean> {
    const result = await db.delete(photos).where(eq(photos.id, id));
    return result.rowCount > 0;
  }

  async getKeywordsByLocationId(locationId: number): Promise<Keyword[]> {
    return await db
      .select()
      .from(keywords)
      .where(eq(keywords.locationId, locationId))
      .orderBy(desc(keywords.lastChecked));
  }

  async createKeyword(insertKeyword: InsertKeyword): Promise<Keyword> {
    const [keyword] = await db.insert(keywords).values(insertKeyword).returning();
    return keyword;
  }

  async updateKeyword(id: number, updateKeyword: Partial<InsertKeyword>): Promise<Keyword | undefined> {
    const [keyword] = await db
      .update(keywords)
      .set(updateKeyword)
      .where(eq(keywords.id, id))
      .returning();
    return keyword || undefined;
  }

  async deleteKeyword(id: number): Promise<boolean> {
    const result = await db.delete(keywords).where(eq(keywords.id, id));
    return result.rowCount > 0;
  }

  async getAnalyticsByLocationId(locationId: number, startDate: Date, endDate: Date): Promise<Analytics[]> {
    return await db
      .select()
      .from(analytics)
      .where(and(
        eq(analytics.locationId, locationId),
        gte(analytics.date, startDate),
        lte(analytics.date, endDate)
      ))
      .orderBy(desc(analytics.date));
  }

  async createAnalytics(insertAnalytics: InsertAnalytics): Promise<Analytics> {
    const [analyticsData] = await db.insert(analytics).values(insertAnalytics).returning();
    return analyticsData;
  }

  async getDashboardStats(userId: number): Promise<{
    totalLocations: number;
    totalReviews: number;
    averageRating: number;
    totalViews: number;
    pendingReviews: number;
  }> {
    const userLocations = await db.select().from(locations).where(eq(locations.userId, userId));
    const locationIds = userLocations.map(loc => loc.id);

    const totalLocations = userLocations.length;
    const totalViews = userLocations.reduce((sum, loc) => sum + (loc.totalViews || 0), 0);
    const totalReviewCount = userLocations.reduce((sum, loc) => sum + (loc.reviewCount || 0), 0);
    
    // Calculate average rating
    const locationsWithRatings = userLocations.filter(loc => loc.rating && loc.reviewCount && loc.reviewCount > 0);
    const averageRating = locationsWithRatings.length > 0
      ? locationsWithRatings.reduce((sum, loc) => sum + parseFloat(loc.rating!), 0) / locationsWithRatings.length
      : 0;

    // Count pending reviews
    const pendingReviews = locationIds.length > 0 
      ? (await this.getUnrepliedReviews(userId)).length 
      : 0;

    return {
      totalLocations,
      totalReviews: totalReviewCount,
      averageRating: Math.round(averageRating * 10) / 10,
      totalViews,
      pendingReviews,
    };
  }
}

export const storage = new DatabaseStorage();

// Example: Get all users
export async function getAllUsers() {
  return prisma.user.findMany();
}

// Example: Create a business
export async function createBusiness(data: { name: string; address: string; ownerId: number }) {
  return prisma.business.create({ data });
}
