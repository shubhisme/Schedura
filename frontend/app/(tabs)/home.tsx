import React, { useState, useEffect, FC } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getSpaces } from "@/supabase/controllers/spaces.controller";
import { useUser } from '@clerk/clerk-expo';
import { getUserInfo } from '@/supabase/controllers/user.controller';
import type { UserProfile } from '@/types/database.type';
//@ts-ignore
import { useRouter } from 'expo-router';

interface Category {
  id: number;
  name: string;
  icon:
    | "heart-outline"
    | "briefcase-outline"
    | "gift-outline"
    | "people-outline"
    | "chatbubbles-outline";
}

const categories: Category[] = [
  { id: 1, name: "Wedding", icon: "heart-outline" },
  { id: 2, name: "Corporate", icon: "briefcase-outline" },
  { id: 3, name: "Birthday", icon: "gift-outline" },
  { id: 4, name: "Conference", icon: "people-outline" },
  { id: 5, name: "Social", icon: "chatbubbles-outline" },
];

const Home = ({profile,setProfile}:any) => {
//   const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const { navigate } = useRouter();
  const [activeCategory, setActiveCategory] = useState(0);
  const [spaces, setSpaces] = useState<any>([]);

  const { user: authUser } = useUser();

  const fetchProfile = async () => {
    setLoading(true);
    const data = await getUserInfo(authUser?.id!);
    setProfile({ ...data, avatar_url: authUser?.imageUrl });
    setLoading(false);
  };

  useEffect(() => {
    fetchProfile();
  }, []);

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

  useEffect(()=>{
    fetchSpaces();
  }, []);
  

  return (
    <SafeAreaView className="flex-1 bg-tertiary">
      <StatusBar barStyle="dark-content" backgroundColor="#E9F0E9" />
      <View  className="bg-primary rounded-b-3xl pt-12 pb-6">
        <View className="flex-row items-center justify-between px-6  mb-2">
          <View className="flex-1">
            <Text className="text-3xl font-bold text-black">Explore</Text>
          </View>
          <View className="flex-row items-center gap-x-3">
            <TouchableOpacity className="bg-white/70 p-2 rounded-full">
              <Ionicons name="notifications-outline" size={22} color="#374151" />
            </TouchableOpacity>
            <TouchableOpacity className="bg-white/70 p-2 rounded-full">
              <Ionicons name="person-circle-outline" size={26} color="#374151" />
            </TouchableOpacity>
          </View>
        </View>

        <View className="flex-row items-center gap-x-3 px-6 pt-2">
          <View className="flex-1 flex-row items-center bg-white/80 rounded-2xl px-4 border border-white/50">
            <Ionicons name="search" size={20} color="#6b7280" />
            <TextInput
              placeholder="Search venues, locations..."
              placeholderTextColor="#6b7280"
              className="flex-1 py-3 ml-3 text-base text-gray-900"
            />
          </View>
          <TouchableOpacity className="bg-white/80 p-3 rounded-2xl border border-white/50">
            <Ionicons name="options-outline" size={20} color="#374151" />
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="px-6 mt-6"
          contentContainerStyle={{ columnGap: 12 }}
        >
          {categories.map((category: Category, index: number) => (
            <TouchableOpacity
              key={category.id}
              onPress={() => setActiveCategory(index)}
              className={`flex-row items-center gap-x-2 px-4 py-2.5 rounded-full ${
                index === activeCategory ? "bg-black" : "bg-white"
              }`}
            >
              <Ionicons
                name={category.icon}
                size={16}
                color={index === activeCategory ? "#fff" : "#000"}
                className=""
              />
              <Text
                className={`text-xs font-medium ${
                  index === activeCategory ? "text-white" : "text-black"
                }`}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 h-full bg-tertiary">

        {/* Featured Venues */}
        <View className="mt-8">
          <View className="flex-row justify-between items-center px-6 mb-4">
            <Text className="text-xl font-bold text-black">Featured Venues</Text>
            <TouchableOpacity>
              <Text className="text-black font-semibold">View All</Text>
            </TouchableOpacity>
          </View>

          <ScrollView decelerationRate={0.9} horizontal showsHorizontalScrollIndicator={false} className="pl-4">
            {spaces.map((hall: any) => (
              <TouchableOpacity
                key={hall.id}
                className="w-72 h-72 rounded-3xl overflow-hidden mr-4 bg-gray-700"
                onPress={() => navigate(`/space/${hall.id}`)}
              >
                <Image
                  source={{ uri: hall["spaces-images"]?.[0]?.link }}
                  className="absolute w-full h-full"
                />
                <View className="absolute inset-0 bg-black/30" />
                <View className="absolute bottom-0 left-0 right-0 p-4">
                  <Text className="text-white text-2xl font-bold mb-1">{hall.name}</Text>
                  <View className="flex-row items-center gap-x-3">
                    <View className="flex-row items-center gap-x-1">
                      <Ionicons name="location" size={16} color="white" />
                      <Text className="text-gray-200 text-sm">{hall.location}</Text>
                    </View>
                    <View className="flex-row items-center gap-x-1">
                      <Ionicons name="people" size={16} color="white" />
                      <Text className="text-gray-200 text-sm">{hall.capacity}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Recommended */}
        <View className="mt-10">
          <View className="flex-row justify-between items-center px-6 mb-4">
            <Text className="text-xl font-bold text-gray-900">Recommended for You</Text>
            <TouchableOpacity>
              <Text className="text-indigo-600 font-semibold">View All</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pl-4">
            {spaces.slice(0, 5).map((hall: any) => (
              <TouchableOpacity
                key={`rec-${hall.id}`}
                className="w-64 h-64 rounded-2xl overflow-hidden mr-4 bg-gray-700"
                onPress={() => navigate(`/space/${hall.id}`)}
              >
                <Image
                  source={{ uri: hall["spaces-images"]?.[0]?.link }}
                  className="absolute w-full h-full"
                />
                <View className="absolute inset-0 bg-black/25" />
                <View className="absolute bottom-0 left-0 right-0 p-3">
                  <Text className="text-white text-lg font-semibold">{hall.name}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Special Promotions */}
        <View className="mt-10 mb-6">
          <View className="flex-row justify-between items-center px-6 mb-4">
            <Text className="text-xl font-bold text-gray-900">Special Promotions</Text>
            <TouchableOpacity>
              <Text className="text-indigo-600 font-semibold">View All</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pl-4">
            {spaces.slice(0, 3).map((hall: any) => (
              <TouchableOpacity
                key={`promo-${hall.id}`}
                className="w-80 h-48 rounded-2xl overflow-hidden mr-4 bg-gray-700"
                onPress={() => navigate(`/space/${hall.id}`)}
              >
                <Image
                  source={{ uri: hall["spaces-images"]?.[0]?.link }}
                  className="absolute w-full h-full"
                />
                <View className="absolute inset-0 bg-black/40" />
                <View className="absolute top-0 left-0 right-0 p-4">
                  <Text className="text-white text-lg font-bold">Special Offer!</Text>
                  <Text className="text-white text-sm mt-1">
                    Book {hall.name} now and save 20%!
                  </Text>
                </View>
                <View className="absolute bottom-0 left-0 right-0 p-4">
                  <View className="flex-row items-center gap-x-2">
                    <Ionicons name="pricetag" size={16} color="white" />
                    <Text className="text-white text-sm font-semibold">
                      Limited Time Deal
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};


const App = () => {
  return <Home  />;
}


export default App;
