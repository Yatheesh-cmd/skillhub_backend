const mongoose = require('mongoose');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const Cart = require('../models/Cart');

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID, // rzp_test_BQZeGK1Esi5rzS
  key_secret: process.env.RAZORPAY_KEY_SECRET, // mI7fb1GAeyjmGoiJ9zI4iRQ0
});

exports.initiatePayment = async (req, res) => {
  const cartItems = req.body; // Array of { _id, price, quantity }
  console.log('Initiate payment called by user:', req.user);

  try {
    // Validate cart items
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      console.log('Invalid cart items received:', cartItems);
      return res.status(400).json({ message: 'Cart must be a non-empty array' });
    }

    for (const item of cartItems) {
      if (!item._id || !mongoose.Types.ObjectId.isValid(item._id)) {
        console.log('Invalid course ID in cart:', item);
        return res.status(400).json({ message: `Invalid course ID: ${item._id || 'missing'}` });
      }
      if (typeof item.price !== 'number' || isNaN(item.price) || item.price <= 0) {
        console.log('Invalid price in cart item:', item);
        return res.status(400).json({ message: `Invalid price for course ${item._id}: ${item.price}` });
      }
      if (typeof item.quantity !== 'number' || isNaN(item.quantity) || item.quantity < 1) {
        console.log('Invalid quantity in cart item:', item);
        return res.status(400).json({ message: `Invalid quantity for course ${item._id}: ${item.quantity}` });
      }
    }

    const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    if (isNaN(total) || total <= 0) {
      console.log('Calculated total is invalid:', total, 'Cart items:', cartItems);
      return res.status(400).json({ message: 'Invalid total amount calculated' });
    }

    // Create Razorpay order
    const razorpayOrder = await razorpayInstance.orders.create({
      amount: total * 100, // Convert to paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    });

    // Create a new order in the database
    const order = new Order({
      userId: req.user.id,
      courses: cartItems.map(item => ({
        courseId: item._id,
        quantity: item.quantity,
        price: item.price,
      })),
      total,
      status: 'Pending', // Initially pending until payment is verified
      razorpayOrderId: razorpayOrder.id,
    });
    await order.save();

    console.log('Razorpay order created:', razorpayOrder.id);
    res.status(200).json({
      message: 'Order created, proceed to payment',
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      dbOrderId: order._id,
    });
  } catch (error) {
    console.error('Initiate payment error:', error.stack);
    res.status(500).json({ message: error.message || 'Server error during payment initiation' });
  }
};

exports.verifyPayment = async (req, res) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature, dbOrderId } = req.body;
  console.log('Verify payment called by user:', req.user);

  try {
    // Verify payment signature
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    if (generatedSignature !== razorpaySignature) {
      console.log('Invalid payment signature:', { razorpayOrderId, razorpayPaymentId });
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    // Update order status
    const order = await Order.findById(dbOrderId);
    if (!order) {
      console.log('Order not found:', dbOrderId);
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = 'Completed';
    order.razorpayPaymentId = razorpayPaymentId;
    order.updatedAt = new Date();
    await order.save();

    // Clear the cart in the database
    await Cart.findOneAndUpdate(
      { userId: req.user.id },
      { $set: { courses: [] } },
      { upsert: true }
    );

    // Populate order details for response
    const populatedOrder = await Order.findById(order._id)
      .populate('courses.courseId', 'title')
      .populate('userId', 'username');

    console.log('Payment verified, order updated:', populatedOrder._id);
    res.status(200).json({
      message: 'Payment successful',
      order: {
        _id: populatedOrder._id,
        userId: populatedOrder.userId._id,
        username: populatedOrder.userId.username,
        courses: populatedOrder.courses,
        total: populatedOrder.total,
        status: populatedOrder.status,
        createdAt: populatedOrder.createdAt,
      },
    });
  } catch (error) {
    console.error('Verify payment error:', error.stack);
    res.status(500).json({ message: error.message || 'Server error during payment verification' });
  }
};

exports.getOrderStatus = async (req, res) => {
  console.log('Get order status called by user:', req.user);
  try {
    const orders = await Order.find({ userId: req.user.id }).populate('courses.courseId', 'title');
    console.log('Orders fetched for user:', orders.length);
    res.status(200).json(orders);
  } catch (error) {
    console.error('Get order status error:', error.stack);
    res.status(500).json({ message: error.message });
  }
};

exports.getAllOrders = async (req, res) => {
  console.log('getAllOrders called by user:', req.user);
  try {
    if (req.user.role !== 'admin') {
      console.log('Access denied: User is not an admin:', req.user.role);
      return res.status(403).json({ message: 'Admin access required' });
    }
    const orders = await Order.find()
      .populate('courses.courseId', 'title')
      .populate('userId', 'username');
    console.log('Orders fetched:', orders.length);
    res.status(200).json(orders);
  } catch (error) {
    console.error('Get all orders error:', error.stack);
    res.status(500).json({ message: error.message });
  }
};