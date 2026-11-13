const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { requireAuth, optionalAuth } = require('../middleware/auth');

// Create a new order with rigorous server-side price & stock verification
router.post('/', optionalAuth, (req, res) => {
  try {
    const {
      items,
      shipping_name,
      shipping_phone,
      shipping_email,
      shipping_address,
      shipping_city,
      shipping_state,
      shipping_pincode,
      coupon_code,
      payment_method = 'UPI',
      notes
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Your cart is empty.' });
    }

    if (!shipping_name || !shipping_phone || !shipping_email || !shipping_address || !shipping_city || !shipping_state || !shipping_pincode) {
      return res.status(400).json({ success: false, message: 'All delivery address fields are required.' });
    }

    // 1. Verify products & stock from database directly
    let calculatedSubtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const prod = db.prepare('SELECT id, name, price, discount_price, stock, is_active FROM products WHERE id = ?').get(item.productId || item.id);
      if (!prod || !prod.is_active) {
        return res.status(400).json({ success: false, message: `Product "${item.name || 'Unknown'}" is no longer available.` });
      }

      const qty = Math.max(1, parseInt(item.quantity, 10) || 1);
      if (qty > prod.stock) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${prod.name}". Available: ${prod.stock}, Requested: ${qty}`
        });
      }

      const unitPrice = prod.discount_price !== null && prod.discount_price !== undefined ? prod.discount_price : prod.price;
      const itemSubtotal = unitPrice * qty;
      calculatedSubtotal += itemSubtotal;

      const img = db.prepare('SELECT image_url FROM product_images WHERE product_id = ? AND is_primary = 1 LIMIT 1').get(prod.id);

      validatedItems.push({
        product_id: prod.id,
        name: prod.name,
        price: unitPrice,
        quantity: qty,
        subtotal: itemSubtotal,
        image: img ? img.image_url : null,
        current_stock: prod.stock
      });
    }

    // 2. Validate coupon if provided
    let calculatedDiscount = 0;
    if (coupon_code) {
      const coupon = db.prepare('SELECT * FROM coupons WHERE UPPER(code) = UPPER(?) AND is_active = 1').get(coupon_code.trim());
      if (coupon) {
        if (!coupon.min_order_value || calculatedSubtotal >= coupon.min_order_value) {
          if (coupon.discount_type === 'percentage') {
            calculatedDiscount = (calculatedSubtotal * coupon.discount_value) / 100;
            if (coupon.max_discount && calculatedDiscount > coupon.max_discount) {
              calculatedDiscount = coupon.max_discount;
            }
          } else {
            calculatedDiscount = Math.min(coupon.discount_value, calculatedSubtotal);
          }
          calculatedDiscount = Math.round(calculatedDiscount);
          db.prepare('UPDATE coupons SET times_used = times_used + 1 WHERE id = ?').run(coupon.id);
        }
      }
    }

    // Delivery fee: Free for orders >= ₹1000, else ₹99
    const deliveryFee = calculatedSubtotal >= 1000 ? 0 : 99;
    const finalTotal = Math.max(0, calculatedSubtotal - calculatedDiscount + deliveryFee);

    // 3. Generate Order Number
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

    const userId = req.user ? req.user.id : null;

    // 4. Save Order
    const insertOrder = db.prepare(`
      INSERT INTO orders (
        order_number, user_id, status, payment_status, payment_method,
        total_amount, subtotal, discount_amount, delivery_fee, coupon_code,
        shipping_name, shipping_phone, shipping_email, shipping_address,
        shipping_city, shipping_state, shipping_pincode, notes
      ) VALUES (
        ?, ?, 'Payment Pending', 'Pending', ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?
      )
    `);

    const orderResult = insertOrder.run(
      orderNumber,
      userId,
      payment_method,
      finalTotal,
      calculatedSubtotal,
      calculatedDiscount,
      deliveryFee,
      coupon_code || null,
      shipping_name.trim(),
      shipping_phone.trim(),
      shipping_email.trim(),
      shipping_address.trim(),
      shipping_city.trim(),
      shipping_state.trim(),
      shipping_pincode.trim(),
      notes ? notes.trim() : null
    );

    const orderId = Number(orderResult.lastInsertRowid);

    // 5. Insert Order Items & decrement inventory
    const insertItem = db.prepare(`
      INSERT INTO order_items (order_id, product_id, product_name, product_price, quantity, subtotal, product_image)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const updateStock = db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?');
    const logInventory = db.prepare(`
      INSERT INTO inventory_logs (product_id, change_type, quantity_change, previous_stock, new_stock, reason)
      VALUES (?, 'SALE', ?, ?, ?, ?)
    `);

    for (const item of validatedItems) {
      insertItem.run(
        orderId,
        item.product_id,
        item.name,
        item.price,
        item.quantity,
        item.subtotal,
        item.image
      );

      const newStock = item.current_stock - item.quantity;
      updateStock.run(item.quantity, item.product_id);
      logInventory.run(item.product_id, -item.quantity, item.current_stock, newStock, `Order ${orderNumber}`);
    }

    // 6. Clear database cart if user logged in
    if (userId) {
      db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(userId);
    }

    res.status(201).json({
      success: true,
      message: 'Order placed successfully. Proceed to payment.',
      orderNumber,
      orderId,
      totalAmount: finalTotal,
      subtotal: calculatedSubtotal,
      discountAmount: calculatedDiscount,
      deliveryFee
    });
  } catch (err) {
    console.error('Create order error:', err);
    res.status(500).json({ success: false, message: 'Failed to place order due to a server error.' });
  }
});

// Get customer orders
router.get('/', requireAuth, (req, res) => {
  const orders = db.prepare(`
    SELECT * FROM orders
    WHERE user_id = ?
    ORDER BY created_at DESC
  `).all(req.user.id);

  const enrichedOrders = orders.map(order => {
    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
    const payment = db.prepare('SELECT * FROM payments WHERE order_id = ? ORDER BY id DESC LIMIT 1').get(order.id);
    return { ...order, items, payment: payment || null };
  });

  res.json({ success: true, orders: enrichedOrders });
});

// Get single order details (accessible by orderNumber or id)
router.get('/:orderNumber', optionalAuth, (req, res) => {
  const { orderNumber } = req.params;
  const order = db.prepare('SELECT * FROM orders WHERE order_number = ? OR id = ?').get(orderNumber, orderNumber);

  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found.' });
  }

  // Security check: if customer is logged in, ensure customer owns this order (admins bypass)
  if (req.user && req.user.role !== 'admin' && order.user_id && order.user_id !== req.user.id) {
    return res.status(403).json({ success: false, message: 'You do not have permission to view this order.' });
  }

  const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
  const payment = db.prepare('SELECT * FROM payments WHERE order_id = ? ORDER BY id DESC LIMIT 1').get(order.id);

  res.json({
    success: true,
    order: {
      ...order,
      items,
      payment: payment || null
    }
  });
});

// Cancel Order
router.post('/:orderNumber/cancel', requireAuth, (req, res) => {
  const { orderNumber } = req.params;
  const order = db.prepare('SELECT * FROM orders WHERE order_number = ?').get(orderNumber);

  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found.' });
  }

  if (order.user_id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Permission denied.' });
  }

  if (order.status !== 'Payment Pending' && order.status !== 'Pending') {
    return res.status(400).json({ success: false, message: `Cannot cancel order in "${order.status}" status.` });
  }

  // Restore inventory
  const items = db.prepare('SELECT product_id, quantity FROM order_items WHERE order_id = ?').all(order.id);
  for (const item of items) {
    db.prepare('UPDATE products SET stock = stock + ? WHERE id = ?').run(item.quantity, item.product_id);
  }

  db.prepare('UPDATE orders SET status = "Cancelled", updated_at = datetime("now") WHERE id = ?').run(order.id);

  res.json({ success: true, message: 'Order has been cancelled and inventory restored.' });
});

module.exports = router;
