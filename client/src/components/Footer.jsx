import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ShieldCheck, Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { addToast } = useToast();

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    try {
      setSubmitting(true);
      const res = await api.subscribeNewsletter(email);
      addToast(res.message, 'success');
      setEmail('');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 transition-colors pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* UPI Merchant Verified Banner */}
        <div className="mb-14 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-slate-800/90 via-indigo-950/60 to-slate-800/90 border border-indigo-500/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="flex items-center gap-4 text-left">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-7 h-7 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-base font-bold text-white">Verified Merchant UPI Destination</h4>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  NPCI Compliant
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Merchant Name: <strong className="text-slate-200">Lalithkumar</strong> &bull; UPI ID: <code className="text-indigo-300 bg-indigo-950/80 px-1.5 py-0.5 rounded text-xs font-mono">lalithkumar19742006@oksbi</code>
              </p>
            </div>
          </div>

          {/* Supported UPI Apps Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {['Google Pay', 'PhonePe', 'Paytm', 'BHIM UPI', 'Cred', 'Any UPI'].map(app => (
              <span key={app} className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                {app}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                AuraStore
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Discover curated luxury lifestyle, electronics, fashion, and everyday essentials. Designed with meticulous craftsmanship and verified instant UPI checkout.
            </p>
            <div className="pt-2 flex items-center gap-3">
              <a
                href="https://wa.me/919840123456?text=Hi%20AuraStore%20Support,%20I%20have%20an%20order%20query"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-500/30 text-xs font-semibold transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                WhatsApp Helpdesk
              </a>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h5 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Explore Shop</h5>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/shop" className="hover:text-indigo-400 transition-colors">All Products</Link></li>
              <li><Link to="/shop?sort=popular" className="hover:text-indigo-400 transition-colors">Trending Products</Link></li>
              <li><Link to="/shop?sort=rating" className="hover:text-indigo-400 transition-colors">Top Rated</Link></li>
              <li><Link to="/categories" className="hover:text-indigo-400 transition-colors">Product Categories</Link></li>
              <li><Link to="/wishlist" className="hover:text-indigo-400 transition-colors">Customer Wishlist</Link></li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h5 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Customer Care</h5>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/orders" className="hover:text-indigo-400 transition-colors">My Orders & Tracking</Link></li>
              <li><Link to="/profile" className="hover:text-indigo-400 transition-colors">Account Profile</Link></li>
              <li><Link to="/contact" className="hover:text-indigo-400 transition-colors">Contact Support</Link></li>
              <li><Link to="/returns" className="hover:text-indigo-400 transition-colors">Returns & Refunds</Link></li>
              <li><Link to="/about" className="hover:text-indigo-400 transition-colors">About Us</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h5 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Stay Updated</h5>
            <p className="text-xs text-slate-400 mb-3">
              Subscribe to get exclusive discount coupons, new arrivals, and flash deals.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full pl-3 pr-9 py-2 rounded-xl text-xs bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Bottom Legal & Copyright */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} AuraStore Inc. All rights reserved. Secured by 256-bit SSL encryption.</p>
          <div className="flex flex-wrap items-center gap-4">
            <Link to="/privacy" className="hover:text-slate-400 transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-slate-400 transition-colors">Terms and Conditions</Link>
            <Link to="/returns" className="hover:text-slate-400 transition-colors">Refund Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
