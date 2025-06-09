import type { Express } from "express";
import { createServer, type Server } from "http";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { storage } from "./storage";
import { 
  insertUserSchema, insertLocationSchema, insertReviewSchema, 
  insertPostSchema, insertPhotoSchema, insertKeywordSchema,
  type User 
} from "@shared/schema";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Auth middleware
async function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    const user = await storage.getUser(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: "Invalid token" });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
      
      // Don't send password back
      const { password, ...userWithoutPassword } = user;
      
      res.json({ user: userWithoutPassword, token });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
      
      // Don't send password back
      const { password: _, ...userWithoutPassword } = user;
      
      res.json({ user: userWithoutPassword, token });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req: any, res) => {
    const { password, ...userWithoutPassword } = req.user;
    res.json({ user: userWithoutPassword });
  });

  // Dashboard routes
  app.get("/api/dashboard/stats", authenticateToken, async (req: any, res) => {
    try {
      const stats = await storage.getDashboardStats(req.user.id);
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Location routes
  app.get("/api/locations", authenticateToken, async (req: any, res) => {
    try {
      const locations = await storage.getLocationsByUserId(req.user.id);
      res.json(locations);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/locations/:id", authenticateToken, async (req: any, res) => {
    try {
      const locationId = parseInt(req.params.id);
      const location = await storage.getLocation(locationId);
      
      if (!location) {
        return res.status(404).json({ message: "Location not found" });
      }

      // Check if user owns this location
      if (location.userId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(location);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/locations", authenticateToken, async (req: any, res) => {
    try {
      const locationData = insertLocationSchema.parse({
        ...req.body,
        userId: req.user.id,
      });
      
      const location = await storage.createLocation(locationData);
      res.status(201).json(location);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/locations/:id", authenticateToken, async (req: any, res) => {
    try {
      const locationId = parseInt(req.params.id);
      const location = await storage.getLocation(locationId);
      
      if (!location) {
        return res.status(404).json({ message: "Location not found" });
      }

      if (location.userId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      const updateData = insertLocationSchema.partial().parse(req.body);
      const updatedLocation = await storage.updateLocation(locationId, updateData);
      
      res.json(updatedLocation);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/locations/:id", authenticateToken, async (req: any, res) => {
    try {
      const locationId = parseInt(req.params.id);
      const location = await storage.getLocation(locationId);
      
      if (!location) {
        return res.status(404).json({ message: "Location not found" });
      }

      if (location.userId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      const deleted = await storage.deleteLocation(locationId);
      if (!deleted) {
        return res.status(500).json({ message: "Failed to delete location" });
      }
      
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Review routes
  app.get("/api/locations/:id/reviews", authenticateToken, async (req: any, res) => {
    try {
      const locationId = parseInt(req.params.id);
      const location = await storage.getLocation(locationId);
      
      if (!location || location.userId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      const limit = req.query.limit ? parseInt(req.query.limit) : undefined;
      const reviews = await storage.getReviewsByLocationId(locationId, limit);
      res.json(reviews);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/reviews/pending", authenticateToken, async (req: any, res) => {
    try {
      const reviews = await storage.getUnrepliedReviews(req.user.id);
      res.json(reviews);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/reviews/:id/reply", authenticateToken, async (req: any, res) => {
    try {
      const reviewId = parseInt(req.params.id);
      const { reply } = req.body;
      
      if (!reply || typeof reply !== 'string') {
        return res.status(400).json({ message: "Reply text is required" });
      }

      const review = await storage.getReview(reviewId);
      if (!review) {
        return res.status(404).json({ message: "Review not found" });
      }

      // Check if user owns the location
      const location = await storage.getLocation(review.locationId);
      if (!location || location.userId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      const updatedReview = await storage.updateReview(reviewId, {
        reply,
        repliedAt: new Date(),
      });
      
      res.json(updatedReview);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Post routes
  app.get("/api/locations/:id/posts", authenticateToken, async (req: any, res) => {
    try {
      const locationId = parseInt(req.params.id);
      const location = await storage.getLocation(locationId);
      
      if (!location || location.userId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      const limit = req.query.limit ? parseInt(req.query.limit) : undefined;
      const posts = await storage.getPostsByLocationId(locationId, limit);
      res.json(posts);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/posts", authenticateToken, async (req: any, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit) : undefined;
      const posts = await storage.getPostsByUserId(req.user.id, limit);
      res.json(posts);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/posts", authenticateToken, async (req: any, res) => {
    try {
      const postData = insertPostSchema.parse({
        ...req.body,
        userId: req.user.id,
      });

      // Verify user owns the location
      const location = await storage.getLocation(postData.locationId);
      if (!location || location.userId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const post = await storage.createPost(postData);
      res.status(201).json(post);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Photo routes
  app.get("/api/locations/:id/photos", authenticateToken, async (req: any, res) => {
    try {
      const locationId = parseInt(req.params.id);
      const location = await storage.getLocation(locationId);
      
      if (!location || location.userId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      const photos = await storage.getPhotosByLocationId(locationId);
      res.json(photos);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/photos", authenticateToken, async (req: any, res) => {
    try {
      const photoData = insertPhotoSchema.parse({
        ...req.body,
        userId: req.user.id,
      });

      // Verify user owns the location
      const location = await storage.getLocation(photoData.locationId);
      if (!location || location.userId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const photo = await storage.createPhoto(photoData);
      res.status(201).json(photo);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Keyword routes
  app.get("/api/locations/:id/keywords", authenticateToken, async (req: any, res) => {
    try {
      const locationId = parseInt(req.params.id);
      const location = await storage.getLocation(locationId);
      
      if (!location || location.userId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      const keywords = await storage.getKeywordsByLocationId(locationId);
      res.json(keywords);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/keywords", authenticateToken, async (req: any, res) => {
    try {
      const keywordData = insertKeywordSchema.parse(req.body);

      // Verify user owns the location
      const location = await storage.getLocation(keywordData.locationId);
      if (!location || location.userId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const keyword = await storage.createKeyword(keywordData);
      res.status(201).json(keyword);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
