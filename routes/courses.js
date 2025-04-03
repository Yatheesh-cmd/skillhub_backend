const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const { addCourse, getAdminCourses, updateCourse, deleteCourse, getAllCourses, getSampleCourses } = require('../controllers/courseController');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

router.post('/addcourse', authMiddleware, adminMiddleware, upload.single('image'), addCourse);
router.get('/admincourses', authMiddleware, adminMiddleware, getAdminCourses);
router.put('/updatecourse/:id', authMiddleware, adminMiddleware, upload.single('image'), updateCourse);
router.delete('/deletecourse/:id', authMiddleware, adminMiddleware, deleteCourse);
router.get('/allcourses', authMiddleware, getAllCourses);
router.get('/samplecourses', getSampleCourses);

module.exports = router;