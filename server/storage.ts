import { Prisma } from "@prisma/client";
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
    
    const reviewStats = await db.$queryRaw<any[]>`
      SELECT AVG(rating) as "averageRating"
      FROM "Review"
      WHERE "locationId" IN (${Prisma.join(locationIds)})
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

export const storage = new DatabaseStorage();
