const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const paymentController = require('../controllers/paymentController');

router.post('/initiate-payment', authMiddleware, paymentController.initiatePayment);
router.post('/verify-payment', authMiddleware, paymentController.verifyPayment);
router.get('/order-status', authMiddleware, paymentController.getOrderStatus);
router.get('/all-orders', authMiddleware, paymentController.getAllOrders);

module.exports = router;