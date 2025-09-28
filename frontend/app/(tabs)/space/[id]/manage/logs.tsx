
import { ScrollView, Text, TouchableOpacity, View, TextInput, Alert, StatusBar, Animated, Easing, RefreshControl } from 'react-native';
//@ts-ignore
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-expo';
import { getLogsForSpace } from '@/supabase/controllers/logs.controller';


export default function LogsSpaceScreen() {
  const [logs, setLogs] = useState<any[]>([]);
  const [actionLoader, setActionLoader] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const params = useLocalSearchParams();
  const { user } = useUser();
  const space_id = params.id;

  const getLogs = async() => {
    setRefreshing(true);
    const {data, error} = await getLogsForSpace(space_id);
    if (error) {
      console.log("Error fetching logs: ", error);
      return;
    }
    if(data) {
      setLogs(data);
    }
    setRefreshing(false);
  }

  useEffect(()=>{
    getLogs();
  },[])
  return (
    <ScrollView className='bg-tertiary px-6' 
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={getLogs}
          colors={["#374151"]}
          tintColor="#374151"
        />
      }
    >
      {logs.map((request) => {
        return <LogCard key={request.id} request={request} getLogs={getLogs} setActionLoader={setRefreshing} actionLoader={refreshing} userId={user?.id!}/>
      })}
    </ScrollView>
  );
}


function LogCard({request, userId, setActionLoader, actionLoader, getLogs}: {request: any, userId: string, setActionLoader: any, actionLoader: any, getLogs: any}) {

  return (
    <View className='px-6 py-4 border rounded-2xl mb-4 flex-row items-center justify-between'>
      <View>
        <Text className='text-xl font-bold'>{request.users.name}</Text>
        <View className='flex-row items-center gap-x-2'>
          <Text className=' font-medium'>{request.rfid}</Text>
          <View className={`${request.event_type === "checkin" ? "bg-[#DBFCE7]" : "bg-[#DBEAFE]"} px-3 py-1 rounded-full`}>
            <Text className={`text-xs ${request.event_type === "checkin" ? "text-[#287864]" : "text-[#194FBA]"} font-semibold`}>{request.event_type}</Text>
          </View>
        </View>
      </View>
      <View>
        <Text className=' font-medium'>{new Date(request.created_at).toLocaleTimeString()}</Text>
      </View>
    </View>
  );
}