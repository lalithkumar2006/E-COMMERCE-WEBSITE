import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Printer, ArrowRight, Package, ShieldCheck, MapPin, Phone, Mail } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';

export default function OrderConfirmation() {
  const { orderNumber } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrder() {
      try {
        const res = await api.getOrder(orderNumber);
        setOrder(res.order);

        // Confetti celebration!
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [orderNumber]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto my-16 p-8 bg-white dark:bg-slate-900 rounded-3xl animate-pulse space-y-4">
        <div className="w-16 h-16 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto"></div>
        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/3 mx-auto"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 text-center bg-white dark:bg-slate-900 rounded-3xl">
        <h2 className="text-lg font-bold">Order Not Found</h2>
        <Link to="/" className="text-xs text-indigo-600 mt-4 block">Return to Store</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Top Success Banner (Hidden on print) */}
      <div className="no-print text-center space-y-3 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md">
        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Order Confirmed!
        </h1>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Thank you for shopping with AuraStore. Your order <strong className="text-indigo-600 font-mono font-bold">{order.order_number}</strong> has been received and confirmed.
        </p>
        
        <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 font-semibold text-xs flex items-center gap-2 transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print / Save Tax Invoice
          </button>
          <Link
            to="/orders"
            className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-700 shadow-md transition-colors flex items-center gap-2"
          >
            <Package className="w-4 h-4" />
            Track in My Orders
          </Link>
        </div>
      </div>

      {/* Printable Invoice / Receipt Section */}
      <div className="bg-white dark:bg-slate-900 p-8 sm:p-12 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-8 print:p-0 print:border-none print:shadow-none">
        
        {/* Invoice Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <span className="text-2xl font-black text-indigo-600">AuraStore</span>
            <p className="text-xs text-slate-500 mt-1">
              Authorized E-Commerce Retailer<br />
              Verified Merchant: <strong>Lalithkumar</strong><br />
              UPI Destination: <code>lalithkumar19742006@oksbi</code>
            </p>
          </div>
          <div className="sm:text-right space-y-1">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              Tax Invoice & Receipt
            </span>
            <p className="text-xs font-bold text-slate-900 dark:text-white mt-1">Invoice #{order.order_number}</p>
            <p className="text-[11px] text-slate-400">Date: {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
          </div>
        </div>

        {/* Shipping & Payment Meta */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-indigo-600" /> Deliver To
            </h4>
            <p className="font-semibold text-slate-800 dark:text-slate-200">{order.shipping_name}</p>
            <p className="text-slate-500 leading-relaxed">
              {order.shipping_address}<br />
              {order.shipping_city}, {order.shipping_state} - {order.shipping_pincode}
            </p>
            <p className="text-slate-500">Phone: {order.shipping_phone} &bull; Email: {order.shipping_email}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Payment Summary
            </h4>
            <div className="space-y-1 text-slate-600 dark:text-slate-400">
              <div className="flex justify-between">
                <span>Method:</span>
                <strong className="text-slate-900 dark:text-white">{order.payment_method}</strong>
              </div>
              <div className="flex justify-between">
                <span>Payment Status:</span>
                <span className="font-bold text-emerald-600">{order.payment_status}</span>
              </div>
              {order.payment?.utr_number && (
                <div className="flex justify-between">
                  <span>Bank UTR:</span>
                  <code className="font-mono text-indigo-600 dark:text-indigo-400">{order.payment.utr_number}</code>
                </div>
              )}
              <div className="flex justify-between">
                <span>Merchant UPI:</span>
                <code className="font-mono text-slate-700 dark:text-slate-300">lalithkumar19742006@oksbi</code>
              </div>
            </div>
          </div>
        </div>

        {/* Ordered Items Table */}
        <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Item Details</th>
                <th className="py-3 px-4 text-center">Unit Price</th>
                <th className="py-3 px-4 text-center">Quantity</th>
                <th className="py-3 px-4 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {order.items?.map((item) => (
                <tr key={item.id}>
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-slate-900 dark:text-white block">{item.product_name}</span>
                  </td>
                  <td className="py-3.5 px-4 text-center text-slate-600 dark:text-slate-400">
                    ₹{item.product_price.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold">{item.quantity}</td>
                  <td className="py-3.5 px-4 text-right font-bold text-slate-900 dark:text-white">
                    ₹{item.subtotal.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Total Calculations */}
        <div className="flex justify-end text-xs">
          <div className="w-full sm:w-64 space-y-2">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal:</span>
              <span className="font-bold text-slate-900 dark:text-white">₹{order.subtotal.toLocaleString('en-IN')}</span>
            </div>
            {order.discount_amount > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Discount ({order.coupon_code || 'Coupon'}):</span>
                <span>-₹{order.discount_amount.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-500">
              <span>Delivery Fee:</span>
              <span>{order.delivery_fee === 0 ? 'FREE' : `₹${order.delivery_fee}`}</span>
            </div>
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between text-sm font-extrabold text-slate-900 dark:text-white">
              <span>Total Paid:</span>
              <span className="text-indigo-600 dark:text-indigo-400">₹{order.total_amount.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Invoice Footer */}
        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 text-center">
          <p>Thank you for your business. For customer care, please contact <a href="mailto:support@aurastore.in" className="text-indigo-600 underline">support@aurastore.in</a></p>
        </div>

      </div>

    </div>
  );
}
