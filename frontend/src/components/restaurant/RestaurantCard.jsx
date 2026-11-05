import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, Bike, Heart } from 'lucide-react';
import { restaurantAPI } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const RestaurantCard = ({ restaurant }) => {
  const { isAuthenticated } = useAuth();
  const { showToast } = useCart();
  const [isFav, setIsFav] = useState(restaurant.is_favourite || false);
  const [favLoading, setFavLoading] = useState(false);

  const handleToggleFav = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      showToast('Please login to save favourite restaurants', 'error');
      return;
    }

    try {
      setFavLoading(true);
      const res = await restaurantAPI.toggleFavourite(restaurant.id);
      if (res.success) {
        setIsFav(res.is_favourite);
        showToast(res.message);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setFavLoading(false);
    }
  };

  return (
    <Link
      to={`/restaurants/${restaurant.id}`}
      className="group bg-white rounded-3xl p-3 border border-stone-200/70 shadow-soft hover:shadow-card hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
    >
      {/* Media */}
      <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-stone-100 mb-3">
        <img
          src={restaurant.image_url}
          alt={restaurant.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Featured Tag */}
        {restaurant.is_featured && (
          <div className="absolute top-3 left-3 z-10">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-brand-500 text-white shadow-xs">
              Featured
            </span>
          </div>
        )}

        {/* Favourite Button */}
        <button
          onClick={handleToggleFav}
          disabled={favLoading}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-stone-700 shadow-md flex items-center justify-center transition-transform active:scale-90"
          title={isFav ? 'Remove from favourites' : 'Save to favourites'}
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isFav ? 'fill-red-500 text-red-500' : 'text-stone-600'
            }`}
          />
        </button>

        {/* Time Overlay Pill */}
        <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-full text-xs font-bold text-stone-800 shadow-xs flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-brand-600" />
          <span>{restaurant.delivery_time_min} mins</span>
        </div>
      </div>

      {/* Info Body */}
      <div className="px-1.5 pb-1 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1">
            <h3 className="text-base font-bold text-stone-900 group-hover:text-brand-600 transition-colors line-clamp-1">
              {restaurant.name}
            </h3>
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full shrink-0">
              <Star className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
              <span>{restaurant.rating.toFixed(1)}</span>
              <span className="text-[10px] text-emerald-600 font-normal">
                ({restaurant.total_reviews})
              </span>
            </div>
          </div>

          <p className="text-xs text-stone-600 font-medium mb-3 line-clamp-1">
            {restaurant.cuisine_type}
          </p>
        </div>

        {/* Delivery & Min Order Bar */}
        <div className="flex items-center justify-between text-xs text-stone-600 pt-2 border-t border-stone-100 font-medium">
          <div className="flex items-center gap-1.5">
            <Bike className="w-3.5 h-3.5 text-stone-600" />
            <span>
              {restaurant.delivery_fee === 0 ? (
                <strong className="text-emerald-600 font-bold">Free Delivery</strong>
              ) : (
                `₹${Math.round(restaurant.delivery_fee)} Delivery`
              )}
            </span>
          </div>
          <span>Min. ₹${Math.round(restaurant.min_order)}</span>
        </div>
      </div>
    </Link>
  );
};

export default RestaurantCard;
