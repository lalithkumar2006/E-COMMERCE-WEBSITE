import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Layers } from 'lucide-react';
import { api } from '../services/api';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.getCategories();
        setCategories(res.categories || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider">
          <Layers className="w-3.5 h-3.5" />
          <span>Curated Collections</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">Product Categories</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Explore our handpicked collections designed with modern craftsmanship and top-tier specifications.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(n => <div key={n} className="h-64 bg-slate-200 dark:bg-slate-800 rounded-3xl animate-pulse"></div>)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/shop?category=${cat.slug}`}
              className="group relative rounded-3xl overflow-hidden aspect-[4/3] bg-slate-900 shadow-md hover:shadow-2xl transition-all duration-300"
            >
              <img
                src={cat.image_url || 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=800&q=80'}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-75 group-hover:opacity-85"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">
                  {cat.product_count ? `${cat.product_count} Products Available` : 'Explore Store'}
                </span>
                <h3 className="text-xl font-bold text-white group-hover:text-indigo-200 transition-colors mt-0.5">
                  {cat.name}
                </h3>
                <p className="text-xs text-slate-300 line-clamp-2 mt-1 leading-relaxed">
                  {cat.description}
                </p>
                <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-white group-hover:translate-x-1 transition-transform">
                  Browse Collection <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
