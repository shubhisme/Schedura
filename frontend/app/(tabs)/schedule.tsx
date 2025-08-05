import React, { useState, FC } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ParallaxScrollView from '@/components/ParallaxScrollView'; 
import { ThemedText } from '@/components/ThemedText'; 
import { ThemedView } from '@/components/ThemedView'; 


interface ScheduleEvent {
  id: string;
  title: string;
  hallName: string;
  time: string;
  date: string;
  status: 'Upcoming' | 'Completed' | 'Cancelled';
  image: string;
}


const scheduleData: ScheduleEvent[] = [
  {
    id: '1',
    title: 'Wedding Reception',
    hallName: 'The Grandeur Hall',
    time: '4:00 PM - 10:00 PM',
    date: 'Aug 10, 2025',
    status: 'Upcoming',
    image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=200&h=200&fit=crop',
  },
  {
    id: '2',
    title: 'Tech Conference 2025',
    hallName: 'Crystal Palace',
    time: '9:00 AM - 5:00 PM',
    date: 'Aug 15, 2025',
    status: 'Upcoming',
    image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=200&h=200&fit=crop',
  },
  {
    id: '3',
    title: 'Annual Corporate Gala',
    hallName: 'Royal Gardens',
    time: '7:00 PM - 11:00 PM',
    date: 'Jul 28, 2025',
    status: 'Completed',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=200&h=200&fit=crop',
  },
    {
    id: '4',
    title: 'Birthday Celebration',
    hallName: 'Sunset Pavilion',
    time: '6:00 PM - 9:00 PM',
    date: 'Aug 22, 2025',
    status: 'Upcoming',
    image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=200&h=200&fit=crop'
  },
];

const ScheduleHeader: FC = () => (
    <ThemedView className="px-4 pt-12 pb-4 bg-gray-900 ">
        <ThemedText type="title" className="text-white">My Schedule</ThemedText>
        <ThemedText className="text-gray-400 mt-1">Here are your upcoming events and bookings.</ThemedText>
    </ThemedView>
);

const DateFilterPills: FC = () => {
    const [activeFilter, setActiveFilter] = useState('Upcoming');
    const filters = ['All', 'Upcoming', 'Completed', 'Cancelled'];

    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12, gap: 10 }}>
            {filters.map(filter => (
                <TouchableOpacity
                    key={filter}
                    onPress={() => setActiveFilter(filter)}
                    className={`px-5 py-2.5 rounded-full ${activeFilter === filter ? 'bg-purple-600' : 'bg-white'}`}
                >
                    <Text className={`font-medium ${activeFilter === filter ? 'text-white' : 'text-gray-700'}`}>{filter}</Text>
                </TouchableOpacity>
            ))}
        </ScrollView>
    );
};


const ScheduleCard: FC<{ event: ScheduleEvent }> = ({ event }) => {
    const getStatusStyles = () => {
        switch(event.status) {
            case 'Upcoming': return 'bg-blue-100 text-blue-800';
            case 'Completed': return 'bg-green-100 text-green-800';
            case 'Cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    }

    return (
        <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
            <View className="flex-row gap-4">
                <Image source={{ uri: event.image }} className="w-20 h-24 rounded-lg" />
                <View className="flex-1">
                    <Text className={`text-xs font-bold px-2 py-1 self-start rounded mb-2 ${getStatusStyles()}`}>{event.status}</Text>
                    <Text className="text-lg font-bold text-gray-900">{event.title}</Text>
                    <View className="flex-row items-center mt-1 gap-1.5">
                        <Ionicons name="location-outline" size={14} color="#6b7280" />
                        <Text className="text-gray-600 text-sm">{event.hallName}</Text>
                    </View>
                    <View className="flex-row items-center mt-1 gap-1.5">
                        <Ionicons name="time-outline" size={14} color="#6b7280" />
                        <Text className="text-gray-600 text-sm">{event.time}</Text>
                    </View>
                </View>
            </View>
        </View>
    );
};

const ScheduleScreen: FC = () => {
    return (
        <ParallaxScrollView
            headerBackgroundColor={{ light: '#111827', dark: '#111827' }}
            headerImage={<ScheduleHeader />}
        >
            <ThemedView className="bg-gray-100">
                <DateFilterPills />
                <View className="p-4">
                    {scheduleData.map(event => (
                        <ScheduleCard key={event.id} event={event} />
                    ))}
                </View>
            </ThemedView>
        </ParallaxScrollView>
    );
}

export default ScheduleScreen;
