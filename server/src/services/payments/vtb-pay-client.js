class VtbPayClient {
  async createPayment(order) {
    const paymentId = `vtb_${order._id}_${Date.now()}`;

    return {
      provider: 'vtb_pay',
      paymentId,
      paymentUrl: `/api/payments/vtbpay/mock-success?orderId=${order._id}&paymentId=${paymentId}`
    };
  }
}

module.exports = VtbPayClient;
