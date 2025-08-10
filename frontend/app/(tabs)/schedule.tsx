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
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import CreateEventScreen from '../CreateEventScreen';

const { width, height } = Dimensions.get('window');

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
  priority?: 'High' | 'Medium' | 'Low'; // Added priority
  description?: string; // Added description
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
    priority: 'High',
    description: 'Elegant wedding reception with dinner and dancing',
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
    priority: 'Medium',
    description: 'Annual technology conference with keynote speakers',
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
    priority: 'High',
    description: 'Formal corporate gala with awards ceremony',
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
    priority: 'Low',
    description: 'Intimate birthday party with close friends and family',
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
    priority: 'Medium',
    description: 'Product launch with media and stakeholders',
  },
];

// Enhanced Header Component
const ScheduleHeader: FC<{ 
  searchQuery: string, 
  onSearchChange: (query: string) => void,
  upcomingCount: number,
  thisWeekCount: number 
}> = ({ searchQuery, onSearchChange, upcomingCount, thisWeekCount }) => (
  <LinearGradient
    colors={['#E9F0E9', '#D8E8D8']} // Keeping the vibrant gradient for the header
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    className="px-6 pt-16 pb-8 relative overflow-hidden"
  >
    {/* Decorative Elements */}
    <View className="absolute -top-10 -right-10 w-40 h-40 bg-black/10 rounded-full" />
    <View className="absolute top-20 -left-8 w-24 h-24 bg-black/5 rounded-full" />
    <View className="absolute bottom-10 right-20 w-16 h-16 bg-black/10 rounded-full" />
    
    <View className="relative z-10">
      {/* Header Title Section */}
      <View className="flex-row items-center justify-between mb-6">
        <View className="flex-1">
          <Text className="text-black text-3xl font-bold mb-2">
            My Schedule
          </Text>
          <Text className="text-black/80 text-base">
            Manage your events and bookings
          </Text>
        </View>
        
        <View className="flex-row gap-3">
          <TouchableOpacity className="bg-black/20 p-3 rounded-full backdrop-blur-sm">
            <Ionicons name="notifications-outline" size={22} color="black" />
          </TouchableOpacity>
          <TouchableOpacity className="bg-black/20 p-3 rounded-full backdrop-blur-sm">
            <Ionicons name="calendar-outline" size={22} color="black" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View className="bg-black/20 backdrop-blur-sm rounded-2xl px-4 py-3 mb-6 flex-row items-center">
        <Ionicons name="search-outline" size={20} color="black" />
        <TextInput
          value={searchQuery}
          onChangeText={onSearchChange}
          placeholder="Search events..."
          placeholderTextColor="rgba(255,255,255,0.7)"
          className="flex-1 ml-3 text-black text-base"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => onSearchChange('')}>
            <Ionicons name="close-circle" size={20} color="black" />
          </TouchableOpacity>
        )}
      </View>
      
      {/* Stats Cards */}
      <View className="flex-row gap-4">
        <View className="bg-black/15 backdrop-blur-sm rounded-2xl px-5 py-4 flex-1">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-black/70 text-xs font-semibold uppercase tracking-wide">
                Upcoming
              </Text>
              <Text className="text-black text-2xl font-bold mt-1">
                {upcomingCount}
              </Text>
            </View>
            <View className="bg-black/20 p-2 rounded-full">
              <Ionicons name="calendar" size={16} color="black" />
            </View>
          </View>
        </View>
        
        <View className="bg-black/15 backdrop-blur-sm rounded-2xl px-5 py-4 flex-1">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-black/70 text-xs font-semibold uppercase tracking-wide">
                This Week
              </Text>
              <Text className="text-black text-2xl font-bold mt-1">
                {thisWeekCount}
              </Text>
            </View>
            <View className="bg-black/20 p-2 rounded-full">
              <Ionicons name="time" size={16} color="black" />
            </View>
          </View>
        </View>
      </View>
    </View>
  </LinearGradient>
);

// Enhanced Filter Pills
const DateFilterPills: FC<{ 
  activeFilter: string, 
  onFilterChange: (filter: EventStatus | 'All') => void 
}> = ({ activeFilter, onFilterChange }) => {
  const filters: (EventStatus | 'All')[] = ['All', 'Upcoming', 'Completed', 'Cancelled'];
  
  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false} 
      contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 16 }}
    >
      <View className="flex-row gap-3">
        {filters.map(filter => (
          <TouchableOpacity
            key={filter}
            onPress={() => onFilterChange(filter)}
            className={`px-6 py-3 rounded-full border ${
              activeFilter === filter 
                ? 'bg-black border-black' 
                : 'bg-white border-gray-200' // Inactive pills remain white with a subtle border
            }`}
            style={{
              shadowColor: activeFilter === filter ? '#7c3aed' : '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: activeFilter === filter ? 0.2 : 0.05, // Reduced shadow for inactive
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <Text className={`font-semibold ${
              activeFilter === filter ? 'text-white' : 'text-gray-700'
            }`}>
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

// Enhanced Schedule Card
const ScheduleCard: FC<{ 
  event: ScheduleEvent, 
  onPress: () => void,
  onEdit: () => void,
  onDelete: () => void 
}> = ({ event, onPress, onEdit, onDelete }) => {
  const [showActions, setShowActions] = useState(false);
  
  const statusConfig = useMemo(() => {
    switch(event.status) {
      case 'Upcoming': 
        return { 
          bg: 'bg-blue-50', 
          border: 'border-l-blue-500', 
          text: 'text-blue-700',
          icon: 'time-outline' as const,
          iconColor: '#3b82f6'
        };
      case 'Completed': 
        return { 
          bg: 'bg-green-50', 
          border: 'border-l-green-500', 
          text: 'text-green-700',
          icon: 'checkmark-circle-outline' as const,
          iconColor: '#10b981'
        };
      case 'Cancelled': 
        return { 
          bg: 'bg-red-50', 
          border: 'border-l-red-500', 
          text: 'text-red-700',
          icon: 'close-circle-outline' as const,
          iconColor: '#ef4444'
        };
      default: 
        return { 
          bg: 'bg-gray-50', 
          border: 'border-l-gray-500', 
          text: 'text-gray-700',
          icon: 'calendar-outline' as const,
          iconColor: '#6b7280'
        };
    }
  }, [event.status]);

  const priorityColor = useMemo(() => {
    switch(event.priority) {
      case 'High': return '#ef4444';
      case 'Medium': return '#f59e0b';
      case 'Low': return '#10b981';
      default: return '#6b7280';
    }
  }, [event.priority]);

  return (
    <TouchableOpacity 
      onPress={onPress}
      onLongPress={() => setShowActions(!showActions)}
      className={`bg-white rounded-2xl p-5 mb-4 ${statusConfig.border} border-l-4`}
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
      }}
    >
      <View className="flex-row gap-4">
        {/* Event Image */}
        <View className="relative">
          <Image 
            source={{ uri: event.image }} 
            className="w-20 h-20 rounded-xl"
          />
          {event.priority && (
            <View 
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full"
              style={{ backgroundColor: priorityColor }}
            />
          )}
        </View>
        
        {/* Event Details */}
        <View className="flex-1">
          <View className="flex-row items-start justify-between mb-2">
            <Text className="text-lg font-bold text-gray-900 flex-1 pr-2">
              {event.title}
            </Text>
            <View className={`px-2 py-1 rounded-full ${statusConfig.bg} flex-row items-center`}>
              <Ionicons name={statusConfig.icon} size={12} color={statusConfig.iconColor} />
              <Text className={`text-xs font-semibold ml-1 ${statusConfig.text}`}>
                {event.status}
              </Text>
            </View>
          </View>
          
          <View className="space-y-1">
            <View className="flex-row items-center">
              <Ionicons name="location-outline" size={14} color="#6b7280" />
              <Text className="text-gray-600 text-sm ml-2">{event.hallName}</Text>
            </View>
            
            <View className="flex-row items-center">
              <Ionicons name="time-outline" size={14} color="#6b7280" />
              <Text className="text-gray-600 text-sm ml-2">{event.time}</Text>
            </View>
            
            <View className="flex-row items-center">
              <Ionicons name="calendar-outline" size={14} color="#6b7280" />
              <Text className="text-gray-600 text-sm ml-2">{event.date}</Text>
            </View>
          </View>
          
          {event.attendees && (
            <View className="flex-row items-center mt-2">
              <Ionicons name="people-outline" size={14} color="#6b7280" />
              <Text className="text-gray-600 text-sm ml-2">
                {event.attendees} attendees
              </Text>
            </View>
          )}
        </View>
      </View>
      
      {/* Action Buttons */}
      {showActions && (
        <View className="flex-row justify-end gap-2 mt-4 pt-4 border-t border-gray-100">
          <TouchableOpacity 
            onPress={onEdit}
            className="bg-blue-50 px-4 py-2 rounded-lg flex-row items-center"
          >
            <Ionicons name="pencil-outline" size={16} color="#3b82f6" />
            <Text className="text-blue-600 font-medium ml-1">Edit</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={onDelete}
            className="bg-red-50 px-4 py-2 rounded-lg flex-row items-center"
          >
            <Ionicons name="trash-outline" size={16} color="#ef4444" />
            <Text className="text-red-600 font-medium ml-1">Delete</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
};

// Enhanced Empty State
const EmptyState: FC<{ 
  onBook: () => void,
  searchQuery: string,
  activeFilter: string 
}> = ({ onBook, searchQuery, activeFilter }) => (
  <View className="items-center justify-center py-20">
    <View className="bg-[#DCE4DC] p-8 rounded-full mb-6"> {/* Adjusted background for icon */}
      <Ionicons 
        name={searchQuery ? "search-outline" : "calendar-outline"} 
        size={40} 
        color="#9ca3af" 
      />
    </View>
    
    <Text className="text-gray-900 text-xl font-bold mb-2">
      {searchQuery ? 'No results found' : `No ${activeFilter.toLowerCase()} events`}
    </Text>
    
    <Text className="text-gray-500 text-base text-center px-8 mb-8 leading-6">
      {searchQuery 
        ? `No events match "${searchQuery}". Try adjusting your search.`
        : `You don't have any ${activeFilter.toLowerCase()} events. Create your first booking to get started.`
      }
    </Text>
    
    <TouchableOpacity 
      onPress={onBook} 
      className="bg-purple-600 px-8 py-4 rounded-2xl flex-row items-center"
      style={{
        shadowColor: '#7c3aed',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
      }}
    >
      <Ionicons name="add" size={20} color="white" />
      <Text className="text-white font-semibold text-base ml-2">
        Create New Event
      </Text>
    </TouchableOpacity>
  </View>
);

// Main Schedule List Component
const ScheduleListScreen: FC<{ onNavigateToCreate: () => void }> = ({ onNavigateToCreate }) => {
  const [activeFilter, setActiveFilter] = useState<EventStatus | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // ... (useMemo hooks and handlers remain the same)

  const filteredData = useMemo(() => {
    let filtered = activeFilter === 'All' 
      ? scheduleData 
      : scheduleData.filter(event => event.status === activeFilter);
    
    if (searchQuery) {
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.hallName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  }, [activeFilter, searchQuery]);

  const upcomingCount = useMemo(() => 
    scheduleData.filter(event => event.status === 'Upcoming').length, 
    []
  );
  
  const thisWeekCount = useMemo(() => 2, []); // You can implement actual logic here

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleEventPress = (event: ScheduleEvent) => {
    // Navigate to event details
    console.log('Event pressed:', event.title);
  };

  const handleEditEvent = (event: ScheduleEvent) => {
    console.log('Edit event:', event.title);
  };

  const handleDeleteEvent = (event: ScheduleEvent) => {
    Alert.alert(
      'Delete Event',
      `Are you sure you want to delete "${event.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => console.log('Deleted') }
      ]
    );
  };
  
  return (
    <View className="flex-1 bg-gray-100"> {/* Changed main background */}
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      <ParallaxScrollView
        headerBackgroundColor={{ light: '#ffffff', dark: '#ffffff' }}
        headerImage={
          <ScheduleHeader 
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            upcomingCount={upcomingCount}
            thisWeekCount={thisWeekCount}
          />
        }
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={handleRefresh}
            tintColor="#000000" // Refresh indicator to black for light background
          />
        }
      >
        <ThemedView className="bg-gray-100"> {/* Changed ThemedView background */}
          <DateFilterPills 
            activeFilter={activeFilter} 
            onFilterChange={setActiveFilter} 
          />
          
          <View className="px-6 py-4 pb-32">
            {filteredData.length > 0 ? (
              <>
                <View className="flex-row items-center justify-between mb-6">
                <Text className="text-gray-900 text-xl font-bold">
                  {`${filteredData.length} event${filteredData.length !== 1 ? 's' : ''}`}
                </Text>
                  
                  <TouchableOpacity className="flex-row items-center bg-white px-4 py-2 rounded-full border border-gray-200">
                    <Text className="text-gray-700 text-sm font-medium mr-1">Sort by date</Text>
                    <Ionicons name="chevron-down-outline" size={16} color="#6b7280" />
                  </TouchableOpacity>
                </View>
                
                {filteredData.map(event => (
                  <ScheduleCard 
                    key={event.id} 
                    event={event}
                    onPress={() => handleEventPress(event)}
                    onEdit={() => handleEditEvent(event)}
                    onDelete={() => handleDeleteEvent(event)}
                  />
                ))}
              </>
            ) : (
              <EmptyState 
                onBook={onNavigateToCreate}
                searchQuery={searchQuery}
                activeFilter={activeFilter}
              />
            )}
          </View>
        </ThemedView>
      </ParallaxScrollView>
      
      {/* Floating Action Button */}
      <TouchableOpacity 
        onPress={onNavigateToCreate}
        className="absolute bottom-8 right-6 bg-purple-600 w-16 h-16 rounded-full items-center justify-center"
        style={{
          shadowColor: '#7c3aed',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.4,
          shadowRadius: 12,
          elevation: 12,
        }}
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>
    </View>
  );
};

// Main App Component
const App: FC = () => {
  const [isCreating, setIsCreating] = useState(false);

  if (isCreating) {
    return <CreateEventScreen onCancel={() => setIsCreating(false)} />;
  }

  return <ScheduleListScreen onNavigateToCreate={() => setIsCreating(true)} />;
};

export default App;