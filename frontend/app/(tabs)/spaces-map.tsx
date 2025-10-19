import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StatusBar, Alert, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import SafeBoundingView from '@/components/SafeBoundingView';
import { useTheme } from '@/contexts/ThemeContext';
import { getSpaces } from '@/supabase/controllers/spaces.controller';

// Declare global window interface for Leaflet
declare global {
  interface Window {
    L: any;
  }
}

const { width, height } = Dimensions.get('window');

export default function SpacesMapScreen() {
  const { colors, isDark } = useTheme();
  const { back } = useRouter();
  const [spaces, setSpaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    fetchSpaces();
  }, []);

  useEffect(() => {
    if (spaces.length > 0 && !mapLoaded) {
      loadLeafletAndInitMap();
    }
  }, [spaces, mapLoaded]);

  const fetchSpaces = async () => {
    try {
      setLoading(true);
      const { data, error } = await getSpaces();
      if (error) {
        console.error("Error fetching spaces:", error);
        Alert.alert('Error', 'Failed to load spaces');
      } else {
        // Filter spaces that have location coordinates
        const spacesWithCoords = (data || []).filter((space: any) => 
          space.latitude && space.longitude && 
          !isNaN(parseFloat(space.latitude)) && !isNaN(parseFloat(space.longitude))
        );
        setSpaces(spacesWithCoords);
      }
    } catch (error) {
      console.error("Error in fetchSpaces:", error);
      Alert.alert('Error', 'Failed to load spaces');
    } finally {
      setLoading(false);
    }
  };

  const loadLeafletAndInitMap = async () => {
    try {
      // Load Leaflet CSS
      const cssLink = document.createElement('link');
      cssLink.rel = 'stylesheet';
      cssLink.href = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css';
      document.head.appendChild(cssLink);

      // Load Leaflet JS
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.js';
      script.onload = () => {
        initializeMap();
      };
      document.body.appendChild(script);
    } catch (error) {
      console.error('Error loading Leaflet:', error);
    }
  };

  const initializeMap = () => {
    if (!window.L || spaces.length === 0) return;

    const mapContainer = document.getElementById('spaces-map');
    if (!mapContainer) return;

    // Calculate center point from all spaces
    const centerLat = spaces.reduce((sum, space) => sum + parseFloat(space.latitude), 0) / spaces.length;
    const centerLng = spaces.reduce((sum, space) => sum + parseFloat(space.longitude), 0) / spaces.length;

    // Initialize map
    const map = window.L.map('spaces-map').setView([centerLat, centerLng], 10);

    // Add tile layer
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Add markers for each space
    spaces.forEach((space: any) => {
      const marker = window.L.marker([parseFloat(space.latitude), parseFloat(space.longitude)])
        .addTo(map);

      // Create popup content
      const popupContent = `
        <div style="font-family: system-ui; max-width: 250px;">
          <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #333;">
            ${space.name}
          </h3>
          <p style="margin: 0 0 8px 0; font-size: 14px; color: #666;">
            <strong>📍</strong> ${space.location}
          </p>
          <p style="margin: 0 0 8px 0; font-size: 14px; color: #666;">
            <strong>👥</strong> Capacity: ${space.capacity}
          </p>
          <p style="margin: 0 0 12px 0; font-size: 14px; color: #666;">
            <strong>💰</strong> ${space.pph}/hour
          </p>
          ${space.description ? `
            <p style="margin: 0 0 12px 0; font-size: 13px; color: #777; line-height: 1.4;">
              ${space.description.length > 100 ? space.description.substring(0, 100) + '...' : space.description}
            </p>
          ` : ''}
          <div style="display: flex; gap: 8px; margin-top: 12px;">
            <a href="javascript:void(0)" 
               onclick="window.open('https://www.google.com/maps?q=${space.latitude},${space.longitude}', '_blank')"
               style="display: inline-block; background: #007bff; color: white; padding: 6px 12px; border-radius: 6px; text-decoration: none; font-size: 12px; font-weight: 500;">
              📍 View on Google Maps
            </a>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
    });

    // Fit map to show all markers
    if (spaces.length > 1) {
      const group = new window.L.featureGroup(
        spaces.map(space => 
          window.L.marker([parseFloat(space.latitude), parseFloat(space.longitude)])
        )
      );
      map.fitBounds(group.getBounds().pad(0.1));
    }

    setMapLoaded(true);
  };

  if (loading) {
    return (
      <SafeBoundingView style={{ flex: 1, backgroundColor: colors.background }}>
        <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.card} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: colors.text, fontSize: 18 }}>Loading spaces...</Text>
        </View>
      </SafeBoundingView>
    );
  }

  return (
    <SafeBoundingView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.card} />
      
      {/* Header */}
      <View style={{ 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        paddingHorizontal: 16, 
        paddingVertical: 12,
        backgroundColor: colors.card,
        borderBottomWidth: 1,
        borderBottomColor: colors.border
      }}>
        <TouchableOpacity onPress={back} style={{ padding: 8 }}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text }}>
          All Spaces on Map
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
            {spaces.length} spaces
          </Text>
        </View>
      </View>

      {spaces.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 }}>
          <Ionicons name="location-outline" size={64} color={colors.textSecondary} />
          <Text style={{ fontSize: 20, fontWeight: '600', color: colors.text, marginTop: 16, textAlign: 'center' }}>
            No Spaces with Locations
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: 16, textAlign: 'center', marginTop: 8 }}>
            Spaces need to have location coordinates to appear on the map
          </Text>
        </View>
      ) : (
        <>
          {/* Map Container */}
          <View style={{ flex: 1, backgroundColor: colors.backgroundSecondary }}>
            <div 
              id="spaces-map" 
              style={{ 
                width: '100%', 
                height: '100%',
                backgroundColor: colors.backgroundSecondary
              }}
            />
          </View>

          {/* Map Info Footer */}
          <View style={{ 
            backgroundColor: colors.card, 
            padding: 16, 
            borderTopWidth: 1, 
            borderTopColor: colors.border 
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="information-circle-outline" size={20} color={colors.accent} />
                <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
                  Tap markers to view space details
                </Text>
              </View>
              <TouchableOpacity 
                onPress={fetchSpaces}
                style={{ 
                  backgroundColor: colors.accent, 
                  paddingHorizontal: 12, 
                  paddingVertical: 6, 
                  borderRadius: 8 
                }}
              >
                <Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>
                  Refresh
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}
    </SafeBoundingView>
  );
}