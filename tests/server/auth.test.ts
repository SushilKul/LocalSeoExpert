import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { registerRoutes } from '../../server/routes';

// Mock storage
vi.mock('../../server/storage', () => {
  const mockUsers = [
    {
      id: 1,
      email: 'test@example.com',
      username: 'testuser',
      password: bcrypt.hashSync('password123', 10),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
  
  return {
    storage: {
      getUserByEmail: vi.fn((email) => {
        const user = mockUsers.find(u => u.email === email);
        return Promise.resolve(user || null);
      }),
      getUserByUsername: vi.fn((username) => {
        const user = mockUsers.find(u => u.username === username);
        return Promise.resolve(user || null);
      }),
      createUser: vi.fn((userData) => {
        const newUser = {
          id: mockUsers.length + 1,
          ...userData,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        mockUsers.push(newUser);
        return Promise.resolve(newUser);
      }),
    },
  };
});

// Mock JWT secret
process.env.JWT_SECRET = 'test_secret';

describe('Authentication API', () => {
  let app: express.Application;
  
  beforeAll(async () => {
    app = express();
    app.use(express.json());
    await registerRoutes(app);
  });
  
  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'newuser@example.com',
        username: 'newuser',
        password: 'password123',
      });
    
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('user');
    expect(res.body.user).toHaveProperty('id');
    expect(res.body.user.email).toBe('newuser@example.com');
    expect(res.body).toHaveProperty('token');
  });
  
  it('should login an existing user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123',
      });
    
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('user');
    expect(res.body.user.email).toBe('test@example.com');
    expect(res.body).toHaveProperty('token');
    
    // Verify token
    const decoded = jwt.verify(res.body.token, process.env.JWT_SECRET as string);
    expect(decoded).toHaveProperty('userId', 1);
  });
  
  it('should reject login with incorrect password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'wrongpassword',
      });
    
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('message', 'Invalid credentials');
  });
  
  it('should reject login for non-existent user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'nonexistent@example.com',
        password: 'password123',
      });
    
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('message', 'Invalid credentials');
  });
});