const mongoose = require('mongoose');
const Course = require('../models/Course');
const Progress = require('../models/Progress');
const fs = require('fs');
const path = require('path');

exports.deleteCourse = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid course ID format' });
  }

  try {
    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    if (course.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (course.image) {
      const imagePath = path.join(__dirname, '../uploads', course.image);
      try {
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      } catch (fileError) {
        console.error('Failed to delete image:', fileError.message);
      }
    }

    await Progress.deleteMany({ courseId: id });
    await Course.findByIdAndDelete(id);
    res.status(200).json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Delete course error:', error); // Improved logging
    res.status(500).json({ message: 'Server error while deleting course' });
  }
};

exports.addCourse = async (req, res) => {
  const { title, description, instructor, instructorPhone, date, price } = req.body;
  const image = req.file ? req.file.filename : undefined; // Check req.file explicitly

  try {
    const course = new Course({
      title,
      description,
      instructor,
      instructorPhone,
      date,
      price,
      image,
      createdBy: req.user.id,
    });
    await course.save();
    res.status(200).json({ message: 'Course added successfully', course });
  } catch (error) {
    if (image) {
      const imagePath = path.join(__dirname, '../Uploads', image);
      if (fs.existsSync(imagePath)) { // Check before deletion
        fs.unlinkSync(imagePath);
      }
    }
    console.error('Add course error:', error); // Improved logging
    res.status(500).json({ message: 'Server error while adding course' });
  }
};

exports.getAdminCourses = async (req, res) => {
  try {
    const courses = await Course.find({ createdBy: req.user.id });
    res.status(200).json(courses);
  } catch (error) {
    console.error('Get admin courses error:', error); // Improved logging
    res.status(500).json({ message: 'Server error while fetching courses' });
  }
};

exports.updateCourse = async (req, res) => {
  const { id } = req.params;
  const { title, description, instructor, instructorPhone, date, price } = req.body;
  const image = req.file ? req.file.filename : undefined; // Check req.file explicitly

  try {
    const course = await Course.findById(id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (course.createdBy.toString() !== req.user.id) return res.status(403).json({ message: 'Unauthorized' });

    course.title = title || course.title;
    course.description = description || course.description;
    course.instructor = instructor || course.instructor;
    course.instructorPhone = instructorPhone || course.instructorPhone;
    course.date = date || course.date;
    course.price = price || course.price;
    if (image) {
      if (course.image) {
        const oldImagePath = path.join(__dirname, '../Uploads', course.image);
        if (fs.existsSync(oldImagePath)) { // Check before deletion
          fs.unlinkSync(oldImagePath);
        }
      }
      course.image = image;
    }

    await course.save();
    res.status(200).json({ message: 'Course updated successfully', course });
  } catch (error) {
    if (image) {
      const imagePath = path.join(__dirname, '../Uploads', image);
      if (fs.existsSync(imagePath)) { // Check before deletion
        fs.unlinkSync(imagePath);
      }
    }
    console.error('Update course error:', error); // Improved logging
    res.status(500).json({ message: 'Server error while updating course' });
  }
};

exports.getAllCourses = async (req, res) => {
  const { search } = req.query;
  try {
    const query = search ? { title: { $regex: search, $options: 'i' } } : {};
    const courses = await Course.find(query);
    res.status(200).json(courses);
  } catch (error) {
    console.error('Get all courses error:', error); // Improved logging
    res.status(500).json({ message: 'Server error while fetching courses' });
  }
};

exports.getSampleCourses = async (req, res) => {
  try {
    const courses = await Course.find().limit(4);
    res.status(200).json(courses);
  } catch (error) {
    console.error('Get sample courses error:', error); // Improved logging
    res.status(500).json({ message: 'Server error while fetching sample courses' });
  }
};