const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { requireAuth } = require('../middleware/auth');

router.get('/', requireAuth, (req, res) => {
  const items = db.prepare(`
    SELECT w.id as wishlist_id, p.id as product_id, p.name, p.slug, p.price, p.discount_price,
           p.stock, p.rating, p.brand,
           (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as image
    FROM wishlist_items w
    JOIN products p ON p.id = w.product_id
    WHERE w.user_id = ? AND p.is_active = 1
  `).all(req.user.id);

  res.json({ success: true, items });
});

router.post('/toggle', requireAuth, (req, res) => {
  const { productId } = req.body;
  if (!productId) return res.status(400).json({ success: false, message: 'Product ID required.' });

  const existing = db.prepare('SELECT id FROM wishlist_items WHERE user_id = ? AND product_id = ?').get(req.user.id, productId);
  if (existing) {
    db.prepare('DELETE FROM wishlist_items WHERE id = ?').run(existing.id);
    return res.json({ success: true, inWishlist: false, message: 'Item removed from wishlist.' });
  } else {
    db.prepare('INSERT INTO wishlist_items (user_id, product_id) VALUES (?, ?)').run(req.user.id, productId);
    return res.json({ success: true, inWishlist: true, message: 'Item added to wishlist.' });
  }
});

router.delete('/:productId', requireAuth, (req, res) => {
  db.prepare('DELETE FROM wishlist_items WHERE user_id = ? AND product_id = ?').run(req.user.id, req.params.productId);
  res.json({ success: true, message: 'Item removed from wishlist.' });
});

module.exports = router;
