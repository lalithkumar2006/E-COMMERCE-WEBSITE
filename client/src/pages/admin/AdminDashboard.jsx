import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  TrendingUp,
  Package,
  Users,
  CreditCard,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Search,
  Filter,
  RefreshCw,
  Tag,
  AlertCircle
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function AdminDashboard() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'orders' | 'payments' | 'products' | 'coupons' | 'customers'
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal / Form state for Add Product
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    brand: '',
    price: '',
    discount_price: '',
    category_id: '',
    stock: '',
    description: '',
    image_url: ''
  });

  // Modal / Form state for Add Coupon
  const [showAddCouponModal, setShowAddCouponModal] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    description: '',
    discount_type: 'percentage',
    discount_value: '',
    min_order_value: ''
  });

  // Protect Admin route
  useEffect(() => {
    if (!authLoading) {
      if (!user || !isAdmin) {
        addToast('Admin access required.', 'error');
        navigate('/login?redirect=/admin');
      }
    }
  }, [user, isAdmin, authLoading]);

  // Load Admin Data
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, ordersRes, paymentsRes, productsRes, catsRes, couponsRes, custsRes] = await Promise.all([
        api.getAdminStats(),
        api.getAdminOrders(),
        api.getAdminPayments(),
        api.getAdminProducts(),
        api.getCategories(),
        api.getAdminCoupons(),
        api.getAdminCustomers()
      ]);

      setStats(statsRes);
      setOrders(ordersRes.orders || []);
      setPayments(paymentsRes.payments || []);
      setProducts(productsRes.products || []);
      setCategories(catsRes.categories || []);
      setCoupons(couponsRes.coupons || []);
      setCustomers(custsRes.customers || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
      addToast('Failed to refresh admin stats.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadDashboardData();
    }
  }, [isAdmin]);

  // 1. Payment Verification action
  const handleVerifyPayment = async (orderNumber, action) => {
    try {
      const res = await api.verifyPayment(orderNumber, action);
      addToast(res.message, action === 'approve' ? 'success' : 'info');
      loadDashboardData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  // 2. Order status update
  const handleUpdateOrderStatus = async (orderNumber, newStatus) => {
    try {
      const res = await api.updateOrderStatus(orderNumber, { status: newStatus });
      addToast(`Order ${orderNumber} status changed to ${newStatus}`, 'success');
      loadDashboardData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  // 3. Create Product
  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price || !newProduct.brand) {
      addToast('Please enter product name, price, and brand.', 'error');
      return;
    }

    try {
      await api.createProduct({
        ...newProduct,
        images: newProduct.image_url ? [newProduct.image_url] : []
      });
      addToast('Product cataloged successfully!', 'success');
      setShowAddProductModal(false);
      setNewProduct({
        name: '',
        brand: '',
        price: '',
        discount_price: '',
        category_id: '',
        stock: '',
        description: '',
        image_url: ''
      });
      loadDashboardData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  // 4. Delete Product
  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`Delete product "${name}" permanently?`)) return;
    try {
      await api.deleteProduct(id);
      addToast('Product removed.', 'info');
      loadDashboardData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  // 5. Create Coupon
  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    try {
      await api.createCoupon(newCoupon);
      addToast(`Coupon "${newCoupon.code}" created!`, 'success');
      setShowAddCouponModal(false);
      setNewCoupon({
        code: '',
        description: '',
        discount_type: 'percentage',
        discount_value: '',
        min_order_value: ''
      });
      loadDashboardData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  // 6. Delete Coupon
  const handleDeleteCoupon = async (id) => {
    try {
      await api.deleteCoupon(id);
      addToast('Coupon deleted.', 'info');
      loadDashboardData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  // 7. Delete Customer
  const handleDeleteCustomer = async (id, name, email) => {
    if (!window.confirm(`Delete user "${name || email}" permanently?`)) return;
    try {
      const res = await api.deleteCustomer(id);
      addToast(res.message, 'info');
      loadDashboardData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  if (loading && !stats) {
    return (
      <div className="max-w-7xl mx-auto py-16 px-4 space-y-8 animate-pulse">
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
        <div className="grid grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(n => <div key={n} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Top Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-600 text-white">
              Administrator Console
            </span>
            <span className="text-xs text-slate-400">&bull; Destination: lalithkumar19742006@oksbi</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            Store Administration & Sales Dashboard
          </h1>
        </div>

        <button
          onClick={loadDashboardData}
          className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-2 self-start sm:self-auto transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Data
        </button>
      </div>

      {/* Admin Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800">
        {[
          { id: 'overview', label: 'Analytics Overview' },
          { id: 'payments', label: `Payment Reconciliations (${payments.filter(p => p.status === 'Submitted').length} Pending)` },
          { id: 'orders', label: `Orders (${orders.length})` },
          { id: 'products', label: `Products (${products.length})` },
          { id: 'coupons', label: `Coupons (${coupons.length})` },
          { id: 'customers', label: `Customers (${customers.length})` }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW & ANALYTICS */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-8">
          {/* Key Metric KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Revenue</span>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                ₹{stats.stats?.totalRevenue?.toLocaleString('en-IN') || 0}
              </p>
              <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3" /> Live Gross Sales
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Orders</span>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                {stats.stats?.totalOrders || 0}
              </p>
              <span className="text-[10px] text-slate-400 mt-1 block">Lifetime orders placed</span>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Pending Payments</span>
              <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">
                {stats.stats?.pendingPayments || 0}
              </p>
              <button
                onClick={() => setActiveTab('payments')}
                className="text-[10px] text-indigo-600 font-bold hover:underline mt-1 block"
              >
                Review UTRs →
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Active Orders</span>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                {stats.stats?.pendingOrders || 0}
              </p>
              <span className="text-[10px] text-slate-400 mt-1 block">Processing or pending</span>
            </div>

            <div
              onClick={() => setActiveTab('customers')}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm cursor-pointer hover:border-indigo-500 transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Users</span>
                <span className="text-xs text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity font-bold">View all →</span>
              </div>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                {stats.stats?.totalCustomers || customers.length || 0}
              </p>
              <span className="text-[10px] text-slate-400 mt-1 block">Click to view customers</span>
            </div>
          </div>

          {/* Revenue by Category & Recent Orders */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Category Performance */}
            <div className="lg:col-span-5 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Category Performance</h3>
              <div className="space-y-3">
                {stats.categorySales?.map((cat, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-700 dark:text-slate-300">{cat.name}</span>
                      <span className="text-slate-900 dark:text-white font-bold">₹{cat.total_revenue.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-indigo-600 h-2 rounded-full"
                        style={{ width: `${Math.min(100, Math.max(15, (cat.total_revenue / (stats.stats.totalRevenue || 1)) * 100))}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Orders Preview */}
            <div className="lg:col-span-7 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Recent Orders</h3>
                <button onClick={() => setActiveTab('orders')} className="text-xs text-indigo-600 font-bold hover:underline">
                  View All Orders →
                </button>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {stats.recentOrders?.map((ord) => (
                  <div key={ord.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white font-mono">{ord.order_number}</p>
                      <p className="text-slate-400">{ord.shipping_name} &bull; {new Date(ord.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-extrabold text-slate-900 dark:text-white block">₹{ord.total_amount.toLocaleString('en-IN')}</span>
                      <span className="text-[10px] font-bold text-indigo-600">{ord.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Registered Users Box */}
            <div className="lg:col-span-12 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Recent Customer Registrations</h3>
                  <p className="text-xs text-slate-500">Newly registered users on AuraStore</p>
                </div>
                <button onClick={() => setActiveTab('customers')} className="text-xs text-indigo-600 font-bold hover:underline">
                  View Full Directory ({customers.length}) →
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(stats.recentCustomers || customers.slice(0, 3)).map((u) => (
                  <div key={u.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{u.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{u.email}</p>
                      <span className="text-[10px] text-slate-400">ID #{u.id} &bull; {u.phone || 'No phone'}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${u.role === 'admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-800'}`}>
                      {u.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB 2: UPI PAYMENT RECONCILIATIONS */}
      {activeTab === 'payments' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden space-y-4 p-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">UPI Bank Reconciliation & UTR Verification</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Review customer-submitted 12-digit UTR numbers against your merchant statement (<code className="text-indigo-600 font-mono">lalithkumar19742006@oksbi</code>) and verify.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Bank UTR / Ref</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Submitted At</th>
                  <th className="py-3 px-4 text-center">Verification Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-slate-400">No payment records found.</td>
                  </tr>
                ) : (
                  payments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">{p.order_number}</td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 block">{p.shipping_name}</span>
                        <span className="text-[10px] text-slate-400">{p.shipping_phone}</span>
                      </td>
                      <td className="py-3 px-4 font-extrabold text-slate-900 dark:text-white">₹{p.amount.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-4">
                        {p.utr_number ? (
                          <span className="font-mono bg-indigo-50 dark:bg-indigo-950 px-2 py-1 rounded text-indigo-700 dark:text-indigo-300 font-bold">
                            {p.utr_number}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Not submitted yet</span>
                        )}
                        {p.proof_notes && <p className="text-[10px] text-slate-400 mt-1">{p.proof_notes}</p>}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          p.status === 'Verified' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950' :
                          p.status === 'Submitted' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950' :
                          'bg-rose-100 text-rose-800 dark:bg-rose-950'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400">{new Date(p.created_at).toLocaleString()}</td>
                      <td className="py-3 px-4 text-center">
                        {p.status === 'Submitted' || p.status === 'Pending' ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleVerifyPayment(p.order_number, 'approve')}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[11px] hover:bg-emerald-700 transition-colors flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                            </button>
                            <button
                              onClick={() => handleVerifyPayment(p.order_number, 'reject')}
                              className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-bold text-[11px] hover:bg-rose-700 transition-colors flex items-center gap-1"
                            >
                              <XCircle className="w-3.5 h-3.5" /> Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400 font-medium">Reconciled</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: ORDER MANAGEMENT */}
      {activeTab === 'orders' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Customer Orders</h3>
              <p className="text-xs text-slate-500">Update fulfillment status and add shipping tracking</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-4">Customer & City</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      {o.order_number}
                      <span className="block text-[10px] text-slate-400 font-normal">{new Date(o.created_at).toLocaleDateString()}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 dark:text-white block">{o.shipping_name}</span>
                      <span className="text-[11px] text-slate-400">{o.shipping_city}, {o.shipping_state}</span>
                    </td>
                    <td className="py-3 px-4 font-extrabold text-slate-900 dark:text-white">
                      ₹{o.total_amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold block">{o.payment_method}</span>
                      <span className="text-[10px] text-slate-400">{o.payment_status}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                        {o.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={o.status}
                        onChange={(e) => handleUpdateOrderStatus(o.order_number, e.target.value)}
                        className="px-2.5 py-1.5 rounded-lg text-xs bg-slate-100 dark:bg-slate-800 border-none font-semibold cursor-pointer"
                      >
                        <option value="Payment Pending">Payment Pending</option>
                        <option value="Payment Successful">Payment Successful</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Out for Delivery">Out for Delivery</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: PRODUCTS MANAGEMENT */}
      {activeTab === 'products' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Inventory & Products</h3>
              <p className="text-xs text-slate-500">Add, edit stock, or update catalog pricing</p>
            </div>
            <button
              onClick={() => setShowAddProductModal(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" /> Add New Product
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Discount Price</th>
                  <th className="py-3 px-4">Stock</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {products.map((p) => (
                  <tr key={p.id}>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.primary_image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=100&q=80'}
                          alt={p.name}
                          className="w-10 h-10 object-cover rounded-lg bg-slate-100 dark:bg-slate-800"
                        />
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white block">{p.name}</span>
                          <span className="text-[10px] text-slate-400">{p.brand}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-500">{p.category_name || 'General'}</td>
                    <td className="py-3 px-4 font-bold">₹{p.price.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 font-bold text-indigo-600">
                      {p.discount_price ? `₹${p.discount_price.toLocaleString('en-IN')}` : '-'}
                    </td>
                    <td className="py-3 px-4 font-bold">{p.stock}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDeleteProduct(p.id, p.name)}
                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: COUPONS */}
      {activeTab === 'coupons' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Discount Coupons</h3>
              <p className="text-xs text-slate-500">Manage promotional discount codes</p>
            </div>
            <button
              onClick={() => setShowAddCouponModal(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" /> Create Coupon
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {coupons.map((c) => (
              <div key={c.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-sm text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border">
                    {c.code}
                  </span>
                  <button onClick={() => handleDeleteCoupon(c.id)} className="text-rose-500 hover:text-rose-700">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300">{c.description}</p>
                <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-700 flex justify-between">
                  <span>Discount: <strong>{c.discount_type === 'percentage' ? `${c.discount_value}%` : `₹${c.discount_value}`}</strong></span>
                  <span>Times used: <strong>{c.times_used}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: CUSTOMERS */}
      {activeTab === 'customers' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Registered Customer Accounts ({customers.length})</h3>
              <p className="text-xs text-slate-500">Every user registered in the database sorted by newest first</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search user by name, email, phone..."
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                className="px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64"
              />
              <button
                onClick={loadDashboardData}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 hover:text-indigo-600"
                title="Refresh customer list"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">User ID</th>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Registered Date</th>
                  <th className="py-3 px-4">Orders Placed</th>
                  <th className="py-3 px-4">Total Spent</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {customers
                  .filter(c => {
                    if (!customerSearch.trim()) return true;
                    const q = customerSearch.toLowerCase();
                    return (
                      c.name?.toLowerCase().includes(q) ||
                      c.email?.toLowerCase().includes(q) ||
                      c.phone?.toLowerCase().includes(q)
                    );
                  })
                  .map((cust) => (
                  <tr key={cust.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-mono font-bold text-slate-400">#{cust.id}</td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      {cust.name}
                      {cust.role === 'admin' && (
                        <span className="ml-2 px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                          Admin
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-300">{cust.email}</td>
                    <td className="py-3 px-4 text-slate-500">{cust.phone || '-'}</td>
                    <td className="py-3 px-4 text-slate-400">{new Date(cust.created_at).toLocaleString()}</td>
                    <td className="py-3 px-4 font-bold">{cust.total_orders}</td>
                    <td className="py-3 px-4 font-extrabold text-indigo-600 dark:text-indigo-400">
                      ₹{cust.total_spent.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {cust.id !== 1 && (
                        <button
                          onClick={() => handleDeleteCustomer(cust.id, cust.name, cust.email)}
                          title="Delete User"
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: ADD PRODUCT */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Add Product to Store</h3>
              <button onClick={() => setShowAddProductModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold">Product Name *</label>
                <input
                  type="text"
                  required
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  placeholder="e.g. Aura Wireless Earbuds"
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold">Brand *</label>
                  <input
                    type="text"
                    required
                    value={newProduct.brand}
                    onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                    placeholder="SoundAura"
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold">Category</label>
                  <select
                    value={newProduct.category_id}
                    onChange={(e) => setNewProduct({ ...newProduct, category_id: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    <option value="">Select category...</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    placeholder="4999"
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold">Discount Price (₹)</label>
                  <input
                    type="number"
                    value={newProduct.discount_price}
                    onChange={(e) => setNewProduct({ ...newProduct, discount_price: e.target.value })}
                    placeholder="3999"
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold">Stock Quantity</label>
                  <input
                    type="number"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                    placeholder="50"
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold">Image URL (Unsplash or direct image link)</label>
                <input
                  type="url"
                  value={newProduct.image_url}
                  onChange={(e) => setNewProduct({ ...newProduct, image_url: e.target.value })}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold">Description</label>
                <textarea
                  rows="3"
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  placeholder="Detailed specifications and product story..."
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD COUPON */}
      {showAddCouponModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Create New Coupon</h3>
            <form onSubmit={handleCreateCoupon} className="space-y-3">
              <input
                type="text"
                required
                placeholder="Coupon Code (e.g. FLASH50)"
                value={newCoupon.code}
                onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border font-mono uppercase"
              />
              <input
                type="text"
                placeholder="Description"
                value={newCoupon.description}
                onChange={(e) => setNewCoupon({ ...newCoupon, description: e.target.value })}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border"
              />
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={newCoupon.discount_type}
                  onChange={(e) => setNewCoupon({ ...newCoupon, discount_type: e.target.value })}
                  className="px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (₹)</option>
                </select>
                <input
                  type="number"
                  required
                  placeholder="Discount Value"
                  value={newCoupon.discount_value}
                  onChange={(e) => setNewCoupon({ ...newCoupon, discount_value: e.target.value })}
                  className="px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border"
                />
              </div>
              <input
                type="number"
                placeholder="Min Order Value (₹)"
                value={newCoupon.min_order_value}
                onChange={(e) => setNewCoupon({ ...newCoupon, min_order_value: e.target.value })}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCouponModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
                >
                  Save Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
