import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Star, 
  Clock, 
  Bike, 
  MapPin, 
  Heart, 
  Share2, 
  MessageSquare, 
  Sparkles, 
  Plus, 
  ArrowLeft 
} from 'lucide-react';
import { restaurantAPI, reviewAPI } from '../api/client';
import FoodCard from '../components/food/FoodCard';
import FoodDetailModal from '../components/food/FoodDetailModal';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const RestaurantDetailPage = () => {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuth();
  const { showToast } = useCart();

  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedFood, setSelectedFood] = useState(null);
  const [isFav, setIsFav] = useState(false);

  // Review Form state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const res = await restaurantAPI.getDetail(id);
        if (res.success && res.restaurant) {
          setRestaurant(res.restaurant);
          setIsFav(res.restaurant.is_favourite);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const handleToggleFav = async () => {
    if (!isAuthenticated) {
      showToast('Please login to bookmark restaurants', 'error');
      return;
    }
    try {
      const res = await restaurantAPI.toggleFavourite(restaurant.id);
      if (res.success) {
        setIsFav(res.is_favourite);
        showToast(res.message);
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showToast('Please login to leave a review', 'error');
      return;
    }
    if (!reviewComment.trim()) return;

    try {
      setSubmittingReview(true);
      const res = await reviewAPI.addReview({
        restaurant_id: restaurant.id,
        rating: reviewRating,
        comment: reviewComment.trim(),
      });
      if (res.success) {
        showToast('Review submitted! Thank you.');
        setReviewComment('');
        setShowReviewForm(false);
        // Refresh details to see new review and updated rating
        const refreshed = await restaurantAPI.getDetail(id);
        if (refreshed.success) setRestaurant(refreshed.restaurant);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 animate-pulse space-y-6">
        <div className="h-64 sm:h-80 rounded-3xl bg-stone-200" />
        <div className="h-10 w-64 bg-stone-200 rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="h-60 bg-stone-200 rounded-3xl" />
          <div className="h-60 bg-stone-200 rounded-3xl" />
          <div className="h-60 bg-stone-200 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <h2 className="text-xl font-bold">Restaurant not found</h2>
        <Link to="/restaurants" className="text-sm font-bold text-brand-600 underline">
          Back to all restaurants
        </Link>
      </div>
    );
  }

  const menu = restaurant.menu || {};
  const categoriesList = ['All', ...Object.keys(menu)];

  return (
    <div className="space-y-8 pb-20">
      
      {/* 1. RESTAURANT BANNER HERO */}
      <section className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          
          <div className="relative h-64 sm:h-80 md:h-96 rounded-3xl overflow-hidden shadow-card border border-stone-200/80">
            <img
              src={restaurant.banner_url || restaurant.image_url}
              alt={restaurant.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-900/30 to-transparent" />
            
            {/* Top Bar inside image */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
              <Link
                to="/restaurants"
                className="p-2.5 rounded-full bg-white/90 hover:bg-white text-stone-800 shadow-md transition-all active:scale-95 flex items-center gap-1.5 text-xs font-bold"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back</span>
              </Link>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggleFav}
                  className="p-2.5 rounded-full bg-white/90 hover:bg-white text-stone-800 shadow-md transition-all active:scale-95"
                  title="Bookmark"
                >
                  <Heart
                    className={`w-4 h-4 ${
                      isFav ? 'fill-red-500 text-red-500' : 'text-stone-700'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Bottom Meta inside Image */}
            <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-500 text-white shadow-xs">
                  {restaurant.cuisine_type}
                </span>
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500 text-stone-900 text-xs font-extrabold">
                  <Star className="w-3.5 h-3.5 fill-stone-900" />
                  <span>{restaurant.rating.toFixed(1)}</span>
                  <span className="text-[10px] font-medium opacity-80">
                    ({restaurant.total_reviews} reviews)
                  </span>
                </div>
              </div>

              <h1 className="text-2xl sm:text-4xl font-black drop-shadow-md">
                {restaurant.name}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-stone-200 font-medium">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-brand-400" />
                  <span>{restaurant.address}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>{restaurant.delivery_time_min} mins prep & delivery</span>
                </div>
                <div className="flex items-center gap-1">
                  <Bike className="w-4 h-4 text-emerald-400" />
                  <span>${restaurant.delivery_fee.toFixed(2)} delivery</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. CATEGORY TABS */}
      <section className="sticky top-20 z-30 bg-[#FAF8F5]/90 backdrop-blur-md border-y border-stone-200/80 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
            {categoriesList.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-brand-500 text-white shadow-sm'
                    : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-white hover:bg-stone-100 text-stone-800 border border-stone-200 shadow-xs shrink-0"
          >
            <MessageSquare className="w-3.5 h-3.5 text-brand-600" />
            <span>Write a Review</span>
          </button>
        </div>
      </section>

      {/* 3. REVIEW MODAL / FORM EXPANDER */}
      {showReviewForm && (
        <section className="max-w-3xl mx-auto px-4">
          <form
            onSubmit={handleSubmitReview}
            className="p-6 rounded-3xl bg-white border border-stone-200/80 shadow-card space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-stone-900">
                Rate your experience at {restaurant.name}
              </h3>
              <button
                type="button"
                onClick={() => setShowReviewForm(false)}
                className="text-stone-600 hover:text-stone-600 text-xs font-bold"
              >
                Close
              </button>
            </div>

            {/* Stars */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-stone-600">Your Rating:</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    className="p-1 focus:outline-none"
                  >
                    <Star
                      className={`w-6 h-6 transition-colors ${
                        star <= reviewRating
                          ? 'fill-amber-500 text-amber-500'
                          : 'text-stone-300 hover:text-amber-400'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <textarea
              rows={3}
              required
              placeholder="What did you love about the food? Mention crust, flavors, delivery speed..."
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              className="w-full p-3 text-xs rounded-2xl bg-stone-50 border border-stone-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowReviewForm(false)}
                className="px-4 py-2 rounded-full text-xs font-semibold text-stone-600 hover:bg-stone-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingReview}
                className="px-6 py-2 rounded-full text-xs font-bold bg-brand-500 hover:bg-brand-600 text-white shadow-sm"
              >
                {submittingReview ? 'Posting...' : 'Post Review'}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* 4. MENU ITEMS BY CATEGORY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {Object.keys(menu).length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-stone-200 p-8">
            <p className="text-sm text-stone-600">No items available currently.</p>
          </div>
        ) : (
          Object.entries(menu).map(([categoryName, items]) => {
            if (selectedCategory !== 'All' && selectedCategory !== categoryName) {
              return null;
            }

            return (
              <div key={categoryName} className="space-y-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl sm:text-2xl font-black text-stone-900">
                    {categoryName}
                  </h2>
                  <span className="text-xs font-bold text-stone-600 bg-stone-100 px-2.5 py-0.5 rounded-full">
                    {items.length} {items.length === 1 ? 'dish' : 'dishes'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {items.map((food) => (
                    <FoodCard
                      key={food.id}
                      food={food}
                      onOpenDetails={(item) => setSelectedFood(item)}
                    />
                  ))}
                </div>
              </div>
            );
          })
        )}
      </section>

      {/* 5. REVIEWS SECTION */}
      {restaurant.reviews && restaurant.reviews.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-stone-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-black text-stone-900">Customer Reviews</h3>
              <p className="text-xs text-stone-600">Verified dining feedback for {restaurant.name}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {restaurant.reviews.map((rev) => (
              <div
                key={rev.id}
                className="p-5 rounded-2xl bg-white border border-stone-200/80 shadow-soft space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < Math.floor(rev.rating)
                            ? 'fill-amber-500 text-amber-500'
                            : 'text-stone-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[11px] text-stone-600">{rev.created_at}</span>
                </div>

                <p className="text-xs text-stone-700 leading-relaxed italic">
                  "{rev.comment}"
                </p>

                <div className="flex items-center gap-2 pt-2 border-t border-stone-100">
                  <img
                    src={rev.user_avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${rev.user_name}`}
                    alt={rev.user_name}
                    className="w-7 h-7 rounded-full object-cover"
                  />
                  <span className="text-xs font-bold text-stone-900">{rev.user_name}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Modal */}
      {selectedFood && (
        <FoodDetailModal
          food={selectedFood}
          onClose={() => setSelectedFood(null)}
        />
      )}

    </div>
  );
};

export default RestaurantDetailPage;
