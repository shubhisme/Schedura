// backend/server.js
const express = require('express');
const crypto = require('crypto');
const app = express();

app.use(express.json());

// In-memory storage (use database in production)
const payments = new Map();

// Create payment intent
app.post('/api/create-payment', async (req, res) => {
  const { amount, userId, description } = req.body;
  
  const transactionId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
  
  // Store payment intent
  payments.set(transactionId, {
    transactionId,
    amount,
    userId,
    description,
    status: 'pending',
    createdAt: new Date(),
    upiId: 'yourmerchant@upi' // Your UPI ID
  });
  
  res.json({
    success: true,
    transactionId,
    upiId: 'yourmerchant@upi',
    amount,
    description
  });
});

// Webhook endpoint (called by payment gateway)
app.post('/api/webhook/payment', (req, res) => {
  // Verify webhook signature (important for security)
  const signature = req.headers['x-webhook-signature'];
  const payload = JSON.stringify(req.body);
  
  // Verify signature (example with Razorpay)
  const expectedSignature = crypto
    .createHmac('sha256', process.env.WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');
  
  if (signature !== expectedSignature) {
    return res.status(400).json({ error: 'Invalid signature' });
  }
  
  const { transactionId, status, utr, amount } = req.body;
  
  // Update payment status
  const payment = payments.get(transactionId);
  if (payment) {
    payment.status = status; // 'success', 'failed', 'pending'
    payment.utr = utr; // Bank reference number
    payment.updatedAt = new Date();
    payments.set(transactionId, payment);
    
    console.log(`Payment ${transactionId} updated to ${status}`);
    
    // Send notification to user (FCM, email, etc.)
    // notifyUser(payment.userId, payment);
  }
  
  res.json({ success: true });
});

// Check payment status (polled by app)
app.get('/api/payment-status/:transactionId', (req, res) => {
  const { transactionId } = req.params;
  const payment = payments.get(transactionId);
  
  if (!payment) {
    return res.status(404).json({ error: 'Transaction not found' });
  }
  
  res.json({
    success: true,
    status: payment.status,
    amount: payment.amount,
    utr: payment.utr,
    transactionId: payment.transactionId
  });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});