import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal, ArrowUpDown, X, Star, Check } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { api } from '../services/api';

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filter metadata
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  // Active filter state from URL params
  const categoryParam = searchParams.get('category') || '';
  const searchParam = searchParams.get('search') || '';
  const brandParam = searchParams.get('brand') || '';
  const sortParam = searchParams.get('sort') || 'newest';
  const minPriceParam = searchParams.get('minPrice') || '';
  const maxPriceParam = searchParams.get('maxPrice') || '';
  const ratingParam = searchParams.get('rating') || '';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);

  // Load filter options
  useEffect(() => {
    async function loadMeta() {
      try {
        const meta = await api.getFilters();
        setCategories(meta.categories || []);
        setBrands(meta.brands || []);
      } catch (err) {
        console.error('Failed to load filter metadata:', err);
      }
    }
    loadMeta();
  }, []);

  // Fetch products whenever params change
  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const queryObj = {
          page: pageParam,
          limit: 12,
          sort: sortParam
        };
        if (categoryParam) queryObj.category = categoryParam;
        if (searchParam) queryObj.search = searchParam;
        if (brandParam) queryObj.brand = brandParam;
        if (minPriceParam) queryObj.minPrice = minPriceParam;
        if (maxPriceParam) queryObj.maxPrice = maxPriceParam;
        if (ratingParam) queryObj.rating = ratingParam;

        const res = await api.getProducts(queryObj);
        setProducts(res.products || []);
        setTotal(res.total || 0);
        setTotalPages(res.totalPages || 1);
      } catch (err) {
        console.error('Fetch products error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [categoryParam, searchParam, brandParam, sortParam, minPriceParam, maxPriceParam, ratingParam, pageParam]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    next.set('page', '1'); // Reset to page 1 on filter change
    setSearchParams(next);
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const hasActiveFilters = Boolean(categoryParam || brandParam || minPriceParam || maxPriceParam || ratingParam || searchParam);

  const FilterSidebar = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
          <Filter className="w-4 h-4 text-indigo-600" />
          Filter Products
        </h3>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-xs font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400"
          >
            Reset All
          </button>
        )}
      </div>

      {/* Categories */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">Category</h4>
        <div className="space-y-1.5">
          <button
            onClick={() => updateParam('category', '')}
            className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              !categoryParam ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            All Categories
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => updateParam('category', c.slug)}
              className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                categoryParam === c.slug ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Brand Filter */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">Brand</h4>
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          {brands.map((b) => (
            <label key={b} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="radio"
                name="brandFilter"
                checked={brandParam === b}
                onChange={() => updateParam('brand', brandParam === b ? '' : b)}
                className="text-indigo-600 focus:ring-indigo-500 rounded"
              />
              <span>{b}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">Price Range (₹)</h4>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Min"
            value={minPriceParam}
            onChange={(e) => updateParam('minPrice', e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-slate-100 dark:bg-slate-800 border-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="number"
            placeholder="Max"
            value={maxPriceParam}
            onChange={(e) => updateParam('maxPrice', e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-slate-100 dark:bg-slate-800 border-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Rating Filter */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">Customer Rating</h4>
        <div className="space-y-1">
          {[4, 3, 2].map((r) => (
            <button
              key={r}
              onClick={() => updateParam('rating', ratingParam === r.toString() ? '' : r.toString())}
              className={`w-full flex items-center justify-between px-2.5 py-1 rounded-lg text-xs transition-colors ${
                ratingParam === r.toString() ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 font-bold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-1">
                <span className="font-medium">{r} Stars & above</span>
              </div>
              <div className="flex text-amber-400">
                {Array.from({ length: r }).map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-current" />
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {searchParam ? `Results for "${searchParam}"` : categoryParam ? `Category: ${categoryParam}` : 'All Products'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Showing <strong className="text-slate-700 dark:text-slate-300">{products.length}</strong> of <strong className="text-slate-700 dark:text-slate-300">{total}</strong> products
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-2"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters {hasActiveFilters && '•'}
          </button>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 hidden sm:inline">Sort:</span>
            <select
              value={sortParam}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="px-3 py-2 rounded-xl text-xs font-medium bg-slate-100 dark:bg-slate-800 border-none text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="popular">Most Popular</option>
              <option value="rating">Customer Rating</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pt-8">
        
        {/* Desktop Sidebar */}
        <div className="hidden lg:block lg:col-span-1">
          <div className="sticky top-24 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <FilterSidebar />
          </div>
        </div>

        {/* Product List */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="h-80 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse"></div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
              <p className="text-base font-semibold text-slate-800 dark:text-slate-200">No products match your criteria.</p>
              <p className="text-xs text-slate-500 mt-1">Try resetting filters or searching with different keywords.</p>
              <button
                onClick={clearAllFilters}
                className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12 pt-6 border-t border-slate-200 dark:border-slate-800">
                  <button
                    disabled={pageParam <= 1}
                    onClick={() => updateParam('page', (pageParam - 1).toString())}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-xs text-slate-600 dark:text-slate-400 font-medium px-2">
                    Page {pageParam} of {totalPages}
                  </span>
                  <button
                    disabled={pageParam >= totalPages}
                    onClick={() => updateParam('page', (pageParam + 1).toString())}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile Filter Modal */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-xs bg-white dark:bg-slate-900 h-full p-6 overflow-y-auto ml-auto shadow-2xl flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <h3 className="font-bold text-slate-900 dark:text-white">Filters</h3>
                <button onClick={() => setMobileFilterOpen(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <FilterSidebar />
            </div>
            <button
              onClick={() => setMobileFilterOpen(false)}
              className="mt-6 w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold text-xs shadow-md"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
