const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');

router.post('/userreg', register);
router.post('/userlog', login);

module.exports = router;