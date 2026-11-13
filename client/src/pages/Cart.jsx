import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, ShieldCheck, Tag, X, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function Cart() {
  const {
    items,
    subtotal,
    deliveryFee,
    discountAmount,
    finalTotal,
    totalItemsCount,
    coupon,
    updateQuantity,
    removeFromCart,
    clearCart,
    applyCoupon,
    removeCoupon
  } = useCart();

  const navigate = useNavigate();
  const [couponInput, setCouponInput] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setApplyingCoupon(true);
    await applyCoupon(couponInput.trim());
    setApplyingCoupon(false);
  };

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Your Shopping Cart is Empty</h2>
        <p className="text-xs text-slate-500 mt-1 mb-6">
          Looks like you haven't added anything to your cart yet. Discover trending audio, gear, and apparel.
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 shadow-md transition-all"
        >
          Start Shopping <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Shopping Cart</h1>
          <p className="text-xs text-slate-500 mt-1">You have {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'} in your cart</p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs font-semibold text-rose-600 hover:text-rose-700 self-start sm:self-auto"
        >
          Clear All Items
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center gap-4 sm:gap-6"
            >
              <img
                src={item.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=200&q=80'}
                alt={item.name}
                className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0"
              />

              <div className="flex-1 min-w-0 text-center sm:text-left">
                <Link to={`/product/${item.slug || item.id}`}>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white hover:text-indigo-600 transition-colors line-clamp-1">
                    {item.name}
                  </h3>
                </Link>
                <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
                  <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                    ₹{item.price.toLocaleString('en-IN')}
                  </span>
                  {item.originalPrice && (
                    <span className="text-xs text-slate-400 line-through">
                      ₹{item.originalPrice.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
                {item.stock !== undefined && (
                  <p className="text-[11px] text-slate-400 mt-1">
                    Available in stock: <strong>{item.stock}</strong> units
                  </p>
                )}
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-800">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="px-3 py-1 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold"
                  >
                    -
                  </button>
                  <span className="px-3 py-1 text-xs font-bold">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="px-3 py-1 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold"
                  >
                    +
                  </button>
                </div>

                <div className="text-right min-w-[80px]">
                  <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400">
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </span>
                </div>

                <button
                  onClick={() => removeFromCart(item.id)}
                  aria-label="Remove item"
                  className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          <div className="pt-2">
            <Link
              to="/shop"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Continue Shopping
            </Link>
          </div>
        </div>

        {/* Order Summary & Coupon Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
              Order Summary
            </h3>

            {/* Price Calculations */}
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span>Subtotal</span>
                <span className="font-bold text-slate-900 dark:text-white">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span>Coupon Discount ({coupon?.code})</span>
                  <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span>Delivery Charge</span>
                <span>
                  {deliveryFee === 0 ? (
                    <span className="text-emerald-600 font-bold uppercase tracking-wider text-[11px]">Free</span>
                  ) : (
                    `₹${deliveryFee}`
                  )}
                </span>
              </div>

              {subtotal < 1000 && (
                <p className="text-[10px] text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg">
                  Add ₹{(1000 - subtotal).toLocaleString('en-IN')} more to qualify for <strong>Free Delivery</strong>!
                </p>
              )}

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-baseline justify-between">
                <span className="text-sm font-bold text-slate-900 dark:text-white">Total Amount</span>
                <span className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400">
                  ₹{finalTotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Coupon Code Input */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              {coupon ? (
                <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-emerald-600" />
                    <div>
                      <p className="text-xs font-bold text-emerald-900 dark:text-emerald-200">{coupon.code}</p>
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400">Coupon applied successfully</p>
                    </div>
                  </div>
                  <button onClick={removeCoupon} className="p-1 text-slate-400 hover:text-rose-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="space-y-2">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Promo / Coupon Code</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. SUPER20, WELCOME10"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      className="flex-1 px-3 py-2 rounded-xl text-xs bg-slate-100 dark:bg-slate-800 uppercase font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      type="submit"
                      disabled={applyingCoupon || !couponInput.trim()}
                      className="px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-bold hover:opacity-90 disabled:opacity-50"
                    >
                      Apply
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400">Try coupon <strong>SUPER20</strong> for 20% off or <strong>WELCOME10</strong>!</p>
                </form>
              )}
            </div>

            {/* Proceed to Checkout Button */}
            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
            >
              Proceed to Checkout
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Trust badge */}
            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 font-medium pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Verified Direct UPI Settlement Ready</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
