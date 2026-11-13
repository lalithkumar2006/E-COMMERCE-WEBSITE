const bcrypt = require('bcryptjs');
const db = require('./db');

function seedData() {
  console.log('Seeding initial database data...');

  // 1. Create Default Users
  const userCheck = db.prepare('SELECT COUNT(*) as count FROM users').get();
  if (userCheck.count === 0) {
    const salt = bcrypt.genSaltSync(10);
    const adminHash = bcrypt.hashSync('Admin@123', salt);
    const customerHash = bcrypt.hashSync('Customer@123', salt);

    const insertUser = db.prepare(`
      INSERT INTO users (name, email, password_hash, role, phone, is_verified)
      VALUES (?, ?, ?, ?, ?, 1)
    `);

    insertUser.run('Admin Manager', 'admin@ecommerce.com', adminHash, 'admin', '+91 9876543210');
    const customer = insertUser.run('Lalith Customer', 'customer@example.com', customerHash, 'customer', '+91 9840123456');

    // Create default address for sample customer
    const insertAddress = db.prepare(`
      INSERT INTO addresses (user_id, full_name, phone, address_line1, address_line2, city, state, postal_code, country, is_default)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `);
    insertAddress.run(
      customer.lastInsertRowid,
      'Lalith Customer',
      '+91 9840123456',
      '42, Gandhi Road, Anna Nagar',
      'Near Metro Station',
      'Chennai',
      'Tamil Nadu',
      '600040',
      'India'
    );

    console.log('Admin user and sample customer created.');
  }

  // 2. Create Categories
  const categoryCheck = db.prepare('SELECT COUNT(*) as count FROM categories').get();
  if (categoryCheck.count === 0) {
    const insertCategory = db.prepare(`
      INSERT INTO categories (name, slug, description, image_url, icon)
      VALUES (?, ?, ?, ?, ?)
    `);

    insertCategory.run(
      'Electronics',
      'electronics',
      'High-performance laptops, wireless noise-cancelling headphones, and smart audio.',
      'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=800&q=80',
      'Laptop'
    );
    insertCategory.run(
      'Fashion & Apparel',
      'fashion',
      'Curated streetwear, minimal jackets, luxury sneakers, and accessories.',
      'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=800&q=80',
      'Shirt'
    );
    insertCategory.run(
      'Home & Living',
      'home-living',
      'Scandinavian furniture, ambient smart lamps, and ergonomic workspace items.',
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
      'Home'
    );
    insertCategory.run(
      'Beauty & Wellness',
      'beauty-grooming',
      'Organic botanical skincare, artisan fragrances, and revitalizing essentials.',
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80',
      'Sparkles'
    );
    insertCategory.run(
      'Gadgets & Accessories',
      'gadgets',
      'MagSafe wireless power banks, titanium carabiners, and mechanical keyboards.',
      'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80',
      'Smartphone'
    );

    console.log('Categories seeded.');
  }

  // 3. Create Products
  const productCheck = db.prepare('SELECT COUNT(*) as count FROM products').get();
  if (productCheck.count === 0) {
    const productsData = [
      {
        name: 'AeroPulse ANC Wireless Headphones Pro',
        slug: 'aeropulse-anc-wireless-headphones-pro',
        category_slug: 'electronics',
        brand: 'SoundAura',
        price: 14999,
        discount_price: 11999,
        stock: 35,
        rating: 4.8,
        review_count: 142,
        is_featured: 1,
        is_trending: 1,
        short_desc: 'Studio-grade hybrid noise cancellation with 45-hour ultra-long battery life.',
        description: 'Engineered for audiophiles and remote workers alike. The AeroPulse Pro features custom 40mm beryllium drivers, active hybrid ambient sound modes, low-latency Bluetooth 5.3, and memory-foam acoustic cups wrapped in vegan leather.',
        images: [
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80'
        ],
        specs: [
          { key: 'Driver Size', value: '40mm Beryllium' },
          { key: 'Battery Life', value: 'Up to 45 Hours (ANC On)' },
          { key: 'Connectivity', value: 'Bluetooth 5.3 / 3.5mm Aux / USB-C' },
          { key: 'Weight', value: '254 grams' }
        ]
      },
      {
        name: 'Veloce Neo Mechanical Gaming Keyboard',
        slug: 'veloce-neo-mechanical-gaming-keyboard',
        category_slug: 'gadgets',
        brand: 'KeyNova',
        price: 8499,
        discount_price: 6499,
        stock: 24,
        rating: 4.9,
        review_count: 88,
        is_featured: 1,
        is_trending: 1,
        short_desc: 'Hot-swappable gasket-mounted mechanical keyboard with per-key RGB and CNC aluminum body.',
        description: 'Crafted with aerospace aluminum casing, factory-lubed linear switches, sound-dampening poron foam, and customizable South-facing RGB lighting. Seamless triple-mode connection: 2.4Ghz wireless, Bluetooth, and braided USB-C.',
        images: [
          'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=800&q=80'
        ],
        specs: [
          { key: 'Switch Type', value: 'Gateron Yellow Pro Linear (Lubed)' },
          { key: 'Layout', value: '75% Compact (82 Keys)' },
          { key: 'Battery', value: '4000mAh Rechargeable' },
          { key: 'Material', value: 'Anodized CNC Aluminum' }
        ]
      },
      {
        name: 'Horizon Minimalist Chronograph Watch',
        slug: 'horizon-minimalist-chronograph-watch',
        category_slug: 'fashion',
        brand: 'NordicTime',
        price: 12499,
        discount_price: 8999,
        stock: 18,
        rating: 4.7,
        review_count: 65,
        is_featured: 1,
        is_trending: 0,
        short_desc: 'Sapphire crystal glass with surgical 316L stainless steel case and genuine Italian leather strap.',
        description: 'Understated elegance inspired by Scandinavian design. Water-resistant up to 50 meters, featuring a Japanese Miyota quartz movement, sub-dial stopwatches, and interchangeable quick-release straps.',
        images: [
          'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80'
        ],
        specs: [
          { key: 'Case Diameter', value: '40mm' },
          { key: 'Glass', value: 'Scratch-resistant Sapphire Crystal' },
          { key: 'Water Resistance', value: '5 ATM (50 Meters)' },
          { key: 'Movement', value: 'Miyota Chronograph Quartz' }
        ]
      },
      {
        name: 'Lumina MagSafe 3-in-1 Fast Wireless Station',
        slug: 'lumina-magsafe-3-in-1-fast-wireless-station',
        category_slug: 'gadgets',
        brand: 'PowerDock',
        price: 4999,
        discount_price: 3499,
        stock: 45,
        rating: 4.6,
        review_count: 94,
        is_featured: 0,
        is_trending: 1,
        short_desc: 'Charges iPhone, Apple Watch, and AirPods simultaneously with floating magnetic alignment.',
        description: 'Organize your nightstand or workspace with this modern aluminum charging stand. Supports Qi2 15W fast charging for smartphones, fast-charge puck for smartwatches, and a dedicated indented wireless pad for earphones.',
        images: [
          'https://images.unsplash.com/photo-1622445262464-84b1456045b6?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80'
        ],
        specs: [
          { key: 'Total Output', value: '25W Fast Charge' },
          { key: 'Input Port', value: 'USB Type-C PD' },
          { key: 'Compatibility', value: 'MagSafe iPhones, Apple Watch, Qi Earbuds' },
          { key: 'Safety', value: 'Foreign Object Detection & Overheat Cutoff' }
        ]
      },
      {
        name: 'Zenith Organic Japanese Ceremonial Matcha Set',
        slug: 'zenith-organic-japanese-ceremonial-matcha-set',
        category_slug: 'beauty-grooming',
        brand: 'ZenBotanics',
        price: 3299,
        discount_price: 2499,
        stock: 50,
        rating: 4.9,
        review_count: 53,
        is_featured: 0,
        is_trending: 0,
        short_desc: 'First-harvest shade-grown Uji green tea powder with handmade bamboo whisk and ceramic chawan bowl.',
        description: 'Experience pure serenity and vibrant focus. Sourced directly from single-estate organic tea farms in Uji, Kyoto. Rich in L-theanine and antioxidants, producing an extraordinarily silky, umami-rich froth without bitterness.',
        images: [
          'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80'
        ],
        specs: [
          { key: 'Origin', value: 'Uji, Kyoto, Japan' },
          { key: 'Grade', value: 'Ceremonial Grade (First Harvest)' },
          { key: 'Net Weight', value: '50g (approx. 25 servings)' },
          { key: 'Includes', value: 'Ceramic Chawan, 100-prong Chasen Whisk, Chashaku Scoop' }
        ]
      },
      {
        name: 'Aura Ambient Smart LED Desk Bar',
        slug: 'aura-ambient-smart-led-desk-bar',
        category_slug: 'home-living',
        brand: 'LumiSpace',
        price: 5999,
        discount_price: 4299,
        stock: 30,
        rating: 4.8,
        review_count: 76,
        is_featured: 1,
        is_trending: 1,
        short_desc: 'Asymmetric anti-glare screen light bar with auto-dimming touch dial and back ambient glow.',
        description: 'Protect your eyes during long work or gaming sessions. Projects soft, balanced light strictly over your desk surface without screen glare. Features stepless color temperature adjustment (2700K - 6500K) and wireless rotary controller.',
        images: [
          'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1517581177682-a085bb7ffb15?auto=format&fit=crop&w=800&q=80'
        ],
        specs: [
          { key: 'Color Temperature', value: '2700K - 6500K Tunable' },
          { key: 'CRI (Color Index)', value: 'Ra >= 95' },
          { key: 'Power Supply', value: 'USB 5V/2A' },
          { key: 'Control', value: 'Wireless 2.4GHz Rotary Knob' }
        ]
      },
      {
        name: 'Urban Transit Waterproof Commuter Backpack 28L',
        slug: 'urban-transit-waterproof-commuter-backpack-28l',
        category_slug: 'fashion',
        brand: 'PackCraft',
        price: 6999,
        discount_price: 4999,
        stock: 22,
        rating: 4.7,
        review_count: 110,
        is_featured: 0,
        is_trending: 1,
        short_desc: 'Cordura ballistic nylon with magnetic Fidlock buckle and suspended 16-inch laptop chamber.',
        description: 'Engineered for seamless city transit. Features weather-sealed YKK Aquaguard zippers, ergonomic airflow back panel, hidden passport sleeve, and quick-access side pockets for water bottle and umbrella.',
        images: [
          'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=800&q=80'
        ],
        specs: [
          { key: 'Capacity', value: '28 Liters' },
          { key: 'Laptop Compartment', value: 'Fits up to 16-inch MacBook Pro' },
          { key: 'Material', value: '1000D Cordura Waterproof Nylon' },
          { key: 'Weight', value: '980 grams' }
        ]
      },
      {
        name: 'ErgoComfort Memory Foam Cervical Orthopedic Pillow',
        slug: 'ergocomfort-memory-foam-cervical-pillow',
        category_slug: 'home-living',
        brand: 'RestWell',
        price: 3499,
        discount_price: 2299,
        stock: 40,
        rating: 4.5,
        review_count: 82,
        is_featured: 0,
        is_trending: 0,
        short_desc: 'Contoured neck alignment contour with cooling gel bamboo fabric outer cover.',
        description: 'Wake up free from morning stiffness. Anatomically shaped contour cradles the cervical spine for optimal airway opening and spine alignment whether you sleep on your back, side, or stomach.',
        images: [
          'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=80'
        ],
        specs: [
          { key: 'Core Material', value: 'Slow-rebound High-density Memory Foam' },
          { key: 'Cover', value: 'Washable Breathable Bamboo Viscose' },
          { key: 'Dimensions', value: '60cm x 35cm x 11/9cm' },
          { key: 'Warranty', value: '3 Years Shape Retention' }
        ]
      }
    ];

    const insertProd = db.prepare(`
      INSERT INTO products (name, slug, description, short_desc, price, discount_price, category_id, brand, stock, rating, review_count, is_featured, is_trending)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertImg = db.prepare(`
      INSERT INTO product_images (product_id, image_url, is_primary, display_order)
      VALUES (?, ?, ?, ?)
    `);

    const insertSpec = db.prepare(`
      INSERT INTO product_specs (product_id, spec_key, spec_value)
      VALUES (?, ?, ?)
    `);

    for (const p of productsData) {
      const cat = db.prepare('SELECT id FROM categories WHERE slug = ?').get(p.category_slug);
      const res = insertProd.run(
        p.name,
        p.slug,
        p.description,
        p.short_desc,
        p.price,
        p.discount_price,
        cat ? cat.id : null,
        p.brand,
        p.stock,
        p.rating,
        p.review_count,
        p.is_featured,
        p.is_trending
      );

      const prodId = res.lastInsertRowid;

      p.images.forEach((url, idx) => {
        insertImg.run(prodId, url, idx === 0 ? 1 : 0, idx);
      });

      p.specs.forEach((s) => {
        insertSpec.run(prodId, s.key, s.value);
      });

      // Insert sample reviews
      db.prepare(`
        INSERT INTO reviews (product_id, user_id, rating, title, comment)
        VALUES (?, 2, 5, 'Exceptional quality and fast delivery!', 'Ordered this last week and received it promptly. The build quality exceeds expectations!')
      `).run(prodId);
    }

    console.log('Products and specs seeded successfully.');
  }

  // 4. Create Coupons
  const couponCheck = db.prepare('SELECT COUNT(*) as count FROM coupons').get();
  if (couponCheck.count === 0) {
    const insertCoupon = db.prepare(`
      INSERT INTO coupons (code, description, discount_type, discount_value, min_order_value, max_discount, is_active)
      VALUES (?, ?, ?, ?, ?, ?, 1)
    `);

    insertCoupon.run('WELCOME10', '10% discount on first purchase', 'percentage', 10, 500, 1000);
    insertCoupon.run('SUPER20', '20% off for orders over ₹1,500', 'percentage', 20, 1500, 1500);
    insertCoupon.run('FESTIVE500', 'Flat ₹500 discount on orders over ₹2,500', 'fixed', 500, 2500, 500);

    console.log('Discount coupons seeded.');
  }

  console.log('Database initialization & seeding complete!');
}

seedData();

module.exports = seedData;
