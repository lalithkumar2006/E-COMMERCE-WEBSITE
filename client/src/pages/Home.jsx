import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones,
  Sparkles,
  Zap,
  TrendingUp,
  Tag
} from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { api } from '../services/api';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [featRes, trendRes, catRes] = await Promise.all([
          api.getFeaturedProducts(),
          api.getTrendingProducts(),
          api.getCategories()
        ]);
        setFeaturedProducts(featRes.products || []);
        setTrendingProducts(trendRes.products || []);
        setCategories(catRes.categories || []);
      } catch (err) {
        console.error('Home load error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50/70 via-white to-transparent dark:from-indigo-950/20 dark:via-slate-950 dark:to-slate-950 pt-8 sm:pt-16 pb-12 sm:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Modern E-Commerce with Verified UPI Checkout</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
                Curated Luxury & <br />
                <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-pink-600 bg-clip-text text-transparent">
                  Everyday Essentials
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Explore hand-selected audio gear, mechanical keyboards, minimal timepieces, and lifestyle essentials. Pay seamlessly with Google Pay, PhonePe, and Paytm to <strong>lalithkumar19742006@oksbi</strong>.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/shop"
                  className="px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all hover:scale-[1.02]"
                >
                  Explore Collection
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/categories"
                  className="px-6 py-3.5 rounded-2xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors"
                >
                  Browse Categories
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-200 dark:border-slate-800 max-w-md mx-auto lg:mx-0 text-left">
                <div>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">100%</p>
                  <p className="text-xs text-slate-500">Genuine Products</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">Zero</p>
                  <p className="text-xs text-slate-500">Gateway Surcharges</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">4.9 ★</p>
                  <p className="text-xs text-slate-500">Customer Rating</p>
                </div>
              </div>
            </div>

            {/* Right Hero Image Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 bg-slate-900 relative group">
                  <img
                    src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80"
                    alt="AeroPulse ANC Headphones"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>

                  {/* Floating Promo Card */}
                  <div className="absolute bottom-6 left-6 right-6 p-5 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-white/20 shadow-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-600 dark:text-indigo-400">Featured Drop</span>
                        <h4 className="text-base font-bold text-slate-900 dark:text-white">AeroPulse ANC Pro</h4>
                        <p className="text-xs text-slate-500">Studio Beryllium Drivers • 45h Battery</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs line-through text-slate-400">₹14,999</span>
                        <p className="text-lg font-black text-indigo-600 dark:text-indigo-400">₹11,999</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating badge */}
                <div className="absolute -top-4 -right-4 p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Instant UPI Settlement</p>
                    <p className="text-[11px] text-slate-500">Safe, direct & verified</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Free Express Shipping</h4>
              <p className="text-xs text-slate-500 mt-0.5">Complimentary delivery on orders above ₹1,000.</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Verified UPI Payments</h4>
              <p className="text-xs text-slate-500 mt-0.5">Pay direct to verified merchant with QR & deep links.</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-violet-50 dark:bg-violet-950 text-violet-600 dark:text-violet-400 shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">7-Day Return Guarantee</h4>
              <p className="text-xs text-slate-500 mt-0.5">Hassle-free replacement or quick UPI refund.</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-pink-50 dark:bg-pink-950 text-pink-600 dark:text-pink-400 shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Dedicated Helpdesk</h4>
              <p className="text-xs text-slate-500 mt-0.5">Live WhatsApp support & expert assistance.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Visual Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Discover</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">Shop By Category</h2>
          </div>
          <Link to="/categories" className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
            All Categories <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/shop?category=${cat.slug}`}
              className="group relative rounded-2xl overflow-hidden aspect-[4/5] bg-slate-900 shadow-sm hover:shadow-xl transition-all"
            >
              <img
                src={cat.image_url || 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=600&q=80'}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-80 group-hover:opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-slate-300 mt-0.5 font-medium">Explore Collection →</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Handpicked</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">Featured Products</h2>
          </div>
          <Link to="/shop" className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="h-72 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Promotional Discount Offer Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 text-white p-8 sm:p-12 relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-indigo-200 text-xs font-semibold">
              <Tag className="w-3.5 h-3.5" />
              <span>Limited Period Offer</span>
            </div>
            <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Get Up to 20% Off Your Entire Cart
            </h3>
            <p className="text-sm sm:text-base text-indigo-100">
              Apply code <code className="bg-white/20 text-white px-2 py-0.5 rounded font-mono font-bold">SUPER20</code> at checkout on orders above ₹1,500. Pay with UPI for instant order verification!
            </p>
            <div className="pt-2">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white text-indigo-950 font-bold text-sm hover:bg-indigo-50 transition-colors shadow-lg"
              >
                Claim Discount Now
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-15 hidden md:block pointer-events-none">
            <Zap className="w-full h-full text-white" />
          </div>
        </div>
      </section>

      {/* Trending Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>What's Popular</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">Trending Right Now</h2>
          </div>
          <Link to="/shop?sort=popular" className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
            See Trending <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trendingProducts.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

    </div>
  );
}
