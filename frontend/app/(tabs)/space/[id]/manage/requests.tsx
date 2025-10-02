import { acceptRequest, getRequestsForSpace } from '@/supabase/controllers/request.controller';
import { ScrollView, Text, TouchableOpacity, View, TextInput, Alert, StatusBar, Animated, Easing, RefreshControl } from 'react-native';
//@ts-ignore
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-expo';
import { useTheme } from '@/contexts/ThemeContext';


export default function RequestsSpaceScreen() {
  const { colors } = useTheme();
  const [requests, setRequests] = useState<any[]>([]);
  const [actionLoader, setActionLoader] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const params = useLocalSearchParams();
  const { user } = useUser();
  const space_id = params.id;

  const getRequests = async() => {
    setRefreshing(true);
    const {data, error} = await getRequestsForSpace(space_id as string);
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
    <ScrollView style={{ backgroundColor: colors.backgroundSecondary, paddingHorizontal: 24 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={getRequests}
          colors={[colors.accent]}
          tintColor={colors.accent}
        />
      }
    >
      {requests.map((request) => {
        return <RequestCard key={request.id} request={request} getRequests={getRequests} setActionLoader={setRefreshing} actionLoader={refreshing} userId={user?.id!} colors={colors}/>
      })}
    </ScrollView>
  );
}


function RequestCard({request, userId, setActionLoader, actionLoader, getRequests, colors}: {request: any, userId: string, setActionLoader: any, actionLoader: any, getRequests: any, colors: any}) {

  const handleAccept = async() => {
    if(actionLoader) return;
    console.log("Accepting request: ", request.id);
    setActionLoader(true);
    await acceptRequest(request.id, userId);
    await getRequests();
    setActionLoader(false);
  }

  return (
    <View style={{ padding: 24, borderWidth: 1, borderColor: colors.border, borderRadius: 16, marginBottom: 16, backgroundColor: colors.card }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.text }}>{request.space.name}</Text>
      <Text style={{ fontSize: 20, fontWeight: '500', color: colors.text }}>{request.users.name}</Text>
      <Text style={{ fontSize: 18, fontWeight: '500', marginBottom: 16, color: colors.textSecondary }}>{new Date(request.start).toLocaleDateString()} - {new Date(request.end).toLocaleDateString()}</Text>
      <View style={{ width: '100%', height: 1, marginBottom: 16, backgroundColor: colors.border }}></View>
      <Text style={{ fontSize: 20, fontWeight: '600', color: colors.text }}>Reason</Text>
      <Text style={{ color: colors.textSecondary }}>
        {request.reason || "No reason provided"}
      </Text>
      <View style={{ flexDirection: 'row', gap: 16, marginTop: 16 }}>
        <TouchableOpacity onPress={handleAccept} style={{ backgroundColor: colors.accent, borderWidth: 1, borderColor: colors.border, flex: 1, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 }}>
          <Text style={{ textAlign: 'center', fontWeight: '600', color: 'white' }}>Accept</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ backgroundColor: colors.error, flex: 1, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 }}>
          <Text style={{ color: 'white', fontWeight: '600', textAlign: 'center' }}>Reject</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}