const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', (req, res) => {
  const categories = db.prepare(`
    SELECT c.*, COUNT(p.id) as product_count
    FROM categories c
    LEFT JOIN products p ON p.category_id = c.id AND p.is_active = 1
    GROUP BY c.id
    ORDER BY c.name ASC
  `).all();

  res.json({ success: true, categories });
});

router.get('/:slug', (req, res) => {
  const category = db.prepare('SELECT * FROM categories WHERE slug = ?').get(req.params.slug);
  if (!category) {
    return res.status(404).json({ success: false, message: 'Category not found.' });
  }

  const products = db.prepare(`
    SELECT * FROM products WHERE category_id = ? AND is_active = 1
  `).all(category.id);

  res.json({ success: true, category, products });
});

module.exports = router;
