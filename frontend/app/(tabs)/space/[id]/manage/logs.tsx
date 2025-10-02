
import { ScrollView, Text, TouchableOpacity, View, TextInput, Alert, StatusBar, Animated, Easing, RefreshControl } from 'react-native';
//@ts-ignore
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-expo';
import { getLogsForSpace } from '@/supabase/controllers/logs.controller';
import { useTheme } from '@/contexts/ThemeContext';


export default function LogsSpaceScreen() {
  const { colors, isDark } = useTheme();
  const [logs, setLogs] = useState<any[]>([]);
  const [actionLoader, setActionLoader] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const params = useLocalSearchParams();
  const { user } = useUser();
  const space_id = params.id;

  const getLogs = async() => {
    setRefreshing(true);
    const {data, error} = await getLogsForSpace(space_id as string);
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
    <ScrollView style={{ backgroundColor: colors.backgroundSecondary, paddingHorizontal: 24 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={getLogs}
          colors={[colors.accent]}
          tintColor={colors.accent}
        />
      }
    >
      {logs.map((request) => {
        return <LogCard key={request.id} request={request} getLogs={getLogs} setActionLoader={setRefreshing} actionLoader={refreshing} userId={user?.id!} colors={colors} isDark={isDark}/>
      })}
    </ScrollView>
  );
}


function LogCard({request, userId, setActionLoader, actionLoader, getLogs, colors, isDark}: {request: any, userId: string, setActionLoader: any, actionLoader: any, getLogs: any, colors: any, isDark: boolean}) {

  return (
    <View style={{ paddingHorizontal: 24, paddingVertical: 16, borderWidth: 1, borderColor: colors.border, borderRadius: 16, marginBottom: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.card }}>
      <View>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.text }}>{request.users.name}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={{ fontWeight: '500', color: colors.textSecondary }}>{request.rfid}</Text>
          <View style={{ backgroundColor: request.event_type === "checkin" ? (isDark ? '#065f46' : '#DBFCE7') : (isDark ? '#1e3a8a' : '#DBEAFE'), paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 }}>
            <Text style={{ fontSize: 12, color: request.event_type === "checkin" ? '#10b981' : '#3b82f6', fontWeight: '600' }}>{request.event_type}</Text>
          </View>
        </View>
      </View>
      <View>
        <Text style={{ fontWeight: '500', color: colors.textSecondary }}>{new Date(request.created_at).toLocaleTimeString()}</Text>
      </View>
    </View>
  );
}