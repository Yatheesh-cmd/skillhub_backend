const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cors = require('cors');
const path = require('path');

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/courses', require('./routes/courses'));
app.use('/user', require('./routes/user'));
app.use('/payment', require('./routes/payment'));
app.use('/review', require('./routes/review'));

// Optional: Seed data on startup (not recommended for production)
// const { insertData } = require('./insertData');
// insertData().then(() => {
//   console.log('Data seeding completed');
// }).catch(err => {
//   console.error('Data seeding failed:', err);
// });

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));