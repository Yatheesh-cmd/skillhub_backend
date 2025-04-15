const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { getUserCourses, getProfile, updateProfile, updateProgress, updateCart, getCart } = require('../controllers/userController');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'Uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

router.get('/usercourses', authMiddleware, getUserCourses);
router.get('/profile', authMiddleware, getProfile);
router.put('/updateprofile', authMiddleware, upload.single('profile'), updateProfile);
router.put('/update-progress/:courseId', authMiddleware, updateProgress);
router.put('/update-cart', authMiddleware, updateCart);
router.get('/update-cart', authMiddleware, getCart);

module.exports = router;