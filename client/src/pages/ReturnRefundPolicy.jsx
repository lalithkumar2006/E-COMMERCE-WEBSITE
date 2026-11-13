import React from 'react';
import { RotateCcw } from 'lucide-react';

export default function ReturnRefundPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="pb-6 border-b border-slate-200 dark:border-slate-800 space-y-2">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
          <RotateCcw className="w-4 h-4" /> Customer Protection
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Return & Refund Policy</h1>
        <p className="text-xs text-slate-500">Effective Date: November 12, 2026</p>
      </div>

      <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm text-slate-600 dark:text-slate-300 space-y-6 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">1. 7-Day Hassle-Free Return Guarantee</h2>
          <p>
            We take extreme pride in our curated catalogue. If you receive an item that is defective, damaged in transit, or significantly different from specifications, you may request a return within 7 calendar days of delivery.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">2. Return Eligibility Criteria</h2>
          <ul className="list-disc list-inside space-y-1 text-slate-500">
            <li>Item must be in its original packaging with all tags, manuals, and accessories intact.</li>
            <li>Item must not show signs of physical abuse, cosmetic alterations, or water ingress.</li>
            <li>Proof of purchase (invoice number or order ID) must be supplied.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">3. Direct UPI Refund Timeline</h2>
          <p>
            Once our inspection team receives and verifies the returned product, your refund will be processed directly to your originating UPI account or bank account within 24 to 48 business hours. No store credits unless requested by you.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">4. Initiating a Return</h2>
          <p>
            To initiate a return, contact our concierge desk at <a href="mailto:support@aurastore.in" className="text-indigo-600 underline font-medium">support@aurastore.in</a> or message our WhatsApp helpline with your order number and brief photos of the item.
          </p>
        </section>
      </div>
    </div>
  );
}
