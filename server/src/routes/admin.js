const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { requireAdmin } = require('../middleware/auth');

// All routes here strictly require Admin role
router.use(requireAdmin);

// 1. Dashboard Analytics & Stats
router.get('/stats', (req, res) => {
  const totalOrders = db.prepare('SELECT COUNT(*) as count FROM orders').get().count;
  const totalRevenue = db.prepare('SELECT SUM(total_amount) as total FROM orders WHERE payment_status = "Verified" OR status IN ("Payment Successful", "Processing", "Shipped", "Out for Delivery", "Delivered")').get().total || 0;
  const totalCustomers = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  const pendingOrders = db.prepare('SELECT COUNT(*) as count FROM orders WHERE status IN ("Pending", "Payment Pending", "Processing")').get().count;
  const pendingPayments = db.prepare('SELECT COUNT(*) as count FROM payments WHERE status = "Submitted"').get().count;

  // Category breakdown
  const categorySales = db.prepare(`
    SELECT c.name, COUNT(oi.id) as units_sold, COALESCE(SUM(oi.subtotal), 0) as total_revenue
    FROM categories c
    JOIN products p ON p.category_id = c.id
    LEFT JOIN order_items oi ON oi.product_id = p.id
    GROUP BY c.id
    ORDER BY total_revenue DESC
  `).all();

  // Recent 6 orders
  const recentOrders = db.prepare(`
    SELECT o.id, o.order_number, o.shipping_name, o.total_amount, o.status, o.payment_status, o.created_at
    FROM orders o
    ORDER BY o.created_at DESC
    LIMIT 6
  `).all();

  // Recent 6 registered users
  const recentCustomers = db.prepare(`
    SELECT id, name, email, phone, role, created_at
    FROM users
    ORDER BY id DESC
    LIMIT 6
  `).all();

  res.json({
    success: true,
    stats: {
      totalOrders,
      totalRevenue: Math.round(totalRevenue),
      totalCustomers,
      pendingOrders,
      pendingPayments
    },
    categorySales,
    recentOrders,
    recentCustomers
  });
});

// 2. Manage Orders
router.get('/orders', (req, res) => {
  const { status, payment_status, search } = req.query;
  let query = 'SELECT * FROM orders';
  const conditions = [];
  const params = [];

  if (status && status !== 'all') {
    conditions.push('status = ?');
    params.push(status);
  }

  if (payment_status && payment_status !== 'all') {
    conditions.push('payment_status = ?');
    params.push(payment_status);
  }

  if (search) {
    conditions.push('(order_number LIKE ? OR shipping_name LIKE ? OR shipping_phone LIKE ? OR shipping_email LIKE ?)');
    const term = `%${search.trim()}%`;
    params.push(term, term, term, term);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' ORDER BY created_at DESC LIMIT 100';

  const orders = db.prepare(query).all(...params);

  const enriched = orders.map(order => {
    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
    const payment = db.prepare('SELECT * FROM payments WHERE order_id = ? ORDER BY id DESC LIMIT 1').get(order.id);
    return { ...order, items, payment: payment || null };
  });

  res.json({ success: true, orders: enriched });
});

// Update order status & tracking details
router.put('/orders/:orderNumber/status', (req, res) => {
  const { orderNumber } = req.params;
  const { status, payment_status, tracking_number, notes } = req.body;

  const order = db.prepare('SELECT * FROM orders WHERE order_number = ?').get(orderNumber);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

  const validStatuses = ['Pending', 'Payment Pending', 'Payment Successful', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'Refunded'];
  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid order status value.' });
  }

  db.prepare(`
    UPDATE orders SET
      status = COALESCE(?, status),
      payment_status = COALESCE(?, payment_status),
      tracking_number = COALESCE(?, tracking_number),
      notes = COALESCE(?, notes),
      updated_at = datetime('now')
    WHERE id = ?
  `).run(status || null, payment_status || null, tracking_number || null, notes || null, order.id);

  // If status is updated to Delivered or Cancelled, keep payments synchronized
  if (status === 'Cancelled' && order.status !== 'Cancelled') {
    // Restore inventory
    const items = db.prepare('SELECT product_id, quantity FROM order_items WHERE order_id = ?').all(order.id);
    for (const item of items) {
      db.prepare('UPDATE products SET stock = stock + ? WHERE id = ?').run(item.quantity, item.product_id);
    }
  }

  res.json({ success: true, message: 'Order status updated successfully.' });
});

// 3. Payments pending review
router.get('/payments', (req, res) => {
  const payments = db.prepare(`
    SELECT p.*, o.order_number, o.shipping_name, o.shipping_phone, o.total_amount, o.status as order_status
    FROM payments p
    JOIN orders o ON o.id = p.order_id
    ORDER BY p.created_at DESC
  `).all();

  res.json({ success: true, payments });
});

// 4. Products CRUD
router.get('/products', (req, res) => {
  const products = db.prepare(`
    SELECT p.*, c.name as category_name,
           (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as primary_image
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
    ORDER BY p.id DESC
  `).all();

  res.json({ success: true, products });
});

router.post('/products', (req, res) => {
  try {
    const {
      name,
      slug,
      description,
      short_desc,
      price,
      discount_price,
      category_id,
      brand,
      stock,
      images = [],
      is_featured = 0,
      is_trending = 0
    } = req.body;

    if (!name || !price || !brand) {
      return res.status(400).json({ success: false, message: 'Name, price, and brand are required.' });
    }

    const finalSlug = slug ? slug.trim() : name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString().slice(-4);

    const insert = db.prepare(`
      INSERT INTO products (
        name, slug, description, short_desc, price, discount_price, category_id,
        brand, stock, is_featured, is_trending
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insert.run(
      name.trim(),
      finalSlug,
      description || name,
      short_desc || '',
      Number(price),
      discount_price ? Number(discount_price) : null,
      category_id ? Number(category_id) : null,
      brand.trim(),
      Number(stock) || 0,
      is_featured ? 1 : 0,
      is_trending ? 1 : 0
    );

    const productId = Number(result.lastInsertRowid);

    // Insert images
    if (Array.isArray(images) && images.length > 0) {
      const insertImg = db.prepare('INSERT INTO product_images (product_id, image_url, is_primary, display_order) VALUES (?, ?, ?, ?)');
      images.forEach((url, idx) => {
        if (url && url.trim()) {
          insertImg.run(productId, url.trim(), idx === 0 ? 1 : 0, idx);
        }
      });
    }

    res.status(201).json({ success: true, message: 'Product created successfully.', productId });
  } catch (err) {
    console.error('Create product error:', err);
    res.status(500).json({ success: false, message: 'Failed to create product.' });
  }
});

router.put('/products/:id', (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      short_desc,
      price,
      discount_price,
      category_id,
      brand,
      stock,
      is_active,
      is_featured,
      is_trending,
      images
    } = req.body;

    const existing = db.prepare('SELECT id FROM products WHERE id = ?').get(id);
    if (!existing) return res.status(404).json({ success: false, message: 'Product not found.' });

    db.prepare(`
      UPDATE products SET
        name = COALESCE(?, name),
        description = COALESCE(?, description),
        short_desc = COALESCE(?, short_desc),
        price = COALESCE(?, price),
        discount_price = ?,
        category_id = ?,
        brand = COALESCE(?, brand),
        stock = COALESCE(?, stock),
        is_active = COALESCE(?, is_active),
        is_featured = COALESCE(?, is_featured),
        is_trending = COALESCE(?, is_trending),
        updated_at = datetime('now')
      WHERE id = ?
    `).run(
      name || null,
      description || null,
      short_desc || null,
      price ? Number(price) : null,
      discount_price ? Number(discount_price) : null,
      category_id ? Number(category_id) : null,
      brand || null,
      stock !== undefined ? Number(stock) : null,
      is_active !== undefined ? Number(is_active) : null,
      is_featured !== undefined ? Number(is_featured) : null,
      is_trending !== undefined ? Number(is_trending) : null,
      id
    );

    // Update images if provided
    if (Array.isArray(images) && images.length > 0) {
      db.prepare('DELETE FROM product_images WHERE product_id = ?').run(id);
      const insertImg = db.prepare('INSERT INTO product_images (product_id, image_url, is_primary, display_order) VALUES (?, ?, ?, ?)');
      images.forEach((url, idx) => {
        if (url && url.trim()) {
          insertImg.run(id, url.trim(), idx === 0 ? 1 : 0, idx);
        }
      });
    }

    res.json({ success: true, message: 'Product updated successfully.' });
  } catch (err) {
    console.error('Update product error:', err);
    res.status(500).json({ success: false, message: 'Failed to update product.' });
  }
});

router.delete('/products/:id', (req, res) => {
  db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
  res.json({ success: true, message: 'Product deleted successfully.' });
});

// 5. Manage Categories
router.post('/categories', (req, res) => {
  const { name, slug, description, image_url, icon } = req.body;
  if (!name) return res.status(400).json({ success: false, message: 'Category name required.' });

  const finalSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  db.prepare(`
    INSERT INTO categories (name, slug, description, image_url, icon)
    VALUES (?, ?, ?, ?, ?)
  `).run(name.trim(), finalSlug, description || '', image_url || '', icon || 'Folder');

  res.status(201).json({ success: true, message: 'Category added.' });
});

router.delete('/categories/:id', (req, res) => {
  db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
  res.json({ success: true, message: 'Category deleted.' });
});

// 6. Manage Customers
router.get('/customers', (req, res) => {
  const { search } = req.query;
  let query = `
    SELECT u.id, u.name, u.email, u.phone, u.role, u.created_at,
           COUNT(o.id) as total_orders,
           COALESCE(SUM(o.total_amount), 0) as total_spent,
           (SELECT city || ', ' || state FROM addresses WHERE user_id = u.id ORDER BY is_default DESC LIMIT 1) as location
    FROM users u
    LEFT JOIN orders o ON o.user_id = u.id
  `;
  const params = [];

  if (search && search.trim()) {
    query += ` WHERE (u.name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?) `;
    const term = `%${search.trim()}%`;
    params.push(term, term, term);
  }

  query += `
    GROUP BY u.id
    ORDER BY u.id DESC
  `;

  const customers = db.prepare(query).all(...params);
  res.json({ success: true, customers });
});

router.delete('/customers/:id', (req, res) => {
  const { id } = req.params;
  const user = db.prepare('SELECT id, role, email FROM users WHERE id = ?').get(id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }

  if (user.role === 'admin' && Number(user.id) === 1) {
    return res.status(403).json({ success: false, message: 'Cannot delete primary system administrator.' });
  }

  db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(id);
  db.prepare('DELETE FROM wishlist_items WHERE user_id = ?').run(id);
  db.prepare('DELETE FROM addresses WHERE user_id = ?').run(id);
  db.prepare('DELETE FROM reviews WHERE user_id = ?').run(id);
  db.prepare('UPDATE orders SET user_id = NULL WHERE user_id = ?').run(id);
  db.prepare('UPDATE transactions SET user_id = NULL WHERE user_id = ?').run(id);
  db.prepare('DELETE FROM users WHERE id = ?').run(id);

  res.json({ success: true, message: `User "${user.email}" deleted successfully.` });
});

// 7. Manage Coupons
router.get('/coupons', (req, res) => {
  const coupons = db.prepare('SELECT * FROM coupons ORDER BY id DESC').all();
  res.json({ success: true, coupons });
});

router.post('/coupons', (req, res) => {
  const { code, description, discount_type, discount_value, min_order_value, max_discount } = req.body;
  if (!code || !discount_value) {
    return res.status(400).json({ success: false, message: 'Code and discount value required.' });
  }

  db.prepare(`
    INSERT INTO coupons (code, description, discount_type, discount_value, min_order_value, max_discount, is_active)
    VALUES (?, ?, ?, ?, ?, ?, 1)
  `).run(code.toUpperCase().trim(), description || '', discount_type || 'percentage', Number(discount_value), Number(min_order_value) || 0, max_discount ? Number(max_discount) : null);

  res.status(201).json({ success: true, message: 'Coupon created.' });
});

router.delete('/coupons/:id', (req, res) => {
  db.prepare('DELETE FROM coupons WHERE id = ?').run(req.params.id);
  res.json({ success: true, message: 'Coupon deleted.' });
});

module.exports = router;
