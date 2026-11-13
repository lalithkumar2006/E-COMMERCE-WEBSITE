const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = process.env.DATABASE_URL || path.join(dataDir, 'ecommerce.db');
const db = new DatabaseSync(dbPath);

// Enable WAL mode and foreign keys for performance and relational integrity
db.exec('PRAGMA foreign_keys = ON;');
db.exec('PRAGMA journal_mode = WAL;');

function initDatabase() {
  db.exec(`
    -- 1. Users Table
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'customer' CHECK(role IN ('customer', 'admin')),
      phone TEXT,
      avatar_url TEXT,
      is_verified INTEGER DEFAULT 1,
      reset_token TEXT,
      reset_expires TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    -- 2. Categories Table
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      slug TEXT NOT NULL UNIQUE,
      description TEXT,
      image_url TEXT,
      icon TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- 3. Products Table
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT NOT NULL,
      short_desc TEXT,
      price REAL NOT NULL CHECK(price >= 0),
      discount_price REAL CHECK(discount_price >= 0),
      category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
      brand TEXT NOT NULL,
      stock INTEGER NOT NULL DEFAULT 0 CHECK(stock >= 0),
      rating REAL DEFAULT 5.0,
      review_count INTEGER DEFAULT 0,
      is_featured INTEGER DEFAULT 0,
      is_trending INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    -- 4. Product Images Table
    CREATE TABLE IF NOT EXISTS product_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      image_url TEXT NOT NULL,
      is_primary INTEGER DEFAULT 0,
      display_order INTEGER DEFAULT 0
    );

    -- 5. Product Specifications Table
    CREATE TABLE IF NOT EXISTS product_specs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      spec_key TEXT NOT NULL,
      spec_value TEXT NOT NULL
    );

    -- 6. Cart Items Table
    CREATE TABLE IF NOT EXISTS cart_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      quantity INTEGER NOT NULL DEFAULT 1 CHECK(quantity > 0),
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      UNIQUE(user_id, product_id)
    );

    -- 7. Wishlist Items Table
    CREATE TABLE IF NOT EXISTS wishlist_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(user_id, product_id)
    );

    -- 8. Customer Addresses Table
    CREATE TABLE IF NOT EXISTS addresses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      full_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      address_line1 TEXT NOT NULL,
      address_line2 TEXT,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      postal_code TEXT NOT NULL,
      country TEXT NOT NULL DEFAULT 'India',
      is_default INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- 9. Orders Table
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_number TEXT NOT NULL UNIQUE,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      status TEXT NOT NULL DEFAULT 'Payment Pending' 
        CHECK(status IN ('Pending', 'Payment Pending', 'Payment Successful', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'Refunded')),
      payment_status TEXT NOT NULL DEFAULT 'Pending'
        CHECK(payment_status IN ('Pending', 'Submitted', 'Verified', 'Failed', 'Refunded')),
      payment_method TEXT NOT NULL DEFAULT 'UPI',
      total_amount REAL NOT NULL,
      subtotal REAL NOT NULL,
      discount_amount REAL DEFAULT 0,
      delivery_fee REAL DEFAULT 0,
      coupon_code TEXT,
      shipping_name TEXT NOT NULL,
      shipping_phone TEXT NOT NULL,
      shipping_email TEXT NOT NULL,
      shipping_address TEXT NOT NULL,
      shipping_city TEXT NOT NULL,
      shipping_state TEXT NOT NULL,
      shipping_pincode TEXT NOT NULL,
      notes TEXT,
      tracking_number TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    -- 10. Order Items Table
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
      product_name TEXT NOT NULL,
      product_price REAL NOT NULL,
      quantity INTEGER NOT NULL CHECK(quantity > 0),
      subtotal REAL NOT NULL,
      product_image TEXT
    );

    -- 11. Payments Table
    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      payment_method TEXT NOT NULL DEFAULT 'UPI',
      merchant_upi_id TEXT NOT NULL DEFAULT 'lalithkumar19742006@oksbi',
      merchant_name TEXT NOT NULL DEFAULT 'Lalithkumar',
      transaction_ref TEXT UNIQUE,
      utr_number TEXT UNIQUE,
      amount REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'Pending' 
        CHECK(status IN ('Pending', 'Submitted', 'Verified', 'Failed', 'Refunded')),
      proof_notes TEXT,
      verified_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
      verified_at TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    -- 12. Transactions Audit Log Table
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER REFERENCES orders(id) ON DELETE SET NULL,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      amount REAL NOT NULL,
      currency TEXT NOT NULL DEFAULT 'INR',
      status TEXT NOT NULL,
      reference_id TEXT,
      gateway TEXT NOT NULL DEFAULT 'UPI',
      payload TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- 13. Reviews Table
    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
      title TEXT,
      comment TEXT NOT NULL,
      is_approved INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- 14. Coupons Table
    CREATE TABLE IF NOT EXISTS coupons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL UNIQUE,
      description TEXT,
      discount_type TEXT NOT NULL CHECK(discount_type IN ('percentage', 'fixed')),
      discount_value REAL NOT NULL CHECK(discount_value > 0),
      min_order_value REAL DEFAULT 0,
      max_discount REAL,
      valid_from TEXT,
      valid_until TEXT,
      is_active INTEGER DEFAULT 1,
      usage_limit INTEGER DEFAULT 1000,
      times_used INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- 15. Inventory Log Table
    CREATE TABLE IF NOT EXISTS inventory_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      change_type TEXT NOT NULL,
      quantity_change INTEGER NOT NULL,
      previous_stock INTEGER NOT NULL,
      new_stock INTEGER NOT NULL,
      reason TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- 16. Contact Messages Table
    CREATE TABLE IF NOT EXISTS contact_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT DEFAULT 'unread' CHECK(status IN ('unread', 'read', 'replied')),
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- 17. Newsletter Subscribers Table
    CREATE TABLE IF NOT EXISTS newsletter_subscribers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- Indexes for performance
    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
    CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
    CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
    CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
    CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
    CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);
    CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(order_id);
    CREATE INDEX IF NOT EXISTS idx_payments_utr ON payments(utr_number);
    CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
  `);
}

initDatabase();

module.exports = db;
