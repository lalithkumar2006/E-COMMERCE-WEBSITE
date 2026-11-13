import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Star,
  Heart,
  ShoppingBag,
  ShieldCheck,
  Truck,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Send,
  ArrowRight
} from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function ProductDetails() {
  const { idOrSlug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();

  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Review submission state
  const [newRating, setNewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    async function loadProductData() {
      setLoading(true);
      try {
        const res = await api.getProduct(idOrSlug);
        const prod = res.product;
        setProduct(prod);
        setSelectedImage(prod.primary_image || (prod.images && prod.images[0]) || '');

        // Record recently viewed in localStorage
        try {
          const recents = JSON.parse(localStorage.getItem('recently_viewed') || '[]');
          const filtered = recents.filter(p => p.id !== prod.id);
          filtered.unshift({ id: prod.id, name: prod.name, slug: prod.slug, price: prod.price, discount_price: prod.discount_price, image: prod.primary_image });
          localStorage.setItem('recently_viewed', JSON.stringify(filtered.slice(0, 6)));
        } catch (e) {}

        // Fetch related & reviews
        const [relatedRes, reviewsRes] = await Promise.all([
          api.getRelatedProducts(prod.id),
          api.getReviews(prod.id)
        ]);
        setRelatedProducts(relatedRes.products || []);
        setReviews(reviewsRes.reviews || []);
      } catch (err) {
        console.error('Failed to load product:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProductData();
  }, [idOrSlug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 animate-pulse space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="aspect-square bg-slate-200 dark:bg-slate-800 rounded-3xl"></div>
          <div className="space-y-4">
            <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
            <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
            <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-md mx-auto my-20 text-center p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Product Not Found</h2>
        <p className="text-xs text-slate-500 mt-1 mb-6">The item you are looking for may have been retired or moved.</p>
        <Link to="/shop" className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl">
          Back to Store
        </Link>
      </div>
    );
  }

  const currentPrice = product.discount_price !== null && product.discount_price !== undefined ? product.discount_price : product.price;
  const originalPrice = product.discount_price ? product.price : null;
  const discountPercent = originalPrice ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : null;
  const isWishlisted = isInWishlist(product.id);
  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = async () => {
    if (isOutOfStock) return;
    await addToCart(product, quantity);
  };

  const handleBuyNow = async () => {
    if (isOutOfStock) return;
    await addToCart(product, quantity);
    navigate('/checkout');
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      addToast('Please login to leave a review.', 'info');
      navigate('/login');
      return;
    }
    if (!reviewComment.trim()) return;

    try {
      setSubmittingReview(true);
      await api.addReview(product.id, {
        rating: newRating,
        title: reviewTitle,
        comment: reviewComment
      });
      addToast('Thank you! Review published.', 'success');
      setReviewTitle('');
      setReviewComment('');
      const updatedRev = await api.getReviews(product.id);
      setReviews(updatedRev.reviews || []);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      
      {/* Breadcrumb */}
      <nav className="text-xs font-medium text-slate-400 flex items-center gap-2">
        <Link to="/" className="hover:text-slate-600 dark:hover:text-slate-200">Home</Link>
        <span>/</span>
        <Link to="/shop" className="hover:text-slate-600 dark:hover:text-slate-200">Shop</Link>
        {product.category && (
          <>
            <span>/</span>
            <Link to={`/shop?category=${product.category.slug}`} className="hover:text-slate-600 dark:hover:text-slate-200">
              {product.category.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-slate-800 dark:text-slate-200 truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Left: Interactive Image Gallery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="aspect-square w-full rounded-3xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 shadow-md relative">
            <img
              src={selectedImage}
              alt={product.name}
              className="w-full h-full object-cover transition-all duration-300"
            />
            {discountPercent && (
              <span className="absolute top-4 left-4 px-3 py-1 rounded-lg text-xs font-black bg-rose-500 text-white shadow-md">
                {discountPercent}% OFF
              </span>
            )}
          </div>

          {/* Thumbnails row */}
          {product.images && product.images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {product.images.map((imgUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(imgUrl)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all shrink-0 ${
                    selectedImage === imgUrl
                      ? 'border-indigo-600 scale-95 shadow-md'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={imgUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Purchase & Details Panel */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Brand & Title */}
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                {product.brand}
              </span>
              <button
                onClick={() => toggleWishlist(product)}
                className={`p-2.5 rounded-full border transition-all ${
                  isWishlisted
                    ? 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-950/60 dark:border-rose-900'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:text-rose-500'
                }`}
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1 leading-snug">
              {product.name}
            </h1>
          </div>

          {/* Rating & Stock Status */}
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900/60 text-amber-700 dark:text-amber-400 px-2.5 py-1 rounded-full font-bold">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>{product.rating || '4.8'}</span>
              <span className="opacity-60">({product.review_count || reviews.length} reviews)</span>
            </div>

            {isOutOfStock ? (
              <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 font-bold">
                Out of Stock
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                In Stock ({product.stock} units left)
              </span>
            )}
          </div>

          {/* Price Block */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 space-y-1">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                ₹{Number(currentPrice).toLocaleString('en-IN')}
              </span>
              {originalPrice && (
                <span className="text-sm text-slate-400 line-through">
                  ₹{Number(originalPrice).toLocaleString('en-IN')}
                </span>
              )}
              {discountPercent && (
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  Save ₹{(originalPrice - currentPrice).toLocaleString('en-IN')} ({discountPercent}%)
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500">
              Inclusive of all taxes &bull; Verified UPI merchant settlement destination: <strong>lalithkumar19742006@oksbi</strong>
            </p>
          </div>

          {/* Short Description */}
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {product.description}
          </p>

          {/* Quantity Selector & Action Buttons */}
          <div className="space-y-4 pt-2">
            {!isOutOfStock && (
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Quantity:</span>
                <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-800">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 font-bold"
                  >
                    -
                  </button>
                  <span className="px-4 py-1.5 text-xs font-bold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="px-3 py-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="w-full py-3.5 px-4 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold text-sm hover:opacity-90 shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingBag className="w-4 h-4" />
                Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className="w-full py-3.5 px-4 rounded-2xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01]"
              >
                Buy Now with UPI
              </button>
            </div>
          </div>

          {/* Value Badges */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-200 dark:border-slate-800 text-center">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
              <Truck className="w-5 h-5 mx-auto text-indigo-600 mb-1" />
              <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200">Free Express Delivery</p>
              <p className="text-[10px] text-slate-400">Orders ₹1,000+</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
              <RotateCcw className="w-5 h-5 mx-auto text-emerald-600 mb-1" />
              <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200">7-Day Guarantee</p>
              <p className="text-[10px] text-slate-400">Easy replacement</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
              <ShieldCheck className="w-5 h-5 mx-auto text-violet-600 mb-1" />
              <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200">Verified Payment</p>
              <p className="text-[10px] text-slate-400">100% Secured UPI</p>
            </div>
          </div>
        </div>
      </div>

      {/* Specifications Table */}
      {product.specs && product.specs.length > 0 && (
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Technical Specifications</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {product.specs.map((spec, i) => (
              <div key={i} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{spec.spec_key}</span>
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{spec.spec_value}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Reviews & Ratings Section */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Customer Ratings & Reviews</h3>
            <p className="text-xs text-slate-500 mt-0.5">Real verified customer feedback</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">{product.rating || '5.0'}</span>
            <div className="flex text-amber-400">
              {[1, 2, 3, 4, 5].map(s => (
                <Star key={s} className="w-4 h-4 fill-current" />
              ))}
            </div>
          </div>
        </div>

        {/* Add Review Form */}
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Write a Customer Review</h4>
          <form onSubmit={handleSubmitReview} className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Your Rating:</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setNewRating(star)}
                    className="p-1 text-amber-400 hover:scale-110 transition-transform"
                  >
                    <Star className={`w-5 h-5 ${star <= newRating ? 'fill-current' : 'text-slate-300 dark:text-slate-600'}`} />
                  </button>
                ))}
              </div>
            </div>

            <input
              type="text"
              placeholder="Headline / Review Title"
              value={reviewTitle}
              onChange={(e) => setReviewTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500"
            />

            <textarea
              rows="3"
              placeholder="Write your honest feedback about quality, build, and delivery experience..."
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500"
            ></textarea>

            <button
              type="submit"
              disabled={submittingReview}
              className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              Submit Review
            </button>
          </form>
        </div>

        {/* Existing Reviews List */}
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">Be the first to review this product!</p>
          ) : (
            reviews.map((rev) => (
              <div key={rev.id} className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 font-bold text-xs flex items-center justify-center">
                      {(rev.user_name || 'U').charAt(0)}
                    </div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{rev.user_name || 'Verified Buyer'}</span>
                  </div>
                  <div className="flex text-amber-400">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-current" />
                    ))}
                  </div>
                </div>
                {rev.title && <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">{rev.title}</h5>}
                <p className="text-xs text-slate-600 dark:text-slate-400">{rev.comment}</p>
                <span className="text-[10px] text-slate-400 block">{new Date(rev.created_at).toLocaleDateString()}</span>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="space-y-6">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">You May Also Like</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
