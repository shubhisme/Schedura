import { Image, StatusBar, Text, View } from 'react-native';
import SafeBoundingView from '@/components/SafeBoundingView';
//@ts-ignore
import CSpace from "@/assets/images/illustrations/cspace.png"
import { Feather } from '@expo/vector-icons';
//@ts-ignore
import { Link, usePathname, useLocalSearchParams, Stack } from 'expo-router';

let navOptions = [
  { name: "Overview", suffix: "/manage", icon: "bar-chart" },
  { name: "Bookings", suffix: "/manage/bookings", icon: "calendar" },
  { name: "Requests", suffix: "/manage/requests", icon: "send" },
  { name: "Logs", suffix: "/manage/logs", icon: "credit-card" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { id } = useLocalSearchParams(); // 👈 get space id

  return (
    <SafeBoundingView className="flex-1 bg-tertiary">
      <StatusBar backgroundColor="#E9F0E9" />
      <View className="p-6 bg-primary rounded-b-3xl pb-12">
        <Text className="text-black text-4xl font-bold mt-6">Dashboard</Text>
        <Text className="mt-2 text-xl">
          Manage all your spaces with ease, {'\n'}get powerful insights
        </Text>
        <Image source={CSpace} className="absolute -right-5 bottom-0 hidden" />
      </View>

      <View className="p-6">
        <View className="bg-white flex-row items-center gap-2 rounded-2xl p-4 py-3 shadow-lg shadow-black/10">
          {navOptions.map((option, index) => {
            const href = `/space/${id}${option.suffix}`;
            const isActive = pathname === href;

            return (
              <Link
                key={index}
                href={href}
                className={`flex-1 rounded-lg items-center text-center ${
                  isActive ? "bg-black" : "bg-white"
                }`}
              >
                <View className="items-center justify-center flex-1 p-2 px-4 rounded-lg">
                  <Feather
                    name={option.icon as any}
                    size={15}
                    color={isActive ? "white" : "black"}
                  />
                  <Text
                    className={`text-xs whitespace-nowrap font-semibold mt-1 ${
                      isActive ? "text-white" : "text-black"
                    }`}
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
