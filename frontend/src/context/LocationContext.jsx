import React, { createContext, useContext, useState, useEffect } from 'react';

const LocationContext = createContext(null);

export const PRESET_LOCATIONS = [
  { city: 'Guntur', state: 'AP', address: 'Brodipet & Arundelpet, Guntur, AP 522002', latitude: 16.3067, longitude: 80.4365 },
  { city: 'Vijayawada', state: 'AP', address: 'MG Road, Vijayawada, AP 520010', latitude: 16.5062, longitude: 80.6480 },
  { city: 'Hyderabad', state: 'TS', address: 'Hitec City, Hyderabad, TS 500081', latitude: 17.3850, longitude: 78.4867 },
  { city: 'Bangalore', state: 'KA', address: 'Indiranagar, Bangalore, India', latitude: 12.9784, longitude: 77.6408 },
  { city: 'Mumbai', state: 'MH', address: 'Bandra West, Mumbai, India', latitude: 19.0596, longitude: 72.8295 },
  { city: 'New Delhi', state: 'DL', address: 'Connaught Place, New Delhi, India', latitude: 28.6139, longitude: 77.2090 },
  { city: 'San Francisco', state: 'CA', address: 'Market St & 4th, San Francisco, CA', latitude: 37.7858, longitude: -122.4064 },
  { city: 'New York', state: 'NY', address: '5th Ave & 42nd St, New York, NY', latitude: 40.7527, longitude: -73.9818 },
  { city: 'London', state: 'UK', address: 'Oxford Street, London, UK', latitude: 51.5154, longitude: -0.1419 },
];

export const LocationProvider = ({ children }) => {
  const [currentLocation, setCurrentLocation] = useState(() => {
    const saved = localStorage.getItem('foodiehub_location');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.city !== 'San Francisco') return parsed;
      } catch (e) {
        // fallback
      }
    }
    return PRESET_LOCATIONS[0];
  });

  const [isDetectingGPS, setIsDetectingGPS] = useState(false);
  const [gpsError, setGpsError] = useState(null);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('foodiehub_location', JSON.stringify(currentLocation));
  }, [currentLocation]);

  // Real GPS Geolocation detection
  const detectGPSLocation = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser');
      return;
    }

    setIsDetectingGPS(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        // Try reverse geocoding via OpenStreetMap Nominatim
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=16&addressdetails=1`,
            { headers: { 'Accept-Language': 'en' } }
          );
          if (res.ok) {
            const data = await res.json();
            const addr = data.address || {};
            const city = addr.city || addr.town || addr.suburb || addr.village || 'Local Area';
            const state = addr.state || addr.country || '';
            const road = addr.road || addr.neighbourhood || '';
            const formatted = road ? `${road}, ${city}` : data.display_name.split(',').slice(0, 3).join(',');

            const loc = {
              city,
              state,
              address: formatted || `${city}, ${state}`,
              latitude,
              longitude,
              isGPS: true,
            };

            setCurrentLocation(loc);
            setIsDetectingGPS(false);
            setIsLocationModalOpen(false);
            return;
          }
        } catch (err) {
          console.warn('Reverse geocode failed, using coordinates:', err);
        }

        // Fallback with GPS coordinates
        const loc = {
          city: 'Your GPS Location',
          state: `(${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
          address: `Current GPS Location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
          latitude,
          longitude,
          isGPS: true,
        };
        setCurrentLocation(loc);
        setIsDetectingGPS(false);
        setIsLocationModalOpen(false);
      },
      (error) => {
        setIsDetectingGPS(false);
        let msg = 'Failed to retrieve GPS location.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Location permission was denied. Please allow location access in your browser.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = 'Location information is unavailable.';
        } else if (error.code === error.TIMEOUT) {
          msg = 'Location request timed out.';
        }
        setGpsError(msg);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  };

  const selectLocation = (loc) => {
    setCurrentLocation(loc);
    setIsLocationModalOpen(false);
  };

  // Helper: calculate distance between two coordinates in kilometers
  const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return 2.4; // default
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Number((R * c).toFixed(1));
  };

  return (
    <LocationContext.Provider
      value={{
        currentLocation,
        isDetectingGPS,
        gpsError,
        isLocationModalOpen,
        setIsLocationModalOpen,
        detectGPSLocation,
        selectLocation,
        calculateDistanceKm,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
