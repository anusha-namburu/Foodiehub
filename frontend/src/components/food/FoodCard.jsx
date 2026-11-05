import React from 'react';
import { Star, Plus, Minus, Flame, Eye } from 'lucide-react';
import { useCart } from '../../context/CartContext';

const FoodCard = ({ food, onOpenDetails }) => {
  const { cartItems, addToCart, updateQuantity } = useCart();

  const cartItem = cartItems.find((i) => i.food_item_id === food.id);
  const quantityInCart = cartItem ? cartItem.quantity : 0;

  const currentPrice = food.discounted_price || food.price;
  const hasDiscount = !!food.discounted_price;

  return (
    <div className="group bg-white rounded-3xl p-3.5 border border-stone-200/70 shadow-soft hover:shadow-card hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
      {/* Top Image area */}
      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-stone-100 mb-3 cursor-pointer" onClick={() => onOpenDetails(food)}>
        <img
          src={food.image_url}
          alt={food.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Veg / Non-veg Badge */}
        <div className="absolute top-2.5 left-2.5 z-10">
          <div
            className={`w-5 h-5 rounded-md flex items-center justify-center bg-white/95 backdrop-blur-xs shadow-xs border ${
              food.is_veg ? 'border-emerald-600' : 'border-red-600'
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                food.is_veg ? 'bg-emerald-600' : 'bg-red-600'
              }`}
            />
          </div>
        </div>

        {/* Badges: Bestseller / Spicy */}
        <div className="absolute top-2.5 right-2.5 flex flex-col items-end gap-1">
          {food.is_bestseller && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-amber-500 text-white shadow-xs">
              Bestseller
            </span>
          )}
          {food.is_spicy && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500/90 text-white flex items-center gap-0.5 shadow-xs">
              <Flame className="w-3 h-3 fill-white" /> Spicy
            </span>
          )}
        </div>

        {/* Hover Quick View Overlay */}
        <div className="absolute inset-0 bg-stone-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="px-3 py-1.5 rounded-full bg-white/90 text-xs font-bold text-stone-900 flex items-center gap-1.5 shadow-md">
            <Eye className="w-3.5 h-3.5" /> Quick View
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-1 mb-1">
            <h3 
              onClick={() => onOpenDetails(food)}
              className="text-base font-bold text-stone-900 line-clamp-1 group-hover:text-brand-600 transition-colors cursor-pointer"
            >
              {food.name}
            </h3>
            <div className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md shrink-0">
              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
              <span>{food.rating || 4.8}</span>
            </div>
          </div>

          <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed mb-3">
            {food.description}
          </p>
        </div>

        {/* Pricing and Cart Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-stone-100 mt-auto">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-extrabold text-stone-900">
                ${currentPrice.toFixed(2)}
              </span>
              {hasDiscount && (
                <span className="text-xs text-stone-600 line-through">
                  ${food.price.toFixed(2)}
                </span>
              )}
            </div>
          </div>

          {/* Add / Qty Controls */}
          {quantityInCart > 0 ? (
            <div className="flex items-center border border-brand-500 rounded-full bg-brand-50/60 overflow-hidden shadow-xs">
              <button
                onClick={() => updateQuantity(cartItem.id, quantityInCart - 1)}
                className="w-7 h-7 flex items-center justify-center text-brand-700 hover:bg-brand-500 hover:text-white transition-colors"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 text-xs font-bold text-brand-900">
                {quantityInCart}
              </span>
              <button
                onClick={() => updateQuantity(cartItem.id, quantityInCart + 1)}
                className="w-7 h-7 flex items-center justify-center text-brand-700 hover:bg-brand-500 hover:text-white transition-colors"
                aria-label="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => addToCart(food, 1)}
              className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-brand-50 text-brand-600 hover:bg-brand-500 hover:text-white border border-brand-200 transition-all shadow-xs flex items-center gap-1 active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FoodCard;
