import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Star, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const navigate = useNavigate();

  const isWishlisted = isInWishlist(product.id);
  const isOutOfStock = product.stock <= 0;

  const currentPrice = product.discount_price !== null && product.discount_price !== undefined ? product.discount_price : product.price;
  const originalPrice = product.discount_price ? product.price : null;
  const discountPercent = originalPrice ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : null;

  const imageUrl = product.primary_image || (product.images && product.images[0]) || product.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80';

  const handleBuyNow = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    await addToCart(product, 1);
    navigate('/checkout');
  };

  return (
    <div className="group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden hover:-translate-y-1">
      
      {/* Image container */}
      <div className="relative aspect-square w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        <Link to={`/product/${product.slug || product.id}`}>
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
          {discountPercent && (
            <span className="px-2 py-0.5 rounded-md text-[11px] font-extrabold uppercase tracking-wide bg-rose-500 text-white shadow-sm">
              {discountPercent}% OFF
            </span>
          )}
          {product.is_trending ? (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide bg-indigo-600 text-white shadow-sm">
              Hot
            </span>
          ) : null}
          {isOutOfStock && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide bg-slate-900/90 text-white backdrop-blur-sm">
              Sold Out
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product);
          }}
          aria-label="Wishlist toggle"
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md shadow-md transition-all ${
            isWishlisted
              ? 'bg-rose-500 text-white hover:bg-rose-600'
              : 'bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 hover:text-rose-500 hover:bg-white dark:hover:bg-slate-900'
          }`}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand & Category */}
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5">
            <span className="font-medium uppercase tracking-wider text-[11px] text-indigo-600 dark:text-indigo-400">{product.brand}</span>
            <div className="flex items-center gap-1 text-amber-500 font-semibold text-xs">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>{product.rating || '4.8'}</span>
              <span className="text-slate-400 text-[10px]">({product.review_count || 12})</span>
            </div>
          </div>

          {/* Title */}
          <Link to={`/product/${product.slug || product.id}`}>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 line-clamp-2 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors leading-snug">
              {product.name}
            </h3>
          </Link>
        </div>

        {/* Price & Action */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-lg font-bold text-slate-900 dark:text-white">
              ₹{Number(currentPrice).toLocaleString('en-IN')}
            </span>
            {originalPrice && (
              <span className="text-xs text-slate-400 line-through">
                ₹{Number(originalPrice).toLocaleString('en-IN')}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => addToCart(product, 1)}
              disabled={isOutOfStock}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              Cart
            </button>
            <button
              onClick={handleBuyNow}
              disabled={isOutOfStock}
              className="w-full flex items-center justify-center py-2 px-3 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
