import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('local_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('local_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    if (user) {
      api.getWishlist().then(res => {
        if (res.items) {
          setWishlist(res.items.map(i => ({
            id: i.product_id,
            name: i.name,
            slug: i.slug,
            price: i.discount_price !== null ? i.discount_price : i.price,
            originalPrice: i.price,
            stock: i.stock,
            rating: i.rating,
            image: i.image,
            brand: i.brand
          })));
        }
      }).catch(err => console.error('Failed to load wishlist:', err));
    }
  }, [user]);

  const toggleWishlist = async (product) => {
    const exists = wishlist.some(i => i.id === product.id);
    let updated;
    if (exists) {
      updated = wishlist.filter(i => i.id !== product.id);
      addToast(`Removed "${product.name}" from wishlist.`, 'info');
    } else {
      updated = [
        ...wishlist,
        {
          id: product.id,
          name: product.name,
          slug: product.slug,
          price: product.discount_price !== null && product.discount_price !== undefined ? product.discount_price : product.price,
          originalPrice: product.price,
          stock: product.stock,
          rating: product.rating,
          brand: product.brand,
          image: product.primary_image || (product.images && product.images[0]) || product.image
        }
      ];
      addToast(`Added "${product.name}" to wishlist!`, 'success');
    }
    setWishlist(updated);

    if (user) {
      try {
        await api.toggleWishlist(product.id);
      } catch (err) {
        console.error('Server wishlist toggle failed:', err);
      }
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.some(i => i.id === productId);
  };

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist, count: wishlist.length }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}
