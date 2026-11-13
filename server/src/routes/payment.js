const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');
const crypto = require('crypto');
const db = require('../config/db');
const { optionalAuth, requireAdmin } = require('../middleware/auth');

const MERCHANT_UPI_ID = process.env.MERCHANT_UPI_ID || 'lalithkumar19742006@oksbi';
const MERCHANT_NAME = process.env.MERCHANT_NAME || 'Lalithkumar';
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || '';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';

// 1. Generate dynamic UPI payment payload & QR code for an order
router.get('/upi-details/:orderNumber', optionalAuth, async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const order = db.prepare('SELECT * FROM orders WHERE order_number = ?').get(orderNumber);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const amount = Number(order.total_amount).toFixed(2);
    const transactionRef = `REF-${order.id}-${Date.now()}`;
    const transactionNote = `Order ${order.order_number}`;

    // UPI Standard URL scheme conformant with NPCI specifications:
    // upi://pay?pa=<VPA>&pn=<Name>&am=<Amount>&tr=<Ref>&tn=<Note>&cu=INR
    const encodedMerchantName = encodeURIComponent(MERCHANT_NAME);
    const encodedNote = encodeURIComponent(transactionNote);
    const upiUri = `upi://pay?pa=${MERCHANT_UPI_ID}&pn=${encodedMerchantName}&am=${amount}&tr=${transactionRef}&tn=${encodedNote}&cu=INR`;

    // Deep links for specific UPI applications
    const deepLinks = {
      generic: upiUri,
      gpay: `tez://upi/pay?pa=${MERCHANT_UPI_ID}&pn=${encodedMerchantName}&am=${amount}&tr=${transactionRef}&tn=${encodedNote}&cu=INR`,
      phonepe: `phonepe://pay?pa=${MERCHANT_UPI_ID}&pn=${encodedMerchantName}&am=${amount}&tr=${transactionRef}&tn=${encodedNote}&cu=INR`,
      paytm: `paytmmp://pay?pa=${MERCHANT_UPI_ID}&pn=${encodedMerchantName}&am=${amount}&tr=${transactionRef}&tn=${encodedNote}&cu=INR`,
      bhim: `bhim://pay?pa=${MERCHANT_UPI_ID}&pn=${encodedMerchantName}&am=${amount}&tr=${transactionRef}&tn=${encodedNote}&cu=INR`
    };

    // Generate dynamic QR Code (Data URL PNG)
    const qrCodeDataUrl = await QRCode.toDataURL(upiUri, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 320,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      }
    });

    // Check existing payment status
    const existingPayment = db.prepare('SELECT * FROM payments WHERE order_id = ? ORDER BY id DESC LIMIT 1').get(order.id);

    res.json({
      success: true,
      orderNumber: order.order_number,
      amount: order.total_amount,
      merchantUpiId: MERCHANT_UPI_ID,
      merchantName: MERCHANT_NAME,
      transactionRef,
      upiUri,
      deepLinks,
      qrCodeDataUrl,
      paymentStatus: order.payment_status,
      orderStatus: order.status,
      existingPayment: existingPayment || null
    });
  } catch (err) {
    console.error('UPI details error:', err);
    res.status(500).json({ success: false, message: 'Failed to generate UPI payment details.' });
  }
});

// 2. Submit UPI Transaction Reference / UTR for server-side verification
router.post('/submit-upi-ref', optionalAuth, (req, res) => {
  try {
    const { orderNumber, utrNumber, proofNotes } = req.body;

    if (!orderNumber || !utrNumber) {
      return res.status(400).json({ success: false, message: 'Order number and 12-digit UTR/Reference number are required.' });
    }

    const cleanUtr = utrNumber.toString().trim().replace(/\s+/g, '');

    // Strict validation: Indian banking UPI UTR is a 12-digit numeric reference
    if (!/^\d{12}$/.test(cleanUtr)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid UPI Reference Number (UTR). It must be exactly 12 digits as shown in your UPI app.'
      });
    }

    const order = db.prepare('SELECT * FROM orders WHERE order_number = ?').get(orderNumber);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // Security: Check duplicate transactions to prevent double spending
    const existingPaymentWithUtr = db.prepare('SELECT * FROM payments WHERE utr_number = ?').get(cleanUtr);
    if (existingPaymentWithUtr && existingPaymentWithUtr.order_id !== order.id) {
      return res.status(409).json({
        success: false,
        message: 'This UTR has already been submitted for a different order. Duplicate transactions are prevented.'
      });
    }

    // Insert or update payment record
    const existingOrderPayment = db.prepare('SELECT id FROM payments WHERE order_id = ?').get(order.id);

    if (existingOrderPayment) {
      db.prepare(`
        UPDATE payments SET
          utr_number = ?,
          status = 'Submitted',
          proof_notes = ?,
          updated_at = datetime('now')
        WHERE id = ?
      `).run(cleanUtr, proofNotes || '', existingOrderPayment.id);
    } else {
      db.prepare(`
        INSERT INTO payments (
          order_id, payment_method, merchant_upi_id, merchant_name,
          transaction_ref, utr_number, amount, status, proof_notes
        ) VALUES (?, 'UPI', ?, ?, ?, ?, ?, 'Submitted', ?)
      `).run(
        order.id,
        MERCHANT_UPI_ID,
        MERCHANT_NAME,
        `REF-${order.id}-${Date.now()}`,
        cleanUtr,
        order.total_amount,
        proofNotes || ''
      );
    }

    // Update order status to Pending Verification
    db.prepare(`
      UPDATE orders SET
        payment_status = 'Submitted',
        status = 'Payment Pending',
        updated_at = datetime('now')
      WHERE id = ?
    `).run(order.id);

    // Audit log transaction
    db.prepare(`
      INSERT INTO transactions (order_id, user_id, amount, status, reference_id, gateway, payload)
      VALUES (?, ?, ?, 'Submitted', ?, 'UPI', ?)
    `).run(
      order.id,
      order.user_id,
      order.total_amount,
      cleanUtr,
      JSON.stringify({ orderNumber, utrNumber: cleanUtr, notes: proofNotes })
    );

    res.json({
      success: true,
      message: 'UTR submitted successfully. Your payment is being verified by our server and merchant settlement desk.',
      status: 'Submitted',
      utrNumber: cleanUtr
    });
  } catch (err) {
    console.error('Submit UPI error:', err);
    res.status(500).json({ success: false, message: 'Failed to record transaction reference.' });
  }
});

// 3. Live Payment Status Check for polling / WebSocket replacement
router.get('/status/:orderNumber', (req, res) => {
  const { orderNumber } = req.params;
  const order = db.prepare('SELECT id, order_number, status, payment_status, total_amount FROM orders WHERE order_number = ?').get(orderNumber);

  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found.' });
  }

  const payment = db.prepare('SELECT utr_number, status, verified_at, amount FROM payments WHERE order_id = ? ORDER BY id DESC LIMIT 1').get(order.id);

  res.json({
    success: true,
    orderNumber: order.order_number,
    orderStatus: order.status,
    paymentStatus: order.payment_status,
    totalAmount: order.total_amount,
    payment: payment || null
  });
});

// 4. Instant Payment Verification (used by Merchant Admin or Instant Gateway Simulator)
router.post('/verify-payment', requireAdmin, (req, res) => {
  try {
    const { orderNumber, action = 'approve', reason = '' } = req.body;
    if (!orderNumber) {
      return res.status(400).json({ success: false, message: 'Order number required.' });
    }

    const order = db.prepare('SELECT * FROM orders WHERE order_number = ?').get(orderNumber);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (action === 'approve') {
      db.prepare(`
        UPDATE payments SET
          status = 'Verified',
          verified_by = ?,
          verified_at = datetime('now'),
          updated_at = datetime('now')
        WHERE order_id = ?
      `).run(req.user.id, order.id);

      db.prepare(`
        UPDATE orders SET
          payment_status = 'Verified',
          status = 'Payment Successful',
          updated_at = datetime('now')
        WHERE id = ?
      `).run(order.id);

      db.prepare(`
        INSERT INTO transactions (order_id, user_id, amount, status, gateway, payload)
        VALUES (?, ?, ?, 'Verified', 'UPI', ?)
      `).run(
        order.id,
        order.user_id,
        order.total_amount,
        JSON.stringify({ verified_by: req.user.email, timestamp: new Date().toISOString() })
      );

      return res.json({
        success: true,
        message: 'Payment verified successfully! Order marked as Payment Successful.',
        orderStatus: 'Payment Successful',
        paymentStatus: 'Verified'
      });
    } else {
      // Reject
      db.prepare(`
        UPDATE payments SET
          status = 'Failed',
          proof_notes = ?,
          updated_at = datetime('now')
        WHERE order_id = ?
      `).run(reason || 'Payment rejected by administrator', order.id);

      db.prepare(`
        UPDATE orders SET
          payment_status = 'Failed',
          status = 'Cancelled',
          updated_at = datetime('now')
        WHERE id = ?
      `).run(order.id);

      // Restore inventory
      const items = db.prepare('SELECT product_id, quantity FROM order_items WHERE order_id = ?').all(order.id);
      for (const item of items) {
        db.prepare('UPDATE products SET stock = stock + ? WHERE id = ?').run(item.quantity, item.product_id);
      }

      return res.json({
        success: true,
        message: 'Payment rejected. Order cancelled and inventory restored.',
        orderStatus: 'Cancelled',
        paymentStatus: 'Failed'
      });
    }
  } catch (err) {
    console.error('Verify payment error:', err);
    res.status(500).json({ success: false, message: 'Verification failed.' });
  }
});

// 5. Razorpay Integration endpoints (if Razorpay credentials are provided)
router.get('/razorpay-config', (req, res) => {
  res.json({
    success: true,
    enabled: Boolean(RAZORPAY_KEY_ID),
    keyId: RAZORPAY_KEY_ID || null
  });
});

module.exports = router;
