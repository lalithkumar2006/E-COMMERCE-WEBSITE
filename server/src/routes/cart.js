const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { requireAuth } = require('../middleware/auth');

// Get current user's database cart
router.get('/', requireAuth, (req, res) => {
  const items = db.prepare(`
    SELECT ci.id as cart_item_id, ci.quantity, p.id as product_id, p.name, p.slug, p.price, p.discount_price,
           p.stock, p.brand,
           (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as image
    FROM cart_items ci
    JOIN products p ON p.id = ci.product_id
    WHERE ci.user_id = ? AND p.is_active = 1
  `).all(req.user.id);

  res.json({ success: true, items });
});

// Add to cart with strict stock validation
router.post('/add', requireAuth, (req, res) => {
  const { productId, quantity = 1 } = req.body;
  if (!productId) return res.status(400).json({ success: false, message: 'Product ID required.' });

  const product = db.prepare('SELECT id, name, stock, is_active FROM products WHERE id = ?').get(productId);
  if (!product || !product.is_active) {
    return res.status(404).json({ success: false, message: 'Product not available.' });
  }

  const existing = db.prepare('SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ?').get(req.user.id, productId);
  const newQty = (existing ? existing.quantity : 0) + Number(quantity);

  if (newQty > product.stock) {
    return res.status(400).json({
      success: false,
      message: `Only ${product.stock} units of "${product.name}" are currently available in stock.`
    });
  }

  if (existing) {
    db.prepare('UPDATE cart_items SET quantity = ?, updated_at = datetime("now") WHERE id = ?').run(newQty, existing.id);
  } else {
    db.prepare('INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)').run(req.user.id, productId, Math.max(1, Number(quantity)));
  }

  res.json({ success: true, message: 'Item added to cart.' });
});

// Update item quantity in cart with stock validation
router.put('/update', requireAuth, (req, res) => {
  const { productId, quantity } = req.body;
  if (!productId || quantity === undefined) {
    return res.status(400).json({ success: false, message: 'Product ID and quantity required.' });
  }

  const product = db.prepare('SELECT id, name, stock FROM products WHERE id = ?').get(productId);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });

  const targetQty = Number(quantity);
  if (targetQty <= 0) {
    db.prepare('DELETE FROM cart_items WHERE user_id = ? AND product_id = ?').run(req.user.id, productId);
    return res.json({ success: true, message: 'Item removed from cart.' });
  }

  if (targetQty > product.stock) {
    return res.status(400).json({
      success: false,
      message: `Cannot exceed available stock of ${product.stock} units.`
    });
  }

  db.prepare('UPDATE cart_items SET quantity = ?, updated_at = datetime("now") WHERE user_id = ? AND product_id = ?')
    .run(targetQty, req.user.id, productId);

  res.json({ success: true, message: 'Cart updated.' });
});

// Remove item from cart
router.delete('/:productId', requireAuth, (req, res) => {
  db.prepare('DELETE FROM cart_items WHERE user_id = ? AND product_id = ?').run(req.user.id, req.params.productId);
  res.json({ success: true, message: 'Item removed from cart.' });
});

// Clear cart
router.delete('/clear/all', requireAuth, (req, res) => {
  db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(req.user.id);
  res.json({ success: true, message: 'Cart cleared.' });
});

module.exports = router;
