import { db } from "./db";
import * as schema from "../shared/schema";
import bcrypt from "bcryptjs";
import { faker } from "@faker-js/faker";

async function seed() {
  console.log("Seeding database...");
  
  // Create test user
  const hashedPassword = await bcrypt.hash("password123", 10);
  
  const [user] = await db.insert(schema.users).values({
    email: "demo@example.com",
    username: "demo",
    password: hashedPassword,
    createdAt: new Date(),
    updatedAt: new Date(),
  }).returning();
  
  console.log(`Created user: ${user.email}`);
  
  // Create locations
  const locations = [];
  for (let i = 0; i < 5; i++) {
    const location = await db.insert(schema.locations).values({
      userId: user.id,
      name: faker.company.name(),
      address: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state(),
      zipCode: faker.location.zipCode(),
      phone: faker.phone.number(),
      website: faker.internet.url(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();
    
    locations.push(location[0]);
    console.log(`Created location: ${location[0].name}`);
    
    // Create reviews for each location
    for (let j = 0; j < 3; j++) {
      await db.insert(schema.reviews).values({
        locationId: location[0].id,
        reviewerName: faker.person.fullName(),
        rating: faker.number.int({ min: 1, max: 5 }),
        comment: faker.lorem.paragraph(),
        reviewDate: faker.date.recent(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    
    // Create posts for each location
    for (let j = 0; j < 2; j++) {
      await db.insert(schema.posts).values({
        locationId: location[0].id,
        title: faker.lorem.sentence(),
        content: faker.lorem.paragraphs(2),
        type: faker.helpers.arrayElement(["EVENT", "OFFER", "UPDATE"]),
        mediaUrl: faker.image.url(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    
    // Create keywords for each location
    for (let j = 0; j < 5; j++) {
      const keyword = await db.insert(schema.keywords).values({
        locationId: location[0].id,
        keyword: faker.lorem.words(2),
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning();
      
      // Create rank history for each keyword
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      
      for (let k = 0; k < 30; k++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + k);
        
        await db.insert(schema.keywordRanks).values({
          keywordId: keyword[0].id,
          rank: faker.number.int({ min: 1, max: 100 }),
          date,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }
    
    // Create analytics for each location
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    
    for (let j = 0; j < 30; j++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + j);
      
      await db.insert(schema.analytics).values({
        locationId: location[0].id,
        date,
        views: faker.number.int({ min: 10, max: 1000 }),
        searches: faker.number.int({ min: 5, max: 500 }),
        calls: faker.number.int({ min: 0, max: 50 }),
        websiteClicks: faker.number.int({ min: 1, max: 100 }),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  }
  
  console.log("Database seeding completed!");
}

seed()
  .catch((error) => {
    console.error("Error seeding database:", error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });