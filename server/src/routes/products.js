const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Helper to attach images and specs to product
function enrichProduct(product) {
  if (!product) return null;
  const images = db.prepare('SELECT image_url, is_primary FROM product_images WHERE product_id = ? ORDER BY is_primary DESC, display_order ASC').all(product.id);
  const specs = db.prepare('SELECT spec_key, spec_value FROM product_specs WHERE product_id = ?').all(product.id);
  const category = product.category_id ? db.prepare('SELECT id, name, slug FROM categories WHERE id = ?').get(product.category_id) : null;
  
  return {
    ...product,
    images: images.length > 0 ? images.map(i => i.image_url) : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'],
    primary_image: images.length > 0 ? images[0].image_url : 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    specs,
    category
  };
}

// 1. Search suggestions for live autocomplete
router.get('/suggestions', (req, res) => {
  const query = (req.query.q || '').trim();
  if (!query) {
    return res.json({ success: true, suggestions: [] });
  }

  const matches = db.prepare(`
    SELECT p.id, p.name, p.slug, p.price, p.discount_price, p.brand,
           (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as image
    FROM products p
    WHERE p.is_active = 1 AND (p.name LIKE ? OR p.brand LIKE ? OR p.description LIKE ?)
    LIMIT 6
  `).all(`%${query}%`, `%${query}%`, `%${query}%`);

  res.json({ success: true, suggestions: matches });
});

// 2. Filter metadata (brands, price range, categories)
router.get('/filters', (req, res) => {
  const brands = db.prepare('SELECT DISTINCT brand FROM products WHERE is_active = 1 ORDER BY brand ASC').all().map(b => b.brand);
  const categories = db.prepare('SELECT id, name, slug FROM categories ORDER BY name ASC').all();
  const priceBounds = db.prepare('SELECT MIN(price) as minPrice, MAX(price) as maxPrice FROM products WHERE is_active = 1').get();

  res.json({
    success: true,
    brands,
    categories,
    minPrice: priceBounds.minPrice || 0,
    maxPrice: priceBounds.maxPrice || 50000
  });
});

// 3. Featured products
router.get('/featured', (req, res) => {
  const products = db.prepare('SELECT * FROM products WHERE is_active = 1 AND is_featured = 1 LIMIT 8').all();
  res.json({ success: true, products: products.map(enrichProduct) });
});

// 4. Trending products
router.get('/trending', (req, res) => {
  const products = db.prepare('SELECT * FROM products WHERE is_active = 1 AND is_trending = 1 LIMIT 8').all();
  res.json({ success: true, products: products.map(enrichProduct) });
});

// 5. All products with full search, filter, sort, and pagination
router.get('/', (req, res) => {
  const {
    search,
    category,
    brand,
    minPrice,
    maxPrice,
    rating,
    inStock,
    sort = 'newest',
    page = 1,
    limit = 12
  } = req.query;

  let query = 'SELECT p.* FROM products p';
  let countQuery = 'SELECT COUNT(*) as total FROM products p';
  const conditions = ['p.is_active = 1'];
  const params = [];
  const countParams = [];

  if (category) {
    conditions.push('(p.category_id = (SELECT id FROM categories WHERE slug = ? OR id = ?))');
    params.push(category, category);
    countParams.push(category, category);
  }

  if (brand) {
    const brandList = Array.isArray(brand) ? brand : brand.split(',');
    const placeholders = brandList.map(() => '?').join(',');
    conditions.push(`p.brand IN (${placeholders})`);
    params.push(...brandList);
    countParams.push(...brandList);
  }

  if (search) {
    conditions.push('(p.name LIKE ? OR p.brand LIKE ? OR p.description LIKE ? OR p.short_desc LIKE ?)');
    const term = `%${search.trim()}%`;
    params.push(term, term, term, term);
    countParams.push(term, term, term, term);
  }

  if (minPrice) {
    conditions.push('COALESCE(p.discount_price, p.price) >= ?');
    params.push(Number(minPrice));
    countParams.push(Number(minPrice));
  }

  if (maxPrice) {
    conditions.push('COALESCE(p.discount_price, p.price) <= ?');
    params.push(Number(maxPrice));
    countParams.push(Number(maxPrice));
  }

  if (rating) {
    conditions.push('p.rating >= ?');
    params.push(Number(rating));
    countParams.push(Number(rating));
  }

  if (inStock === 'true' || inStock === '1') {
    conditions.push('p.stock > 0');
  }

  if (conditions.length > 0) {
    const whereClause = ' WHERE ' + conditions.join(' AND ');
    query += whereClause;
    countQuery += whereClause;
  }

  // Sorting
  switch (sort) {
    case 'price_asc':
      query += ' ORDER BY COALESCE(p.discount_price, p.price) ASC';
      break;
    case 'price_desc':
      query += ' ORDER BY COALESCE(p.discount_price, p.price) DESC';
      break;
    case 'rating':
      query += ' ORDER BY p.rating DESC, p.review_count DESC';
      break;
    case 'popular':
      query += ' ORDER BY p.is_trending DESC, p.review_count DESC';
      break;
    case 'newest':
    default:
      query += ' ORDER BY p.created_at DESC, p.id DESC';
      break;
  }

  // Pagination
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, Math.min(50, parseInt(limit, 10) || 12));
  const offset = (pageNum - 1) * limitNum;

  query += ` LIMIT ${limitNum} OFFSET ${offset}`;

  const totalCount = db.prepare(countQuery).get(...countParams).total;
  const products = db.prepare(query).all(...params);

  res.json({
    success: true,
    total: totalCount,
    page: pageNum,
    totalPages: Math.ceil(totalCount / limitNum),
    limit: limitNum,
    products: products.map(enrichProduct)
  });
});

// 6. Single product details by id or slug
router.get('/:idOrSlug', (req, res) => {
  const { idOrSlug } = req.params;
  const product = db.prepare(`
    SELECT * FROM products
    WHERE (slug = ? OR id = ?) AND is_active = 1
  `).get(idOrSlug, idOrSlug);

  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found.' });
  }

  const enriched = enrichProduct(product);
  res.json({ success: true, product: enriched });
});

// 7. Related products
router.get('/:id/related', (req, res) => {
  const { id } = req.params;
  const target = db.prepare('SELECT category_id, brand FROM products WHERE id = ?').get(id);
  if (!target) {
    return res.json({ success: true, products: [] });
  }

  const related = db.prepare(`
    SELECT * FROM products
    WHERE id != ? AND is_active = 1 AND (category_id = ? OR brand = ?)
    LIMIT 4
  `).all(id, target.category_id, target.brand);

  res.json({ success: true, products: related.map(enrichProduct) });
});

module.exports = router;
