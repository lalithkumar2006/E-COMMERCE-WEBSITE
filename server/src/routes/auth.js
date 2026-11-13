const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { JWT_SECRET, requireAuth } = require('../middleware/auth');

// Register
router.post('/register', (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(normalizedEmail);
    if (existing) {
      return res.status(409).json({ success: false, message: 'An account with this email address already exists.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    const insert = db.prepare(`
      INSERT INTO users (name, email, password_hash, role, phone, is_verified)
      VALUES (?, ?, ?, 'customer', ?, 1)
    `);
    const result = insert.run(name.trim(), normalizedEmail, passwordHash, phone ? phone.trim() : null);

    const user = {
      id: Number(result.lastInsertRowid),
      name: name.trim(),
      email: normalizedEmail,
      role: 'customer',
      phone: phone || null
    };

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ success: false, message: 'Registration failed due to a server error.' });
  }
});

// Login
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both email and password.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(normalizedEmail);

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isValid = bcrypt.compareSync(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar_url: user.avatar_url
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Login failed due to a server error.' });
  }
});

// Current User Profile
router.get('/me', requireAuth, (req, res) => {
  const address = db.prepare('SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, id DESC LIMIT 1').get(req.user.id);
  res.json({
    success: true,
    user: req.user,
    address: address || null
  });
});

// Update Profile
router.put('/profile', requireAuth, (req, res) => {
  try {
    const { name, phone, address_line1, address_line2, city, state, postal_code } = req.body;
    
    if (name) {
      db.prepare('UPDATE users SET name = ?, phone = ?, updated_at = datetime("now") WHERE id = ?')
        .run(name.trim(), phone ? phone.trim() : null, req.user.id);
    }

    if (address_line1 && city && state && postal_code) {
      const existingAddr = db.prepare('SELECT id FROM addresses WHERE user_id = ?').get(req.user.id);
      if (existingAddr) {
        db.prepare(`
          UPDATE addresses SET
            full_name = ?, phone = ?, address_line1 = ?, address_line2 = ?,
            city = ?, state = ?, postal_code = ?
          WHERE id = ?
        `).run(name || req.user.name, phone || req.user.phone, address_line1, address_line2 || '', city, state, postal_code, existingAddr.id);
      } else {
        db.prepare(`
          INSERT INTO addresses (user_id, full_name, phone, address_line1, address_line2, city, state, postal_code, is_default)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
        `).run(req.user.id, name || req.user.name, phone || req.user.phone, address_line1, address_line2 || '', city, state, postal_code);
      }
    }

    const updatedUser = db.prepare('SELECT id, name, email, role, phone, avatar_url FROM users WHERE id = ?').get(req.user.id);
    const updatedAddr = db.prepare('SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC LIMIT 1').get(req.user.id);

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: updatedUser,
      address: updatedAddr || null
    });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
});

// Forgot Password mock / recovery flow
router.post('/forgot-password', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'Email address is required.' });

  const user = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase().trim());
  // Always return success to prevent email enumeration
  return res.json({
    success: true,
    message: 'If an account exists with this email, a password reset link has been dispatched.'
  });
});

// Reset Password
router.post('/reset-password', (req, res) => {
  const { email, newPassword } = req.body;
  if (!email || !newPassword || newPassword.length < 6) {
    return res.status(400).json({ success: false, message: 'Valid email and password (min 6 chars) required.' });
  }

  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(newPassword, salt);
  db.prepare('UPDATE users SET password_hash = ?, updated_at = datetime("now") WHERE email = ?')
    .run(passwordHash, email.toLowerCase().trim());

  res.json({ success: true, message: 'Password reset successful. You can now log in.' });
});

module.exports = router;
