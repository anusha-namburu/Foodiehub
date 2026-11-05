import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Clock, Flame, ShoppingBag, Plus, Minus, Check } from 'lucide-react';
import { useCart } from '../../context/CartContext';

const FoodDetailModal = ({ food, onClose }) => {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [adding, setAdding] = useState(false);

  if (!food) return null;

  const currentPrice = food.discounted_price || food.price;
  const totalPrice = (currentPrice * quantity).toFixed(2);

  const handleAdd = async () => {
    setAdding(true);
    await addToCart(food, quantity, notes);
    setAdding(false);
    onClose();
  };

  const ingredientsList = food.ingredients ? food.ingredients.split(',').map((s) => s.trim()) : [];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/90 hover:bg-white text-stone-700 shadow-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Media Header */}
          <div className="relative h-64 sm:h-72 w-full bg-stone-100 shrink-0">
            <img
              src={food.image_url}
              alt={food.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                    food.is_veg ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
                  }`}
                >
                  {food.is_veg ? '100% Vegetarian' : 'Non-Vegetarian'}
                </span>
                {food.is_spicy && (
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-600 text-white flex items-center gap-1">
                    <Flame className="w-3 h-3 fill-white" /> Spicy
                  </span>
                )}
                {food.is_bestseller && (
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-brand-500 text-white">
                    Bestseller
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-black drop-shadow-sm">{food.name}</h2>
            </div>
          </div>

          {/* Content Body */}
          <div className="p-6 overflow-y-auto space-y-5">
            {/* Meta row */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 text-xs font-semibold text-stone-600">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 text-amber-600">
                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                  <span className="font-bold text-sm text-stone-900">{food.rating || 4.8}</span>
                  <span>(150+ ratings)</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-stone-600" />
                  <span>{food.preparation_time || 20} mins prep</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xl font-extrabold text-stone-900">
                  ${currentPrice.toFixed(2)}
                </span>
                {food.discounted_price && (
                  <span className="text-xs text-stone-600 line-through ml-2">
                    ${food.price.toFixed(2)}
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                Description
              </h4>
              <p className="text-sm text-stone-700 leading-relaxed">
                {food.description}
              </p>
            </div>

            {/* Ingredients */}
            {ingredientsList.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-600 mb-2">
                  Fresh Ingredients
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {ingredientsList.map((ing, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-full text-xs font-medium bg-stone-100 text-stone-700"
                    >
                      {ing}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Special Instructions */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                Special Instructions (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="E.g., Extra sauce, no onions, well done..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-3 text-xs rounded-xl bg-stone-50 border border-stone-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>
          </div>

          {/* Footer Controls */}
          <div className="p-4 sm:p-6 border-t border-stone-100 bg-stone-50/70 flex items-center justify-between gap-4">
            {/* Quantity Selector */}
            <div className="flex items-center border border-stone-300 rounded-full bg-white px-2 py-1 shadow-xs">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 flex items-center justify-center text-stone-600 hover:text-stone-900"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 text-center text-sm font-bold text-stone-900">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-8 h-8 flex items-center justify-center text-stone-600 hover:text-stone-900"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Add to Basket button */}
            <button
              onClick={handleAdd}
              disabled={adding}
              className="flex-1 py-3.5 px-6 rounded-full text-sm font-bold bg-brand-500 hover:bg-brand-600 text-white shadow-md shadow-brand-500/20 flex items-center justify-center gap-2 transition-all"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Add to Basket • ${totalPrice}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default FoodDetailModal;
