import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, SafeAreaView, StatusBar } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getSpaces } from "@/supabase/controllers/spaces.controller";


export default function SchedulePage() {
  const [spaces, setSpaces] = useState<any>([]);
  const [booked, setBooked] = useState<{ hall: string; time: string }[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toDateString());

  const fetchSpaces = async () => {
    try {
      const { data, error } = await getSpaces();
      if (error) {
        console.error("Error fetching spaces:", error);
      } else {
        setSpaces(data || []);
      }
    } catch (error) {
      console.error("Error in fetchSpaces:", error);
    }
  };

  useEffect(() => {
    fetchSpaces();
  }, []);

  const timeSlots = [
    { time: "09:00 AM", label: "Morning" },
    { time: "11:00 AM", label: "Late Morning" },
    { time: "01:00 PM", label: "Afternoon" },
    { time: "03:00 PM", label: "Late Afternoon" },
    { time: "05:00 PM", label: "Evening" },
    { time: "07:00 PM", label: "Night" },
  ];

  // Generate next 7 days for date selection
  const getNextDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const handleBooking = (hallName: string, time: string) => {
    setBooked((prev) => [...prev, { hall: hallName, time }]);
    alert(`✅ Successfully booked ${hallName} at ${time}`);
  };

  const isBooked = (hall: string, time: string) =>
    booked.some((b) => b.hall === hall && b.time === time);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#E9F0E9' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#E9F0E9" />
      
      {/* Header */}
      <View style={{ backgroundColor: '#E9F0E9' }} className="px-6 pt-12 pb-2">
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-3xl font-bold text-gray-900">Schedule</Text>
            <Text className="text-lg text-gray-600 mt-1">Book your perfect venue</Text>
          </View>
          <TouchableOpacity className="bg-white/70 p-2 rounded-full">
            <Ionicons name="calendar-outline" size={24} color="#374151" />
          </TouchableOpacity>
        </View>

        {/* Date Selection */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          className="mb-4"
          contentContainerStyle={{ columnGap: 12 }}
        >
          {getNextDays().map((date, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => setSelectedDate(date.toDateString())}
              className={`px-4 py-3 rounded-2xl min-w-[80px] items-center ${
                selectedDate === date.toDateString() 
                  ? "bg-gray-900" 
                  : "bg-white/80"
              }`}
            >
              <Text className={`text-sm font-semibold ${
                selectedDate === date.toDateString() 
                  ? "text-white" 
                  : "text-gray-700"
              }`}>
                {formatDate(date)}
              </Text>
              {index === 0 && (
                <Text className={`text-xs mt-1 ${
                  selectedDate === date.toDateString() 
                    ? "text-gray-300" 
                    : "text-gray-500"
                }`}>
                  Today
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView 
        className="flex-1 bg-gray-50" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <View className="px-6 py-4">
          {spaces.map(
            (hall: {
              id: number;
              name: string;
              location: string;
              capacity: number;
              "spaces-images": { link: string }[];
            }) => (
              <View
                key={hall.id}
                className="mb-6 bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100"
              >
                {/* Hall Image with Overlay Info */}
                <View className="relative">
                  <Image
                    source={{
                      uri: hall["spaces-images"]?.length
                        ? hall["spaces-images"][0].link
                        : "https://via.placeholder.com/400x200",
                    }}
                    className="w-full h-56"
                  />
                  <View className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  {/* Hall Name Overlay */}
                  <View className="absolute bottom-4 left-4 right-4">
                    <Text className="text-white text-2xl font-bold mb-2">
                      {hall.name}
                    </Text>
                    <View className="flex-row items-center space-x-4">
                      <View className="flex-row items-center">
                        <View className="bg-white/20 rounded-full p-1 mr-2">
                          <Ionicons name="location" size={14} color="white" />
                        </View>
                        <Text className="text-white text-sm font-medium">{hall.location}</Text>
                      </View>
                      <View className="flex-row items-center">
                        <View className="bg-white/20 rounded-full p-1 mr-2">
                          <Ionicons name="people" size={14} color="white" />
                        </View>
                        <Text className="text-white text-sm font-medium">
                          {hall.capacity} guests
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Favorite Button */}
                  <TouchableOpacity className="absolute top-4 right-4 bg-white/20 rounded-full p-2">
                    <Ionicons name="heart-outline" size={20} color="white" />
                  </TouchableOpacity>
                </View>

                {/* Time Slots Section */}
                <View className="p-6">
                  <View className="flex-row items-center justify-between mb-4">
                    <Text className="text-lg font-bold text-gray-900">
                      Available Time Slots
                    </Text>
                    <View className="flex-row items-center">
                      <View className="w-3 h-3 bg-green-500 rounded-full mr-2"></View>
                      <Text className="text-xs text-gray-500 mr-3">Available</Text>
                      <View className="w-3 h-3 bg-red-500 rounded-full mr-2"></View>
                      <Text className="text-xs text-gray-500">Booked</Text>
                    </View>
                  </View>
                  
                  <View className="space-y-3">
                    {timeSlots.map((slot, idx) => {
                      const isSlotBooked = isBooked(hall.name, slot.time);
                      return (
                        <TouchableOpacity
                          key={idx}
                          className={`flex-row items-center justify-between p-4 rounded-2xl border-2 ${
                            isSlotBooked
                              ? "bg-red-50 border-red-200"
                              : "bg-green-50 border-green-200"
                          }`}
                          onPress={() =>
                            !isSlotBooked && handleBooking(hall.name, slot.time)
                          }
                          disabled={isSlotBooked}
                        >
                          <View className="flex-row items-center">
                            <View className={`w-12 h-12 rounded-2xl items-center justify-center mr-4 ${
                              isSlotBooked ? "bg-red-100" : "bg-green-100"
                            }`}>
                              <Ionicons 
                                name={isSlotBooked ? "close-circle" : "time"} 
                                size={24} 
                                color={isSlotBooked ? "#EF4444" : "#10B981"} 
                              />
                            </View>
                            <View>
                              <Text className={`text-lg font-semibold ${
                                isSlotBooked ? "text-red-700" : "text-gray-900"
                              }`}>
                                {slot.time}
                              </Text>
                              <Text className={`text-sm ${
                                isSlotBooked ? "text-red-500" : "text-gray-600"
                              }`}>
                                {slot.label}
                              </Text>
                            </View>
                          </View>
                          
                          <View className={`px-4 py-2 rounded-full ${
                            isSlotBooked 
                              ? "bg-red-500" 
                              : "bg-green-500"
                          }`}>
                            <Text className="text-white font-semibold text-sm">
                              {isSlotBooked ? "Booked" : "Book Now"}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* Booking Stats */}
                  <View className="mt-6 p-4 bg-gray-50 rounded-2xl">
                    <Text className="text-center text-sm text-gray-600">
                      {timeSlots.filter(slot => !isBooked(hall.name, slot.time)).length} of {timeSlots.length} slots available
                    </Text>
                  </View>
                </View>
              </View>
            )
          )}
        </View>

        {/* My Bookings Section */}
        {booked.length > 0 && (
          <View className="px-6 py-4 bg-white mx-6 rounded-3xl shadow-sm border border-gray-100">
            <Text className="text-xl font-bold text-gray-900 mb-4">My Bookings</Text>
            {booked.map((booking, idx) => (
              <View key={idx} className="flex-row items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                <View>
                  <Text className="font-semibold text-gray-900">{booking.hall}</Text>
                  <Text className="text-sm text-gray-600">{booking.time}</Text>
                </View>
                <View className="bg-green-100 px-3 py-1 rounded-full">
                  <Text className="text-green-700 text-xs font-semibold">Confirmed</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}