import express from 'express';
import { auth } from '../middleware/auth.js';
import Order from '../models/Order.js';
import Razorpay from 'razorpay';

const router = express.Router();

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_Risv0DiB8AgNG0',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'Xs38YUh3Kl4GdOH9vT2sroWc',
});

router.post('/razorpay/order', auth, async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount) return res.status(400).json({ message: 'Amount is required' });
    const order = await razorpayInstance.orders.create({ amount: Math.round(amount * 100), currency: 'INR', payment_capture: 1 });
    if (!order) return res.status(500).json({ message: 'Failed to create Razorpay order' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error creating Razorpay order' });
  }
});

router.post('/orders', auth, async (req, res) => {
  try {
    const { products, totalAmount, razorpayOrderId, razorpayPaymentId, razorpaySignature, paymentStatus } = req.body;
    if (!products || !totalAmount || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({ message: 'Missing required order fields' });
    }
    const order = new Order({ userId: req.user.id, products, totalAmount, razorpayOrderId, razorpayPaymentId, razorpaySignature, paymentStatus: paymentStatus || 'paid' });
    const savedOrder = await order.save();
    return res.status(201).json({ message: 'Order saved successfully', order: savedOrder });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to save order' });
  }
});

router.get('/orders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
    return res.json(orders);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

export default router;
