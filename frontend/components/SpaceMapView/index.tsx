import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';

interface SpaceMapViewProps {
  visible: boolean;
  onClose: () => void;
  latitude: number;
  longitude: number;
  spaceName: string;
  spaceAddress?: string;
}

declare global {
  interface Window {
    L: any;
  }
}

const SpaceMapView: React.FC<SpaceMapViewProps> = ({
  visible,
  onClose,
  latitude,
  longitude,
  spaceName,
  spaceAddress
}) => {
  const { colors, isDark } = useTheme();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (visible && Platform.OS === 'web') {
      loadLeafletAndInitMap();
    }
    
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [visible, latitude, longitude]);

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
        center: [latitude, longitude],
        zoom: 15,
        zoomControl: true,
      });

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      // Add marker for the space location
      const marker = L.marker([latitude, longitude])
        .bindPopup(`
          <div style="text-align: center;">
            <h3 style="margin: 0; color: #333;">${spaceName}</h3>
            ${spaceAddress ? `<p style="margin: 5px 0; color: #666;">${spaceAddress}</p>` : ''}
            <p style="margin: 5px 0; font-family: monospace; color: #888;">${latitude.toFixed(6)}, ${longitude.toFixed(6)}</p>
          </div>
        `)
        .addTo(map);

      // Open popup by default
      marker.openPopup();

      mapRef.current = map;

      // Fix map size after container is ready
      setTimeout(() => {
        map.invalidateSize();
      }, 100);
    } catch (error) {
      console.error('Failed to initialize map:', error);
    }
  };

  if (!visible) return null;

  return (
    <View className="absolute top-0 left-0 right-0 bottom-0 z-50" style={{ backgroundColor: colors.background }}>
      <View className="flex-row items-center justify-between px-4 py-3 border-b pt-6" style={{ backgroundColor: colors.card, borderBottomColor: colors.border }}>
        <TouchableOpacity onPress={onClose} className="p-2 w-10">
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text className="text-lg font-semibold" style={{ color: colors.text }}>Space Location</Text>
        <TouchableOpacity 
          onPress={() => {
            const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
            if (Platform.OS === 'web' && typeof window !== 'undefined') {
              window.open(url, '_blank');
            }
          }}
          className="p-2 w-10"
        >
          <Ionicons name="open-outline" size={20} color={colors.accent} />
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
          <Ionicons name="location" size={64} color={colors.accent} />
          <Text className="text-xl font-semibold mt-4 text-center" style={{ color: colors.text }}>
            {spaceName}
          </Text>
          <Text className="text-sm mt-2 text-center" style={{ color: colors.textSecondary }}>
            {latitude.toFixed(6)}, {longitude.toFixed(6)}
          </Text>
          {spaceAddress && (
            <Text className="text-sm mt-1 text-center px-5" style={{ color: colors.textSecondary }}>
              {spaceAddress}
            </Text>
          )}
        </View>
      )}

      <View className="p-4 border-t" style={{ backgroundColor: colors.card, borderTopColor: colors.border }}>
        <TouchableOpacity 
          className="flex-row items-center justify-center p-3 rounded-lg gap-2"
          style={{ backgroundColor: colors.accent }}
          onPress={() => {
            // Open in external map app
            const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
            if (Platform.OS === 'web' && typeof window !== 'undefined') {
              window.open(url, '_blank');
            }
          }}
        >
          <Ionicons name="map" size={20} color="white" />
          <Text className="text-white text-base font-semibold">Open in Google Maps</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SpaceMapView;