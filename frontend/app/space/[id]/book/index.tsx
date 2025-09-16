import React, { useState, useEffect } from "react";
import { View, Text, Image, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, Share, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getSpaceById } from "@/supabase/controllers/spaces.controller";
//@ts-ignore
import { useLocalSearchParams, useRouter } from 'expo-router';
import {Calendar, CalendarList, Agenda} from 'react-native-calendars';

const { width } = Dimensions.get('window');

export default function HallBooking() {
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(false) 
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const { back, push } = useRouter();

  
  const facilities = [
    { name: "WiFi", icon: "wifi", available: true },
    { name: "Parking", icon: "car", available: true },
    { name: "AC", icon: "snow", available: true },
    { name: "Projector", icon: "tv", available: true },
    { name: "Catering", icon: "restaurant", available: false },
    { name: "Sound System", icon: "volume-high", available: true },
  ];

  const [space, setSpace] = useState<any>();

  const fetchSpace = async () => {
    try {
      setLoading(true);
      const { data, error } = await getSpaceById(id as string);
      if (error) {
        console.error("Error fetching spaces:", error);
      } else {
        setSpace(data);
        console.log(`Space with ${id} fetched:`, data);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error in fetchSpaces:", error);
    }
  };

  useEffect(() => {
    fetchSpace();
  }, []);
  
  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this amazing venue: ${space.name} at ${space.location}`,
      });
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };
  if (loading || !space) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <StatusBar barStyle="dark-content" backgroundColor="#E9F0E9" />
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-600">Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }
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
            {space?.images.map((image: any, index: number) => (
              <Image
                key={index}
                source={{ uri: image }}
                style={{ width, height: 300 }}
                className="bg-gray-200"
              />
            ))}
          </ScrollView>
          

          {space?.images.length > 1 && (
            <View className="absolute bottom-4 self-center flex-row space-x-2">
              {space.images.map((_: any, index: number) => (
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
                onPress={() => back()}
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
                <Text className="text-3xl font-bold text-gray-900 mb-2">{space.name}</Text>
                
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
            <Calendar
                onDayPress={day => {
                    console.log('selected day', day);
                }}
            />

        </View>
      </ScrollView>

      <View className="bg-white border-t border-gray-200 px-6 py-4">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold text-gray-900">₹{space.pph}</Text>
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