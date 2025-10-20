import { ScrollView, Text, View, RefreshControl } from 'react-native';
//@ts-ignore
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-expo';
import { getLogsForSpace } from '@/supabase/controllers/logs.controller';
import { useTheme } from '@/contexts/ThemeContext';


export default function LogsSpaceScreen() {
  const { colors, isDark } = useTheme();
  const [logs, setLogs] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const params = useLocalSearchParams();
  const { user } = useUser();
  const space_id = params.id;

  const getLogs = async() => {
    setRefreshing(true);
    const {data, error} = await getLogsForSpace(space_id as string);
    if (error) {
      console.log("Error fetching logs: ", error);
      setRefreshing(false);
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
    <ScrollView
      className="px-6"
      style={{ backgroundColor: colors.backgroundSecondary }}
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
        return (
          <LogCard
            key={request.id}
            request={request}
            getLogs={getLogs}
            setActionLoader={setRefreshing}
            actionLoader={refreshing}
            userId={user?.id!}
            colors={colors}
            isDark={isDark}
          />
        );
      })}
    </ScrollView>
  );
}


function LogCard({request, colors, isDark}: {request: any, userId: string, setActionLoader: any, actionLoader: any, getLogs: any, colors: any, isDark: boolean}) {

  const badgeBg = request.event_type === "checkin"
    ? (isDark ? '#065f46' : '#DBFCE7')
    : (isDark ? '#1e3a8a' : '#DBEAFE');
  const badgeTextColor = request.event_type === "checkin" ? '#10b981' : '#3b82f6';

  return (
    <View
      className="px-6 py-4 border rounded-lg mb-4 flex-row items-center justify-between"
      style={{ borderColor: colors.border, backgroundColor: colors.card }}
    >
      <View>
        <Text className="text-xl font-bold" style={{ color: colors.text }}>{request.users.name}</Text>
        <View className="flex-row items-center space-x-2 mt-1">
          <Text className="font-medium" style={{ color: colors.textSecondary }}>{request.rfid}</Text>
          <View className="px-3 py-1 rounded-full" style={{ backgroundColor: badgeBg }}>
            <Text className="text-xs font-semibold" style={{ color: badgeTextColor }}>{request.event_type}</Text>
          </View>
        </View>
      </View>
      <View>
        <Text className="font-medium" style={{ color: colors.textSecondary }}>{new Date(request.created_at).toLocaleTimeString()}</Text>
      </View>
    </View>
  );
}