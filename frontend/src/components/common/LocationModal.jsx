import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Navigation, X, Check, Search, AlertCircle, Compass } from 'lucide-react';
import { useLocation, PRESET_LOCATIONS, GUNTUR_LOCATIONS } from '../../context/LocationContext';

const LocationModal = () => {
  const {
    isLocationModalOpen,
    setIsLocationModalOpen,
    currentLocation,
    detectGPSLocation,
    isDetectingGPS,
    gpsError,
    selectLocation,
  } = useLocation();

  const [searchQuery, setSearchQuery] = useState('');

  if (!isLocationModalOpen) return null;

  const filteredPresets = PRESET_LOCATIONS.filter(
    (loc) =>
      (loc.name && loc.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      loc.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsLocationModalOpen(false)}
          className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 z-10 space-y-5"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center">
                <Compass className="w-5 h-5 animate-spin-slow" />
              </div>
              <div>
                <h3 className="text-lg font-black text-stone-900">Choose Delivery Location</h3>
                <p className="text-xs text-stone-600">Select where you want your food delivered</p>
              </div>
            </div>
            <button
              onClick={() => setIsLocationModalOpen(false)}
              className="p-2 rounded-full hover:bg-stone-100 text-stone-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Real GPS Detection Button */}
          <button
            onClick={detectGPSLocation}
            disabled={isDetectingGPS}
            className="w-full p-4 rounded-2xl bg-gradient-to-r from-brand-500 to-amber-500 hover:from-brand-600 hover:to-amber-600 text-white shadow-md shadow-brand-500/25 flex items-center justify-between transition-all group active:scale-98"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                <Navigation className={`w-5 h-5 text-white ${isDetectingGPS ? 'animate-spin' : ''}`} />
              </div>
              <div className="text-left">
                <span className="text-sm font-black block">
                  {isDetectingGPS ? 'Detecting via Device GPS...' : 'Use Current GPS Location'}
                </span>
                <span className="text-[11px] text-white/90">
                  Auto-detect exact latitude, longitude & street address
                </span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-white/20 text-[11px] font-bold">
              GPS
            </span>
          </button>

          {/* GPS Error Alert */}
          {gpsError && (
            <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{gpsError}</span>
            </div>
          )}

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-600" />
            <input
              type="text"
              placeholder="Search by city or neighborhood..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-stone-50 border border-stone-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          {/* Current Selection details */}
          <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 max-w-[320px]">
              <MapPin className="w-4 h-4 text-brand-600 shrink-0" />
              <div className="truncate">
                <span className="font-bold text-stone-900 block truncate">
                  {currentLocation.address}
                </span>
                <span className="text-[10px] text-stone-600">
                  Lat: {currentLocation.latitude?.toFixed(4)}, Lon: {currentLocation.longitude?.toFixed(4)}
                  {currentLocation.isGPS && ' • Verified Device GPS'}
                </span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800">
              Active
            </span>
          </div>

          {/* Guntur Delivery Neighborhoods */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black text-brand-700 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-brand-600" />
                Guntur Delivery Zones
              </span>
              <span className="text-[10px] text-stone-600 font-medium">Fast 20-30 min delivery</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {GUNTUR_LOCATIONS.map((loc) => {
                const isSelected =
                  currentLocation.address === loc.address ||
                  (currentLocation.city === 'Guntur' && currentLocation.address.includes(loc.name));
                return (
                  <button
                    key={loc.name}
                    onClick={() => selectLocation(loc)}
                    className={`p-2 rounded-xl border text-left text-xs transition-all flex flex-col justify-between group ${
                      isSelected
                        ? 'border-brand-500 bg-brand-50 font-bold text-brand-900 shadow-sm'
                        : 'border-stone-200 hover:border-brand-300 hover:bg-stone-50 bg-white text-stone-700'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-bold text-stone-900 group-hover:text-brand-600">{loc.name}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-brand-600 shrink-0" />}
                    </div>
                    <span className="text-[10px] text-stone-600 truncate mt-0.5">{loc.tag}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* All Delivery Hubs */}
          <div className="space-y-2 pt-1 border-t border-stone-100">
            <span className="text-[11px] font-bold text-stone-600 uppercase tracking-wider block">
              All Available Hubs
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-36 overflow-y-auto pr-1">
              {filteredPresets.map((loc) => {
                const label = loc.name || loc.city;
                const isSelected = currentLocation.address === loc.address;
                return (
                  <button
                    key={`${loc.city}-${label}`}
                    onClick={() => selectLocation(loc)}
                    className={`p-2 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-brand-500 bg-brand-50/70 font-bold text-brand-900'
                        : 'border-stone-200 hover:border-stone-300 bg-white text-stone-700'
                    }`}
                  >
                    <span className="truncate">{label}</span>
                    {isSelected && <Check className="w-3 h-3 text-brand-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default LocationModal;
