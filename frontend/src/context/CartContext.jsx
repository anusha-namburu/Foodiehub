import React, { createContext, useContext, useState, useEffect } from 'react';
import { cartAPI, couponAPI } from '../api/client';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [coupon, setCoupon] = useState(null); // { code, discount, description }
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchCart = async () => {
    if (!isAuthenticated) {
      // Guest cart from local storage
      const saved = localStorage.getItem('foodiehub_guest_cart');
      if (saved) {
        try {
          setCartItems(JSON.parse(saved));
        } catch {
          setCartItems([]);
        }
      }
      return;
    }
    try {
      setLoading(true);
      const res = await cartAPI.getCart();
      if (res.success) {
        setCartItems(res.items || []);
      }
    } catch (err) {
      console.warn('Failed to load cart:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [isAuthenticated]);

  // Save guest cart
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem('foodiehub_guest_cart', JSON.stringify(cartItems));
    }
  }, [cartItems, isAuthenticated]);

  const addToCart = async (foodItem, quantity = 1, notes = '', replaceCart = false) => {
    if (isAuthenticated) {
      try {
        const res = await cartAPI.addItem({
          food_item_id: foodItem.id,
          quantity,
          notes,
          replace_cart: replaceCart,
        });
        if (res.success) {
          showToast(`Added ${foodItem.name} to cart!`);
          await fetchCart();
          return { success: true };
        }
      } catch (err) {
        showToast(err.message, 'error');
        return { success: false, error: err.message };
      }
    } else {
      // Guest cart logic
      setCartItems((prev) => {
        const existingIdx = prev.findIndex((item) => item.food_item_id === foodItem.id);
        const itemPrice = foodItem.discounted_price || foodItem.price;
        if (existingIdx > -1) {
          const updated = [...prev];
          const newQty = updated[existingIdx].quantity + quantity;
          updated[existingIdx] = {
            ...updated[existingIdx],
            quantity: newQty,
            item_total: Number((itemPrice * newQty).toFixed(2)),
          };
          return updated;
        } else {
          return [
            ...prev,
            {
              id: Date.now(),
              food_item_id: foodItem.id,
              quantity,
              notes,
              food_item: foodItem,
              item_total: Number((itemPrice * quantity).toFixed(2)),
            },
          ];
        }
      });
      showToast(`Added ${foodItem.name} to cart!`);
      return { success: true };
    }
  };

  const updateQuantity = async (cartItemId, newQty) => {
    if (isAuthenticated) {
      try {
        const res = await cartAPI.updateItem(cartItemId, { quantity: newQty });
        if (res.success) {
          await fetchCart();
        }
      } catch (err) {
        showToast(err.message, 'error');
      }
    } else {
      setCartItems((prev) => {
        if (newQty <= 0) {
          return prev.filter((item) => item.id !== cartItemId);
        }
        return prev.map((item) => {
          if (item.id === cartItemId) {
            const price = item.food_item.discounted_price || item.food_item.price;
            return {
              ...item,
              quantity: newQty,
              item_total: Number((price * newQty).toFixed(2)),
            };
          }
          return item;
        });
      });
    }
  };

  const removeFromCart = async (cartItemId) => {
    if (isAuthenticated) {
      try {
        const res = await cartAPI.removeItem(cartItemId);
        if (res.success) {
          showToast('Item removed from cart');
          await fetchCart();
        }
      } catch (err) {
        showToast(err.message, 'error');
      }
    } else {
      setCartItems((prev) => prev.filter((item) => item.id !== cartItemId));
      showToast('Item removed from cart');
    }
  };

  const clearCart = async () => {
    if (isAuthenticated) {
      try {
        await cartAPI.clearCart();
        setCartItems([]);
      } catch (err) {
        console.error(err);
      }
    } else {
      setCartItems([]);
      localStorage.removeItem('foodiehub_guest_cart');
    }
    setCoupon(null);
  };

  // Calculations
  const subtotal = Number(
    cartItems
      .reduce((sum, item) => {
        const price = item.food_item?.discounted_price || item.food_item?.price || 0;
        return sum + price * item.quantity;
      }, 0)
      .toFixed(2)
  );

  const deliveryFee = cartItems.length > 0 ? 2.99 : 0;
  const tax = Number((subtotal * 0.08).toFixed(2));
  const discount = coupon ? Math.min(subtotal, coupon.discount) : 0;
  const total = Number(Math.max(0, subtotal + deliveryFee + tax - discount).toFixed(2));
  const itemCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  const applyCouponCode = async (code) => {
    try {
      const res = await couponAPI.applyCoupon(code, subtotal);
      if (res.success) {
        setCoupon({
          code: res.coupon.code,
          discount: res.discount,
          description: res.coupon.description,
        });
        showToast(`Coupon ${res.coupon.code} applied! Saved $${res.discount.toFixed(2)}`);
        return { success: true };
      }
    } catch (err) {
      showToast(err.message, 'error');
      return { success: false, error: err.message };
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
    showToast('Coupon removed');
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        itemCount,
        subtotal,
        deliveryFee,
        tax,
        discount,
        total,
        coupon,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        applyCouponCode,
        removeCoupon,
        fetchCart,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
