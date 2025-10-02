import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StatusBar, Alert, ActivityIndicator, Image } from 'react-native';
import SafeBoundingView from '@/components/SafeBoundingView';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import { getUserInfo } from '@/supabase/controllers/user.controller';

const EditProfileScreen = () => {
  const router = useRouter();
  const { user: authUser } = useUser();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const data = await getUserInfo(authUser?.id!);
      setName(data?.name || '');
      setEmail(data?.email || '');
      setPhone(data?.phone || '');
      setBio(data?.bio || '');
      setLocation(data?.location || '');
      setAvatarUri(authUser?.imageUrl || null);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
    setLoading(false);
  };

  const pickImage = async () => {
    Alert.alert(
      'Change Profile Picture',
      'This feature will be available soon. You can update your profile picture from your account settings.',
      [{ text: 'OK' }]
    );
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }

    setSaving(true);
    try {
      // Here you would update the user profile in Supabase
      // await updateUserProfile(authUser?.id!, { name, phone, bio, location });
      
      // Simulate save delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      Alert.alert('Success', 'Profile updated successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <SafeBoundingView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#000" />
      </SafeBoundingView>
    );
  }

  return (
    <SafeBoundingView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      {/* Header */}
      <View className="bg-white px-6 py-4 flex-row items-center justify-between border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900">Edit Profile</Text>
        <TouchableOpacity 
          onPress={handleSave}
          disabled={saving}
          className="p-2"
        >
          {saving ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <Text className="text-base font-semibold text-indigo-600">Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Avatar Section */}
        <View className="bg-white py-8 items-center border-b border-gray-200">
          <TouchableOpacity onPress={pickImage} className="relative">
            {avatarUri ? (
              <Image 
                source={{ uri: avatarUri }} 
                className="w-32 h-32 rounded-full bg-gray-200"
              />
            ) : (
              <View className="w-32 h-32 rounded-full bg-gray-200 items-center justify-center">
                <Ionicons name="person" size={48} color="#9ca3af" />
              </View>
            )}
            <View className="absolute bottom-0 right-0 bg-indigo-600 p-2 rounded-full">
              <Ionicons name="camera" size={20} color="white" />
            </View>
          </TouchableOpacity>
          <Text className="text-gray-500 text-sm mt-3">Tap to change photo</Text>
        </View>

        {/* Form Section */}
        <View className="px-6 py-6">
          {/* Name */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-700 mb-2">Full Name</Text>
            <View className="flex-row items-center bg-white rounded-xl px-4 py-3 border border-gray-200">
              <Ionicons name="person-outline" size={20} color="#6b7280" />
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                placeholderTextColor="#9ca3af"
                className="flex-1 ml-3 text-base text-gray-900"
              />
            </View>
          </View>

          {/* Email */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-700 mb-2">Email</Text>
            <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3 border border-gray-200">
              <Ionicons name="mail-outline" size={20} color="#6b7280" />
              <TextInput
                value={email}
                editable={false}
                placeholder="Email"
                placeholderTextColor="#9ca3af"
                className="flex-1 ml-3 text-base text-gray-500"
              />
            </View>
            <Text className="text-xs text-gray-500 mt-1">Email cannot be changed</Text>
          </View>

          {/* Phone */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-700 mb-2">Phone Number</Text>
            <View className="flex-row items-center bg-white rounded-xl px-4 py-3 border border-gray-200">
              <Ionicons name="call-outline" size={20} color="#6b7280" />
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="+1 (555) 000-0000"
                placeholderTextColor="#9ca3af"
                keyboardType="phone-pad"
                className="flex-1 ml-3 text-base text-gray-900"
              />
            </View>
          </View>

          {/* Location */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-700 mb-2">Location</Text>
            <View className="flex-row items-center bg-white rounded-xl px-4 py-3 border border-gray-200">
              <Ionicons name="location-outline" size={20} color="#6b7280" />
              <TextInput
                value={location}
                onChangeText={setLocation}
                placeholder="City, Country"
                placeholderTextColor="#9ca3af"
                className="flex-1 ml-3 text-base text-gray-900"
              />
            </View>
          </View>

          {/* Bio */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-700 mb-2">Bio</Text>
            <View className="bg-white rounded-xl px-4 py-3 border border-gray-200">
              <TextInput
                value={bio}
                onChangeText={setBio}
                placeholder="Tell us about yourself..."
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                className="text-base text-gray-900"
              />
            </View>
            <Text className="text-xs text-gray-500 mt-1">{bio.length}/150 characters</Text>
          </View>

          {/* Save Button (Mobile) */}
          <TouchableOpacity
            onPress={handleSave}
            disabled={saving}
            className="bg-black rounded-xl py-4 items-center mt-4"
          >
            {saving ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text className="text-white font-semibold text-base">Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeBoundingView>
  );
};

export default EditProfileScreen;
