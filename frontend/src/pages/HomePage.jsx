import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Search, 
  ArrowRight, 
  Star, 
  Clock, 
  Bike, 
  ShieldCheck, 
  Sparkles, 
  Tag, 
  Quote, 
  MapPin, 
  Navigation 
} from 'lucide-react';
import { restaurantAPI, foodAPI, couponAPI, reviewAPI } from '../api/client';
import { fallbackRestaurants, fallbackCategories, fallbackFoods, fallbackCoupons } from '../utils/fallbackData';
import { useLocation } from '../context/LocationContext';
import RestaurantCard from '../components/restaurant/RestaurantCard';
import FoodCard from '../components/food/FoodCard';
import FoodDetailModal from '../components/food/FoodDetailModal';
import { useCart } from '../context/CartContext';

const HomePage = () => {
  const navigate = useNavigate();
  const { showToast } = useCart();
  const { currentLocation, setIsLocationModalOpen } = useLocation();
  const [categories, setCategories] = useState(fallbackCategories);
  const [featuredRestaurants, setFeaturedRestaurants] = useState(fallbackRestaurants.slice(0, 3));
  const [bestsellers, setBestsellers] = useState(fallbackFoods);
  const [coupons, setCoupons] = useState(fallbackCoupons);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFood, setSelectedFood] = useState(null);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setLoading(true);
        const [catRes, restRes, foodRes, coupRes, revRes] = await Promise.all([
          foodAPI.getCategories().catch(() => ({ success: false })),
          restaurantAPI.getAll({ featured: 'true' }).catch(() => ({ success: false })),
          foodAPI.getBestsellers(8).catch(() => ({ success: false })),
          couponAPI.getCoupons().catch(() => ({ success: false })),
          reviewAPI.getReviews({ featured: 'true' }).catch(() => ({ success: false })),
        ]);

        if (catRes.success && catRes.categories?.length > 0) setCategories(catRes.categories);
        if (restRes.success && restRes.restaurants?.length > 0) setFeaturedRestaurants(restRes.restaurants);
        if (foodRes.success && foodRes.items?.length > 0) setBestsellers(foodRes.items);
        if (coupRes.success && coupRes.coupons?.length > 0) setCoupons(coupRes.coupons);
        if (revRes.success && revRes.reviews?.length > 0) setReviews(revRes.reviews);
      } catch (err) {
        console.warn('Backend unavailable, using initial data');
      } finally {
        setLoading(false);
      }
    };
    loadHomeData();
  }, []);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/restaurants?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleNewsletter = (e) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setNewsletterSubmitted(true);
      showToast('Thank you for subscribing! Check your email for special food vouchers.');
      setNewsletterEmail('');
    }
  };

  return (
    <div className="space-y-16 pb-20">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-8 pb-16 lg:py-24 bg-gradient-to-b from-cream-100/70 via-cream-50/50 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              
              {/* GPS Location Pill */}
              <button
                onClick={() => setIsLocationModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-stone-200/90 hover:border-brand-300 text-stone-700 text-xs font-bold shadow-xs hover:shadow-sm transition-all"
              >
                <Navigation className="w-3.5 h-3.5 text-brand-600 animate-pulse" />
                <span>Deliver to: <strong className="text-brand-600">{currentLocation.name ? `${currentLocation.name}, ${currentLocation.city}` : currentLocation.city}</strong></span>
                <span className="text-[10px] bg-brand-50 text-brand-700 px-1.5 py-0.2 rounded font-black">GPS</span>
              </button>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-stone-900 tracking-tight leading-[1.15]">
                Delicious Food, <br className="hidden sm:inline" />
                <span className="text-brand-600 underline decoration-amber-400 decoration-wavy decoration-2">
                  Delivered to Your Door.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-stone-600 max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed">
                Craving artisanal woodfired pizza, juicy smash burgers, or fresh nigiri sushi? Order from top-rated neighbourhood culinary kitchens in minutes.
              </p>

              {/* Main Search Bar */}
              <form onSubmit={handleHeroSearch} className="max-w-lg mx-auto lg:mx-0 flex flex-col sm:flex-row gap-2 p-2 rounded-2xl bg-white shadow-card border border-stone-200/80">
                <div className="relative flex-1 flex items-center pl-3">
                  <Search className="w-5 h-5 text-stone-600" />
                  <input
                    type="text"
                    placeholder="Search dishes, burgers, pizza, sushi..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 text-sm text-stone-800 placeholder:text-stone-600 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl text-sm font-bold bg-brand-500 hover:bg-brand-600 text-white shadow-md shadow-brand-500/20 transition-all active:scale-95 shrink-0"
                >
                  Find Food
                </button>
              </form>

              {/* Trust Badges */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 pt-2 text-xs font-semibold text-stone-600">
                <div className="flex items-center gap-1.5">
                  <Bike className="w-4 h-4 text-brand-600" />
                  <span>30-min average delivery</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>100% Contactless payment</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                  <span>4.9/5 from 20,000+ reviews</span>
                </div>
              </div>
            </div>

            {/* Right Visual Floating Collage */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto w-full max-w-md lg:max-w-none aspect-square">
                <div className="absolute inset-0 bg-gradient-to-tr from-brand-400/20 to-amber-300/30 rounded-full blur-3xl -z-10 animate-pulse" />
                
                <img
                  src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&fit=crop"
                  alt="Gourmet Food Feast"
                  className="w-full h-full object-cover rounded-3xl shadow-2xl border-4 border-white"
                />

                {/* Floating Card 1: 30 Min Delivery */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="absolute -top-4 -left-4 sm:-left-6 bg-white/95 backdrop-blur-md p-3 rounded-2xl shadow-card border border-stone-100 flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center text-xl">
                    ⚡
                  </div>
                  <div>
                    <span className="text-xs font-bold text-stone-900 block">Superfast Delivery</span>
                    <span className="text-[11px] text-stone-600">Under 25 mins</span>
                  </div>
                </motion.div>

                {/* Floating Card 2: Rating */}
                <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.35 }}
                  className="absolute -bottom-6 -right-4 sm:-right-6 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-card border border-stone-100 flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
                    <Star className="w-5 h-5 fill-amber-500" />
                  </div>
                  <div>
                    <span className="text-xs font-extrabold text-stone-900 block">Top Rated Kitchens</span>
                    <span className="text-[11px] text-emerald-600 font-semibold">Over 500+ Dishes</span>
                  </div>
                </motion.div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. CATEGORIES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600">Explore Cuisines</span>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900">What are you in the mood for?</h2>
          </div>
          <Link
            to="/restaurants"
            className="text-xs sm:text-sm font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 group"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/restaurants?category=${cat.slug}`}
              className="group p-3 rounded-2xl bg-white border border-stone-200/70 hover:border-brand-500 shadow-soft hover:shadow-card hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-stone-100 mb-2 shadow-xs group-hover:scale-105 transition-transform">
                <img
                  src={cat.image_url}
                  alt={cat.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-xs font-bold text-stone-800 group-hover:text-brand-600 transition-colors">
                {cat.name}
              </span>
              <span className="text-[10px] text-stone-600 font-medium">
                {cat.items_count || 3} items
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. PROMO OFFERS & COUPONS BANNER */}
      {coupons.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 p-6 sm:p-10 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute right-0 bottom-0 translate-x-10 translate-y-10 w-64 h-64 bg-brand-500/10 rounded-full blur-2xl" />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
              <div className="lg:col-span-5 space-y-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold">
                  <Tag className="w-3.5 h-3.5" />
                  <span>Today's Special Deals</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black">Save big on your next meal</h3>
                <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                  Use coupon codes at checkout to unlock instant discounts, free delivery, and cashbacks.
                </p>
              </div>

              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {coupons.slice(0, 2).map((coup) => (
                  <div
                    key={coup.id}
                    className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-between"
                  >
                    <div>
                      <span className="text-xs text-amber-300 font-semibold uppercase tracking-wider block">
                        {coup.discount_type === 'percentage' ? `${coup.discount_value}% OFF` : `$${coup.discount_value} OFF`}
                      </span>
                      <p className="text-xs text-stone-200 mt-0.5 max-w-[180px] truncate">{coup.description}</p>
                    </div>
                    <div className="text-right">
                      <span className="px-3 py-1.5 rounded-xl bg-white text-stone-900 text-xs font-mono font-black tracking-wider shadow-sm select-all">
                        {coup.code}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 4. POPULAR RESTAURANTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600">Handpicked Quality</span>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900">Popular Restaurants Near You</h2>
          </div>
          <Link
            to="/restaurants"
            className="text-xs sm:text-sm font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 group"
          >
            <span>Explore All</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredRestaurants.map((restaurant) => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
          ))}
        </div>
      </section>

      {/* 5. BEST-SELLING DISHES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600">Customer Favorites</span>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900">Best-Selling Dishes</h2>
          </div>
          <Link
            to="/restaurants"
            className="text-xs sm:text-sm font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 group"
          >
            <span>Browse Menu</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {bestsellers.map((food) => (
            <FoodCard
              key={food.id}
              food={food}
              onOpenDetails={(item) => setSelectedFood(item)}
            />
          ))}
        </div>
      </section>

      {/* 6. NEWSLETTER SECTION */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-brand-500 text-white p-8 sm:p-12 text-center space-y-6 shadow-xl shadow-brand-500/20 relative overflow-hidden">
          <div className="max-w-xl mx-auto space-y-2">
            <h3 className="text-2xl sm:text-3xl font-black">Get $10 Off Your Next Order</h3>
            <p className="text-xs sm:text-sm text-brand-100 leading-relaxed">
              Subscribe to the FoodieHub newsletter to receive secret weekend coupon codes, chef specials, and new restaurant openings.
            </p>
          </div>

          <form onSubmit={handleNewsletter} className="max-w-md mx-auto flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              required
              placeholder="Enter your email address..."
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              className="flex-1 px-4 py-3 rounded-full text-xs text-stone-900 placeholder:text-stone-600 focus:outline-none bg-white shadow-sm"
            />
            <button
              type="submit"
              className="px-6 py-3 rounded-full text-xs font-bold bg-stone-900 hover:bg-black text-white transition-all shadow-md active:scale-95 shrink-0"
            >
              Subscribe Now
            </button>
          </form>
          {newsletterSubmitted && (
            <p className="text-xs font-bold text-amber-200 animate-fade-in">
              🎉 Welcome to the club! Check your inbox shortly.
            </p>
          )}
        </div>
      </section>

      {/* Food Details Modal */}
      {selectedFood && (
        <FoodDetailModal
          food={selectedFood}
          onClose={() => setSelectedFood(null)}
        />
      )}

    </div>
  );
};

export default HomePage;
