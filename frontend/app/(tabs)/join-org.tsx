import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { joinOrganisation } from "@/supabase/controllers/organisation.controller";
import { supabase } from "../../supabase/supabase";
import { useUser } from "@clerk/clerk-expo";

const { width } = Dimensions.get("window");

interface Organisation {
  id: string;
  name: string;
  description: string;
  members_count?: number;
  category?: string;
  created_at?: string;
}

export default function JoinOrganisationScreen() {
  const [organisations, setOrganisations] = useState<Organisation[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [joiningIds, setJoiningIds] = useState<Set<string>>(new Set());
  const [searchLoading, setSearchLoading] = useState(false);
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    fetchOrganisations();
  }, []);

  // Debounced search
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (search.trim()) {
        fetchOrganisations();
      }
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [search]);

  const fetchOrganisations = async () => {
    setSearchLoading(true);
    try {
      const query = supabase
        .from("organisations")
        .select("*")
        .order("created_at", { ascending: false });

      if (search.trim()) {
        query.ilike("name", `%${search.trim()}%`);
      }

      const { data, error } = await query.limit(50);

      if (error) {
        Alert.alert("Error", error.message);
      } else {
        setOrganisations(data || []);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to fetch organisations");
    } finally {
      setSearchLoading(false);
    }
  };

  const handleRefresh = useCallback(() => {
    setLoading(true);
    fetchOrganisations().finally(() => setLoading(false));
  }, [search]);

  const handleJoin = async (organisationId: string, organisationName: string) => {
    try {
      if (!user) {
        Alert.alert("Authentication Required", "Please log in to join an organisation.");
        return;
      }

      setJoiningIds((prev) => new Set(prev).add(organisationId));

      await joinOrganisation(user.id, organisationId);

      Alert.alert(
        "Success! 🎉",
        `You've successfully joined "${organisationName}". Welcome aboard!`,
        [{ text: "Great!", onPress: () => fetchOrganisations() }]
      );
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to join organisation");
    } finally {
      setJoiningIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(organisationId);
        return newSet;
      });
    }
  };

  const clearSearch = () => {
    setSearch("");
    fetchOrganisations();
  };

  const renderOrganisationItem = ({ item }: { item: Organisation }) => {
    const isJoining = joiningIds.has(item.id);

    return (
      <View
        className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 3,
        }}
      >
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-1 mr-4">
            <Text className="text-xl font-bold text-gray-900 mb-1" numberOfLines={2}>
              {item.name}
            </Text>
            {item.category && (
              <View className="bg-blue-100 px-3 py-1 rounded-full self-start">
                <Text className="text-blue-800 text-sm font-medium">{item.category}</Text>
              </View>
            )}
          </View>
          <TouchableOpacity
            onPress={() => handleJoin(item.id, item.name)}
            disabled={isJoining}
            className={`px-6 py-3 rounded-xl min-w-[80px] ${
              isJoining ? "bg-gray-400" : "bg-green-600"
            }`}
            style={{
              shadowColor: isJoining ? "#9CA3AF" : "#10B981",
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: isJoining ? 0 : 0.3,
              shadowRadius: 6,
              elevation: isJoining ? 0 : 4,
            }}
          >
            {isJoining ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text className="text-black font-bold text-center">Join</Text>
            )}
          </TouchableOpacity>
        </View>
        {item.description && (
          <Text className="text-gray-600 text-base leading-6 mb-3" numberOfLines={3}>
            {item.description}
          </Text>
        )}
        <View className="flex-row justify-between items-center pt-3 border-t border-gray-100">
          <View className="flex-row items-center">
            <Ionicons name="people-outline" size={16} color="#6B7280" className="mr-2" />
            <Text className="text-gray-500 text-sm">{item.members_count || 0} members</Text>
          </View>
          {item.created_at && (
            <Text className="text-gray-400 text-xs">
              Created {new Date(item.created_at).toLocaleDateString()}
            </Text>
          )}
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View className="flex-1 justify-center items-center px-8 py-16">
      <View className="bg-gray-100 rounded-full p-6 mb-6">
        <Text className="text-5xl">🏢</Text>
      </View>
      <Text className="text-2xl font-bold text-gray-800 mb-3 text-center">
        {search.trim() ? "No Organisations Found" : "No Organisations Available"}
      </Text>
      <Text className="text-gray-500 text-center mb-8 leading-6">
        {search.trim()
          ? `No organisations match "${search}". Try a different search term.`
          : "There are no organisations to join right now. Check back later!"}
      </Text>
      {search.trim() && (
        <TouchableOpacity onPress={clearSearch} className="bg-blue-600 px-6 py-3 rounded-xl">
          <Text className="text-white font-semibold">Clear Search</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderHeader = () => (
    <View className="mb-6">
      <View className="bg-white rounded-xl p-2 shadow-sm border border-gray-100 flex-row items-center">
        <Ionicons name="search-outline" size={20} color="#9CA3AF" className="ml-3 mr-2" />
        <TextInput
          placeholder="Search organisations by name..."
          value={search}
          onChangeText={setSearch}
          className="flex-1 py-3 text-gray-900 text-base"
          placeholderTextColor="#9CA3AF"
          returnKeyType="search"
          onSubmitEditing={fetchOrganisations}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={clearSearch} className="p-2">
            <Ionicons name="close-circle" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={fetchOrganisations}
          disabled={searchLoading}
          className="bg-blue-600 px-4 py-3 rounded-xl mr-1"
        >
          {searchLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="search" size={20} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
      {organisations.length > 0 && (
        <Text className="text-gray-600 mt-4 text-center">
          Found {organisations.length} organisation{organisations.length !== 1 ? "s" : ""}
          {search.trim() && ` for "${search}"`}
        </Text>
      )}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-row items-center justify-between p-4 bg-white border-b border-gray-200">
        <TouchableOpacity onPress={() => router.push('/spaces')} className="p-2">
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900">Join Organisation</Text>
        <View className="w-10" />
      </View>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View className="flex-1 px-6 pt-6">
          <FlatList
            data={organisations}
            keyExtractor={(item) => item.id}
            renderItem={renderOrganisationItem}
            ListHeaderComponent={renderHeader}
            ListEmptyComponent={!searchLoading ? renderEmptyState : null}
            refreshControl={
              <RefreshControl
                refreshing={loading}
                onRefresh={handleRefresh}
                colors={["#3B82F6"]}
                tintColor="#3B82F6"
              />
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100, flexGrow: 1 }}
            ItemSeparatorComponent={() => <View className="h-2" />}
          />
          {searchLoading && organisations.length === 0 && (
            <View className="absolute inset-0 justify-center items-center bg-white/80">
              <ActivityIndicator size="large" color="#3B82F6" />
              <Text className="mt-4 text-gray-600">Searching organisations...</Text>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}