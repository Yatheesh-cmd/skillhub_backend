const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Course = require('./models/Course');
const Cart = require('./models/Cart');
const Wishlist = require('./models/Wishlist');
const Progress = require('./models/Progress');
const Review = require('./models/Review');
const Order = require('./models/Order');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const insertData = async () => {
  await connectDB();

  const users = [
    {
      _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439012'),
      username: 'user1',
      email: 'user1@example.com',
      password: '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WZcG8d3YXv9z9Xz9Xz9Xz',
      role: 'user',
      github: 'https://github.com/user1',
      linkedin: 'https://linkedin.com/in/user1',
      profile: 'profile-1698765432101.jpg',
      createdAt: new Date('2023-10-31T12:05:00Z'),
      updatedAt: new Date('2023-10-31T12:05:00Z'),
    },
    {
      _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439013'),
      username: 'admin1',
      email: 'admin1@example.com',
      password: '$2b$10$bCuxFoqIz7wLw7s0LP9FNOc0futwngatPvMtBmZD0pNM6apMX0tgq',
      role: 'admin',
      github: 'https://github.com/admin1',
      linkedin: 'https://linkedin.com/in/admin1',
      profile: 'profile-admin-1698765432101.jpg',
      createdAt: new Date('2025-03-19T12:00:00Z'),
      updatedAt: new Date('2025-03-19T12:00:00Z'),
    },
  ];

  const courses = [
    {
      _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439021'),
      title: 'AI & Machine Learning',
      description: 'Learn to build intelligent systems.',
      instructor: 'Dr. John Doe',
      price: 99.99,
      image: 'course-1698765432102.jpg',
      createdBy: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
      createdAt: new Date('2023-10-31T12:10:00Z'),
      updatedAt: new Date('2023-10-31T12:10:00Z'),
    },
    {
      _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439022'),
      title: 'Web3 Development',
      description: 'Master blockchain and DApps.',
      instructor: 'Jane Smith',
      price: 149.99,
      image: 'course-1698765432103.jpg',
      createdBy: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
      createdAt: new Date('2023-10-31T12:15:00Z'),
      updatedAt: new Date('2023-10-31T12:15:00Z'),
    },
  ];

  const carts = [
    {
      _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439031'),
      userId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439012'),
      courses: [
        { courseId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439021'), quantity: 1 },
        { courseId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439022'), quantity: 2 },
      ],
      createdAt: new Date('2023-10-31T12:20:00Z'),
      updatedAt: new Date('2023-10-31T12:20:00Z'),
    },
  ];

  const wishlists = [
    {
      _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439041'),
      userId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439012'),
      courses: [
        new mongoose.Types.ObjectId('507f1f77bcf86cd799439021'),
        new mongoose.Types.ObjectId('507f1f77bcf86cd799439022'),
      ],
      createdAt: new Date('2023-10-31T12:25:00Z'),
      updatedAt: new Date('2023-10-31T12:25:00Z'),
    },
  ];

  const progresses = [
    {
      _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439051'),
      userId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439012'),
      courseId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439021'),
      progress: 50,
      createdAt: new Date('2023-10-31T12:30:00Z'),
      updatedAt: new Date('2023-10-31T12:35:00Z'),
    },
    {
      _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439052'),
      userId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439012'),
      courseId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439022'),
      progress: 25,
      createdAt: new Date('2023-10-31T12:30:00Z'),
      updatedAt: new Date('2023-10-31T12:35:00Z'),
    },
  ];

  const reviews = [
    {
      _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439061'),
      userId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439012'),
      courseId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439021'),
      rating: 4,
      comment: 'Great course, very insightful!',
      createdAt: new Date('2023-10-31T12:40:00Z'),
      updatedAt: new Date('2023-10-31T12:40:00Z'),
    },
    {
      _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439062'),
      userId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439012'),
      courseId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439022'),
      rating: 5,
      comment: 'Loved the blockchain content!',
      createdAt: new Date('2023-10-31T12:45:00Z'),
      updatedAt: new Date('2023-10-31T12:45:00Z'),
    },
  ];

  const orders = [
    {
      _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439071'),
      userId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439012'),
      courses: [
        {
          courseId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439021'),
          quantity: 1,
          price: 99.99,
        },
        {
          courseId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439022'),
          quantity: 2,
          price: 149.99,
        },
      ],
      total: 399.97,
      status: 'Pending',
      createdAt: new Date('2023-10-31T13:00:00Z'),
      updatedAt: new Date('2023-10-31T13:00:00Z'),
    },
    {
      _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439072'),
      userId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439012'),
      courses: [
        {
          courseId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439021'),
          quantity: 3,
          price: 99.99,
        },
      ],
      total: 299.97,
      status: 'Completed',
      createdAt: new Date('2023-11-01T10:00:00Z'),
      updatedAt: new Date('2023-11-01T10:05:00Z'),
    },
  ];

  try {
    await User.deleteMany({});
    await Course.deleteMany({});
    await Cart.deleteMany({});
    await Wishlist.deleteMany({});
    await Progress.deleteMany({});
    await Review.deleteMany({});
    await Order.deleteMany({});

    await User.insertMany(users);
    await Course.insertMany(courses);
    await Cart.insertMany(carts);
    await Wishlist.insertMany(wishlists);
    await Progress.insertMany(progresses);
    await Review.insertMany(reviews);
    await Order.insertMany(orders);
    console.log('All data inserted successfully');
  } catch (error) {
    console.error('Error inserting data:', error);
  } finally {
    mongoose.connection.close();
  }
};

insertData();