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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../supabase/supabase';

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
        };
      };
    };
  };
};
type UserProfile = Database['public']['Tables']['users']['Row'];


const ProfileHeader: FC<{ profile: UserProfile | null }> = ({ profile }) => (
  <View className="items-center pt-8 pb-6 bg-gray-900">
    <Image
      source={{ uri: profile?.avatar_url || '' }}
      className="w-24 h-24 rounded-full border-4 border-purple-500 mb-4"
    />
    <Text className="text-white text-2xl font-bold">{profile?.name || 'Guest'}</Text>
    <Text className="text-gray-400 text-base mt-1">{profile?.email || ''}</Text>
  </View>
);

const MenuItem: FC<{ icon: keyof typeof Ionicons.glyphMap; label: string; isDestructive?: boolean; onPress?: () => void; hasToggle?: boolean; }> = ({ icon, label, isDestructive, onPress, hasToggle }) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const toggleSwitch = () => setIsEnabled(previousState => !previousState);

  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center p-4 bg-white rounded-xl mb-3"
      disabled={hasToggle}
    >
      <View className="p-2 bg-gray-100 rounded-full">
        <Ionicons name={icon} size={22} color={isDestructive ? "#ef4444" : "#4b5563"} />
      </View>
      <Text className={`flex-1 text-lg ml-4 ${isDestructive ? 'text-red-500' : 'text-gray-800'}`}>{label}</Text>
      {hasToggle ? (
        <Switch
          trackColor={{ false: "#767577", true: "#8b5cf6" }}
          thumbColor={isEnabled ? "#f5f3ff" : "#f4f3f4"}
          onValueChange={toggleSwitch}
          value={isEnabled}
        />
      ) : (
        <Ionicons name="chevron-forward-outline" size={22} color="#9ca3af" />
      )}
    </TouchableOpacity>
  );
};

const ProfilePage: FC<{ profile: UserProfile | null }> = ({ profile }) => {
  const handleLogout = () => {
  
    console.log("Logout pressed");
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <StatusBar barStyle="light-content" backgroundColor="#111827" />
      <ScrollView>
        <ProfileHeader profile={profile} />

        <View className="p-4">
          <View className="p-4 bg-white rounded-xl mb-4">
              <Text className="text-gray-500 text-sm font-semibold mb-3 uppercase">Account</Text>
              <MenuItem icon="person-outline" label="Edit Profile" />
              <MenuItem icon="lock-closed-outline" label="Change Password" />
          </View>
          
          <View className="p-4 bg-white rounded-xl mb-4">
              <Text className="text-gray-500 text-sm font-semibold mb-3 uppercase">Settings</Text>
              <MenuItem icon="notifications-outline" label="Notifications" hasToggle />
              <MenuItem icon="language-outline" label="Language" />
              <MenuItem icon="help-circle-outline" label="Help Center" />
          </View>

          <View className="mt-4">
            <MenuItem icon="log-out-outline" label="Logout" isDestructive onPress={handleLogout} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
``
const App: FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        
        const { data, error } = await supabase 
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (error) {
          console.error('Error fetching profile:', error);
        } else {
          setProfile(data);
        }
      } else {
        setProfile(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);
  console.log("profile", profile);
  return <ProfilePage profile={profile} />;
}

export default App;
