import React from 'react';
import { ShoppingBag, ShieldCheck, Award, Heart, Sparkles, CheckCircle2 } from 'lucide-react';

export default function AboutUs() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      
      {/* Hero */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
          Our Story & Vision
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Crafting Modern Commerce with Transparency & Trust
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          Founded to bridge the gap between premium design aesthetics and seamless, zero-friction Indian payment rails. We believe every customer deserves genuine luxury with direct, verifiable UPI settlement.
        </p>
      </div>

      {/* Grid Values */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Curated Excellence</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Every product cataloged undergoes strict material quality control, acoustic measurement, and endurance testing.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Verified UPI Infrastructure</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Eliminating middleman gateway commissions by powering direct peer-to-merchant UPI settlement with bank UTR validation.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-violet-50 dark:bg-violet-950 text-violet-600 flex items-center justify-center">
            <Heart className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Customer-Centric Care</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Human-first customer support, live WhatsApp order desk, and transparent 7-day return guarantees.
          </p>
        </div>
      </div>

      {/* Merchant Details Statement */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white space-y-4 shadow-xl">
        <h3 className="text-xl font-bold">Official Merchant Credentials</h3>
        <p className="text-xs text-indigo-200 leading-relaxed max-w-2xl">
          AuraStore is proudly owned and operated by <strong>Lalithkumar</strong>. All digital UPI payments made through this website are directly routed to verified VPA destination: <code className="bg-white/10 px-2 py-0.5 rounded font-mono text-white">lalithkumar19742006@oksbi</code>.
        </p>
        <div className="pt-2 flex flex-wrap gap-4 text-xs font-semibold text-slate-300">
          <div className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> NPCI Compliant</div>
          <div className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> 256-Bit SSL Encryption</div>
          <div className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> State Bank of India VPA</div>
        </div>
      </div>

    </div>
  );
}
