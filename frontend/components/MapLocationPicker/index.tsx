import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';

interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

interface MapLocationPickerProps {
  visible: boolean;
  onLocationSelect: (location: Location) => void;
  onCancel: () => void;
  initialLocation?: Location;
}

declare global {
  interface Window {
    L: any;
  }
}

const MapLocationPicker: React.FC<MapLocationPickerProps> = ({
  visible,
  onLocationSelect,
  onCancel,
  initialLocation
}) => {
  const { colors, isDark } = useTheme();
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    initialLocation || { latitude: 15.2993, longitude: 74.124 }
  );
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    if (visible && Platform.OS === 'web') {
      loadLeafletAndInitMap();
    }
    
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, [visible]);

  const loadLeafletAndInitMap = async () => {
    try {
      // Load Leaflet CSS
      if (!document.querySelector('link[href*="leaflet.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      // Load Leaflet JS
      if (!window.L) {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = initializeMap;
        document.head.appendChild(script);
      } else {
        initializeMap();
      }
    } catch (error) {
      console.error('Failed to load Leaflet:', error);
    }
  };

  const initializeMap = () => {
    if (!mapContainerRef.current || mapRef.current) return;

    try {
      const L = window.L;
      
      // Initialize map
      const map = L.map(mapContainerRef.current, {
        center: [selectedLocation?.latitude || 15.2993, selectedLocation?.longitude || 74.124],
        zoom: 13,
        zoomControl: true,
      });

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      // Add marker if location exists
      if (selectedLocation) {
        const marker = L.marker([selectedLocation.latitude, selectedLocation.longitude])
          .addTo(map);
        markerRef.current = marker;
      }

      // Handle map clicks
      map.on('click', (e: any) => {
        const { lat, lng } = e.latlng;
        
        // Remove existing marker
        if (markerRef.current) {
          map.removeLayer(markerRef.current);
        }
        
        // Add new marker
        const newMarker = L.marker([lat, lng]).addTo(map);
        markerRef.current = newMarker;
        
        // Update selected location
        setSelectedLocation({
          latitude: lat,
          longitude: lng,
        });
      });

      mapRef.current = map;

      // Fix map size after container is ready
      setTimeout(() => {
        map.invalidateSize();
      }, 100);
    } catch (error) {
      console.error('Failed to initialize map:', error);
    }
  };

  const handleConfirmLocation = () => {
    if (selectedLocation) {
      onLocationSelect(selectedLocation);
    } else {
      Alert.alert('Please select a location', 'Click on the map to choose a location');
    }
  };

  if (!visible) return null;

  return (
    <View className="absolute top-0 left-0 right-0 bottom-0 z-50" style={{ backgroundColor: colors.background }}>
      <View className="flex-row items-center justify-between px-4 py-3 border-b pt-6" style={{ backgroundColor: colors.card, borderBottomColor: colors.border }}>
        <TouchableOpacity onPress={onCancel} className="p-2">
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text className="text-lg font-semibold" style={{ color: colors.text }}>Select Location</Text>
        <TouchableOpacity onPress={handleConfirmLocation} className="p-2">
          <Text className="text-base font-semibold" style={{ color: colors.accent }}>Confirm</Text>
        </TouchableOpacity>
      </View>

      {Platform.OS === 'web' ? (
        <div 
          ref={mapContainerRef}
          style={{ 
            flex: 1, 
            width: '100%', 
            height: '100%',
            position: 'relative',
            backgroundColor: colors.backgroundSecondary
          }}
        />
      ) : (
        <View className="flex-1 justify-center items-center m-4 border rounded-xl" style={{ backgroundColor: colors.backgroundSecondary, borderColor: colors.border }}>
          <Ionicons name="map" size={64} color={colors.accent} />
          <Text className="text-xl font-semibold mt-4 text-center" style={{ color: colors.text }}>Interactive Map</Text>
          <Text className="text-sm mt-2 text-center px-5" style={{ color: colors.textSecondary }}>
            Full map functionality available on web
          </Text>
        </View>
      )}

      {selectedLocation && (
        <View className="p-4 border-t gap-2" style={{ backgroundColor: colors.card, borderTopColor: colors.border }}>
          <View className="flex-row items-center gap-2">
            <Ionicons name="location" size={20} color={colors.accent} />
            <Text className="text-base font-semibold" style={{ color: colors.text }}>
              Selected Location
            </Text>
          </View>
          <Text className="text-sm font-mono" style={{ color: colors.textSecondary }}>
            {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
          </Text>
        </View>
      )}
    </View>
  );
};

export default MapLocationPicker;