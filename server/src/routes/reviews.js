const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { requireAuth } = require('../middleware/auth');

// Get approved reviews for a product
router.get('/:productId', (req, res) => {
  const reviews = db.prepare(`
    SELECT r.*, u.name as user_name, u.avatar_url
    FROM reviews r
    JOIN users u ON u.id = r.user_id
    WHERE r.product_id = ? AND r.is_approved = 1
    ORDER BY r.created_at DESC
  `).all(req.params.productId);

  const stats = db.prepare(`
    SELECT AVG(rating) as avg_rating, COUNT(id) as count
    FROM reviews
    WHERE product_id = ? AND is_approved = 1
  `).get(req.params.productId);

  res.json({
    success: true,
    reviews,
    avgRating: stats.avg_rating ? Number(stats.avg_rating.toFixed(1)) : 5.0,
    totalReviews: stats.count || 0
  });
});

// Submit a new review
router.post('/:productId', requireAuth, (req, res) => {
  const { rating, title, comment } = req.body;
  const productId = req.params.productId;

  if (!rating || !comment) {
    return res.status(400).json({ success: false, message: 'Rating and comment are required.' });
  }

  const numericRating = Math.max(1, Math.min(5, parseInt(rating, 10)));

  db.prepare(`
    INSERT INTO reviews (product_id, user_id, rating, title, comment, is_approved)
    VALUES (?, ?, ?, ?, ?, 1)
  `).run(productId, req.user.id, numericRating, title ? title.trim() : null, comment.trim());

  // Recalculate product rating and review_count
  const stats = db.prepare(`
    SELECT AVG(rating) as avg_rating, COUNT(id) as count
    FROM reviews
    WHERE product_id = ? AND is_approved = 1
  `).get(productId);

  db.prepare(`
    UPDATE products SET rating = ?, review_count = ? WHERE id = ?
  `).run(Number(stats.avg_rating.toFixed(1)), stats.count, productId);

  res.status(201).json({
    success: true,
    message: 'Thank you! Your review has been published.'
  });
});

module.exports = router;
