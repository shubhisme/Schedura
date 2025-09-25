import { acceptRequest, getRequestsForSpace, getRequestsOfUser } from '@/supabase/controllers/request.controller';
import { ScrollView, Text, TouchableOpacity, View, TextInput, Alert, StatusBar, Animated, Easing, RefreshControl } from 'react-native';
//@ts-ignore
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-expo';
import { Feather } from '@expo/vector-icons';


export default function RequestsSpacesScreen() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [actionLoader, setActionLoader] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const params = useLocalSearchParams();
  const { user } = useUser();
  const space_id = params.id;

  const getMyRequests = async() => {
    setRefreshing(true);
    const {data, error} = await getRequestsOfUser(user?.id!);
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
    getMyRequests();
  },[])
  return (
    <ScrollView className='bg-tertiary px-6' 
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={getMyRequests}
          colors={["#374151"]}
          tintColor="#374151"
        />
      }
    >
      {bookings.map((booking) => {
        return <BookingCard key={booking.id} booking={booking} getBookings={getMyRequests} setActionLoader={setRefreshing} actionLoader={refreshing} userId={user?.id!}/>
      })}
    </ScrollView>
  );
}


function BookingCard({booking, userId, setActionLoader, actionLoader, getBookings}: {booking: any, userId: string, setActionLoader: any, actionLoader: any, getBookings: any}) {


  let pendingTag = (
    <View className='bg-yellow-100 px-3 py-1 rounded-full'>
      <Text className='text-yellow-800 font-semibold'>Pending</Text>
    </View>
  )

  let acceptedTag = (
    <View className='bg-green-100 px-3 py-1 rounded-full'>
      <Text className='text-green-800 font-semibold'>Accepted</Text>
    </View>
  )
  return (
    <View className='p-6 border rounded-2xl mb-4'>
      <View className='flex-row items-center justify-between mb-2'>
        <Text className='text-xl font-bold'><Feather name='home' size={18}/>  {booking.space.name}</Text>
        {booking.payment_status === 'pending' ? pendingTag : acceptedTag}
      </View>
      <Text className='text-lg'><Feather name='calendar' size={18}/>  {new Date(booking.start).toLocaleDateString()} - {new Date(booking.end).toLocaleDateString()}</Text>
      
    </View>
  );
}