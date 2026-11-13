require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Initialize database & tables
require('./config/db');

// Ensure seed data exists
try {
  require('./config/seed');
} catch (e) {
  console.log('Seeder ran or already populated:', e.message);
}

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Serve frontend static build if it exists
const clientDistPath = path.join(__dirname, '../../client/dist');
const fs = require('fs');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'E-Commerce Production API',
    merchant: {
      upiId: 'lalithkumar19742006@oksbi',
      name: 'Lalithkumar'
    }
  });
});

// Mount Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/wishlist', require('./routes/wishlist'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/payment', require('./routes/payment'));
app.use('/api/coupons', require('./routes/coupons'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/contact', require('./routes/contact'));

// Global 404 Handler for API
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: `API route ${req.originalUrl} not found.` });
});

// SPA Fallback for client-side routing
if (fs.existsSync(clientDistPath)) {
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error occurred.'
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`=================================================`);
    console.log(`🚀 E-Commerce API Server running on port ${PORT}`);
    console.log(`💳 UPI Payment Destination: lalithkumar19742006@oksbi`);
    console.log(`👤 Merchant Name: Lalithkumar`);
    console.log(`📍 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`=================================================`);
  });
}

module.exports = app;
