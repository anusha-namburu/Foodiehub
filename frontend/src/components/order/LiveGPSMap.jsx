import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Navigation, 
  MapPin, 
  Store, 
  Bike, 
  Compass, 
  Phone, 
  ShieldCheck, 
  Signal, 
  CheckCircle2 
} from 'lucide-react';
import { useLocation } from '../../context/LocationContext';

const LiveGPSMap = ({ order }) => {
  const { currentLocation, calculateDistanceKm } = useLocation();

  // Simulation of rider position along 0 to 100% of route
  const [riderProgress, setRiderProgress] = useState(() => {
    if (order.status === 'delivered') return 100;
    if (order.status === 'out_for_delivery') return 45;
    if (order.status === 'preparing') return 15;
    return 5;
  });

  const [riderSpeed, setRiderSpeed] = useState(24); // km/h

  useEffect(() => {
    if (order.status === 'delivered') {
      setRiderProgress(100);
      return;
    }

    if (order.status === 'out_for_delivery') {
      const interval = setInterval(() => {
        setRiderProgress((prev) => {
          if (prev >= 98) return 98;
          return prev + 1.5;
        });
        setRiderSpeed(Math.floor(20 + Math.random() * 12));
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [order.status]);

  const totalDistance = 3.2; // km
  const remainingDist = Math.max(0.1, ((100 - riderProgress) / 100) * totalDistance).toFixed(1);
  const remainingTimeMin = Math.max(2, Math.round((remainingDist / 20) * 60));

  // Bezier curve coordinate for moving rider: from (120, 220) to (480, 80)
  const t = riderProgress / 100;
  // Start: (80, 240), Control: (280, 100), End: (520, 120)
  const riderX = (1 - t) * (1 - t) * 80 + 2 * (1 - t) * t * 280 + t * t * 520;
  const riderY = (1 - t) * (1 - t) * 240 + 2 * (1 - t) * t * 80 + t * t * 140;

  return (
    <div className="bg-white rounded-3xl border border-stone-200/90 shadow-soft overflow-hidden">
      
      {/* Top GPS Telemetry Bar */}
      <div className="p-4 sm:p-5 bg-stone-900 text-white flex flex-wrap items-center justify-between gap-3 border-b border-stone-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            <Navigation className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black tracking-wide uppercase text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Live GPS Satellite Feed
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-stone-300 font-mono">
                3m Accuracy
              </span>
            </div>
            <p className="text-xs text-stone-300 font-medium mt-0.5">
              {order.status === 'delivered' ? 'Package successfully delivered' : `Rider is ${remainingDist} km away • Est. ${remainingTimeMin} mins`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="hidden sm:block text-right">
            <span className="text-[10px] text-stone-400 uppercase tracking-widest block">Speed</span>
            <span className="font-bold text-white">{order.status === 'delivered' ? '0' : riderSpeed} km/h</span>
          </div>
          <div className="hidden sm:block text-right">
            <span className="text-[10px] text-stone-400 uppercase tracking-widest block">Distance</span>
            <span className="font-bold text-emerald-400">{remainingDist} km</span>
          </div>
        </div>
      </div>

      {/* Stylized Interactive GPS Map Canvas */}
      <div className="relative h-64 sm:h-80 bg-[#1e232a] overflow-hidden select-none">
        
        {/* Map Grid / Streets background effect */}
        <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#64748b" strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          {/* Simulated Street Lines */}
          <path d="M 0 100 Q 250 80 600 120" stroke="#475569" strokeWidth="12" fill="none" />
          <path d="M 120 0 Q 180 180 200 350" stroke="#475569" strokeWidth="14" fill="none" />
          <path d="M 380 0 L 390 350" stroke="#475569" strokeWidth="10" fill="none" />
          <path d="M 0 240 L 600 220" stroke="#475569" strokeWidth="16" fill="none" />
        </svg>

        {/* Dynamic Route SVG */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 600 300" preserveAspectRatio="none">
          {/* Glowing Shadow line */}
          <path
            d="M 80 240 Q 280 80 520 140"
            fill="none"
            stroke="#f97316"
            strokeWidth="10"
            strokeOpacity="0.25"
            strokeLinecap="round"
          />
          {/* Animated active path */}
          <path
            d="M 80 240 Q 280 80 520 140"
            fill="none"
            stroke="#f97316"
            strokeWidth="4"
            strokeDasharray="8 6"
            strokeLinecap="round"
            className="animate-dash"
          />
        </svg>

        {/* 1. RESTAURANT PIN (Start) */}
        <div 
          className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10"
          style={{ left: '13%', top: '80%' }}
        >
          <div className="w-10 h-10 rounded-2xl bg-amber-500 text-stone-900 shadow-xl flex items-center justify-center font-bold border-2 border-white ring-4 ring-amber-500/30">
            <Store className="w-5 h-5 text-stone-950" />
          </div>
          <span className="mt-1.5 px-2 py-0.5 rounded-md bg-stone-900/90 text-[10px] font-bold text-white shadow-md border border-stone-700 whitespace-nowrap">
            {order.restaurant_name || 'Kitchen'}
          </span>
        </div>

        {/* 2. LIVE MOVING RIDER (Current GPS Position) */}
        <motion.div
          animate={{
            left: `${(riderX / 600) * 100}%`,
            top: `${(riderY / 300) * 100}%`,
          }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20"
        >
          {/* Radar ripple */}
          <div className="absolute w-14 h-14 rounded-full bg-brand-500/30 animate-ping -z-10" />
          
          <div className="w-12 h-12 rounded-2xl bg-brand-500 text-white shadow-2xl flex items-center justify-center border-2 border-white ring-4 ring-brand-500/40">
            <Bike className="w-6 h-6 animate-pulse" />
          </div>
          <div className="mt-1.5 px-2.5 py-0.5 rounded-full bg-brand-600 text-[10px] font-black text-white shadow-lg border border-brand-400 whitespace-nowrap flex items-center gap-1">
            <span>Rider: {Math.round(riderProgress)}%</span>
          </div>
        </motion.div>

        {/* 3. CUSTOMER DROP-OFF PIN (Destination) */}
        <div 
          className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10"
          style={{ left: '86%', top: '46%' }}
        >
          <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white shadow-xl flex items-center justify-center font-bold border-2 border-white ring-4 ring-emerald-500/30">
            <MapPin className="w-5 h-5" />
          </div>
          <span className="mt-1.5 px-2 py-0.5 rounded-md bg-stone-900/90 text-[10px] font-bold text-white shadow-md border border-stone-700 whitespace-nowrap">
            You ({currentLocation.city})
          </span>
        </div>

        {/* GPS Map Watermark */}
        <div className="absolute bottom-3 left-3 bg-stone-900/80 backdrop-blur-md px-3 py-1 rounded-xl text-[10px] font-mono text-stone-300 border border-stone-700/80 flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5 text-emerald-400" />
          <span>FoodieHub Live Tracker • GPS-Enabled</span>
        </div>
      </div>

      {/* Driver Card & Actions */}
      <div className="p-4 sm:p-5 bg-stone-50/70 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop"
            alt="Delivery Partner"
            className="w-12 h-12 rounded-2xl object-cover border-2 border-white shadow-xs"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-sm font-bold text-stone-900">Carlos Delgado</h4>
              <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded-md">
                ⭐ 4.9 (1,240 deliveries)
              </span>
            </div>
            <p className="text-xs text-stone-600">
              Honda PCX Eco-Scooter • CA License SF-9028
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <a
            href="tel:+18005550199"
            className="flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold bg-stone-900 hover:bg-black text-white flex items-center justify-center gap-1.5 shadow-xs transition-colors"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Call Driver</span>
          </a>
          <button
            onClick={() => alert(`Rider Carlos is en route. Remaining distance: ${remainingDist} km.`)}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-white border border-stone-200 text-stone-700 hover:bg-stone-100 transition-colors"
          >
            Driver Notes
          </button>
        </div>
      </div>

    </div>
  );
};

export default LiveGPSMap;
