import React, { useState, FC, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
  SafeAreaView,
  StatusBar,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import CreateEventScreen from '../CreateEventScreen';

const { width } = Dimensions.get('window');

type EventStatus = 'Upcoming' | 'Completed' | 'Cancelled';
type EventCategory = 'Wedding' | 'Conference' | 'Corporate' | 'Birthday' | 'Social';

interface ScheduleEvent {
  id: string;
  title: string;
  hallName: string;
  time: string;
  date: string;
  status: EventStatus;
  image: string;
  category: EventCategory;
  attendees?: number;
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
    category: 'Wedding',
    attendees: 150,
  },
  {
    id: '2',
    title: 'Tech Conference 2025',
    hallName: 'Crystal Palace',
    time: '9:00 AM - 5:00 PM',
    date: 'Aug 15, 2025',
    status: 'Upcoming',
    image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=200&h=200&fit=crop',
    category: 'Conference',
    attendees: 300,
  },
  {
    id: '3',
    title: 'Annual Corporate Gala',
    hallName: 'Royal Gardens',
    time: '7:00 PM - 11:00 PM',
    date: 'Jul 28, 2025',
    status: 'Completed',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=200&h=200&fit=crop',
    category: 'Corporate',
    attendees: 200,
  },
    {
    id: '4',
    title: 'Birthday Celebration',
    hallName: 'Sunset Pavilion',
    time: '6:00 PM - 9:00 PM',
    date: 'Aug 22, 2025',
    status: 'Upcoming',
    image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=200&h=200&fit=crop',
    category: 'Birthday',
    attendees: 50,
  },
   {
    id: '5',
    title: 'Product Launch Event',
    hallName: 'Crystal Palace',
    time: '2:00 PM - 5:00 PM',
    date: 'Aug 15, 2025',
    status: 'Cancelled',
    image: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=200&h=200&fit=crop',
    category: 'Corporate',
    attendees: 120,
  },
];



const ScheduleHeader: FC = () => (
  <ThemedView className="px-6 pt-16 pb-8 relative overflow-hidden">
    <View className="absolute inset-0 bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900" />
    <View className="absolute -top-10 -right-10 w-32 h-32 bg-white opacity-5 rounded-full" />
    <View className="absolute top-20 -left-8 w-20 h-20 bg-white opacity-10 rounded-full" />
    
    <View className="relative z-10">
      <View className="flex-row items-center justify-between mb-4">
        <View>
          <ThemedText type="title" className="text-white text-3xl font-bold mb-2">
            My Schedule
          </ThemedText>
          <ThemedText className="text-purple-200 text-base">
            Manage your upcoming events and bookings
          </ThemedText>
        </View>
        <TouchableOpacity className="bg-white/20 p-3 rounded-full backdrop-blur-sm">
          <Ionicons name="calendar-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>
      
      <View className="flex-row gap-4 mt-6">
        <View className="bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-3 flex-1">
          <Text className="text-white/60 text-xs font-medium">UPCOMING</Text>
          <Text className="text-white text-xl font-bold">3</Text>
        </View>
        <View className="bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-3 flex-1">
          <Text className="text-white/60 text-xs font-medium">THIS WEEK</Text>
          <Text className="text-white text-xl font-bold">2</Text>
        </View>
      </View>
    </View>
  </ThemedView>
);


const DateFilterPills: FC<{ activeFilter: string, onFilterChange: (filter: EventStatus | 'All') => void }> = ({ activeFilter, onFilterChange }) => {
    const filters: (EventStatus | 'All')[] = ['All', 'Upcoming', 'Completed', 'Cancelled'];

    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12, gap: 10 }}>
            {filters.map(filter => (
                <TouchableOpacity
                    key={filter}
                    onPress={() => onFilterChange(filter)}
                    className={`px-5 py-2.5 rounded-full ${activeFilter === filter ? 'bg-purple-600' : 'bg-white shadow-sm'}`}
                >
                    <Text className={`font-medium ${activeFilter === filter ? 'text-white' : 'text-gray-700'}`}>{filter}</Text>
                </TouchableOpacity>
            ))}
        </ScrollView>
    );
};


const ScheduleCard: FC<{ event: ScheduleEvent }> = ({ event }) => {
    const statusStyle = useMemo(() => {
        switch(event.status) {
            case 'Upcoming': return { container: 'bg-blue-50 border-blue-200', text: 'text-blue-800' };
            case 'Completed': return { container: 'bg-green-50 border-green-200', text: 'text-green-800' };
            case 'Cancelled': return { container: 'bg-red-50 border-red-200', text: 'text-red-800' };
            default: return { container: 'bg-gray-50 border-gray-200', text: 'text-gray-800' };
        }
    }, [event.status]);

    return (
        <View className={`bg-white rounded-2xl p-4 border-l-4 ${statusStyle.container} mb-4`}>
            <View className="flex-row gap-4 items-center">
                <Image source={{ uri: event.image }} className="w-20 h-24 rounded-lg" />
                <View className="flex-1">
                    <Text className="text-lg font-bold text-gray-900 mb-1">{event.title}</Text>
                    <View className="flex-row items-center mb-1 gap-1.5"><Ionicons name="location-outline" size={14} color="#6b7280" /><Text className="text-gray-600 text-sm">{event.hallName}</Text></View>
                    <View className="flex-row items-center gap-1.5"><Ionicons name="time-outline" size={14} color="#6b7280" /><Text className="text-gray-600 text-sm">{event.time}</Text></View>
                </View>
                <Text className={`absolute top-2 right-2 text-xs font-bold px-2 py-1 rounded-full ${statusStyle.container} ${statusStyle.text}`}>{event.status}</Text>
            </View>
        </View>
    );
};

const EmptyState: FC<{ onBook: () => void }> = ({ onBook }) => (
  <View className="items-center justify-center py-16">
    <View className="bg-gray-100 p-6 rounded-full mb-4">
      <Ionicons name="calendar-outline" size={32} color="#9ca3af" />
    </View>
    <Text className="text-gray-500 text-lg font-semibold mb-2">No events found</Text>
    <Text className="text-gray-400 text-sm text-center px-8">
      You don't have any events scheduled yet. Create your first booking to get started.
    </Text>
    <TouchableOpacity onPress={onBook} className="bg-purple-600 px-6 py-3 rounded-full mt-6">
      <Text className="text-white font-semibold">Book New Event</Text>
    </TouchableOpacity>
  </View>
);

const ScheduleListScreen: FC<{ onNavigateToCreate: () => void }> = ({ onNavigateToCreate }) => {
  const [activeFilter, setActiveFilter] = useState<EventStatus | 'All'>('Upcoming');
  
  const filteredData = useMemo(() => activeFilter === 'All' 
    ? scheduleData 
    : scheduleData.filter(event => event.status === activeFilter), [activeFilter]);

  return (
    <View className="flex-1 bg-gray-50">
        <ParallaxScrollView
            headerBackgroundColor={{ light: '#7c3aed', dark: '#7c3aed' }}
            headerImage={<ScheduleHeader />}
        >
            <ThemedView className="bg-gray-50">
                <DateFilterPills activeFilter={activeFilter} onFilterChange={setActiveFilter} />
                
                <View className="px-6 py-4 pb-24">
                    {filteredData.length > 0 ? (
                        <>
                            <View className="flex-row items-center justify-between mb-6">
                                <Text className="text-gray-900 text-lg font-bold">
                                    {filteredData.length} {activeFilter.toLowerCase()} event{filteredData.length !== 1 ? 's' : ''}
                                </Text>
                                <TouchableOpacity className="flex-row items-center gap-1">
                                    <Text className="text-purple-600 text-sm font-medium">Sort by</Text>
                                    <Ionicons name="chevron-down-outline" size={16} color="#7c3aed" />
                                </TouchableOpacity>
                            </View>
                            
                            {filteredData.map(event => (
                                <ScheduleCard key={event.id} event={event} />
                            ))}
                        </>
                    ) : (
                        <EmptyState onBook={onNavigateToCreate} />
                    )}
                </View>
            </ThemedView>
        </ParallaxScrollView>
        <TouchableOpacity 
            onPress={onNavigateToCreate}
            className="absolute bottom-6 right-6 bg-purple-600 w-16 h-16 rounded-full items-center justify-center"
            style={{
                shadowColor: '#7c3aed',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
            }}
        >
            <Ionicons name="add" size={28} color="white" />
        </TouchableOpacity>
    </View>
  );
};


const App: FC = () => {
    const [isCreating, setIsCreating] = useState(false);

    if (isCreating) {
        return <CreateEventScreen onCancel={() => setIsCreating(false)} />;
    }

    return <ScheduleListScreen onNavigateToCreate={() => setIsCreating(true)} />;
}


export default App;
