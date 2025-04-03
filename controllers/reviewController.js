const Review = require('../models/Review');

exports.createReview = async (req, res) => {
  const { courseId, rating, comment } = req.body;

  try {
    const existingReview = await Review.findOne({ userId: req.user.id, courseId });
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this course' });
    }

    const review = new Review({
      userId: req.user.id,
      courseId,
      rating,
      comment,
    });

    await review.save();
    res.status(201).json({ message: 'Review submitted successfully', review });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCourseReviews = async (req, res) => {
  const { courseId } = req.params;

  try {
    const reviews = await Review.find({ courseId }).populate('userId', 'username');
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteReview = async (req, res) => {
  const { reviewId } = req.params;

  try {
    const review = await Review.findById(reviewId);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    if (review.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await review.remove();
    res.status(200).json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};