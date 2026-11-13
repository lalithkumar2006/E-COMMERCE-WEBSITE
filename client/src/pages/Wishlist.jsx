import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

export default function Wishlist() {
  const { wishlist, toggleWishlist, count } = useWishlist();
  const { addToCart } = useCart();

  if (count === 0) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950 text-rose-500 flex items-center justify-center mx-auto mb-4">
          <Heart className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Your Wishlist is Empty</h2>
        <p className="text-xs text-slate-500 mt-1 mb-6">
          Save your favorite audio equipment, apparel, and lifestyle accessories here to purchase later.
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 shadow-md transition-all"
        >
          Explore Shop <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="pb-6 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Customer Wishlist</h1>
        <p className="text-xs text-slate-500 mt-1">You have saved {count} {count === 1 ? 'item' : 'items'}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {wishlist.map((item) => (
          <div
            key={item.id}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 relative mb-3">
                <img
                  src={item.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80'}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => toggleWishlist(item)}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 dark:bg-slate-900/90 text-rose-500 shadow-sm hover:scale-110 transition-transform"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                {item.brand}
              </span>
              <Link to={`/product/${item.slug || item.id}`}>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white hover:text-indigo-600 transition-colors line-clamp-2 mt-0.5">
                  {item.name}
                </h3>
              </Link>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
              <p className="text-base font-extrabold text-slate-900 dark:text-white mb-3">
                ₹{Number(item.price).toLocaleString('en-IN')}
              </p>

              <button
                onClick={() => addToCart(item, 1)}
                className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
              >
                <ShoppingBag className="w-3.5 h-3.5" /> Move to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
