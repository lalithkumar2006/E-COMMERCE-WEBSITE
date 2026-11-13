import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Heart,
  Search,
  User,
  Sun,
  Moon,
  Menu,
  X,
  LogOut,
  Package,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { totalItemsCount } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const searchRef = useRef(null);
  const dropdownRef = useRef(null);

  // Live autocomplete debouncing
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsSearching(true);
        const res = await api.getSearchSuggestions(searchQuery);
        setSuggestions(res.suggestions || []);
        setShowSuggestions(true);
      } catch (err) {
        console.error('Search suggestion error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/90 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 transition-colors">
      {/* Top Banner Notice */}
      <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 text-white text-xs py-1.5 px-4 text-center font-medium tracking-wide flex items-center justify-center gap-2">
        <span>✨ Welcome to AuraStore • Instant UPI Payments via Google Pay, PhonePe, Paytm & BHIM to <strong>lalithkumar19742006@oksbi</strong></span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-600 dark:from-white dark:via-indigo-200 dark:to-indigo-400 bg-clip-text text-transparent">
                AuraStore
              </span>
              <span className="block text-[9px] uppercase tracking-widest font-semibold text-indigo-600 dark:text-indigo-400">
                Premium Store
              </span>
            </div>
          </Link>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex flex-1 max-w-lg relative" ref={searchRef}>
            <form onSubmit={handleSearchSubmit} className="w-full relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
                placeholder="Search products, brands, categories..."
                className="w-full pl-10 pr-10 py-2 rounded-full text-sm bg-slate-100 dark:bg-slate-800/80 border border-transparent focus:border-indigo-500 dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all placeholder:text-slate-400"
              />
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => { setSearchQuery(''); setSuggestions([]); }}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </form>

            {/* Suggestions Autocomplete Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50">
                <div className="p-2 border-b border-slate-100 dark:border-slate-800 text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-3">
                  Matching Products
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {suggestions.map((item) => (
                    <Link
                      key={item.id}
                      to={`/product/${item.slug}`}
                      onClick={() => setShowSuggestions(false)}
                      className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                    >
                      <img
                        src={item.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=100&q=80'}
                        alt={item.name}
                        className="w-10 h-10 object-cover rounded-lg shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{item.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{item.brand}</p>
                      </div>
                      <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 shrink-0">
                        ₹{(item.discount_price || item.price).toLocaleString('en-IN')}
                      </span>
                    </Link>
                  ))}
                </div>
                <Link
                  to={`/search?q=${encodeURIComponent(searchQuery)}`}
                  onClick={() => setShowSuggestions(false)}
                  className="block text-center py-2.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30 hover:bg-indigo-100/50 transition-colors"
                >
                  View all results for "{searchQuery}" →
                </Link>
              </div>
            )}
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-700 dark:text-slate-300">
            <Link to="/shop" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              All Products
            </Link>
            <Link to="/categories" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Categories
            </Link>
            <Link to="/contact" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Contact
            </Link>
            <Link to="/about" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              About
            </Link>
          </nav>

          {/* Action Icons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle Theme"
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Wishlist Icon */}
            <Link
              to="/wishlist"
              aria-label="Wishlist"
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Shopping Cart Icon */}
            <Link
              to="/cart"
              aria-label="Shopping Cart"
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[10px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center">
                  {totalItemsCount}
                </span>
              )}
            </Link>

            {/* User Account / Dropdown */}
            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center text-xs font-bold uppercase">
                    {user.name.charAt(0)}
                  </div>
                  <span className="hidden sm:inline max-w-[100px] truncate">{user.name.split(' ')[0]}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-50 animate-scale-in">
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{user.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                      {isAdmin && (
                        <span className="inline-block mt-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                          Administrator
                        </span>
                      )}
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      My Profile
                    </Link>

                    <Link
                      to="/orders"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Package className="w-4 h-4 text-slate-400" />
                      My Orders
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        Admin Dashboard
                      </Link>
                    )}

                    <div className="border-t border-slate-100 dark:border-slate-800 my-1"></div>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="hidden sm:inline-flex px-4 py-1.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-600/30 transition-all hover:scale-[1.02]"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-9 pr-8 py-2 rounded-full text-sm bg-slate-100 dark:bg-slate-800 border-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </form>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-3 pb-6 space-y-3">
          <div className="flex flex-col space-y-2 text-sm font-medium">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Home
            </Link>
            <Link
              to="/shop"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              All Products
            </Link>
            <Link
              to="/categories"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Categories
            </Link>
            <Link
              to="/orders"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              My Orders
            </Link>
            <Link
              to="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Contact Us
            </Link>
            <Link
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              About Us
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-semibold"
              >
                Admin Panel
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
