import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import CategoriesPage from './pages/CategoriesPage';
import SearchResults from './pages/SearchResults';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Checkout from './pages/Checkout';
import UPIPayment from './pages/UPIPayment';
import OrderConfirmation from './pages/OrderConfirmation';
import MyOrders from './pages/MyOrders';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ContactUs from './pages/ContactUs';
import AboutUs from './pages/AboutUs';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsAndConditions from './pages/TermsAndConditions';
import ReturnRefundPolicy from './pages/ReturnRefundPolicy';
import NotFound from './pages/NotFound';
import AdminDashboard from './pages/admin/AdminDashboard';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
        <Navbar />
        <main className="flex-1">
          <Routes>
            {/* 1. Home */}
            <Route path="/" element={<Home />} />

            {/* 2. Shop / All Products */}
            <Route path="/shop" element={<Shop />} />

            {/* 3. Product Details */}
            <Route path="/product/:idOrSlug" element={<ProductDetails />} />

            {/* 4. Product Categories */}
            <Route path="/categories" element={<CategoriesPage />} />

            {/* 5. Search Results */}
            <Route path="/search" element={<SearchResults />} />

            {/* 6. Shopping Cart */}
            <Route path="/cart" element={<Cart />} />

            {/* 7. Wishlist */}
            <Route path="/wishlist" element={<Wishlist />} />

            {/* 8. Checkout */}
            <Route path="/checkout" element={<Checkout />} />

            {/* 9. UPI Payment */}
            <Route path="/payment/upi/:orderNumber" element={<UPIPayment />} />

            {/* 10. Order Confirmation */}
            <Route path="/order-confirmation/:orderNumber" element={<OrderConfirmation />} />

            {/* 11. My Orders */}
            <Route path="/orders" element={<MyOrders />} />

            {/* 12. Customer Profile */}
            <Route path="/profile" element={<Profile />} />

            {/* 13. Login */}
            <Route path="/login" element={<Login />} />

            {/* 14. Registration */}
            <Route path="/register" element={<Register />} />

            {/* 15. Forgot Password */}
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* 16. Contact Us */}
            <Route path="/contact" element={<ContactUs />} />

            {/* 17. About Us */}
            <Route path="/about" element={<AboutUs />} />

            {/* 18. Privacy Policy */}
            <Route path="/privacy" element={<PrivacyPolicy />} />

            {/* 19. Terms and Conditions */}
            <Route path="/terms" element={<TermsAndConditions />} />

            {/* 20. Return and Refund Policy */}
            <Route path="/returns" element={<ReturnRefundPolicy />} />

            {/* Admin Dashboard */}
            <Route path="/admin" element={<AdminDashboard />} />

            {/* 21. 404 Error Page */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
