// screens/HallDetails.tsx
import React, { useState, useEffect } from "react";
import { View, Text, Image, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, Share, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { RouteProp, useRoute } from "@react-navigation/native";
import { getSpaces } from "@/supabase/controllers/spaces.controller";
import { useNavigation } from '@react-navigation/native';
type HallDetailsRouteProp = RouteProp<{ HallDetails: { hall: any } }, "HallDetails">;
const { width } = Dimensions.get('window');

export default function HallDetails() {
  const navigation = useNavigation();
  const route = useRoute<HallDetailsRouteProp>();
  const { hall } = route.params;
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  
  const images = hall["spaces-images"];
  
  const facilities = [
    { name: "WiFi", icon: "wifi", available: true },
    { name: "Parking", icon: "car", available: true },
    { name: "AC", icon: "snow", available: true },
    { name: "Projector", icon: "tv", available: true },
    { name: "Catering", icon: "restaurant", available: false },
    { name: "Sound System", icon: "volume-high", available: true },
  ];

  const [spaces, setSpaces] = useState<any>([]);

  const fetchSpaces = async () => {
    try {
      const { data, error } = await getSpaces();
      if (error) {
        console.error("Error fetching spaces:", error);
      } else {
        setSpaces(data || []);
        console.log("Fetched spaces:", data);
      }
    } catch (error) {
      console.error("Error in fetchSpaces:", error);
    }
  };

  useEffect(() => {
    fetchSpaces();
  }, []);
  
  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this amazing venue: ${hall.name} at ${hall.location}`,
      });
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="relative">
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={({ nativeEvent }) => {
              const slide = Math.ceil(nativeEvent.contentOffset.x / nativeEvent.layoutMeasurement.width);
              if (slide !== currentImageIndex) {
                setCurrentImageIndex(slide);
              }
            }}
            scrollEventThrottle={20}
          >
            {images.map((image: any, index: number) => (
              <Image
                key={index}
                source={{ uri: image.link }}
                style={{ width, height: 300 }}
                className="bg-gray-200"
              />
            ))}
          </ScrollView>
          

          {images.length > 1 && (
            <View className="absolute bottom-4 self-center flex-row space-x-2">
              {images.map((_: any, index: number) => (
                <View
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </View>
          )}
          

          <View className="absolute top-0 left-0 right-0 flex-row justify-between items-center p-6 pt-12">
            <TouchableOpacity 
                onPress={() => navigation.goBack()}
                className="bg-black/30 rounded-full p-3">
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <View className="flex-row space-x-3">
              <TouchableOpacity 
                onPress={handleShare}
                className="bg-black/30 rounded-full p-3"
              >
                <Ionicons name="share-outline" size={24} color="white" />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => setIsFavorite(!isFavorite)}
                className="bg-black/30 rounded-full p-3"
              >
                <Ionicons 
                  name={isFavorite ? "heart" : "heart-outline"} 
                  size={24} 
                  color={isFavorite ? "#EF4444" : "white"} 
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View className="bg-white rounded-t-3xl -mt-6 relative z-10">

          <View className="p-6 pb-4">
            <View className="flex-row justify-between items-start mb-4">
              <View className="flex-1">
                <Text className="text-3xl font-bold text-gray-900 mb-2">{hall.name}</Text>
                <View className="flex-row items-center mb-2">
                  <View className="bg-gray-100 rounded-full p-2 mr-3">
                    <Ionicons name="location" size={16} color="#6B7280" />
                  </View>
                  <Text className="text-gray-600 text-lg flex-1">{hall.location}</Text>
                </View>
                <View className="flex-row items-center">
                  <View className="bg-gray-100 rounded-full p-2 mr-3">
                    <Ionicons name="people" size={16} color="#6B7280" />
                  </View>
                  <Text className="text-gray-600 text-lg">Up to {hall.capacity} guests</Text>
                </View>
              </View>
              
              <View className="bg-green-100 rounded-2xl px-4 py-2">
                <Text className="text-green-800 font-semibold">Available</Text>
              </View>
            </View>
            

            <View className="flex-row items-center mb-4">
              <View className="flex-row items-center bg-yellow-100 rounded-full px-3 py-1 mr-3">
                <Ionicons name="star" size={16} color="#F59E0B" />
                <Text className="text-yellow-800 font-semibold ml-1">4.8</Text>
              </View>
              <Text className="text-gray-600">Based on 124 reviews</Text>
            </View>
          </View>


          <View className="px-6 pb-6">
            <View className="flex-row gap-2">
              <TouchableOpacity className="bg-gray-900 rounded-2xl px-6 py-4 flex-1">
                <Text className="text-white text-center font-semibold text-lg">Book Now</Text>
              </TouchableOpacity>
              <TouchableOpacity className="border-2 border-gray-200 rounded-2xl px-6 py-4 flex-1">
                <Text className="text-gray-900 text-center font-semibold text-lg">Check Availability</Text>
              </TouchableOpacity>
            </View>
          </View>


          <View className="px-6 py-4 border-t border-gray-100">
            <Text className="text-xl font-bold text-gray-900 mb-4">About This Venue</Text>
            <Text className="text-gray-600 leading-relaxed text-base">
              Experience luxury and elegance at {hall.name}. Our premium venue offers the perfect setting for your special events, from intimate gatherings to grand celebrations. With state-of-the-art facilities and exceptional service, we ensure your event will be unforgettable.
            </Text>
          </View>


          <View className="px-6 py-4 border-t border-gray-100">
            <Text className="text-xl font-bold text-gray-900 mb-4">Facilities & Amenities</Text>
            <View className="flex-row flex-wrap">
              {facilities.map((facility, index) => (
                <View 
                  key={index} 
                  className={`flex-row items-center mr-6 mb-4 ${
                    facility.available ? 'opacity-100' : 'opacity-50'
                  }`}
                >
                  <View className={`p-2 rounded-xl mr-3 ${
                    facility.available ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    <Ionicons 
                      name={facility.icon as any} 
                      size={20} 
                      color={facility.available ? '#10B981' : '#6B7280'} 
                    />
                  </View>
                  <Text className={`font-medium ${
                    facility.available ? 'text-gray-900' : 'text-gray-400'
                  }`}>
                    {facility.name}
                  </Text>
                  {!facility.available && (
                    <Text className="text-gray-400 ml-1">(Not Available)</Text>
                  )}
                </View>
              ))}
            </View>
          </View>


          <View className="px-6 py-4 border-t border-gray-100">
            <Text className="text-xl font-bold text-gray-900 mb-4">Pricing</Text>
            <View className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-2xl font-bold text-gray-900">₹{hall.pph}</Text>
                <Text className="text-gray-600">per day</Text>
              </View>
              <Text className="text-gray-600 mb-4">Base price includes venue rental for 8 hours</Text>
              <View className="space-y-2">
                <View className="flex-row justify-between">
                  <Text className="text-gray-600">Security deposit</Text>
                  <Text className="text-gray-900 font-semibold">₹{hall.pph}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-gray-600">Cleaning fee</Text>
                  <Text className="text-gray-900 font-semibold">₹{hall.pph}</Text>
                </View>
              </View>
            </View>
          </View>


          <View className="px-6 py-4 border-t border-gray-100">
            <Text className="text-xl font-bold text-gray-900 mb-4">Location</Text>
            <TouchableOpacity className="flex-row items-center justify-center border border-gray-300 rounded-2xl py-3">
              <Ionicons name="map" size={20} color="#374151" />
              <Text className="text-gray-900 font-semibold ml-2">View on Map</Text>
            </TouchableOpacity>
          </View>


          <View className="px-6 py-4 border-t border-gray-100">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold text-gray-900">Reviews</Text>
              <TouchableOpacity>
                <Text className="text-blue-600 font-semibold">See All</Text>
              </TouchableOpacity>
            </View>
            
            <View className="space-y-4">
              {[1, 2].map((review) => (
                <View key={review} className="bg-gray-50 rounded-2xl p-4">
                  <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-row items-center">
                      <View className="w-10 h-10 bg-gray-300 rounded-full mr-3"></View>
                      <Text className="font-semibold text-gray-900">John Doe</Text>
                    </View>
                    <View className="flex-row items-center">
                      <Ionicons name="star" size={16} color="#F59E0B" />
                      <Text className="text-gray-600 ml-1">5.0</Text>
                    </View>
                  </View>
                  <Text className="text-gray-600">
                    Amazing venue with excellent facilities. The staff was very helpful and the location is perfect for events.
                  </Text>
                </View>
              ))}
            </View>
          </View>


          <View className="px-6 py-4 border-t border-gray-100 mb-8">
            <Text className="text-xl font-bold text-gray-900 mb-4">Contact Host</Text>
            <View className="flex-row gap-2">
              <TouchableOpacity className="bg-green-500 rounded-2xl px-6 py-3 flex-1 flex-row items-center justify-center">
                <Ionicons name="call" size={20} color="white" />
                <Text className="text-white font-semibold ml-2">Call</Text>
              </TouchableOpacity>
              <TouchableOpacity className="bg-blue-500 rounded-2xl px-6 py-3 flex-1 flex-row items-center justify-center">
                <Ionicons name="chatbubble" size={20} color="white" />
                <Text className="text-white font-semibold ml-2">Message</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      <View className="bg-white border-t border-gray-200 px-6 py-4">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold text-gray-900">₹{hall.pph}</Text>
            <Text className="text-gray-600">per day</Text>
          </View>
          <TouchableOpacity className="bg-gray-900 rounded-2xl px-8 py-3">
            <Text className="text-white font-semibold text-lg">Book Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}