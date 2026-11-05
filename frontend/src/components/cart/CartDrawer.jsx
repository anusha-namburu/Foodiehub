import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { X, Plus, Minus, Trash2, ArrowRight, Tag, ShoppingBag, Check } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

const CartDrawer = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    cartItems,
    itemCount,
    subtotal,
    deliveryFee,
    tax,
    discount,
    total,
    coupon,
    updateQuantity,
    removeFromCart,
    applyCouponCode,
    removeCoupon,
  } = useCart();

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    await applyCouponCode(couponInput.trim());
    setCouponLoading(false);
    setCouponInput('');
  };

  const handleProceedCheckout = () => {
    setIsCartOpen(false);
    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout');
    } else {
      navigate('/checkout');
    }
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="absolute inset-0 bg-stone-900/50 backdrop-blur-sm transition-opacity"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              className="w-screen max-w-md bg-white shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-brand-50 text-brand-600">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-stone-900">Your Feast</h2>
                    <p className="text-xs text-stone-600">
                      {itemCount} {itemCount === 1 ? 'item' : 'items'} in basket
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 rounded-full hover:bg-stone-200/60 text-stone-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {cartItems.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-12">
                    <div className="w-20 h-20 rounded-full bg-brand-50 flex items-center justify-center text-4xl mb-4">
                      🍲
                    </div>
                    <h3 className="text-base font-bold text-stone-900 mb-1">Your cart is hungry!</h3>
                    <p className="text-xs text-stone-600 max-w-xs mb-6">
                      Explore top restaurants and fill up your cart with delicious dishes.
                    </p>
                    <button
                      onClick={() => {
                        setIsCartOpen(false);
                        navigate('/restaurants');
                      }}
                      className="px-5 py-2.5 rounded-full text-xs font-bold bg-brand-500 hover:bg-brand-600 text-white shadow-sm"
                    >
                      Browse Restaurants
                    </button>
                  </div>
                ) : (
                  cartItems.map((item) => {
                    const food = item.food_item || {};
                    const price = food.discounted_price || food.price || 0;
                    return (
                      <div
                        key={item.id}
                        className="flex gap-3 p-3 rounded-2xl bg-stone-50 border border-stone-100 relative group"
                      >
                        <img
                          src={food.image_url}
                          alt={food.name}
                          className="w-16 h-16 rounded-xl object-cover shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-stone-900 truncate">{food.name}</h4>
                          <p className="text-xs font-semibold text-brand-600 mb-2">
                            ${price.toFixed(2)}
                          </p>

                          {/* Qty controls */}
                          <div className="flex items-center gap-2">
                            <div className="flex items-center border border-stone-200 rounded-lg bg-white overflow-hidden shadow-xs">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="p-1 hover:bg-stone-100 text-stone-600 transition-colors"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="px-2 text-xs font-bold text-stone-800">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="p-1 hover:bg-stone-100 text-stone-600 transition-colors"
                                aria-label="Increase quantity"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <span className="text-xs font-bold text-stone-800 ml-auto">
                              ${(price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-stone-600 hover:text-red-500 p-1 self-start transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer with Calculations & Checkout */}
              {cartItems.length > 0 && (
                <div className="p-5 border-t border-stone-100 bg-stone-50/80 space-y-4">
                  
                  {/* Coupon section */}
                  {coupon ? (
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-emerald-600" />
                        <div>
                          <span className="font-bold text-emerald-800">{coupon.code}</span>
                          <span className="text-emerald-600 ml-1">(-${coupon.discount.toFixed(2)})</span>
                        </div>
                      </div>
                      <button
                        onClick={removeCoupon}
                        className="text-emerald-700 hover:text-emerald-900 font-semibold underline"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyCoupon} className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-600" />
                        <input
                          type="text"
                          placeholder="Try code WELCOME50"
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                          className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white border border-stone-200 uppercase tracking-wide focus:outline-none focus:ring-1 focus:ring-brand-500"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={couponLoading || !couponInput.trim()}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-stone-800 hover:bg-stone-900 text-white disabled:opacity-50 transition-colors"
                      >
                        Apply
                      </button>
                    </form>
                  )}

                  {/* Summary Breakdown */}
                  <div className="space-y-1.5 text-xs text-stone-600">
                    <div className="flex justify-between">
                      <span>Item Subtotal</span>
                      <span className="font-semibold text-stone-800">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Standard Delivery</span>
                      <span className="font-semibold text-stone-800">${deliveryFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Taxes & Fees (8%)</span>
                      <span className="font-semibold text-stone-800">${tax.toFixed(2)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-emerald-600 font-medium">
                        <span>Coupon Savings</span>
                        <span>-${discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 border-t border-stone-200 text-sm font-extrabold text-stone-900">
                      <span>Total Amount</span>
                      <span className="text-brand-600">${total.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Checkout CTA */}
                  <button
                    onClick={handleProceedCheckout}
                    className="w-full py-3.5 px-4 rounded-xl text-sm font-bold bg-brand-500 hover:bg-brand-600 text-white shadow-md shadow-brand-500/20 flex items-center justify-center gap-2 transition-all hover:gap-3"
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
