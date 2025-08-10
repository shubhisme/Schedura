import React, { useState, useEffect, FC } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  Switch,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../../supabase/supabase';
import type { User } from '@supabase/supabase-js';

const { width } = Dimensions.get('window');

type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          avatar_url?: string;
          role: 'owner' | 'user';
          created_at: string;
        };
      };
    };
  };
};

type UserProfile = Database['public']['Tables']['users']['Row'];

const ProfileHeader: FC<{ 
  profile: UserProfile | null; 
  loading: boolean; 
  user: User | null;
  onRefresh: () => void;
}> = ({ profile, loading, user, onRefresh }) => (
  <LinearGradient
    colors={['#E9F0E9', '#D8E8D8']}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    className="relative overflow-hidden"
  >
    {/* Decorative Elements */}
    <View className="absolute -top-10 -right-10 w-32 h-32 bg-black/10 rounded-full" />
    <View className="absolute top-20 -left-8 w-20 h-20 bg-black/5 rounded-full" />
    <View className="absolute bottom-10 right-20 w-16 h-16 bg-black/10 rounded-full" />
    
    <View className="items-center pt-16 pb-8 px-6 relative z-10">
      {/* Profile Picture Section */}
      <View className="relative mb-6">
        {loading ? (
          <View className="w-28 h-28 rounded-full border-4 border-white/30 items-center justify-center bg-white/20 backdrop-blur-sm">
            <ActivityIndicator color="white" size="large" />
          </View>
        ) : (
          <>
            <Image
              source={{
                uri: profile?.avatar_url || user?.user_metadata?.avatar_url || 
                'https://via.placeholder.com/150/8b5cf6/ffffff?text=' + 
                (profile?.name?.[0] || user?.email?.[0] || 'U')
              }}
              className="w-28 h-28 rounded-full border-4 border-black/30"
            />
            {/* Online Status Indicator */}
            <View className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-black" />
          </>
        )}
        
        {/* Edit Profile Button */}
        <TouchableOpacity 
          className="absolute -bottom-2 -right-2 bg-white/20 backdrop-blur-sm p-2 rounded-full"
          onPress={() => console.log('Edit avatar')}
        >
          <Ionicons name="camera-outline" size={16} color="black" />
        </TouchableOpacity>
      </View>

      {/* User Info */}
      <View className="items-center">
        <Text className="text-black text-2xl font-bold mb-1">
          {loading ? 'Loading...' : (
            profile?.name || 
            user?.user_metadata?.full_name || 
            user?.email?.split('@')[0] || 
            'Guest User'
          )}
        </Text>
        
        <Text className="text-black/80 text-base mb-3">
          {loading ? '' : (profile?.email || user?.email || 'No email available')}
        </Text>

        {/* Role Badge */}
        {(profile?.role || user) && (
          <View className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
            <Text className="text-black text-sm font-semibold capitalize">
              {profile?.role || 'User'}
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
  </LinearGradient>
);

// Enhanced Menu Item with Better Styling
const MenuItem: FC<{
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  subtitle?: string;
  isDestructive?: boolean;
  onPress?: () => void;
  hasToggle?: boolean;
  toggleValue?: boolean;
  onToggleChange?: (value: boolean) => void;
  disabled?: boolean;
  showBadge?: boolean;
  badgeText?: string;
}> = ({ 
  icon, 
  label, 
  subtitle,
  isDestructive, 
  onPress, 
  hasToggle, 
  toggleValue = false,
  onToggleChange,
  disabled,
  showBadge,
  badgeText
}) => {
  const [isEnabled, setIsEnabled] = useState(toggleValue);

  const toggleSwitch = () => {
    const newValue = !isEnabled;
    setIsEnabled(newValue);
    onToggleChange?.(newValue);
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      className={`flex-row items-center p-4 bg-white rounded-2xl mb-3 ${
        disabled ? 'opacity-50' : ''
      }`}
      disabled={hasToggle || disabled}
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      {/* Icon Container */}
      <View className={`p-3 rounded-xl ${
        isDestructive ? 'bg-red-50' : 'bg-gray-50'
      }`}>
        <Ionicons 
          name={icon} 
          size={22} 
          color={isDestructive ? "#ef4444" : "#6b7280"} 
        />
      </View>

      {/* Content */}
      <View className="flex-1 ml-4">
        <View className="flex-row items-center">
          <Text className={`text-base font-semibold ${
            isDestructive ? 'text-red-600' : 'text-gray-900'
          }`}>
            {label}
          </Text>
          {showBadge && badgeText && (
            <View className="bg-red-500 px-2 py-1 rounded-full ml-2">
              <Text className="text-white text-xs font-bold">{badgeText}</Text>
            </View>
          )}
        </View>
        {subtitle && (
          <Text className="text-gray-500 text-sm mt-1">{subtitle}</Text>
        )}
      </View>

      {/* Right Side */}
      {hasToggle ? (
        <Switch
          trackColor={{ false: "#e5e7eb", true: "#8b5cf6" }}
          thumbColor={isEnabled ? "#ffffff" : "#ffffff"}
          onValueChange={toggleSwitch}
          value={isEnabled}
        />
      ) : (
        <Ionicons name="chevron-forward-outline" size={20} color="#9ca3af" />
      )}
    </TouchableOpacity>
  );
};

// Enhanced Menu Section Component
const MenuSection: FC<{
  title: string;
  children: React.ReactNode;
}> = ({ title, children }) => (
  <View className="mb-6">
    <Text className="text-gray-500 text-sm font-bold mb-4 uppercase tracking-wide px-2">
      {title}
    </Text>
    <View className="bg-gray-50 rounded-3xl p-4">
      {children}
    </View>
  </View>
);


// Main Profile Page Component
const ProfilePage: FC<{
  profile: UserProfile | null;
  loading: boolean;
  user: User | null;
  onRefresh: () => void;
}> = ({ profile, loading, user, onRefresh }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefresh();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleLogout = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase.auth.signOut();
              if (error) {
                Alert.alert('Error', 'Failed to sign out. Please try again.');
              }
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'An unexpected error occurred.');
            }
          }
        }
      ]
    );
  };

  const handleSignIn = () => {
    // Navigate to sign in screen
    console.log('Navigate to sign in');
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={handleRefresh}
            tintColor="#8b5cf6"
          />
        }
      >
        <ProfileHeader 
          profile={profile} 
          loading={loading} 
          user={user}
          onRefresh={onRefresh}
        />
        
        <View className="px-6 py-6">

          {/* Account Section */}
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

          {/* Preferences Section */}
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

          {/* Support Section */}
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

          {/* About Section */}
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

          {/* Sign Out Section (only if user is signed in) */}
          {user && (
            <View className="mt-4">
              <MenuItem
                icon="log-out-outline"
                label="Sign Out"
                subtitle="Sign out of your account"
                isDestructive
                onPress={handleLogout}
                disabled={loading}
              />
            </View>
          )}

          {/* Bottom Spacing */}
          <View className="h-8" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Main App Component
const App: FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false); // Changed to false by default
  const [user, setUser] = useState<User | null>(null);

  // Fetch user profile data
  const fetchProfile = async (userId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        // Don't show alert for missing profile, just log it
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error('Unexpected error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Check authentication state and fetch profile
  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchProfile(session.user.id);
        }
      } catch (error) {
        console.error('Error getting session:', error);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Refresh profile data
  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  return (
    <ProfilePage 
      profile={profile} 
      loading={loading} 
      user={user}
      onRefresh={refreshProfile}
    />
  );
};

export default App;