import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, Modal, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
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

const MapLocationPicker: React.FC<MapLocationPickerProps> = ({
  visible,
  onLocationSelect,
  onCancel,
  initialLocation
}) => {
  const { colors, isDark } = useTheme();
  const [selectedLocation, setSelectedLocation] = useState<Location>(
    initialLocation || { latitude: 15.2993, longitude: 74.124 }
  );

  const generateMapHTML = () => {
    const backgroundColor = isDark ? '#1a1a1a' : '#ffffff';
    const textColor = isDark ? '#ffffff' : '#333333';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          body, html {
            margin: 0;
            padding: 0;
            height: 100%;
            width: 100%;
            background-color: ${backgroundColor};
          }
          #map {
            width: 100%;
            height: 100%;
          }
          .leaflet-container {
            background: ${backgroundColor};
          }
          .leaflet-popup-content-wrapper {
            background-color: ${backgroundColor};
            color: ${textColor};
          }
          .leaflet-popup-tip {
            background-color: ${backgroundColor};
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          var map = L.map('map').setView([${selectedLocation.latitude}, ${selectedLocation.longitude}], 13);

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
          }).addTo(map);

          var marker = L.marker([${selectedLocation.latitude}, ${selectedLocation.longitude}], {
            draggable: true
          }).addTo(map);

          // Handle marker drag
          marker.on('dragend', function(e) {
            var latlng = marker.getLatLng();
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'locationSelected',
              latitude: latlng.lat,
              longitude: latlng.lng
            }));
          });

          // Handle map clicks
          map.on('click', function(e) {
            marker.setLatLng(e.latlng);
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'locationSelected',
              latitude: e.latlng.lat,
              longitude: e.latlng.lng
            }));
          });

          // Initial location
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'locationSelected',
            latitude: ${selectedLocation.latitude},
            longitude: ${selectedLocation.longitude}
          }));
        </script>
      </body>
      </html>
    `;
  };

  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'locationSelected') {
        setSelectedLocation({
          latitude: data.latitude,
          longitude: data.longitude,
        });
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  };

  const handleConfirmLocation = () => {
    if (selectedLocation) {
      onLocationSelect(selectedLocation);
    } else {
      Alert.alert('Please select a location', 'Click on the map to choose a location');
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onCancel}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={onCancel} style={styles.headerButton}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Select Location</Text>
          <TouchableOpacity onPress={handleConfirmLocation} style={styles.headerButton}>
            <Text style={[styles.confirmText, { color: colors.accent }]}>Confirm</Text>
          </TouchableOpacity>
        </View>

        {/* Map */}
        <View style={styles.mapContainer}>
          <WebView
            style={styles.webview}
            originWhitelist={['*']}
            source={{ html: generateMapHTML() }}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            onMessage={handleWebViewMessage}
          />
        </View>

        {/* Location Info */}
        {selectedLocation && (
          <View style={[styles.infoContainer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
            <View style={styles.infoHeader}>
              <Ionicons name="location" size={20} color={colors.accent} />
              <Text style={[styles.infoTitle, { color: colors.text }]}>
                Selected Location
              </Text>
            </View>
            <Text style={[styles.coordinates, { color: colors.textSecondary }]}>
              {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
            </Text>
            <Text style={[styles.hint, { color: colors.textSecondary }]}>
              💡 Tap anywhere on the map or drag the marker to change location
            </Text>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerButton: {
    padding: 8,
    minWidth: 60,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  confirmText: {
    fontSize: 16,
    fontWeight: '600',
  },
  mapContainer: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  infoContainer: {
    padding: 16,
    borderTopWidth: 1,
    gap: 8,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  coordinates: {
    fontSize: 14,
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace' }),
  },
  hint: {
    fontSize: 12,
    marginTop: 4,
  },
});

export default MapLocationPicker;