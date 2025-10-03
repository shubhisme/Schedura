
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
      style={{ backgroundColor: colors.tertiary, paddingHorizontal: 24 }}
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
        <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 80 }}>
          <Feather name="calendar" size={64} color={colors.textTertiary} />
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.text, marginTop: 16 }}>No bookings yet</Text>
          <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 8 }}>Your bookings will appear here</Text>
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
    <View style={{ backgroundColor: isDark ? '#713f12' : '#fef3c7', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 }}>
      <Text style={{ color: isDark ? '#fde047' : '#92400e', fontWeight: '600' }}>Pending</Text>
    </View>
  )

  let acceptedTag = (
    <View style={{ backgroundColor: isDark ? '#14532d' : '#d1fae5', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 }}>
      <Text style={{ color: isDark ? '#86efac' : '#065f46', fontWeight: '600' }}>Accepted</Text>
    </View>
  )
  return (
    <View style={{ 
      padding: 24, 
      borderWidth: 1, 
      borderColor: colors.border, 
      borderRadius: 16, 
      marginBottom: 16,
      backgroundColor: colors.card
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.text }}>
          <Feather name='home' size={18} color={colors.text}/>  {booking.space.name.slice(0,15)} {booking.space.name.length > 10 && "..."}
        </Text>
        {booking.payment_status === 'pending' ? pendingTag : acceptedTag}
      </View>
      <Text style={{ fontSize: 18, color: colors.textSecondary }}>
        <Feather name='calendar' size={18} color={colors.textSecondary}/>  {new Date(booking.start).toLocaleDateString()} - {new Date(booking.end).toLocaleDateString()}
      </Text>
      
    </View>
  );
}