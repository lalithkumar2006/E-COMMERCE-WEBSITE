import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, ArrowRight, Clock, CheckCircle2, QrCode, AlertCircle, Eye } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function MyOrders() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login?redirect=/orders');
      return;
    }

    async function loadOrders() {
      try {
        const res = await api.getOrders();
        setOrders(res.orders || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (isAuthenticated) {
      loadOrders();
    }
  }, [isAuthenticated, authLoading]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Payment Successful':
      case 'Delivered':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300';
      case 'Payment Pending':
      case 'Pending':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300';
      case 'Processing':
      case 'Shipped':
      case 'Out for Delivery':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300';
      case 'Cancelled':
      case 'Refunded':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 space-y-4 animate-pulse">
        {[1, 2, 3].map(n => <div key={n} className="h-40 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>)}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="pb-6 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">My Orders</h1>
        <p className="text-xs text-slate-500 mt-1">Review your order history, tracking updates, and invoices</p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Orders Placed Yet</h3>
          <p className="text-xs text-slate-500 mt-1 mb-6">Explore our curated collections and place your first order with instant UPI payment.</p>
          <Link to="/shop" className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 dark:text-white font-mono">{order.order_number}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusBadge(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Placed on {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  {order.payment_status !== 'Verified' && order.status !== 'Cancelled' && (
                    <Link
                      to={`/payment/upi/${order.order_number}`}
                      className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      Pay with UPI
                    </Link>
                  )}
                  <Link
                    to={`/order-confirmation/${order.order_number}`}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Invoice
                  </Link>
                </div>
              </div>

              {/* Items in order */}
              <div className="space-y-3">
                {order.items?.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <img
                      src={item.product_image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=100&q=80'}
                      alt={item.product_name}
                      className="w-12 h-12 object-cover rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{item.product_name}</p>
                      <p className="text-[11px] text-slate-400">Qty: {item.quantity} &bull; ₹{item.product_price.toLocaleString('en-IN')} each</p>
                    </div>
                    <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                      ₹{item.subtotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>

              {/* Order Footer summary */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-500">
                  Payment: <strong>{order.payment_method}</strong> ({order.payment_status})
                </span>
                <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400">
                  Total: ₹{order.total_amount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
