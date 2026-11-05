import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, Star, Clock, Bike, X, RotateCcw } from 'lucide-react';
import { restaurantAPI } from '../api/client';
import RestaurantCard from '../components/restaurant/RestaurantCard';

const RestaurantsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [restaurants, setRestaurants] = useState([]);
  const [cuisines, setCuisines] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCuisine, setSelectedCuisine] = useState(searchParams.get('cuisine') || searchParams.get('category') || 'All');
  const [minRating, setMinRating] = useState(searchParams.get('rating') || '');
  const [maxTime, setMaxTime] = useState(searchParams.get('max_time') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'rating_desc');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Load cuisines once
  useEffect(() => {
    restaurantAPI.getCuisines().then((res) => {
      if (res.success) {
        setCuisines(['All', ...res.cuisines]);
      }
    }).catch(console.error);
  }, []);

  // Fetch restaurants when filters change
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
        if (res.success) {
          setRestaurants(res.restaurants || []);
        }
      } catch (err) {
        console.error('Restaurant fetch error:', err);
      } finally {
        setLoading(false);
      }
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-stone-900 tracking-tight">
            Explore Restaurants
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 font-medium">
            Discover {restaurants.length} kitchens ready to deliver to your doorstep
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
