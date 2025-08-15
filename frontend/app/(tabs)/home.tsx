import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getSpaceFromId, getSpaces } from '@/supabase/controllers/spaces.controller';

type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          avatar_url?: string;
          role: 'owner' | 'user';
        };
      };
    };
  };
};

type UserProfile = Database['public']['Tables']['users']['Row'];


interface Hall {
  id: number;
  name: string;
  location: string;
  price: number;
  rating: number;
  image: string;
  capacity: string;
  isNew: boolean;
}

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

const recentBookings: Booking[] = [
    {
      id: 1,
      hallName: 'Sunset Pavilion',
      date: 'Dec 25, 2024',
      status: 'Confirmed',
      statusColor: '#16a34a',
      statusBg: '#dcfce7',
      amount: 'Rs. 50,000',
      image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=100&h=100&fit=crop'
    },
    {
      id: 2,
      hallName: 'Royal Gardens',
      date: 'Jan 15, 2025',
      status: 'Pending',
      statusColor: '#ea580c',
      statusBg: '#fff7ed',
      amount: 'Rs. 30,000',
      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=100&h=100&fit=crop'
    },
];

const Header: FC<{ profile: UserProfile | null }> = ({ profile }) => (
  <View className="flex-row justify-between items-center px-6 pt-6 pb-4 mt-6">
    <View>
      <Text className="text-black text-3xl font-bold">Explore</Text>
    </View>
  </View>
);

const SearchBar: FC = () => (
  <View className="flex-row gap-3 px-6 mt-4">
    <View className="flex-1 flex-row items-center bg-white rounded-2xl px-6">
      <Ionicons name="search" size={20} color="#9ca3af" className='-mt-1'/>
      <TextInput
        placeholder="Search venues, locations..."
        placeholderTextColor="#9ca3af"
        className="flex-1 text-black text-lg py-4 ml-2"
      />
   </View>
    <TouchableOpacity className="bg-white aspect-square p-3 rounded-2xl justify-center items-center">
      <Ionicons name="options-outline" size={24} color="#000" />
    </TouchableOpacity>
  </View>
);

const CategoryPills: FC = () => {
  const [activeCategory, setActiveCategory] = useState<number>(0);

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, marginTop: 24, gap: 12, paddingBottom: 4 }}>
      {categories.map((category, index) => (
        <TouchableOpacity
          key={category.id}
          onPress={() => setActiveCategory(index)}
          className={`flex-row justify-center items-center gap-2 px-5 py-3 rounded-full ${index === activeCategory ? 'bg-black' : 'bg-white'}`}
        >
          <Ionicons name={category.icon} size={20} color={index === activeCategory ? '#fff' : '#000'}  />
          <Text className={`text-md mt-1 ${index === activeCategory ? 'text-white' : 'text-black'}`}>
            {category.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const VenueCard: FC<{ hall: Hall }> = ({ hall }) => {
  const [isLiked, setIsLiked] = useState(false);

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
        if(data && data.length>0 && data[0]?.id)
          await spaceThruId(data[0]?.id)
        console.log("Fetched spaces:", data);
      }
    } catch (error) {
      console.error("Error in fetchSpaces:", error);
    }
  };

  const spaceThruId = async (spaceId:string)=>
  {
    try
    {
        const {data, error} = await getSpaceFromId(spaceId);
        if(error){console.log(error?.message)}
        else{console.log("Returned Data: ",data)}
    }catch(error){console.log(error)}
  }

  useEffect(()=>{
    fetchSpaces();
  }, []);
  

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <StatusBar barStyle="dark-content" backgroundColor="#E9F0E9" />
      <View style={{ backgroundColor: "#E9F0E9" }} className="px-6 pt-12 pb-6">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-1">
            <Text className="text-3xl font-bold text-gray-900">Explore</Text>
            <Text className="text-lg text-gray-600 mt-1">Hi, {profile?.name}!</Text>
          </View>
          <View className="flex-row items-center space-x-3">
            <TouchableOpacity className="bg-white/70 p-2 rounded-full">
              <Ionicons name="notifications-outline" size={22} color="#374151" />
            </TouchableOpacity>
            <TouchableOpacity className="bg-white/70 p-2 rounded-full">
              <Ionicons name="person-circle-outline" size={26} color="#374151" />
            </TouchableOpacity>
          </View>
        </View>

        <View className="flex-row items-center space-x-3">
          <View className="flex-1 flex-row items-center bg-white/80 rounded-2xl px-4 shadow-sm border border-white/50">
            <Ionicons name="search" size={20} color="#6b7280" />
            <TextInput
              placeholder="Search venues, locations..."
              placeholderTextColor="#6b7280"
              className="flex-1 py-4 ml-3 text-base text-gray-900"
            />
          </View>
          <TouchableOpacity className="bg-white/80 p-3 rounded-2xl shadow-sm border border-white/50">
            <Ionicons name="options-outline" size={24} color="#374151" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 bg-gray-100">
        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="px-4 mt-6"
          contentContainerStyle={{ columnGap: 12 }}
        >
          {categories.map((category: Category, index: number) => (
            <TouchableOpacity
              key={category.id}
              onPress={() => setActiveCategory(index)}
              className={`flex-row items-center space-x-2 px-5 py-3 rounded-full ${
                index === activeCategory ? "bg-gray-900" : "bg-white"
              }`}
            >
              <Ionicons
                name={category.icon}
                size={20}
                color={index === activeCategory ? "#fff" : "#000"}
              />
              <Text
                className={`text-sm font-medium ${
                  index === activeCategory ? "text-white" : "text-black"
                }`}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Featured Venues */}
        <View className="mt-8">
          <View className="flex-row justify-between items-center px-6 mb-4">
            <Text className="text-xl font-bold text-gray-900">Featured Venues</Text>
            <TouchableOpacity>
              <Text className="text-indigo-600 font-semibold">View All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-4 px-6 pb-4">
            {spaces.map((space:any) => <VenueCard key={space.id} hall={{...space, price:space.pph, rating:5, isNew:true, image:space["spaces_images"]?.[0]?.link}} />)}
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
                onPress={() => navigation.navigate("hall-details", { hall })}
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
                onPress={() => navigation.navigate("hall-details", { hall })}
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
                  <View className="flex-row items-center space-x-2">
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


const App: FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const mockProfile: UserProfile = {
      id: "1",
      email: "posture@gmail.com",
      name: "Posture Man",
      role: "user",
      avatar_url: "",
    };
    
    setProfile(mockProfile);
  }, []);

  return <HomePage profile={profile} />;
}


export default App;
