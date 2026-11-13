import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, SlidersHorizontal, ArrowLeft } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { api } from '../services/api';

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function executeSearch() {
      if (!query.trim()) {
        setProducts([]);
        setTotal(0);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const res = await api.getProducts({ search: query, limit: 24 });
        setProducts(res.products || []);
        setTotal(res.total || 0);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    executeSearch();
  }, [query]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <Link to="/shop" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 mb-2">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to All Products
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Search Results for "<span className="text-indigo-600 dark:text-indigo-400">{query}</span>"
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Found <strong>{total}</strong> matching {total === 1 ? 'product' : 'products'}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(n => <div key={n} className="h-80 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse"></div>)}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center mx-auto mb-4">
            <Search className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No products found</h3>
          <p className="text-xs text-slate-500 mt-1 mb-6">
            We couldn't find any products matching "{query}". Try checking your spelling or browse our trending categories.
          </p>
          <Link to="/shop" className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors">
            Browse All Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
