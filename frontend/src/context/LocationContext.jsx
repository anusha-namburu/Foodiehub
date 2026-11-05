import React, { createContext, useContext, useState, useEffect } from 'react';

const LocationContext = createContext(null);

export const GUNTUR_LOCATIONS = [
  { name: 'Brodipet', city: 'Guntur', state: 'AP', address: 'Brodipet 4th Lane, Guntur, AP 522002', latitude: 16.3067, longitude: 80.4365, tag: 'Heart of Guntur' },
  { name: 'Arundelpet', city: 'Guntur', state: 'AP', address: 'Arundelpet Main Road, Guntur, AP 522002', latitude: 16.3015, longitude: 80.4412, tag: 'Commercial Hub' },
  { name: 'Lakshmipuram', city: 'Guntur', state: 'AP', address: 'Lakshmipuram Circle, Guntur, AP 522007', latitude: 16.2945, longitude: 80.4328, tag: 'Prime Dining' },
  { name: 'Kothapet', city: 'Guntur', state: 'AP', address: 'Old Club Road, Kothapet, Guntur, AP 522001', latitude: 16.3120, longitude: 80.4480, tag: 'Biryani Hub' },
  { name: 'Pattabhipuram', city: 'Guntur', state: 'AP', address: 'Pattabhipuram Main Road, Guntur, AP 522006', latitude: 16.2890, longitude: 80.4280, tag: 'Residential' },
  { name: 'Gujjanagundla', city: 'Guntur', state: 'AP', address: 'Ring Road, Gujjanagundla, Guntur, AP 522006', latitude: 16.2980, longitude: 80.4210, tag: 'Ring Road' },
  { name: 'Gorantla', city: 'Guntur', state: 'AP', address: 'Amaravathi Road, Gorantla, Guntur, AP 522034', latitude: 16.3210, longitude: 80.4150, tag: 'Amaravathi Way' },
  { name: 'Vidyanagar', city: 'Guntur', state: 'AP', address: 'Vidyanagar 1st Line, Guntur, AP 522007', latitude: 16.3150, longitude: 80.4250, tag: 'Town Center' },
  { name: 'Nagarampalem', city: 'Guntur', state: 'AP', address: 'Collectorate Complex, Nagarampalem, Guntur, AP 522004', latitude: 16.2915, longitude: 80.4180, tag: 'Collectorate' },
  { name: 'Old Guntur', city: 'Guntur', state: 'AP', address: 'Jinnah Tower Centre, Old Guntur, AP 522001', latitude: 16.3030, longitude: 80.4530, tag: 'Heritage Market' },
];

export const PRESET_LOCATIONS = [
  ...GUNTUR_LOCATIONS,
  { name: 'Vijayawada', city: 'Vijayawada', state: 'AP', address: 'MG Road, Vijayawada, AP 520010', latitude: 16.5062, longitude: 80.6480, tag: 'Nearby City' },
  { name: 'Hyderabad', city: 'Hyderabad', state: 'TS', address: 'Hitec City, Hyderabad, TS 500081', latitude: 17.3850, longitude: 78.4867, tag: 'Metro' },
  { name: 'Bangalore', city: 'Bangalore', state: 'KA', address: 'Indiranagar, Bangalore, India', latitude: 12.9784, longitude: 77.6408, tag: 'Metro' },
  { name: 'Chennai', city: 'Chennai', state: 'TN', address: 'T. Nagar, Chennai, India', latitude: 13.0418, longitude: 80.2341, tag: 'Metro' },
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
