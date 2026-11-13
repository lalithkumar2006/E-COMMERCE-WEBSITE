import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const CartContext = createContext();

export function CartProvider({ children }) {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem('local_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [coupon, setCoupon] = useState(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('local_cart', JSON.stringify(items));
  }, [items]);

  // Load from DB when user logs in
  useEffect(() => {
    if (user) {
      api.getCart().then(res => {
        if (res.items && res.items.length > 0) {
          // Merge or replace
          setItems(res.items.map(i => ({
            id: i.product_id,
            name: i.name,
            slug: i.slug,
            price: i.discount_price !== null ? i.discount_price : i.price,
            originalPrice: i.price,
            stock: i.stock,
            image: i.image,
            quantity: i.quantity
          })));
        }
      }).catch(err => console.error('Failed to load server cart:', err));
    }
  }, [user]);

  const addToCart = async (product, quantity = 1) => {
    const existing = items.find(i => i.id === product.id);
    const currentQty = existing ? existing.quantity : 0;
    const requestedQty = currentQty + quantity;

    if (product.stock !== undefined && requestedQty > product.stock) {
      addToast(`Only ${product.stock} units available in stock.`, 'error');
      return false;
    }

    let updated;
    if (existing) {
      updated = items.map(i => i.id === product.id ? { ...i, quantity: requestedQty } : i);
    } else {
      updated = [
        ...items,
        {
          id: product.id,
          name: product.name,
          slug: product.slug,
          price: product.discount_price !== null && product.discount_price !== undefined ? product.discount_price : product.price,
          originalPrice: product.price,
          stock: product.stock,
          image: product.primary_image || (product.images && product.images[0]) || product.image,
          quantity
        }
      ];
    }
    setItems(updated);
    addToast(`Added "${product.name}" to cart!`, 'success');

    if (user) {
      try {
        await api.addToCart(product.id, quantity);
      } catch (err) {
        console.error('Server cart sync failed:', err);
      }
    }
    return true;
  };

  const updateQuantity = async (productId, newQuantity) => {
    const item = items.find(i => i.id === productId);
    if (!item) return;

    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    if (item.stock !== undefined && newQuantity > item.stock) {
      addToast(`Cannot add more than ${item.stock} available units.`, 'error');
      return;
    }

    const updated = items.map(i => i.id === productId ? { ...i, quantity: newQuantity } : i);
    setItems(updated);

    if (user) {
      try {
        await api.updateCartQty(productId, newQuantity);
      } catch (err) {
        console.error('Server cart update failed:', err);
      }
    }
  };

  const removeFromCart = async (productId) => {
    const updated = items.filter(i => i.id !== productId);
    setItems(updated);
    addToast('Item removed from cart', 'info');

    if (user) {
      try {
        await api.removeFromCart(productId);
      } catch (err) {
        console.error('Server remove item failed:', err);
      }
    }
  };

  const clearCart = async () => {
    setItems([]);
    setCoupon(null);
    if (user) {
      try {
        await api.clearCart();
      } catch (err) {
        console.error('Server clear cart failed:', err);
      }
    }
  };

  const applyCoupon = async (code) => {
    try {
      const res = await api.applyCoupon(code, subtotal);
      setCoupon(res.coupon);
      addToast(res.message, 'success');
      return { success: true };
    } catch (err) {
      addToast(err.message, 'error');
      return { success: false, message: err.message };
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
    addToast('Coupon removed.', 'info');
  };

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = subtotal === 0 || subtotal >= 1000 ? 0 : 99;
  
  let discountAmount = 0;
  if (coupon) {
    if (coupon.discount_type === 'percentage') {
      discountAmount = Math.round((subtotal * coupon.discount_value) / 100);
      if (coupon.max_discount && discountAmount > coupon.max_discount) {
        discountAmount = coupon.max_discount;
      }
    } else {
      discountAmount = Math.min(coupon.discount_value, subtotal);
    }
  }

  const finalTotal = Math.max(0, subtotal - discountAmount + deliveryFee);
  const totalItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        subtotal,
        deliveryFee,
        discountAmount,
        finalTotal,
        totalItemsCount,
        coupon,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        applyCoupon,
        removeCoupon
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
