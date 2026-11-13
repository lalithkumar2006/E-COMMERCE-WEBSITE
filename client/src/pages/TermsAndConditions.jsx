import React from 'react';
import { FileText } from 'lucide-react';

export default function TermsAndConditions() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="pb-6 border-b border-slate-200 dark:border-slate-800 space-y-2">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
          <FileText className="w-4 h-4" /> Legal
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Terms and Conditions</h1>
        <p className="text-xs text-slate-500">Effective Date: November 12, 2026</p>
      </div>

      <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm text-slate-600 dark:text-slate-300 space-y-6 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">1. Agreement to Terms</h2>
          <p>
            By accessing or placing an order through AuraStore, you agree to be bound by these Terms and Conditions. The platform is operated by merchant <strong>Lalithkumar</strong>.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">2. Product Availability & Pricing</h2>
          <p>
            All products listed on the platform are subject to availability. We reserve the right to limit quantities or refuse orders if stock counts are depleted. Prices displayed are in Indian Rupees (INR) and are inclusive of applicable taxes.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">3. Payment & Order Verification</h2>
          <p>
            Orders paid through UPI require verification of the 12-digit UTR reference against our bank settlement desk. Submitting fraudulent or duplicate UTR references is strictly prohibited and will result in immediate cancellation and blacklisting.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">4. Order Cancellations</h2>
          <p>
            Customers may cancel an order prior to dispatch through their "My Orders" account dashboard. Once an order is in "Shipped" status, return procedures apply.
          </p>
        </section>
      </div>
    </div>
  );
}
