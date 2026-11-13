const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Submit Contact Message
router.post('/', (req, res) => {
  const { name, email, phone, subject, message } = req.body;
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ success: false, message: 'Please provide name, email, subject, and message.' });
  }

  db.prepare(`
    INSERT INTO contact_messages (name, email, phone, subject, message)
    VALUES (?, ?, ?, ?, ?)
  `).run(name.trim(), email.trim(), phone ? phone.trim() : null, subject.trim(), message.trim());

  res.status(201).json({
    success: true,
    message: 'Thank you for reaching out! Our support team will get back to you within 24 hours.'
  });
});

// Newsletter Subscription
router.post('/newsletter', (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
  }

  try {
    db.prepare('INSERT INTO newsletter_subscribers (email) VALUES (?)').run(email.toLowerCase().trim());
    res.status(201).json({ success: true, message: 'Subscribed successfully to our VIP newsletter!' });
  } catch (err) {
    // If already subscribed, return friendly success
    res.json({ success: true, message: 'You are already subscribed to our newsletter.' });
  }
});

module.exports = router;
