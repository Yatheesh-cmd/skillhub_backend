const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  github: { type: String },
  linkedin: { type: String },
  profile: { type: String }, // Profile image filename
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);