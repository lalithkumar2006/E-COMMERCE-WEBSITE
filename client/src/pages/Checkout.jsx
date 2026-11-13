import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Truck,
  ArrowRight,
  ShoppingBag,
  CreditCard,
  QrCode,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';

export default function Checkout() {
  const { items, subtotal, deliveryFee, discountAmount, finalTotal, coupon, clearCart } = useCart();
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    address: '',
    address2: '',
    city: '',
    state: 'Tamil Nadu',
    pincode: '',
    notes: ''
  });

  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [submitting, setSubmitting] = useState(false);

  // Load saved address if logged in
  useEffect(() => {
    if (user) {
      api.getMe().then(res => {
        if (res.address) {
          setFormData(prev => ({
            ...prev,
            name: res.address.full_name || prev.name,
            phone: res.address.phone || prev.phone,
            address: res.address.address_line1 || prev.address,
            address2: res.address.address_line2 || prev.address2,
            city: res.address.city || prev.city,
            state: res.address.state || prev.state,
            pincode: res.address.postal_code || prev.pincode
          }));
        }
      }).catch(err => console.error(err));
    }
  }, [user]);

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Your cart is empty</h2>
        <p className="text-xs text-slate-500 mt-1 mb-6">Please add items to your cart before proceeding to checkout.</p>
        <Link to="/shop" className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold">
          Return to Shop
        </Link>
      </div>
    );
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.phone || !formData.email || !formData.address || !formData.city || !formData.state || !formData.pincode) {
      addToast('Please fill in all mandatory delivery fields.', 'error');
      return;
    }

    // Validate phone and pincode format
    if (!/^\d{6}$/.test(formData.pincode.trim())) {
      addToast('Please enter a valid 6-digit Indian PIN code.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        items: items.map(i => ({ productId: i.id, quantity: i.quantity })),
        shipping_name: formData.name,
        shipping_phone: formData.phone,
        shipping_email: formData.email,
        shipping_address: formData.address + (formData.address2 ? `, ${formData.address2}` : ''),
        shipping_city: formData.city,
        shipping_state: formData.state,
        shipping_pincode: formData.pincode,
        coupon_code: coupon ? coupon.code : null,
        payment_method: paymentMethod,
        notes: formData.notes
      };

      const res = await api.createOrder(payload);

      addToast('Order placed successfully! Proceeding to payment...', 'success');
      // Direct to dynamic UPI payment page
      navigate(`/payment/upi/${res.orderNumber}`);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="pb-6 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Secure Checkout</h1>
        <p className="text-xs text-slate-500 mt-1">Provide your delivery information and select your payment method</p>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Left Column: Delivery Details & Payment Method */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Shipping Form */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Delivery Address</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Lalith Kumar"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Mobile Phone *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  placeholder="+91 98401 23456"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Email Address (For Invoices) *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="lalith@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Street Address *</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  placeholder="Door/Flat No, Apartment, Street Name"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Landmark / Suite (Optional)</label>
                <input
                  type="text"
                  name="address2"
                  value={formData.address2}
                  onChange={handleChange}
                  placeholder="Near Metro Station or Landmark"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">City / District *</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  placeholder="Chennai"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">PIN Code *</label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  required
                  maxLength="6"
                  placeholder="600040"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">State *</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  required
                  placeholder="Tamil Nadu"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Payment Method</h3>
            </div>

            {/* UPI Option Card (Recommended) */}
            <label
              className={`block p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                paymentMethod === 'UPI'
                  ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment_method"
                    value="UPI"
                    checked={paymentMethod === 'UPI'}
                    onChange={() => setPaymentMethod('UPI')}
                    className="text-indigo-600 focus:ring-indigo-500 mt-0.5"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">UPI (Google Pay, PhonePe, Paytm, BHIM)</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-600 text-white">
                        Recommended
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Pay direct to merchant: <strong className="text-indigo-600 dark:text-indigo-400">lalithkumar19742006@oksbi</strong> with dynamic QR code & instant UPI deep link.
                    </p>
                  </div>
                </div>
                <QrCode className="w-6 h-6 text-indigo-600 shrink-0" />
              </div>
            </label>
          </div>
        </div>

        {/* Right Column: Order Items & Place Order Summary */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
              Items in Your Order ({items.length})
            </h3>

            {/* Items list */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <img
                    src={item.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=100&q=80'}
                    alt={item.name}
                    className="w-12 h-12 rounded-lg object-cover bg-slate-100 dark:bg-slate-800 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{item.name}</p>
                    <p className="text-[11px] text-slate-400">Qty: {item.quantity} &bull; ₹{item.price.toLocaleString('en-IN')} each</p>
                  </div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-2.5 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span>Subtotal</span>
                <span className="font-bold text-slate-900 dark:text-white">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span>Coupon Discount</span>
                  <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span>Delivery Charge</span>
                <span>
                  {deliveryFee === 0 ? <span className="text-emerald-600 font-bold uppercase text-[11px]">Free</span> : `₹${deliveryFee}`}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-baseline justify-between">
                <span className="text-sm font-bold text-slate-900 dark:text-white">Final Payable</span>
                <span className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
                  ₹{finalTotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] disabled:opacity-50"
            >
              <Lock className="w-4 h-4" />
              {submitting ? 'Creating Order...' : `Proceed to UPI Payment (₹${finalTotal.toLocaleString('en-IN')})`}
            </button>

            {/* Security Guarantee */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 flex items-center gap-2.5 text-[11px] text-slate-500">
              <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
              <span>
                Orders are encrypted. Payments are verified on server before order fulfillment.
              </span>
            </div>
          </div>
        </div>

      </form>
    </div>
  );
}
