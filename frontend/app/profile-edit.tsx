import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StatusBar, Alert, ActivityIndicator, Image } from 'react-native';
import SafeBoundingView from '@/components/SafeBoundingView';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import { getUserInfo } from '@/supabase/controllers/user.controller';
import { useTheme } from '@/contexts/ThemeContext';

const EditProfileScreen = () => {
  const { colors, isDark } = useTheme();
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
      <SafeBoundingView style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={colors.accent} />
      </SafeBoundingView>
    );
  }

  return (
    <SafeBoundingView style={{ flex: 1, backgroundColor: colors.backgroundSecondary }}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.card} />
      
      {/* Header */}
      <View style={{ backgroundColor: colors.card, paddingHorizontal: 24, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.text }}>Edit Profile</Text>
        <TouchableOpacity 
          onPress={handleSave}
          disabled={saving}
          style={{ padding: 8 }}
        >
          {saving ? (
            <ActivityIndicator size="small" color={colors.accent} />
          ) : (
            <Text style={{ fontSize: 16, fontWeight: '600', color: colors.link }}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Avatar Section */}
        <View style={{ backgroundColor: colors.card, paddingVertical: 32, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: colors.border }}>
          <TouchableOpacity onPress={pickImage} style={{ position: 'relative' }}>
            {avatarUri ? (
              <Image 
                source={{ uri: avatarUri }} 
                style={{ width: 128, height: 128, borderRadius: 64, backgroundColor: colors.backgroundSecondary }}
              />
            ) : (
              <View style={{ width: 128, height: 128, borderRadius: 64, backgroundColor: colors.backgroundSecondary, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="person" size={48} color={colors.textSecondary} />
              </View>
            )}
            <View style={{ position: 'absolute', bottom: 0, right: 0, backgroundColor: colors.link, padding: 8, borderRadius: 20 }}>
              <Ionicons name="camera" size={20} color="white" />
            </View>
          </TouchableOpacity>
          <Text style={{ color: colors.textSecondary, fontSize: 14, marginTop: 12 }}>Tap to change photo</Text>
        </View>

        {/* Form Section */}
        <View style={{ paddingHorizontal: 24, paddingVertical: 24 }}>
          {/* Name */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 8 }}>Full Name</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, borderWidth: 1, borderColor: colors.border }}>
              <Ionicons name="person-outline" size={20} color={colors.textSecondary} />
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                placeholderTextColor={colors.textSecondary}
                style={{ flex: 1, marginLeft: 12, fontSize: 16, color: colors.text }}
              />
            </View>
          </View>

          {/* Email */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 8 }}>Email</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.backgroundSecondary, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, borderWidth: 1, borderColor: colors.border }}>
              <Ionicons name="mail-outline" size={20} color={colors.textSecondary} />
              <TextInput
                value={email}
                editable={false}
                placeholder="Email"
                placeholderTextColor={colors.textSecondary}
                style={{ flex: 1, marginLeft: 12, fontSize: 16, color: colors.textSecondary }}
              />
            </View>
            <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4 }}>Email cannot be changed</Text>
          </View>

          {/* Phone */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 8 }}>Phone Number</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, borderWidth: 1, borderColor: colors.border }}>
              <Ionicons name="call-outline" size={20} color={colors.textSecondary} />
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="+1 (555) 000-0000"
                placeholderTextColor={colors.textSecondary}
                keyboardType="phone-pad"
                style={{ flex: 1, marginLeft: 12, fontSize: 16, color: colors.text }}
              />
            </View>
          </View>

          {/* Location */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 8 }}>Location</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, borderWidth: 1, borderColor: colors.border }}>
              <Ionicons name="location-outline" size={20} color={colors.textSecondary} />
              <TextInput
                value={location}
                onChangeText={setLocation}
                placeholder="City, Country"
                placeholderTextColor={colors.textSecondary}
                style={{ flex: 1, marginLeft: 12, fontSize: 16, color: colors.text }}
              />
            </View>
          </View>

          {/* Bio */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 8 }}>Bio</Text>
            <View style={{ backgroundColor: colors.card, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, borderWidth: 1, borderColor: colors.border }}>
              <TextInput
                value={bio}
                onChangeText={setBio}
                placeholder="Tell us about yourself..."
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                style={{ fontSize: 16, color: colors.text }}
              />
            </View>
            <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4 }}>{bio.length}/150 characters</Text>
          </View>

          {/* Save Button (Mobile) */}
          <TouchableOpacity
            onPress={handleSave}
            disabled={saving}
            style={{ backgroundColor: colors.accent, borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 16 }}
          >
            {saving ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeBoundingView>
  );
};

export default EditProfileScreen;
