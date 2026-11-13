const express = require('express');
const router = express.Router();
const db = require('../config/db');

// List publicly available coupon offers
router.get('/active', (req, res) => {
  const coupons = db.prepare(`
    SELECT code, description, discount_type, discount_value, min_order_value, max_discount
    FROM coupons
    WHERE is_active = 1
  `).all();
  res.json({ success: true, coupons });
});

// Validate and calculate discount
router.post('/apply', (req, res) => {
  const { code, orderAmount } = req.body;
  if (!code) return res.status(400).json({ success: false, message: 'Coupon code required.' });

  const coupon = db.prepare('SELECT * FROM coupons WHERE UPPER(code) = UPPER(?) AND is_active = 1').get(code.trim());
  if (!coupon) {
    return res.status(404).json({ success: false, message: 'Invalid or expired coupon code.' });
  }

  const amount = Number(orderAmount) || 0;
  if (coupon.min_order_value && amount < coupon.min_order_value) {
    return res.status(400).json({
      success: false,
      message: `Coupon "${coupon.code}" requires a minimum purchase of ₹${coupon.min_order_value.toLocaleString('en-IN')}.`
    });
  }

  let discount = 0;
  if (coupon.discount_type === 'percentage') {
    discount = (amount * coupon.discount_value) / 100;
    if (coupon.max_discount && discount > coupon.max_discount) {
      discount = coupon.max_discount;
    }
  } else {
    discount = Math.min(coupon.discount_value, amount);
  }

  discount = Math.round(discount);

  res.json({
    success: true,
    message: `Coupon "${coupon.code}" applied successfully! You save ₹${discount.toLocaleString('en-IN')}`,
    coupon: {
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      discountAmount: discount
    }
  });
});

module.exports = router;
