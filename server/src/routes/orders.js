const express = require('express');
const Product = require('../models/Product');
const Order = require('../models/Order');
const VtbPayClient = require('../services/payments/vtb-pay-client');

const router = express.Router();
const vtbPayClient = new VtbPayClient();

router.post('/create', async (req, res) => {
  const { userId, productId } = req.body;

  if (!userId || !productId) {
    return res.status(400).json({ message: 'userId и productId обязательны' });
  }

  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({ message: 'Товар не найден' });
  }

  const order = await Order.create({
    userId,
    productId: product._id,
    productName: product.name,
    amount: product.price,
    status: 'pending',
    paymentProvider: 'vtb_pay'
  });

  const payment = await vtbPayClient.createPayment(order);
  order.paymentId = payment.paymentId;
  await order.save();

  return res.status(201).json({
    order,
    payment
  });
});

router.get('/:orderId/status', async (req, res) => {
  const order = await Order.findById(req.params.orderId);

  if (!order) {
    return res.status(404).json({ message: 'Заказ не найден' });
  }

  return res.json({
    orderId: order._id,
    status: order.status,
    paymentProvider: order.paymentProvider
  });
});

module.exports = router;
