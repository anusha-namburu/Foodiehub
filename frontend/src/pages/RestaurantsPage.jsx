import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, Star, Clock, Bike, X, RotateCcw, MapPin, Navigation, AlertCircle, CheckCircle2 } from 'lucide-react';
import { restaurantAPI } from '../api/client';
import { fallbackRestaurants } from '../utils/fallbackData';
import { useLocation } from '../context/LocationContext';
import RestaurantCard from '../components/restaurant/RestaurantCard';

const RestaurantsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentLocation, calculateDistanceKm, setIsLocationModalOpen } = useLocation();
  const [restaurants, setRestaurants] = useState([]);
  const [cuisines, setCuisines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOfflineFallback, setIsOfflineFallback] = useState(false);

  // Filters state
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCuisine, setSelectedCuisine] = useState(searchParams.get('cuisine') || searchParams.get('category') || 'All');
  const [minRating, setMinRating] = useState(searchParams.get('rating') || '');
  const [maxTime, setMaxTime] = useState(searchParams.get('max_time') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'rating_desc');

  // Load cuisines
  useEffect(() => {
    restaurantAPI.getCuisines().then((res) => {
      if (res.success && res.cuisines?.length > 0) {
        const filtered = res.cuisines.filter((c) => c !== 'Drinks' && c !== 'Drinks & Beverages');
        const unique = Array.from(new Set(['All', 'Smoothies', ...filtered]));
        setCuisines(unique);
      } else {
        setCuisines(['All', 'Smoothies', 'Biryani', 'Pizza', 'Burgers', 'Sushi', 'Salads', 'Pasta', 'Desserts']);
      }
    }).catch(() => {
      setCuisines(['All', 'Smoothies', 'Biryani', 'Pizza', 'Burgers', 'Sushi', 'Salads', 'Pasta', 'Desserts']);
    });
  }, []);

  // Fetch restaurants with intelligent fallback
  useEffect(() => {
    const fetchRestaurants = async () => {
      setLoading(true);
      try {
        const params = {};
        if (search.trim()) params.search = search.trim();
        if (selectedCuisine && selectedCuisine !== 'All') params.cuisine = selectedCuisine;
        if (minRating) params.rating = minRating;
        if (maxTime) params.max_time = maxTime;
        if (sortBy) params.sort = sortBy;

        const res = await restaurantAPI.getAll(params);
        if (res.success && res.restaurants?.length > 0) {
          setRestaurants(res.restaurants);
          setIsOfflineFallback(false);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.warn('Backend unavailable, using rich local fallback data:', err);
      }

      // Fallback Data processing with client-side filtering
      let list = [...fallbackRestaurants];

      if (search.trim()) {
        const q = search.toLowerCase();
        list = list.filter((r) => r.name.toLowerCase().includes(q) || r.cuisine_type.toLowerCase().includes(q));
      }
      if (selectedCuisine && selectedCuisine !== 'All') {
        list = list.filter((r) => r.cuisine_type.toLowerCase().includes(selectedCuisine.toLowerCase()));
      }
      if (minRating) {
        list = list.filter((r) => r.rating >= parseFloat(minRating));
      }
      if (maxTime) {
        list = list.filter((r) => r.delivery_time_min <= parseInt(maxTime));
      }
      if (sortBy === 'rating_desc') {
        list.sort((a, b) => b.rating - a.rating);
      } else if (sortBy === 'delivery_time_asc') {
        list.sort((a, b) => a.delivery_time_min - b.delivery_time_min);
      } else if (sortBy === 'delivery_fee_asc') {
        list.sort((a, b) => a.delivery_fee - b.delivery_fee);
      } else if (sortBy === 'name_asc') {
        list.sort((a, b) => a.name.localeCompare(b.name));
      }

      setRestaurants(list);
      setIsOfflineFallback(true);
      setLoading(false);
    };

    fetchRestaurants();
  }, [search, selectedCuisine, minRating, maxTime, sortBy]);

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCuisine('All');
    setMinRating('');
    setMaxTime('');
    setSortBy('rating_desc');
    setSearchParams({});
  };

  const activeFilterCount = (selectedCuisine !== 'All' ? 1 : 0) + (minRating ? 1 : 0) + (maxTime ? 1 : 0) + (search ? 1 : 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* GPS Location & Live Delivery Banner */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-cream-100 via-amber-50 to-brand-50 border border-brand-200/70 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-500 text-white flex items-center justify-center shadow-md shadow-brand-500/25">
            <Navigation className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase text-brand-700 tracking-wide">
                Delivering to Your GPS Location
              </span>
              {currentLocation.isGPS && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                  🛰️ GPS Verified
                </span>
              )}
            </div>
            <p className="text-sm font-bold text-stone-900 truncate max-w-md">
              {currentLocation.address}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsLocationModalOpen(true)}
          className="px-4 py-2 rounded-full text-xs font-bold bg-white hover:bg-stone-50 border border-stone-200 text-stone-800 shadow-xs flex items-center gap-1.5 self-start sm:self-center transition-all"
        >
          <MapPin className="w-3.5 h-3.5 text-brand-600" />
          <span>Change Location</span>
        </button>
      </div>

      {/* Top Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
        <div>
          <h1 className="text-3xl font-black text-stone-900 tracking-tight">
            Explore Restaurants
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 font-medium">
            Discover {restaurants.length} kitchens ready to deliver to {currentLocation.city}
          </p>
        </div>

        {/* Search & Sort */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-600" />
            <input
              type="text"
              placeholder="Search by restaurant name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-full bg-white border border-stone-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-600 hover:text-stone-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3.5 py-2 text-xs font-semibold rounded-full bg-white border border-stone-200 text-stone-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 cursor-pointer"
          >
            <option value="rating_desc">Highest Rated ⭐</option>
            <option value="delivery_time_asc">Fastest Delivery ⚡</option>
            <option value="delivery_fee_asc">Lowest Delivery Fee 🚲</option>
            <option value="name_asc">Name (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Cuisines Bar */}
      {cuisines.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {cuisines.map((c) => {
            const isSelected = selectedCuisine.toLowerCase() === c.toLowerCase();
            return (
              <button
                key={c}
                onClick={() => setSelectedCuisine(c)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                  isSelected
                    ? 'bg-stone-900 text-white shadow-sm'
                    : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200/80'
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>
      )}

      {/* Secondary Quick Filters bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-white border border-stone-200/70 shadow-soft">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-bold text-stone-500 uppercase tracking-wider text-[11px] mr-1">
            Filter:
          </span>

          {/* Rating filter chips */}
          <button
            onClick={() => setMinRating(minRating === '4.5' ? '' : '4.5')}
            className={`px-3 py-1 rounded-full font-bold flex items-center gap-1 border transition-all ${
              minRating === '4.5'
                ? 'bg-amber-50 text-amber-800 border-amber-300'
                : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
            }`}
          >
            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
            <span>4.5+ Rating</span>
          </button>

          <button
            onClick={() => setMinRating(minRating === '4.0' ? '' : '4.0')}
            className={`px-3 py-1 rounded-full font-bold flex items-center gap-1 border transition-all ${
              minRating === '4.0'
                ? 'bg-amber-50 text-amber-800 border-amber-300'
                : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
            }`}
          >
            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
            <span>4.0+ Rating</span>
          </button>

          {/* Delivery time chips */}
          <button
            onClick={() => setMaxTime(maxTime === '25' ? '' : '25')}
            className={`px-3 py-1 rounded-full font-bold flex items-center gap-1 border transition-all ${
              maxTime === '25'
                ? 'bg-brand-50 text-brand-800 border-brand-300'
                : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
            }`}
          >
            <Clock className="w-3 h-3 text-brand-600" />
            <span>Under 25 mins</span>
          </button>

          <button
            onClick={() => setMaxTime(maxTime === '35' ? '' : '35')}
            className={`px-3 py-1 rounded-full font-bold flex items-center gap-1 border transition-all ${
              maxTime === '35'
                ? 'bg-brand-50 text-brand-800 border-brand-300'
                : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
            }`}
          >
            <Clock className="w-3 h-3 text-brand-600" />
            <span>Under 35 mins</span>
          </button>
        </div>

        {activeFilterCount > 0 && (
          <button
            onClick={handleResetFilters}
            className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 hover:underline ml-auto"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Filters ({activeFilterCount})</span>
          </button>
        )}
      </div>

      {/* Restaurants Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-72 rounded-3xl bg-stone-200/70" />
          ))}
        </div>
      ) : restaurants.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-stone-200/70 p-8 space-y-4 shadow-soft">
          <div className="w-20 h-20 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center text-4xl mx-auto">
            🍽️
          </div>
          <h3 className="text-xl font-bold text-stone-900">No restaurants match your filters</h3>
          <p className="text-xs sm:text-sm text-stone-600 max-w-sm mx-auto">
            Try resetting your search query or selecting a different cuisine filter to see more options.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-6 py-2.5 rounded-full text-xs font-bold bg-brand-500 hover:bg-brand-600 text-white shadow-sm"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.map((rest) => (
            <RestaurantCard key={rest.id} restaurant={rest} />
          ))}
        </div>
      )}

    </div>
  );
};

export default RestaurantsPage;
