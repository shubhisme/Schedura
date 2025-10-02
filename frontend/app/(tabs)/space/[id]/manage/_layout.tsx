import { Image, StatusBar, Text, View } from 'react-native';
import SafeBoundingView from '@/components/SafeBoundingView';
//@ts-ignore
import CSpace from "@/assets/images/illustrations/cspace.png"
import { Feather } from '@expo/vector-icons';
//@ts-ignore
import { Link, usePathname, useLocalSearchParams, Stack } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';

let navOptions = [
  { name: "Overview", suffix: "/manage", icon: "bar-chart" },
  { name: "Bookings", suffix: "/manage/bookings", icon: "calendar" },
  { name: "Requests", suffix: "/manage/requests", icon: "send" },
  { name: "Logs", suffix: "/manage/logs", icon: "credit-card" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { colors, isDark } = useTheme();
  const pathname = usePathname();
  const { id } = useLocalSearchParams(); // 👈 get space id

  return (
    <SafeBoundingView style={{ flex: 1, backgroundColor: colors.backgroundSecondary }}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.card} />
      <View style={{ padding: 24, backgroundColor: colors.accent, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, paddingBottom: 48 }}>
        <Text style={{ color: colors.text, fontSize: 36, fontWeight: 'bold', marginTop: 24 }}>Dashboard</Text>
        <Text style={{ marginTop: 8, fontSize: 20, color: colors.text }}>
          Manage all your spaces with ease, {'\n'}get powerful insights
        </Text>
        <Image source={CSpace} style={{ position: 'absolute', right: -20, bottom: 0, display: 'none' }} />
      </View>

      <View style={{ padding: 24 }}>
        <View style={{ backgroundColor: colors.card, flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 16, padding: 16, paddingVertical: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 }}>
          {navOptions.map((option, index) => {
            const href = `/space/${id}${option.suffix}` as any;
            const isActive = pathname === href;

            return (
              <Link
                key={index}
                href={href}
                style={{ flex: 1, borderRadius: 8, alignItems: 'center', textAlign: 'center', backgroundColor: isActive ? colors.accent : colors.card }}
              >
                <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1, padding: 8, paddingHorizontal: 16, borderRadius: 8 }}>
                  <Feather
                    name={option.icon as any}
                    size={15}
                    color={isActive ? "white" : colors.text}
                  />
                  <Text
                    style={{ fontSize: 12, fontWeight: '600', marginTop: 4, color: isActive ? "white" : colors.text }}
                  >
                    {option.name}
                  </Text>
                </View>
              </Link>
            );
          })}
        </View>
      </View>
      <Stack screenOptions={{headerShown:false}}/>
    </SafeBoundingView>
  );
}
