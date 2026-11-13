const BASE_URL = '/api';

export async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.message || `Request failed with status ${response.status}`;
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  // Auth
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => request('/auth/me'),
  updateProfile: (data) => request('/auth/profile', { method: 'PUT', body: JSON.stringify(data) }),
  forgotPassword: (email) => request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  resetPassword: (data) => request('/auth/reset-password', { method: 'POST', body: JSON.stringify(data) }),

  // Products
  getProducts: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/products${query ? `?${query}` : ''}`);
  },
  getProduct: (idOrSlug) => request(`/products/${idOrSlug}`),
  getRelatedProducts: (id) => request(`/products/${id}/related`),
  getFeaturedProducts: () => request('/products/featured'),
  getTrendingProducts: () => request('/products/trending'),
  getSearchSuggestions: (q) => request(`/products/suggestions?q=${encodeURIComponent(q)}`),
  getFilters: () => request('/products/filters'),

  // Categories
  getCategories: () => request('/categories'),
  getCategory: (slug) => request(`/categories/${slug}`),

  // Cart
  getCart: () => request('/cart'),
  addToCart: (productId, quantity = 1) => request('/cart/add', { method: 'POST', body: JSON.stringify({ productId, quantity }) }),
  updateCartQty: (productId, quantity) => request('/cart/update', { method: 'PUT', body: JSON.stringify({ productId, quantity }) }),
  removeFromCart: (productId) => request(`/cart/${productId}`, { method: 'DELETE' }),
  clearCart: () => request('/cart/clear/all', { method: 'DELETE' }),

  // Wishlist
  getWishlist: () => request('/wishlist'),
  toggleWishlist: (productId) => request('/wishlist/toggle', { method: 'POST', body: JSON.stringify({ productId }) }),
  removeFromWishlist: (productId) => request(`/wishlist/${productId}`, { method: 'DELETE' }),

  // Coupons
  getActiveCoupons: () => request('/coupons/active'),
  applyCoupon: (code, orderAmount) => request('/coupons/apply', { method: 'POST', body: JSON.stringify({ code, orderAmount }) }),

  // Orders
  createOrder: (orderData) => request('/orders', { method: 'POST', body: JSON.stringify(orderData) }),
  getOrders: () => request('/orders'),
  getOrder: (orderNumber) => request(`/orders/${orderNumber}`),
  cancelOrder: (orderNumber) => request(`/orders/${orderNumber}/cancel`, { method: 'POST' }),

  // UPI Payments
  getUpiDetails: (orderNumber) => request(`/payment/upi-details/${orderNumber}`),
  submitUtr: (orderNumber, utrNumber, proofNotes = '') => request('/payment/submit-upi-ref', { method: 'POST', body: JSON.stringify({ orderNumber, utrNumber, proofNotes }) }),
  getPaymentStatus: (orderNumber) => request(`/payment/status/${orderNumber}`),
  verifyPayment: (orderNumber, action = 'approve', reason = '') => request('/payment/verify-payment', { method: 'POST', body: JSON.stringify({ orderNumber, action, reason }) }),

  // Reviews
  getReviews: (productId) => request(`/reviews/${productId}`),
  addReview: (productId, reviewData) => request(`/reviews/${productId}`, { method: 'POST', body: JSON.stringify(reviewData) }),

  // Contact
  submitContact: (data) => request('/contact', { method: 'POST', body: JSON.stringify(data) }),
  subscribeNewsletter: (email) => request('/contact/newsletter', { method: 'POST', body: JSON.stringify({ email }) }),

  // Admin
  getAdminStats: () => request('/admin/stats'),
  getAdminOrders: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/admin/orders${query ? `?${query}` : ''}`);
  },
  updateOrderStatus: (orderNumber, data) => request(`/admin/orders/${orderNumber}/status`, { method: 'PUT', body: JSON.stringify(data) }),
  getAdminPayments: () => request('/admin/payments'),
  getAdminProducts: () => request('/admin/products'),
  createProduct: (productData) => request('/admin/products', { method: 'POST', body: JSON.stringify(productData) }),
  updateProduct: (id, productData) => request(`/admin/products/${id}`, { method: 'PUT', body: JSON.stringify(productData) }),
  deleteProduct: (id) => request(`/admin/products/${id}`, { method: 'DELETE' }),
  getAdminCustomers: () => request('/admin/customers'),
  deleteCustomer: (id) => request(`/admin/customers/${id}`, { method: 'DELETE' }),
  getAdminCoupons: () => request('/admin/coupons'),
  createCoupon: (couponData) => request('/admin/coupons', { method: 'POST', body: JSON.stringify(couponData) }),
  deleteCoupon: (id) => request(`/admin/coupons/${id}`, { method: 'DELETE' }),
};
