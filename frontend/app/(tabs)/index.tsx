import React, { useState, useEffect, FC } from 'react';
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
// kept like this till all db is finished
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
  icon: keyof typeof Ionicons.glyphMap;
}

interface Booking {
  id: number;
  hallName: string;
  date: string;
  status: 'Confirmed' | 'Pending';
  statusColor: string;
  statusBg: string;
  amount: string;
  image: string;
}


const featuredHalls: Hall[] = [
  {
    id: 1,
    name: 'The Grandeur Hall',
    location: 'Downtown Plaza',
    price: 80000,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400&h=300&fit=crop',
    capacity: '200-300 guests',
    isNew: true,
  },
  {
    id: 2,
    name: 'Crystal Palace',
    location: 'City Center',
    price: 350000,
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400&h=300&fit=crop',
    capacity: '100-150 guests',
    isNew: false,
  },
  {
    id: 3,
    name: 'Royal Gardens',
    location: 'Uptown District',
    price: 75000,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop',
    capacity: '300-500 guests',
    isNew: false,
  },
];

const categories: Category[] = [
  { id: 1, name: 'Wedding', icon: 'heart-outline' },
  { id: 2, name: 'Corporate', icon: 'briefcase-outline' },
  { id: 3, name: 'Birthday', icon: 'gift-outline' },
  { id: 4, name: 'Conference', icon: 'people-outline' },
  { id: 5, name: 'Social', icon: 'chatbubbles-outline' },
];

const recentBookings: Booking[] = [
    {
      id: 1,
      hallName: 'Sunset Pavilion',
      date: 'Dec 25, 2024',
      status: 'Confirmed',
      statusColor: '#16a34a',
      statusBg: '#dcfce7',
      amount: '$450',
      image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=100&h=100&fit=crop'
    },
    {
      id: 2,
      hallName: 'Royal Gardens',
      date: 'Jan 15, 2025',
      status: 'Pending',
      statusColor: '#ea580c',
      statusBg: '#fff7ed',
      amount: '$750',
      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=100&h=100&fit=crop'
    },
];


const Header: FC<{ profile: UserProfile | null }> = ({ profile }) => (
  <View className="flex-row justify-between items-center px-4 pt-6 pb-4 mt-6">
    <View>
      <Text className="text-white text-2xl font-bold">Find Your Perfect Venue</Text>
    </View>
  </View>
);

const SearchBar: FC = () => (
  <View className="flex-row gap-3 px-4 mt-4">
    <View className="flex-1 flex-row items-center bg-gray-800 rounded-2xl px-4">
      <Ionicons name="search" size={20} color="#9ca3af" />
      <TextInput
        placeholder="Search venues, locations..."
        placeholderTextColor="#9ca3af"
        className="flex-1 text-white text-base py-3 ml-2"
      />
    </View>
    <TouchableOpacity className="bg-purple-600 p-3 rounded-2xl justify-center items-center">
      <Ionicons name="options-outline" size={24} color="#fff" />
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
          className={`flex-row items-center gap-2 px-5 py-3 rounded-full ${index === activeCategory ? 'bg-purple-600' : 'bg-gray-800'}`}
        >
          <Ionicons name={category.icon} size={20} color={index === activeCategory ? '#fff' : '#d1d5db'} />
          <Text className={`text-sm font-medium ${index === activeCategory ? 'text-white' : 'text-gray-400'}`}>
            {category.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const VenueCard: FC<{ hall: Hall }> = ({ hall }) => {
  const [isLiked, setIsLiked] = useState(false);

  const toggleLike = () => {
    setIsLiked(previousState => !previousState);
  };
  return(
    <TouchableOpacity className="w-[75vw] h-72 rounded-3xl overflow-hidden mr-4 bg-gray-900">
      <Image source={{ uri: hall.image }} className="absolute w-full h-full" />
      <View className="absolute inset-0 bg-black/30" />

      <TouchableOpacity onPress={toggleLike} className="absolute top-4 right-4 p-2 bg-black/40 rounded-full">
        <Ionicons
          name={isLiked ? "heart" : "heart-outline"}
          size={22}
          color={isLiked ? "#ef4444" : "#fff"}
        />
      </TouchableOpacity>

      <View className="absolute top-4 left-4 flex-row items-center gap-1 bg-black/50 px-3 py-1 rounded-full">
        <Ionicons name="star" size={14} color="#facc15" />
        <Text className="text-white text-sm font-medium">{hall.rating}</Text>
      </View>

      <View className="absolute bottom-0 left-0 right-0 p-4">
        <Text className="text-white text-xl font-bold mb-1">{hall.name}</Text>
        <View className="flex-row items-center gap-1 mb-2">
          <Ionicons name="location-outline" size={14} color="#d1d5db" />
          <Text className="text-gray-300 text-sm">{hall.location}</Text>
        </View>
        <View className="flex-row items-center justify-between">
          <Text className="text-white text-2xl font-bold">
            Rs.{hall.price}<Text className="text-sm font-normal text-gray-300">/day</Text>
          </Text>
          <Text className="text-gray-300 text-sm">{hall.capacity}</Text>
        </View>
      </View>
    </TouchableOpacity>
  )
};

const RecentBookingItem: FC<{ booking: Booking }> = ({ booking }) => (
  <TouchableOpacity className="flex-row items-center gap-4 bg-white rounded-2xl p-4 shadow-sm">
    <Image source={{ uri: booking.image }} className="w-16 h-16 rounded-xl" />
    <View className="flex-1">
      <Text className="font-semibold text-gray-900 mb-1 text-base">{booking.hallName}</Text>
      <Text className="text-gray-500 text-sm">{booking.date}</Text>
    </View>
    <View className="items-end">
      <View style={{ backgroundColor: booking.statusBg }} className="flex-row items-center gap-2 px-3 py-1 rounded-full mb-2">
        <View style={{ backgroundColor: booking.statusColor }} className="w-2 h-2 rounded-full" />
        <Text style={{ color: booking.statusColor }} className="text-xs font-medium">{booking.status}</Text>
      </View>
      <Text className="font-bold text-gray-900 text-base">{booking.amount}</Text>
    </View>
  </TouchableOpacity>
);

const HomePage: FC<{ profile: UserProfile | null }> = ({ profile }) => {
  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <StatusBar barStyle="light-content" backgroundColor="#111827" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="bg-gray-900 rounded-b-3xl pb-7">
          <Header profile={profile} />
          <SearchBar />
          <CategoryPills />
        </View>

        <View className="p-4 pt-6">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-2xl font-bold text-gray-900">Featured Venues</Text>
            <TouchableOpacity>
              <Text className="text-purple-600 font-medium">View All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-4 px-4 pb-4">
            {featuredHalls.map((hall) => <VenueCard key={hall.id} hall={hall} />)}
          </ScrollView>

          <View className="flex-row justify-between items-center my-6">
            <Text className="text-2xl font-bold text-gray-900">Recent Activity</Text>
            <TouchableOpacity>
              <Text className="text-purple-600 font-medium">View All</Text>
            </TouchableOpacity>
          </View>
          <View className="space-y-4">
            {recentBookings.map((booking) => <RecentBookingItem key={booking.id} booking={booking} />)}
          </View>
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
