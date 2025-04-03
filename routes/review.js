const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { createReview, getCourseReviews, deleteReview } = require('../controllers/reviewController');

router.post('/create', authMiddleware, createReview);
router.get('/course/:courseId', getCourseReviews); // Public route, no auth required
router.delete('/:reviewId', authMiddleware, deleteReview);

module.exports = router;