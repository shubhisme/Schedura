import type { UserProfile } from "@/types/database.type";
import type { FC } from "react";
import { ActivityIndicator, Image, Text, View } from "react-native";


export const ProfileHeader: FC<{ 
  profile: UserProfile | null; 
  loading: boolean; 
  onRefresh: () => void;
}> = ({ profile, loading, onRefresh }) => (
  <View className="relative overflow-hidden bg-primary">
    <View className="items-center pt-16 pb-8 px-6 relative z-10">
      <View className="relative mb-6">
        {loading ? (
          <View className="w-28 h-28 rounded-full border-4 border-white/30 items-center justify-center bg-white/20 backdrop-blur-sm">
            <ActivityIndicator color="white" size="large" />
          </View>
        ) : (
          <>
            <Image
              source={{
                uri: profile?.avatar_url 
              }}
              className="w-28 h-28 rounded-full border-4 border-black/30"
            />
            <View className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-black" />
          </>
        )}
      </View>
      <View className="items-center">
        <Text className="text-black text-2xl font-bold mb-1">
          {loading ? 'Loading...' : profile?.name }
        </Text>
        <Text className="text-black/80 text-base mb-3">
          {loading ? '' : profile?.email }
        </Text>

        {/* Role Badge */}
        {(profile?.role) && (
          <View className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
            <Text className="text-black text-sm font-semibold capitalize">
              {profile?.role}
            </Text>
          </View>
        )}

        {/* Stats Row */}
        <View className="flex-row gap-6 mt-2">
          <View className="items-center">
            <Text className="text-black text-xl font-bold">12</Text>
            <Text className="text-black/70 text-xs">Events</Text>
          </View>
          <View className="items-center">
            <Text className="text-black text-xl font-bold">5</Text>
            <Text className="text-black/70 text-xs">Upcoming</Text>
          </View>
          <View className="items-center">
            <Text className="text-black text-xl font-bold">7</Text>
            <Text className="text-black/70 text-xs">Completed</Text>
          </View>
        </View>
      </View>
    </View>
  </View>
);
