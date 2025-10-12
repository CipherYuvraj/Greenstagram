// MongoDB initialization script for Greenstagram
db = db.getSiblingDB('greenstagram');

// Create collections with initial data
db.createCollection('users');
db.createCollection('posts');
db.createCollection('challenges');
db.createCollection('badges');
db.createCollection('ecoquotes');

// Create indexes for better performance
db.users.createIndex({ "username": 1 }, { unique: true });
db.users.createIndex({ "email": 1 }, { unique: true });
db.posts.createIndex({ "createdAt": -1 });
db.posts.createIndex({ "author": 1 });
db.challenges.createIndex({ "startDate": 1, "endDate": 1 });

// Insert sample data for development
db.challenges.insertMany([
  {
    title: "Plant a Tree",
    description: "Plant a tree in your community",
    points: 100,
    difficulty: "medium",
    category: "environment",
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  },
  {
    title: "Zero Waste Day",
    description: "Go a full day without creating any waste",
    points: 75,
    difficulty: "hard",
    category: "sustainability",
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  }
]);

print('✅ MongoDB initialized successfully!');
