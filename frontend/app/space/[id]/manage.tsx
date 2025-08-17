import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  Alert, 
  ActivityIndicator,
  RefreshControl,
  Dimensions
} from "react-native";
//@ts-ignore
import { useRouter, navigate } from "expo-router";
import { deleteMySpace } from "@/supabase/controllers/spaces.controller";
import { useUser } from "@clerk/clerk-expo";
import { getMySpaces } from "@/supabase/controllers/spaces.controller";

type Space = {
  id: string;
  name: string;
  location: string;
  capacity: number;
  description: string;
  pph: number;
  images?: string[];
};

export default function ManageSpacesPage() {
  const router = useRouter();
  const { user } = useUser();
  const [spaces, setSpaces] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMySpaces = async () => {
    try {
      const { data } = await getMySpaces(user?.id!);
      console.log(data);
      setSpaces(data || []);
    } catch (error) {
      console.error('Error fetching spaces:', error);
      Alert.alert("Error", "Failed to load spaces");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchMySpaces();
    }
  }, [user?.id]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMySpaces();
  };

  const handleDelete = (id: string, spaceName: string) => {
    Alert.alert(
      "Delete Space",
      `Are you sure you want to delete "${spaceName}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              if (!user) {
                Alert.alert("Error", "You must be logged in");
                return;
              }
              const { error } = await deleteMySpace(id, user.id);
              if (error) {
                Alert.alert("Error", error.message);
              } else {
                setSpaces((prev: any) => prev.filter((s: any) => s.id !== id));
                Alert.alert("Success", "Space deleted successfully");
              }
            } catch (err) {
              Alert.alert("Error", "Failed to delete space");
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="mt-4 text-gray-600 text-base">Loading your spaces...</Text>
      </View>
    );
  }

  const EmptyState = () => (
    <View className="flex-1 justify-center items-center px-8 py-16">
      <View className="bg-gray-100 rounded-full p-8 mb-6">
        <Text className="text-4xl">🏢</Text>
      </View>
      <Text className="text-2xl font-bold text-gray-800 mb-3 text-center">
        No Spaces Yet
      </Text>
      <Text className="text-gray-500 text-center mb-8 leading-6">
        Start earning by listing your first space. It only takes a few minutes to get started.
      </Text>
      <TouchableOpacity
        className="bg-blue-500 px-8 py-4 rounded-xl  active:bg-blue-600"
        onPress={() => navigate("/add-space")}
      >
        <Text className="text-white font-semibold text-lg">Create Your First Space</Text>
      </TouchableOpacity>
    </View>
  );

  const SpaceCard = ({ space }: { space: any }) => (
    <View className="bg-white rounded-2xl mb-6  border border-gray-100 overflow-hidden">
      {(space["spaces-images"]?.length > 0) ? (
        <Image
          source={{ uri: space["spaces-images"][0].link }}
          className="w-full h-48"
          style={{ resizeMode: 'cover' }}
        />
      ) : (
        <View className="w-full h-48 bg-gray-200 justify-center items-center">
          <Text className="text-gray-400 text-6xl">🏢</Text>
          <Text className="text-gray-500 mt-2">No image</Text>
        </View>
      )}

      <View className="p-5">
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-1 mr-3">
            <Text className="text-xl font-bold text-gray-900 mb-1" numberOfLines={2}>
              {space.name}
            </Text>
            <Text className="text-gray-600 text-base" numberOfLines={1}>
              📍 {space.location}
            </Text>
          </View>
          <View className="bg-green-50 px-3 py-2 rounded-lg">
            <Text className="text-green-700 font-bold text-lg">
              ₹{space.pph}
            </Text>
            <Text className="text-green-600 text-xs text-center">per hour</Text>
          </View>
        </View>

        {/* Stats */}
        <View className="flex-row items-center mb-4">
          <View className="bg-blue-50 px-3 py-2 rounded-lg mr-3">
            <Text className="text-blue-700 font-semibold">
              👥 {space.capacity} people
            </Text>
          </View>
          <View className="bg-gray-50 px-3 py-2 rounded-lg">
            <Text className="text-gray-700 text-sm">
              ID: {space.id.slice(0, 8)}...
            </Text>
          </View>
        </View>
        {space.description && (
          <Text className="text-gray-600 text-sm mb-4 leading-5" numberOfLines={2}>
            {space.description}
          </Text>
        )}
        <View className="flex-row gap-3">
          <TouchableOpacity
            className="flex-1 bg-blue-500 py-3 rounded-xl active:bg-blue-600"
            onPress={() => navigate(`/space/${space.id}/edit`)}
          >
            <Text className="text-white font-semibold text-center text-base">
              ✏️ Edit
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 bg-red-500 py-3 rounded-xl active:bg-red-600"
            onPress={() => handleDelete(space.id, space.name)}
          >
            <Text className="text-white font-semibold text-center text-base">
              🗑️ Delete
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white pt-12 pb-6 px-6 border-b border-gray-100">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-2xl font-bold text-gray-900">My Spaces</Text>
            <Text className="text-gray-600 mt-1">
              {spaces.length} space{spaces.length !== 1 ? 's' : ''} listed
            </Text>
          </View>
          {spaces.length > 0 && (
            <TouchableOpacity
              className="bg-blue-500 px-4 py-2 rounded-xl"
              onPress={() => navigate("/add-space")}
            >
              <Text className="text-white font-semibold">+ Add Space</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ 
          paddingHorizontal: 20, 
          paddingTop: 20,
          paddingBottom: 100 
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#3B82F6']}
            tintColor="#3B82F6"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {spaces.length === 0 ? (
          <EmptyState />
        ) : (
          spaces.map((space: any) => (
            <SpaceCard key={space.id} space={space} />
          ))
        )}
      </ScrollView>
    </View>
  );
}