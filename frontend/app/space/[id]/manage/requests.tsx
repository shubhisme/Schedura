import { acceptRequest, getRequestsForSpace } from '@/supabase/controllers/request.controller';
import { ScrollView, Text, TouchableOpacity, View, TextInput, Alert, StatusBar, Animated, Easing, RefreshControl } from 'react-native';
//@ts-ignore
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-expo';


export default function RequestsSpaceScreen() {
  const [requests, setRequests] = useState<any[]>([]);
  const [actionLoader, setActionLoader] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const params = useLocalSearchParams();
  const { user } = useUser();
  const space_id = params.id;

  const getRequests = async() => {
    setRefreshing(true);
    const {data, error} = await getRequestsForSpace(space_id);
    if (error) {
      console.log("Error fetching requests: ", error);
      return;
    }
    if(data) {
      setRequests(data);
    }
    setRefreshing(false);
  }

  useEffect(()=>{
    getRequests();
  },[])
  return (
    <ScrollView className='bg-tertiary px-6' 
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={getRequests}
          colors={["#374151"]}
          tintColor="#374151"
        />
      }
    >
      {requests.map((request) => {
        return <RequestCard key={request.id} request={request} getRequests={getRequests} setActionLoader={setRefreshing} actionLoader={refreshing} userId={user?.id!}/>
      })}
    </ScrollView>
  );
}


function RequestCard({request, userId, setActionLoader, actionLoader, getRequests}: {request: any, userId: string, setActionLoader: any, actionLoader: any, getRequests: any}) {

  const handleAccept = async() => {
    if(actionLoader) return;
    console.log("Accepting request: ", request.id);
    setActionLoader(true);
    await acceptRequest(request.id, userId);
    await getRequests();
    setActionLoader(false);
  }

  return (
    <View className='p-6 border rounded-2xl mb-4'>
      <Text className='text-2xl font-bold'>{request.space.name}</Text>
      <Text className='text-xl font-medium'>{request.users.name}</Text>
      <Text className='text-lg font-medium mb-4'>{new Date(request.start).toLocaleDateString()} - {new Date(request.end).toLocaleDateString()}</Text>
      <View className='w-full h-[1px] mb-4 bg-black/10'></View>
      <Text className=' text-xl font-semibold'>Reason</Text>
      <Text>
        {request.reason || "No reason provided"}
      </Text>
      <View className='flex-row gap-4 mt-4 space-x-4'>
        <TouchableOpacity onPress={handleAccept}  className='bg-primary border flex-1 px-4 py-2 rounded-xl'>
          <Text className='text-center font-semibold text-black'>Accept</Text>
        </TouchableOpacity>
        <TouchableOpacity  className='bg-red-500 flex-1 px-4 py-2 rounded-xl'>
          <Text className='text-white font-semibold text-center'>Reject</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}