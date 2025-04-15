const mongoose = require('mongoose');
const User = require('../models/User');
const Course = require('../models/Course');
const Progress = require('../models/Progress');
const Cart = require('../models/Cart');
const fs = require('fs');
const path = require('path');

exports.getUserCourses = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const progresses = await Progress.find({ userId: req.user.id }).populate('courseId');
    const courses = progresses
      .filter(p => p.courseId && p.courseId._id)
      .map(p => ({
        _id: p.courseId._id,
        title: p.courseId.title,
        description: p.courseId.description,
        instructor: p.courseId.instructor,
        price: p.courseId.price,
        image: p.courseId.image,
        createdBy: p.courseId.createdBy,
        progress: p.progress,
      }));
    res.status(200).json(courses);
  } catch (error) {
    console.error('Get user courses error:', error.stack);
    res.status(500).json({ message: 'Server error while fetching user courses' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const user = await User.findById(req.user.id).select('username github linkedin profile');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      username: user.username,
      github: user.github || '',
      linkedin: user.linkedin || '',
      profile: user.profile || ''
    });
  } catch (error) {
    console.error('Get profile error:', error.stack);
    res.status(500).json({ message: 'Server error while fetching profile' });
  }
};

exports.updateProfile = async (req, res) => {
  const { username, github, linkedin } = req.body;
  const profile = req.file?.filename;

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.username = username || user.username;
    user.github = github || user.github;
    user.linkedin = linkedin || user.linkedin;
    if (profile) {
      if (user.profile) {
        const oldProfilePath = path.join(__dirname, '../Uploads', user.profile);
        if (fs.existsSync(oldProfilePath)) fs.unlinkSync(oldProfilePath);
      }
      user.profile = profile;
    }

    await user.save();
    res.status(200).json({ 
      message: 'Profile updated successfully', 
      user: {
        username: user.username,
        github: user.github,
        linkedin: user.linkedin,
        profile: user.profile
      }
    });
  } catch (error) {
    console.error('Update profile error:', error.stack);
    if (profile) {
      const profilePath = path.join(__dirname, '../Uploads', profile);
      if (fs.existsSync(profilePath)) fs.unlinkSync(profilePath);
    }
    res.status(500).json({ message: 'Server error while updating profile' });
  }
};

exports.updateProgress = async (req, res) => {
  const { courseId } = req.params;
  const { progress } = req.body;

  try {
    let progressDoc = await Progress.findOne({ userId: req.user.id, courseId });
    if (!progressDoc) {
      progressDoc = new Progress({ userId: req.user.id, courseId, progress });
    } else {
      progressDoc.progress = progress;
    }
    await progressDoc.save();
    res.status(200).json({ message: 'Progress updated successfully', progress: progressDoc });
  } catch (error) {
    console.error('Update progress error:', error.stack);
    res.status(500).json({ message: 'Server error while updating progress' });
  }
};

exports.updateCart = async (req, res) => {
  const { cart } = req.body;

  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    if (!Array.isArray(cart)) {
      return res.status(400).json({ message: 'Cart must be an array of course items' });
    }

    for (const item of cart) {
      if (!item.courseId) {
        return res.status(400).json({ message: 'courseId is required for all cart items' });
      }
      if (!mongoose.Types.ObjectId.isValid(item.courseId)) {
        return res.status(400).json({ message: `Invalid courseId: ${item.courseId}` });
      }
      if (typeof item.quantity !== 'number' || item.quantity < 1) {
        return res.status(400).json({ message: `Invalid quantity for courseId ${item.courseId}: ${item.quantity}` });
      }
    }

    const updatedCart = await Cart.findOneAndUpdate(
      { userId },
      { $set: { courses: cart } },
      { upsert: true, new: true }
    );

    res.status(200).json({ message: 'Cart updated successfully', cart: updatedCart });
  } catch (error) {
    console.error('Update cart error:', error.stack);
    if (error.name === 'VersionError') {
      return res.status(409).json({ message: 'Cart update failed due to version conflict, please retry' });
    }
    res.status(500).json({ message: 'Server error while updating cart', error: error.message });
  }
};

exports.getCart = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const cart = await Cart.findOne({ userId }).populate('courses.courseId', 'title price image instructor');
    res.status(200).json({
      cart: cart || { userId, courses: [] },
    });
  } catch (error) {
    console.error('Get cart error:', error.stack);
    res.status(500).json({ message: 'Server error while fetching cart', error: error.message });
  }
};

module.exports = exports;