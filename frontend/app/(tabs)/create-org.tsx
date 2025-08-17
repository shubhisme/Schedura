import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, RefreshControl, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
//@ts-ignore
import { useRouter } from "expo-router";
import { supabase } from "../../supabase/supabase";
import { useUser } from "@clerk/clerk-expo";

export default function CreateOrganisationScreen() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [capacity, setCapacity] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useUser();
  const router = useRouter();

  const handleCreate = async () => {
    if (!name || !description) {
      Alert.alert("Error", "Please fill in all required fields.");
      return;
    }
    if (!user) {
      Alert.alert("Error", "You must be logged in.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("organisations").insert([
      {
        name,
        description,
        capacity: parseInt(capacity) || 0,
        ownerid: user?.id,
      },
    ]);

    setLoading(false);

    if (error) {
      Alert.alert("Error", error.message);
    } else {
      Alert.alert("Success", "Organisation created successfully!");
      setName("");
      setDescription("");
      setLocation("");
      setCapacity("");
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setName("");
    setDescription("");
    setLocation("");
    setCapacity("");
    setRefreshing(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
      <View className="flex-row items-center justify-between p-4 bg-white border-b border-gray-200">
        <TouchableOpacity onPress={() => router.push('/spaces')} className="p-2">
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900">Create Organisation</Text>
        <View className="w-10" />
      </View>

      <ScrollView
        className="flex-1 px-5 py-6"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#374151"]}
            tintColor="#374151"
          />
        }
      >
        <View className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6">
          <View className="mb-6">
            <View className="flex-row items-center mb-2">
              <Ionicons name="business-outline" size={20} color="#374151" className="mr-2" />
              <Text className="text-lg font-semibold text-gray-900">Organisation Name *</Text>
            </View>
            <TextInput
              placeholder="Enter organisation name"
              value={name}
              onChangeText={setName}
              className="border border-gray-300 rounded-xl px-4 py-3 text-base bg-gray-50 focus:border-blue-500 focus:bg-white"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View className="mb-6">
            <View className="flex-row items-center mb-2">
              <Ionicons name="document-text-outline" size={20} color="#374151" className="mr-2" />
              <Text className="text-lg font-semibold text-gray-900">Description *</Text>
            </View>
            <TextInput
              placeholder="Enter description"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              className="border border-gray-300 rounded-xl px-4 py-3 text-base bg-gray-50 focus:border-blue-500 focus:bg-white h-32"
              placeholderTextColor="#9CA3AF"
              textAlignVertical="top"
            />
          </View>

          <View className="mb-6">
            <View className="flex-row items-center mb-2">
              <Ionicons name="location-outline" size={20} color="#374151" className="mr-2" />
              <Text className="text-lg font-semibold text-gray-900">Location</Text>
            </View>
            <TextInput
              placeholder="Enter location"
              value={location}
              onChangeText={setLocation}
              className="border border-gray-300 rounded-xl px-4 py-3 text-base bg-gray-50 focus:border-blue-500 focus:bg-white"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View className="mb-8">
            <View className="flex-row items-center mb-2">
              <Ionicons name="people-outline" size={20} color="#374151" className="mr-2" />
              <Text className="text-lg font-semibold text-gray-900">Capacity</Text>
            </View>
            <TextInput
              placeholder="Enter capacity"
              value={capacity}
              onChangeText={setCapacity}
              keyboardType="numeric"
              className="border border-gray-300 rounded-xl px-4 py-3 text-base bg-gray-50 focus:border-blue-500 focus:bg-white"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <TouchableOpacity
            onPress={handleCreate}
            disabled={loading}
            className={`${
              loading ? "bg-gray-400" : "bg-blue-600"
            } py-4 rounded-xl shadow-md`}
          >
            <Text className="text-white text-center font-semibold text-lg">
              {loading ? "Creating..." : "Create Organisation"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}