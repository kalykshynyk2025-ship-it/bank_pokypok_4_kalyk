const express = require('express');
const Order = require('../models/Order');

const router = express.Router();

router.get('/vtbpay/mock-success', async (req, res) => {
  const { orderId, paymentId } = req.query;

  if (!orderId) {
    return res.status(400).json({ message: 'orderId обязателен' });
  }

  const order = await Order.findById(orderId);

  if (!order) {
    return res.status(404).json({ message: 'Заказ не найден' });
  }

  order.status = 'paid';
  if (paymentId) {
    order.paymentId = String(paymentId);
  }
  await order.save();

  return res.json({
    message: 'Оплата VTB Pay успешно подтверждена',
    orderId: order._id,
    status: order.status
  });
});

module.exports = router;
