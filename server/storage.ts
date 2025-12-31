import { PrismaClient } from '@prisma/client';
import { db } from "./db";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<any | undefined>;
  getUserByUsername(username: string): Promise<any | undefined>;
  getUserByEmail(email: string): Promise<any | undefined>;
  createUser(user: any): Promise<any>;
  updateUser(id: number, user: any): Promise<any | undefined>;

  // Location methods
  getLocationsByUserId(userId: number): Promise<any[]>;
  getLocation(id: number): Promise<any | undefined>;
  createLocation(location: any): Promise<any>;
  updateLocation(id: number, location: any): Promise<any | undefined>;
  deleteLocation(id: number): Promise<boolean>;

  // Review methods
  getReviewsByLocationId(locationId: number, limit?: number): Promise<any[]>;
  getReview(id: number): Promise<any | undefined>;
  createReview(review: any): Promise<any>;
  updateReview(id: number, review: any): Promise<any | undefined>;
  getUnrepliedReviews(userId: number): Promise<any[]>;

  // Post methods
  getPostsByLocationId(locationId: number, limit?: number): Promise<any[]>;
  getPostsByUserId(userId: number, limit?: number): Promise<any[]>;
  getPost(id: number): Promise<any | undefined>;
  createPost(post: any): Promise<any>;
  updatePost(id: number, post: any): Promise<any | undefined>;
  deletePost(id: number): Promise<boolean>;

  // Photo methods
  getPhotosByLocationId(locationId: number): Promise<any[]>;
  createPhoto(photo: any): Promise<any>;
  deletePhoto(id: number): Promise<boolean>;

  // Keyword methods
  getKeywordsByLocationId(locationId: number): Promise<any[]>;
  createKeyword(keyword: any): Promise<any>;
  updateKeyword(id: number, keyword: any): Promise<any | undefined>;
  deleteKeyword(id: number): Promise<boolean>;

  // Analytics methods
  getAnalyticsByLocationId(locationId: number, startDate: Date, endDate: Date): Promise<any[]>;
  createAnalytics(analytics: any): Promise<any>;
  
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
  async getUser(id: number): Promise<any | undefined> {
    return await db.user.findUnique({
      where: { id }
    });
  }

  async getUserByUsername(username: string): Promise<any | undefined> {
    return await db.user.findUnique({
      where: { username }
    });
  }

  async getUserByEmail(email: string): Promise<any | undefined> {
    return await db.user.findUnique({
      where: { email }
    });
  }

  async createUser(user: any): Promise<any> {
    return await db.user.create({
      data: {
        ...user,
        updatedAt: new Date()
      }
    });
  }

  async updateUser(id: number, updateData: any): Promise<any | undefined> {
    return await db.user.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date()
      }
    });
  }

  async getLocationsByUserId(userId: number): Promise<any[]> {
    return await db.location.findMany({
      where: { userId }
    });
  }

  async getLocation(id: number): Promise<any | undefined> {
    return await db.location.findUnique({
      where: { id }
    });
  }

  async createLocation(location: any): Promise<any> {
    return await db.location.create({
      data: {
        ...location,
        updatedAt: new Date()
      }
    });
  }

  async updateLocation(id: number, updateData: any): Promise<any | undefined> {
    return await db.location.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date()
      }
    });
  }

  async deleteLocation(id: number): Promise<boolean> {
    await db.location.delete({
      where: { id }
    });
    return true;
  }

  async getReviewsByLocationId(locationId: number, limit?: number): Promise<any[]> {
    return await db.review.findMany({
      where: { locationId },
      orderBy: { createdAt: 'desc' },
      take: limit
    });
  }

  async getReview(id: number): Promise<any | undefined> {
    return await db.review.findUnique({
      where: { id }
    });
  }

  async createReview(review: any): Promise<any> {
    return await db.review.create({
      data: review
    });
  }

  async updateReview(id: number, updateData: any): Promise<any | undefined> {
    return await db.review.update({
      where: { id },
      data: updateData
    });
  }

  async getUnrepliedReviews(userId: number): Promise<any[]> {
    return await db.review.findMany({
      where: {
        reply: null,
        location: {
          userId
        }
      },
      include: {
        location: true
      }
    });
  }

  async getPostsByLocationId(locationId: number, limit?: number): Promise<any[]> {
    return await db.post.findMany({
      where: { locationId },
      orderBy: { createdAt: 'desc' },
      take: limit
    });
  }

  async getPostsByUserId(userId: number, limit?: number): Promise<any[]> {
    return await db.post.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit
    });
  }

  async getPost(id: number): Promise<any | undefined> {
    return await db.post.findUnique({
      where: { id }
    });
  }

  async createPost(post: any): Promise<any> {
    return await db.post.create({
      data: post
    });
  }

  async updatePost(id: number, updateData: any): Promise<any | undefined> {
    return await db.post.update({
      where: { id },
      data: updateData
    });
  }

  async deletePost(id: number): Promise<boolean> {
    await db.post.delete({
      where: { id }
    });
    return true;
  }

  async getPhotosByLocationId(locationId: number): Promise<any[]> {
    return await db.photo.findMany({
      where: { locationId }
    });
  }

  async createPhoto(photo: any): Promise<any> {
    return await db.photo.create({
      data: photo
    });
  }

  async deletePhoto(id: number): Promise<boolean> {
    await db.photo.delete({
      where: { id }
    });
    return true;
  }

  async getKeywordsByLocationId(locationId: number): Promise<any[]> {
    return await db.keyword.findMany({
      where: { locationId }
    });
  }

  async createKeyword(keyword: any): Promise<any> {
    return await db.keyword.create({
      data: keyword
    });
  }

  async updateKeyword(id: number, updateData: any): Promise<any | undefined> {
    return await db.keyword.update({
      where: { id },
      data: updateData
    });
  }

  async deleteKeyword(id: number): Promise<boolean> {
    await db.keyword.delete({
      where: { id }
    });
    return true;
  }

  async getAnalyticsByLocationId(locationId: number, startDate: Date, endDate: Date): Promise<any[]> {
    return await db.analytics.findMany({
      where: {
        locationId,
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: {
        date: 'asc'
      }
    });
  }

  async createAnalytics(analytics: any): Promise<any> {
    return await db.analytics.create({
      data: analytics
    });
  }

  async getDashboardStats(userId: number): Promise<{
    totalLocations: number;
    totalReviews: number;
    averageRating: number;
    totalViews: number;
    pendingReviews: number;
  }> {
    const totalLocations = await db.location.count({
      where: { userId }
    });

    const locations = await db.location.findMany({
      where: { userId },
      select: { id: true }
    });
    
    const locationIds = locations.map(loc => loc.id);
    
    const totalReviews = await db.review.count({
      where: {
        locationId: { in: locationIds }
      }
    });
    
    const reviewStats = await db.$queryRaw`
      SELECT AVG(rating) as "averageRating"
      FROM "Review"
      WHERE "location_id" IN (${locationIds.join(',')})
    `;
    
    const averageRating = reviewStats[0]?.averageRating || 0;
    
    const viewsStats = await db.location.aggregate({
      where: { userId },
      _sum: {
        totalViews: true
      }
    });
    
    const totalViews = viewsStats._sum.totalViews || 0;
    
    const pendingReviews = await db.review.count({
      where: {
        locationId: { in: locationIds },
        reply: null
      }
    });
    
    return {
      totalLocations,
      totalReviews,
      averageRating: parseFloat(averageRating),
      totalViews,
      pendingReviews
    };
  }
}
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
