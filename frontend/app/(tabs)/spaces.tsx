import { Image, ScrollView, Text, TouchableOpacity, View, StatusBar, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
//@ts-ignore
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { getMySpaces } from '@/supabase/controllers/spaces.controller';
import { useUser } from '@clerk/clerk-expo';

export default function SpacesScreen() {
  const { navigate, back } = useRouter();
  const [spaces, setSpaces] = useState<any>();
  const { user } = useUser();
  const [refreshing, setRefreshing] = useState(false);

  const fetchMySpaces = async () => {
    const { data } = await getMySpaces(user?.id!);
    console.log(data)
    setSpaces(data);
  }
  
  useEffect(() => {
    fetchMySpaces()
  },[])

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#E9F0E9" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={fetchMySpaces}
            colors={["#374151"]}
            tintColor="#374151"
          />
        }
      >
        <View style={{ backgroundColor: '#E9F0E9' }} className="px-6 pt-6 pb-8 rounded-b-3xl">
          <View className="mb-4">
            <Text className="text-black text-3xl font-bold">My Spaces</Text>
            <Text className="text-gray-600 text-lg mt-1">Manage your venues</Text>
          </View>
          <View className="flex-row space-x-4 mt-4 gap-2">
            <View className="bg-white/80 rounded-2xl p-4 flex-1">
              <Text className="text-2xl font-bold text-gray-900">{spaces?.length || 0}</Text>
              <Text className="text-sm text-gray-600">Total Spaces</Text>
            </View>
            <View className="bg-white/80 rounded-2xl p-4 flex-1">
              <Text className="text-2xl font-bold text-green-600">Active</Text>
              <Text className="text-sm text-gray-600">Status</Text>
            </View>
          </View>
        </View>

        <View className="px-6 py-8">
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-gray-900 text-xl font-bold">Your Venues</Text>
            <TouchableOpacity
              onPress={() => navigate('/space/create')}
              className="bg-gray-900 px-4 py-2 rounded-xl flex-row items-center "
            >
              <Ionicons name="add" size={20} color="#E9F0E9" />
              <Text className="text-white font-semibold ml-1">Add Space</Text>
            </TouchableOpacity>
          </View>

          {spaces && spaces.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 16, paddingRight: 24 }}>
              {spaces.map((space: any) => (
                <TouchableOpacity
                  key={space.id}
                  onPress={() => navigate(`/spaces?id=${space.id}`)}
                  className="bg-white rounded-3xl overflow-hidden border border-gray-100 w-72"
                >
                  <View className="relative">
                    <Image
                      source={{
                        uri: space['spaces-images']?.[0]?.link || 'https://via.placeholder.com/300x200.png?text=No+Image+Available'
                      }}
                      className="h-48 w-full"
                    />
                    <View className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                    <View className="absolute top-3 right-3 bg-green-500 rounded-full px-3 py-1">
                      <Text className="text-white text-xs font-semibold">Active</Text>
                    </View>
                  </View>
                  <View className="p-5">
                    <Text className="text-xl font-bold text-gray-900 mb-2">{space.name}</Text>
                    <View className="space-y-2">
                      <View className="flex-row items-center">
                        <View className="bg-gray-100 rounded-full p-1 mr-3">
                          <Ionicons name="location" size={14} color="#6B7280" />
                        </View>
                        <Text className="text-gray-600 flex-1">{space.location}</Text>
                      </View>
                      <View className="flex-row items-center">
                        <View className="bg-gray-100 rounded-full p-1 mr-3">
                          <Ionicons name="people" size={14} color="#6B7280" />
                        </View>
                        <Text className="text-gray-600">Up to {space.capacity} guests</Text>
                      </View>
                    </View>
                    <View className="flex-row mt-4 gap-2">
                      <TouchableOpacity
                        onPress={() => navigate(`/space/${space.id}/manage`)}
                        className="bg-gray-900 rounded-xl px-4 py-2 flex-1 "
                      >
                        <Text className="text-white text-center font-semibold">Manage</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => navigate(`/space/${space.id}/edit`)}
                        className="bg-gray-100 rounded-xl px-4 py-2 flex-1"
                      >
                        <Text className="text-gray-900 text-center font-semibold">Edit</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <View className="bg-white rounded-3xl border-2 border-dashed border-gray-300 p-8 items-center justify-center">
              <View className="bg-gray-100 rounded-full p-4 mb-4">
                <MaterialCommunityIcons name="home-plus-outline" size={48} color="#9CA3AF" />
              </View>
              <Text className="text-xl font-semibold text-gray-900 mb-2">No spaces yet</Text>
              <Text className="text-gray-600 text-center mb-6">Create your first venue to start managing bookings</Text>
              <TouchableOpacity
                onPress={() => navigate('/space/create')}
                className="bg-gray-900 py-3 px-6 rounded-xl"
              >
                <Text className="text-white text-lg font-semibold">Create Your First Space</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View className="px-6 pb-8">
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-gray-900 text-xl font-bold">Organization</Text>
            <TouchableOpacity>
              <Ionicons name="information-circle-outline" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          <View className="bg-white rounded-3xl p-6 border border-gray-100">
            <View className="flex-row items-center mb-6">
              <View className="bg-primary p-4 rounded-2xl mr-4">
                <MaterialCommunityIcons name="office-building" size={32} color="black" />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-gray-900 mb-1">Organisation</Text>
                <Text className="text-gray-600">Join or create an org to collaborate</Text>
              </View>
            </View>
            
            <View className="flex-row items-center space-x-3 gap-2">
              <TouchableOpacity
                onPress={() => navigate('/create-org')}
                className="bg-gray-900 py-2 px-4 rounded-xl flex-1 border-2"
              >
                <Text className="text-white  text-base text-center font-semibold">Create</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigate('/join-org')}
                className="border-2 border-gray-200 py-2 px-4 rounded-xl flex-1 "
              >
                <Text className="text-gray-900 text-base text-center font-semibold">Join</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}