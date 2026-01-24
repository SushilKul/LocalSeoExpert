import { db } from "./db";
import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { faker } from "@faker-js/faker";

async function seed() {
  console.log("Seeding database...");
  
  // Create test user
  const hashedPassword = await bcrypt.hash("password123", 10);
  
  // Check if user exists
  const existingUser = await db.user.findUnique({
    where: { email: "demo@example.com" }
  });

  let user;

  if (existingUser) {
    user = existingUser;
    console.log(`User already exists: ${user.email}`);
  } else {
    user = await db.user.create({
      data: {
        email: "demo@example.com",
        username: "demo",
        password: hashedPassword,
        fullName: "Demo User",
        role: "business_owner",
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    });
    console.log(`Created user: ${user.email}`);
  }
  
  // Create locations
  for (let i = 0; i < 5; i++) {
    const location = await db.location.create({
      data: {
        userId: user.id,
        name: faker.company.name(),
        address: `${faker.location.streetAddress()}, ${faker.location.city()}, ${faker.location.state()} ${faker.location.zipCode()}`,
        phone: faker.phone.number(),
        website: faker.internet.url(),
        status: "verified",
        rating: new Prisma.Decimal(faker.number.float({ min: 3, max: 5, fractionDigits: 1 })),
        reviewCount: faker.number.int({ min: 0, max: 100 }),
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    });
    
    console.log(`Created location: ${location.name}`);
    
    // Create reviews for each location
    for (let j = 0; j < 3; j++) {
      await db.review.create({
        data: {
          locationId: location.id,
          customerName: faker.person.fullName(),
          rating: faker.number.int({ min: 1, max: 5 }),
          comment: faker.lorem.paragraph(),
          createdAt: faker.date.recent(),
        }
      });
    }
    
    // Create posts for each location
    for (let j = 0; j < 2; j++) {
      await db.post.create({
        data: {
          locationId: location.id,
          userId: user.id,
          title: faker.lorem.sentence(),
          content: faker.lorem.paragraphs(2),
          type: faker.helpers.arrayElement(["EVENT", "OFFER", "UPDATE"]),
          imageUrl: faker.image.url(),
          createdAt: new Date(),
        }
      });
    }
    
    // Create keywords for each location
    for (let j = 0; j < 5; j++) {
      const keyword = await db.keyword.create({
        data: {
          locationId: location.id,
          keyword: faker.lorem.words(2),
          createdAt: new Date(),
        }
      });
      
      // Create rank history for each keyword
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      
      for (let k = 0; k < 30; k++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + k);
        
        await db.keywordRank.create({
          data: {
            keywordId: keyword.id,
            rank: faker.number.int({ min: 1, max: 100 }),
            date,
            createdAt: new Date(),
            updatedAt: new Date(),
          }
        });
      }
    }
    
    // Create analytics for each location
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    
    for (let j = 0; j < 30; j++) {
       const date = new Date(startDate);
       date.setDate(date.getDate() + j);

       await db.analytics.create({
         data: {
           locationId: location.id,
           date: date,
           views: faker.number.int({ min: 10, max: 100 }),
           searches: faker.number.int({ min: 5, max: 50 }),
           calls: faker.number.int({ min: 0, max: 10 }),
           directions: faker.number.int({ min: 0, max: 20 }),
           websiteClicks: faker.number.int({ min: 0, max: 15 }),
         }
       });
    }
  }
  
  console.log("Seeding completed successfully");
}

seed().catch((error) => {
  console.error("Seeding failed:", error);
  process.exit(1);
});




