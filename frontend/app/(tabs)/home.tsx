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
import { getSpaces } from '@/supabase/controllers/spaces.controller';

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

  const toggleLike = () => {
    setIsLiked(previousState => !previousState);
  };
  return(
    <TouchableOpacity className="w-[75vw] h-72 rounded-3xl overflow-hidden mr-4 bg-gray-900">
      <Image source={{ uri: hall.image }} className="absolute w-full h-full" />
      <View className="absolute inset-0 bg-black/30" />

      <View className="absolute top-4 left-4 flex-row items-center gap-1 bg-white px-3 py-1 rounded-full">
        <Ionicons name="star" size={14} color="#facc15" />
        <Text className="text-black mt-1">{hall.rating}</Text>
      </View>

      <View className="absolute bottom-0 left-0 right-0 p-4 pb-2">
        <Text className="text-white text-2xl font-bold mb-1">{hall.name}</Text>
        
        <View className='flex-row w-full gap-5'>
          <View className="flex-row items-center gap-1 mb-1">
            <Ionicons name="location" size={20} color="white" className='-mt-1.5'/>
            <Text className="text-gray-300 text-lg ">{hall.location}</Text>
          </View>
          <View className='flex-row items-center gap-1 mb-1'>
            <Ionicons name="people" size={20} color="white" className='-mt-1.5'/>
            <Text className="text-gray-300 text-lg ">{hall.capacity}</Text>
          </View>
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
  const [spaces, setSpaces] = useState<any>([])
  
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

  useEffect(()=>{
    fetchSpaces();
  },[])

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <StatusBar barStyle="light-content" backgroundColor="#111827" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="bg-primary rounded-b-3xl pb-7">
          <Header profile={profile} />
          <SearchBar />
          <CategoryPills />
        </View>

        <View className="p-4 pt-6">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-2xl px-2 font-bold text-gray-900">Featured Venues</Text>
            <TouchableOpacity>
              <Text className="text-black font-medium">View All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-4 px-6 pb-4">
            {spaces.map((space:any) => <VenueCard key={space.id} hall={{...space, price:space.pph, rating:5, isNew:true, image:space["spaces-images"][0].link}} />)}
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
