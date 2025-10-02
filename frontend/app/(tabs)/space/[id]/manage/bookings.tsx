import { acceptRequest, getRequestsForSpace } from '@/supabase/controllers/request.controller';
import { ScrollView, Text, TouchableOpacity, View, TextInput, Alert, StatusBar, Animated, Easing, RefreshControl } from 'react-native';
//@ts-ignore
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-expo';
import { getBookingsForSpace } from '@/supabase/controllers/booking.controller';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';


export default function BookingSpacesScreen() {
  const { colors } = useTheme();
  const [bookings, setBookings] = useState<any[]>([]);
  const [actionLoader, setActionLoader] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const params = useLocalSearchParams();
  const { user } = useUser();
  const space_id = params.id;

  const getBookings = async() => {
    setRefreshing(true);
    const {data, error} = await getBookingsForSpace(space_id as string);
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
    getBookings();
  },[])
  return (
    <ScrollView style={{ backgroundColor: colors.backgroundSecondary, paddingHorizontal: 24 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={getBookings}
          colors={[colors.accent]}
          tintColor={colors.accent}
        />
      }
    >
      {bookings.map((booking) => {
        return <BookingCard key={booking.id} booking={booking} getBookings={getBookings} setActionLoader={setRefreshing} actionLoader={refreshing} userId={user?.id!} colors={colors}/>
      })}
    </ScrollView>
  );
}


function BookingCard({booking, userId, setActionLoader, actionLoader, getBookings, colors}: {booking: any, userId: string, setActionLoader: any, actionLoader: any, getBookings: any, colors: any}) {


  let pendingTag = (
    <View style={{ backgroundColor: '#FEF3C7', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 }}>
      <Text style={{ color: '#92400E', fontWeight: '600' }}>Pending</Text>
    </View>
  )

  let acceptedTag = (
    <View style={{ backgroundColor: colors.success + '20', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 }}>
      <Text style={{ color: colors.success, fontWeight: '600' }}>Accepted</Text>
    </View>
  )
  return (
    <View style={{ padding: 24, borderWidth: 1, borderColor: colors.border, borderRadius: 16, marginBottom: 16, backgroundColor: colors.card }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.text }}><Feather name='home' size={18}/>  {booking.space.name}</Text>
        {booking.payment_status === 'pending' ? pendingTag : acceptedTag}
      </View>
      <Text style={{ fontSize: 18, color: colors.textSecondary }}><Feather name='user' size={18}/>  {booking.users.name}</Text>
      <Text style={{ fontSize: 18, color: colors.textSecondary }}><Feather name='calendar' size={18}/>  {new Date(booking.start).toLocaleDateString()} - {new Date(booking.end).toLocaleDateString()}</Text>
      
    </View>
  );
}