import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StatusBar } from 'react-native';
import SafeBoundingView from '@/components/SafeBoundingView';
import { useUser } from '@clerk/clerk-expo';
import { getUserInfo } from '@/supabase/controllers/user.controller';
import { MenuItem } from '@/components/MenuItem';
import { ProfileHeader } from '@/components/ProfileHeader';
import SignOutModal from '@/components/Modals/SignOutModal';
import type { UserProfile } from '@/types/database.type';

const MenuSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <View className="mb-6">
    <Text className="text-gray-500 text-sm font-bold mb-4 uppercase tracking-wide">
      {title}
    </Text>
    <View className="bg-gray-50 rounded-3xl">
      {children}
    </View>
  </View>
);

const ProfileScreen = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [signOutModalVisible, setSignOutModalVisible] = useState(false);

  const { user: authUser } = useUser();

  const fetchProfile = async () => {
    setLoading(true);
    const data = await getUserInfo(authUser?.id!);
    setProfile({ ...data, avatar_url: authUser?.imageUrl });
    setLoading(false);
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <SafeBoundingView className="flex-1 bg-gray-50">
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <ScrollView showsVerticalScrollIndicator={false}>
        <ProfileHeader profile={profile} loading={loading} onRefresh={fetchProfile} />

        <View className="px-6 py-6">
          <MenuSection title="Account">
            <MenuItem
              icon="person-outline"
              label="Edit Profile"
              subtitle="Update your personal information"
              onPress={() => console.log('Edit profile')}
              disabled={loading}
            />
            <MenuItem
              icon="lock-closed-outline"
              label="Privacy & Security"
              subtitle="Manage your account security"
              onPress={() => console.log('Privacy settings')}
              disabled={loading}
            />
            <MenuItem
              icon="card-outline"
              label="Billing & Payments"
              subtitle="Manage subscription and payments"
              onPress={() => console.log('Billing')}
              disabled={loading}
            />
          </MenuSection>

          <MenuSection title="Preferences">
            <MenuItem
              icon="notifications-outline"
              label="Notifications"
              subtitle="Push notifications and alerts"
              hasToggle
              toggleValue={notificationsEnabled}
              onToggleChange={setNotificationsEnabled}
            />
            <MenuItem
              icon="moon-outline"
              label="Dark Mode"
              subtitle="Switch to dark theme"
              hasToggle
              toggleValue={darkModeEnabled}
              onToggleChange={setDarkModeEnabled}
            />
            <MenuItem
              icon="language-outline"
              label="Language"
              subtitle="English (US)"
              onPress={() => console.log('Language')}
              disabled={loading}
            />
          </MenuSection>

          <MenuSection title="Support">
            <MenuItem
              icon="help-circle-outline"
              label="Help Center"
              subtitle="FAQs and support articles"
              onPress={() => console.log('Help')}
              disabled={loading}
            />
            <MenuItem
              icon="chatbubble-outline"
              label="Contact Support"
              subtitle="Get help from our team"
              onPress={() => console.log('Contact')}
              disabled={loading}
            />
            <MenuItem
              icon="star-outline"
              label="Rate App"
              subtitle="Share your feedback"
              onPress={() => console.log('Rate app')}
              disabled={loading}
            />
          </MenuSection>

          <MenuSection title="About">
            <MenuItem
              icon="information-circle-outline"
              label="About Schedura"
              subtitle="Version 1.0.0"
              onPress={() => console.log('About')}
              disabled={loading}
            />
            <MenuItem
              icon="document-text-outline"
              label="Terms of Service"
              onPress={() => console.log('Terms')}
              disabled={loading}
            />
            <MenuItem
              icon="shield-checkmark-outline"
              label="Privacy Policy"
              onPress={() => console.log('Privacy')}
              disabled={loading}
            />
          </MenuSection>

          {profile && (
            <View className="mt-4">
              <MenuItem
                icon="log-out-outline"
                label="Sign Out"
                subtitle="Sign out of your account"
                isDestructive
                onPress={() => setSignOutModalVisible(true)}
                disabled={loading}
              />
            </View>
          )}

          <View className="h-8" />
        </View>
      </ScrollView>

      <SignOutModal visible={signOutModalVisible} setVisible={setSignOutModalVisible} />
    </SafeBoundingView>
  );
};

export default ProfileScreen;
