import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Search, ShoppingBag } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="max-w-md mx-auto my-20 px-4 text-center space-y-6">
      <div className="text-7xl font-black bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">
        404
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Page Not Found</h1>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          The page or product you requested may have been relocated or is temporarily unavailable.
        </p>
      </div>

      <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/"
          className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-700 shadow-md transition-colors flex items-center gap-1.5"
        >
          <Home className="w-4 h-4" /> Return Home
        </Link>
        <Link
          to="/shop"
          className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-xs hover:bg-slate-200 transition-colors flex items-center gap-1.5"
        >
          <ShoppingBag className="w-4 h-4" /> Browse Store
        </Link>
      </div>
    </div>
  );
}
