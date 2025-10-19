import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StatusBar, Alert, Dimensions, ActivityIndicator, Linking, StyleSheet, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, UrlTile } from 'react-native-maps';
import SafeBoundingView from '@/components/SafeBoundingView';
import { useTheme } from '@/contexts/ThemeContext';
import { getSpaces } from '@/supabase/controllers/spaces.controller';

const { width, height } = Dimensions.get('window');

interface Space {
  id: string;
  name: string;
  location: string;
  latitude: string | number;
  longitude: string | number;
  capacity: number;
  pph: number;
  description?: string;
}

export default function SpacesMapScreen() {
  const { colors, isDark } = useTheme();
  const { back } = useRouter();
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSpace, setSelectedSpace] = useState<Space | null>(null);
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    fetchSpaces();
  }, []);

  useEffect(() => {
    if (spaces.length > 1 && mapRef.current) {
      const coordinates = spaces.map(space => ({
        latitude: parseFloat(space.latitude.toString()),
        longitude: parseFloat(space.longitude.toString()),
      }));
      
      setTimeout(() => {
        mapRef.current?.fitToCoordinates(coordinates, {
          edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
          animated: true,
        });
      }, 500);
    }
  }, [spaces]);

  const fetchSpaces = async () => {
    try {
      setLoading(true);
      const { data, error } = await getSpaces();
      if (error) {
        console.error("Error fetching spaces:", error);
        Alert.alert('Error', 'Failed to load spaces');
      } else {
        const spacesWithCoords = (data || []).filter((space: any) => 
          space.latitude && space.longitude && 
          !isNaN(parseFloat(space.latitude.toString())) && 
          !isNaN(parseFloat(space.longitude.toString()))
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

  const openInMaps = (latitude: number, longitude: number) => {
    const url = Platform.select({
      ios: `maps:0,0?q=${latitude},${longitude}`,
      android: `geo:0,0?q=${latitude},${longitude}`,
      default: `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=18/${latitude}/${longitude}`,
    });
    Linking.openURL(url).catch(err => 
      console.error('Error opening maps:', err)
    );
  };

  const calculateRegion = () => {
    if (spaces.length === 0) {
      return {
        latitude: 15.4909,
        longitude: 73.8278,
        latitudeDelta: 0.5,
        longitudeDelta: 0.5,
      };
    }

    if (spaces.length === 1) {
      return {
        latitude: parseFloat(spaces[0].latitude.toString()),
        longitude: parseFloat(spaces[0].longitude.toString()),
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
    }

    const latitudes = spaces.map(s => parseFloat(s.latitude.toString()));
    const longitudes = spaces.map(s => parseFloat(s.longitude.toString()));
    
    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLng = Math.min(...longitudes);
    const maxLng = Math.max(...longitudes);
    
    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;
    const latDelta = (maxLat - minLat) * 1.5;
    const lngDelta = (maxLng - minLng) * 1.5;

    return {
      latitude: centerLat,
      longitude: centerLng,
      latitudeDelta: Math.max(latDelta, 0.05),
      longitudeDelta: Math.max(lngDelta, 0.05),
    };
  };

  if (loading) {
    return (
      <SafeBoundingView style={{ flex: 1, backgroundColor: colors.background }}>
        <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.card} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={{ color: colors.text, fontSize: 18, marginTop: 16 }}>Loading spaces...</Text>
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
        borderBottomColor: colors.border,
        zIndex: 10,
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
          <View style={{ flex: 1 }}>
            <MapView
              ref={mapRef}
              style={{ flex: 1 }}
              initialRegion={calculateRegion()}
              showsUserLocation={true}
              showsMyLocationButton={true}
              showsCompass={true}
            >
              {/* OpenStreetMap Tiles */}
              <UrlTile
                urlTemplate="https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"
                maximumZ={19}
              />

              {/* Markers */}
              {spaces.map((space) => (
                <Marker
                  key={space.id}
                  coordinate={{
                    latitude: parseFloat(space.latitude.toString()),
                    longitude: parseFloat(space.longitude.toString()),
                  }}
                  onPress={() => setSelectedSpace(space)}
                >
                  <View style={styles.markerContainer}>
                    <View style={[styles.marker, { backgroundColor: colors.accent }]}>
                      <Ionicons name="location" size={24} color="white" />
                    </View>
                  </View>
                </Marker>
              ))}
            </MapView>
          </View>

          {/* Selected Space Details Card */}
          {selectedSpace && (
            <View style={[styles.detailsCard, { 
              backgroundColor: colors.card,
              shadowColor: isDark ? '#fff' : '#000',
            }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text, marginBottom: 8 }}>
                    {selectedSpace.name}
                  </Text>
                  <Text style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 4 }}>
                    📍 {selectedSpace.location}
                  </Text>
                  <Text style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 4 }}>
                    👥 Capacity: {selectedSpace.capacity}
                  </Text>
                  <Text style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 8 }}>
                    💰 ₹{selectedSpace.pph}/hour
                  </Text>
                  {selectedSpace.description && (
                    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 18 }}>
                      {selectedSpace.description.length > 100 
                        ? selectedSpace.description.substring(0, 100) + '...' 
                        : selectedSpace.description}
                    </Text>
                  )}
                </View>
                <TouchableOpacity 
                  onPress={() => setSelectedSpace(null)}
                  style={{ padding: 4 }}
                >
                  <Ionicons name="close" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                onPress={() => openInMaps(
                  parseFloat(selectedSpace.latitude.toString()),
                  parseFloat(selectedSpace.longitude.toString())
                )}
                style={{
                  backgroundColor: colors.accent,
                  paddingVertical: 10,
                  paddingHorizontal: 16,
                  borderRadius: 8,
                  marginTop: 12,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: 'white', fontSize: 14, fontWeight: '600' }}>
                  📍 Open in Maps
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Map Info Footer */}
          <View style={{ 
            backgroundColor: colors.card, 
            padding: 16, 
            borderTopWidth: 1, 
            borderTopColor: colors.border,
            zIndex: 10,
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

const styles = StyleSheet.create({
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  marker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  detailsCard: {
    position: 'absolute',
    bottom: 80,
    left: 16,
    right: 16,
    borderRadius: 12,
    padding: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  }
});
