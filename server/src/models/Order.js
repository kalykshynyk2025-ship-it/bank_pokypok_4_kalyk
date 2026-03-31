const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    productName: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending'
    },
    paymentProvider: {
      type: String,
      default: 'vtb_pay'
    },
    paymentId: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
