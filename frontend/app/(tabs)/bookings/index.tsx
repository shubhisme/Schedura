import { ScrollView, Text, TouchableOpacity, View, TextInput, Alert, StatusBar, Animated, Easing, RefreshControl } from 'react-native';
//@ts-ignore
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-expo';
import { getBookingsOfUser } from '@/supabase/controllers/booking.controller';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';


export default function BookingSpacesScreen() {
  const { colors, isDark } = useTheme();
  const [bookings, setBookings] = useState<any[]>([]);
  const [actionLoader, setActionLoader] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useUser();

  const getMyBookings = async() => {
    setRefreshing(true);
    const {data, error} = await getBookingsOfUser(user?.id!);
    if (error) {
      console.log("Error fetching requests: ", error);
      return;
    }
    if(data) {
      setBookings(data);
    }
    setRefreshing(false);
  }

  useEffect(()=>{
    getMyBookings();
  },[])
  return (
    <ScrollView 
      className="px-6"
      style={{ backgroundColor: colors.tertiary }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={getMyBookings}
          colors={[colors.text]}
          tintColor={colors.text}
        />
      }
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      {bookings.length === 0 && !refreshing ? (
        <View className="items-center justify-center py-20">
          <Feather name="calendar" size={64} color={colors.textTertiary} />
          <Text className="text-[20px] font-bold mt-4" style={{ color: colors.text }}>No bookings yet</Text>
          <Text className="text-center mt-2" style={{ color: colors.textSecondary }}>Your bookings will appear here</Text>
        </View>
      ) : (
        bookings.map((booking) => {
          return <BookingCard key={booking.id} booking={booking} getBookings={getMyBookings} setActionLoader={setRefreshing} actionLoader={refreshing} userId={user?.id!} colors={colors} isDark={isDark}/>
        })
      )}
    </ScrollView>
  );
}


function BookingCard({booking, userId, setActionLoader, actionLoader, getBookings, colors, isDark}: {booking: any, userId: string, setActionLoader: any, actionLoader: any, getBookings: any, colors: any, isDark: boolean}) {


  let pendingTag = (
    <View className="px-3 py-1 rounded-full">
      <Text style={{ color: isDark ? '#fde047' : '#92400e', fontWeight: '600', backgroundColor: undefined }}>{'Pending'}</Text>
    </View>
  )

  let acceptedTag = (
    <View className="px-3 py-1 rounded-full">
      <Text style={{ color: isDark ? '#86efac' : '#065f46', fontWeight: '600', backgroundColor: undefined }}>{'Accepted'}</Text>
    </View>
  )
  return (
    <View 
      className="p-6 border rounded-xl mb-4"
      style={{ borderColor: colors.border, backgroundColor: colors.card }}
    >
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center">
          <Feather name='home' size={18} color={colors.text}/>
          <Text className="ml-2 text-xl font-bold" style={{ color: colors.text }}>
            {booking.space.name.slice(0,15)} {booking.space.name.length > 10 && "..."}
          </Text>
        </View>
        <View style={{
          backgroundColor: booking.payment_status === 'pending'
            ? (isDark ? '#713f12' : '#fef3c7')
            : (isDark ? '#14532d' : '#d1fae5'),
          paddingHorizontal: 12,
          paddingVertical: 4,
          borderRadius: 20
        }}>
          <Text style={{ color: booking.payment_status === 'pending' ? (isDark ? '#fde047' : '#92400e') : (isDark ? '#86efac' : '#065f46'), fontWeight: '600' }}>
            {booking.payment_status === 'pending' ? 'Pending' : 'Accepted'}
          </Text>
        </View>
      </View>
      <Text className="text-lg" style={{ color: colors.textSecondary }}>
        <Feather name='calendar' size={18} color={colors.textSecondary}/>  {new Date(booking.start).toLocaleDateString()} - {new Date(booking.end).toLocaleDateString()}
      </Text>
      
    </View>
  );
}