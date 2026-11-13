import React from 'react';
import { ShieldCheck, Lock } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="pb-6 border-b border-slate-200 dark:border-slate-800 space-y-2">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4" /> Legal & Security
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Privacy Policy</h1>
        <p className="text-xs text-slate-500">Effective Date: November 12, 2026</p>
      </div>

      <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm text-slate-600 dark:text-slate-300 space-y-6 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">1. Information We Collect</h2>
          <p>
            When you visit or place an order on AuraStore, we collect information necessary to fulfill your purchases, including your full name, shipping delivery address, email address, and mobile phone number.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">2. Strict Payment Security & UPI Credentials</h2>
          <p>
            <strong>We NEVER store or request your UPI PIN, banking passwords, OTPs, or debit/credit card CVVs.</strong>
          </p>
          <p>
            All UPI transactions are initiated via secure deep links or encrypted dynamic QR codes leading to your preferred banking app (Google Pay, PhonePe, Paytm, BHIM). We only store the 12-digit Bank Transaction Reference Number (UTR) provided by you to reconcile order payments with our merchant account (<code className="text-indigo-600">lalithkumar19742006@oksbi</code>).
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">3. How We Use Your Data</h2>
          <p>
            Your information is used strictly to process orders, generate compliant tax invoices, dispatch shipments through authorized logistics partners, and provide order status notifications. We never sell or license your personal contact information to third-party telemarketers.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">4. Data Encryption</h2>
          <p>
            All traffic between your browser and our servers is secured using Industry Standard TLS 1.3 / 256-bit SSL encryption. Passwords stored in our database are salted and hashed using bcrypt.
          </p>
        </section>
      </div>
    </div>
  );
}
