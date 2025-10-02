import React, { useState, useEffect, FC } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getSpaces } from "@/supabase/controllers/spaces.controller";
import { useUser } from '@clerk/clerk-expo';
import { getUserInfo } from '@/supabase/controllers/user.controller';
import type { UserProfile } from '@/types/database.type';
//@ts-ignore
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';

interface Category {
  id: number;
  name: string;
  icon:
    | "heart-outline"
    | "briefcase-outline"
    | "gift-outline"
    | "people-outline"
    | "chatbubbles-outline"
    | "grid-outline";
}

const categories: Category[] = [
  { id: 0, name: "All", icon: "grid-outline" },
  { id: 1, name: "Wedding", icon: "heart-outline" },
  { id: 2, name: "Corporate", icon: "briefcase-outline" },
  { id: 3, name: "Birthday", icon: "gift-outline" },
  { id: 4, name: "Conference", icon: "people-outline" },
  { id: 5, name: "Social", icon: "chatbubbles-outline" },
];

const Home = () => {
  const { colors, isDark } = useTheme();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const { navigate } = useRouter();
  const [activeCategory, setActiveCategory] = useState(0);
  const [spaces, setSpaces] = useState<any>([]);
  const [filteredSpaces, setFilteredSpaces] = useState<any>([]);
  const [searchQuery, setSearchQuery] = useState('');

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

  const fetchSpaces = async () => {
    try {
      setLoading(true);
      const { data, error } = await getSpaces();
      if (error) {
        console.error("Error fetching spaces:", error);
      } else {
        setSpaces(data || []);
        setFilteredSpaces(data || []);
      }
    } catch (error) {
      console.error("Error in fetchSpaces:", error);
    }
    setLoading(false);
  };

  useEffect(()=>{
    fetchSpaces();
  }, []);
  
  useEffect(() => {
    if (activeCategory === 0) {
      setFilteredSpaces(spaces);
    } else {
      const categoryName = categories[activeCategory].name;
      const filtered = spaces.filter((space: any) => space.category === categoryName);
      setFilteredSpaces(filtered);
    }
  }, [activeCategory, spaces]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      // If search is empty, apply category filter
      if (activeCategory === 0) {
        setFilteredSpaces(spaces);
      } else {
        const categoryName = categories[activeCategory].name;
        const filtered = spaces.filter((space: any) => space.category === categoryName);
        setFilteredSpaces(filtered);
      }
    } else {
      // Apply search filter
      const query = searchQuery.toLowerCase();
      let filtered = spaces.filter((space: any) => {
        const nameMatch = space.name?.toLowerCase().includes(query);
        const locationMatch = space.location?.toLowerCase().includes(query);
        const descriptionMatch = space.description?.toLowerCase().includes(query);
        return nameMatch || locationMatch || descriptionMatch;
      });

      // Also apply category filter if not "All"
      if (activeCategory !== 0) {
        const categoryName = categories[activeCategory].name;
        filtered = filtered.filter((space: any) => space.category === categoryName);
      }

      setFilteredSpaces(filtered);
    }
  }, [searchQuery, activeCategory, spaces]);

  const handleClearSearch = () => {
    setSearchQuery('');
  };
  

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.tertiary }}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.primary} />
      <View style={{ backgroundColor: colors.primary, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, paddingTop: 48, paddingBottom: 24 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, marginBottom: 8 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 30, fontWeight: 'bold', color: colors.accent }}>Explore</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <TouchableOpacity style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.7)', padding: 8, borderRadius: 20 }}>
              <Ionicons name="notifications-outline" size={22} color={colors.accent} />
            </TouchableOpacity>
            <TouchableOpacity style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.7)', padding: 8, borderRadius: 20 }}>
              <Ionicons name="person-circle-outline" size={26} color={colors.accent} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 24, paddingTop: 8 }}>
          <View style={{ 
            flex: 1, 
            flexDirection: 'row', 
            alignItems: 'center', 
            backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.8)', 
            borderRadius: 16, 
            paddingHorizontal: 16,
            borderWidth: 1,
            borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.5)'
          }}>
            <Ionicons name="search" size={20} color={colors.textSecondary} />
            <TextInput
              placeholder="Search venues, locations..."
              placeholderTextColor={colors.textSecondary}
              style={{ flex: 1, paddingVertical: 12, marginLeft: 12, fontSize: 16, color: colors.text }}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={handleClearSearch} style={{ padding: 4 }}>
                <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity style={{ 
            backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.8)', 
            padding: 12, 
            borderRadius: 16,
            borderWidth: 1,
            borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.5)'
          }}>
            <Ionicons name="options-outline" size={20} color={colors.accent} />
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ paddingHorizontal: 24, marginTop: 24 }}
          contentContainerStyle={{ columnGap: 12 }}
        >
          {categories.map((category: Category, index: number) => (
            <TouchableOpacity
              key={category.id}
              onPress={() => setActiveCategory(index)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 20,
                backgroundColor: index === activeCategory ? colors.accent : (isDark ? 'rgba(255,255,255,0.15)' : '#FFFFFF')
              }}
            >
              <Ionicons
                name={category.icon}
                size={16}
                color={index === activeCategory ? (isDark ? '#000' : '#fff') : colors.accent}
              />
              <Text style={{
                fontSize: 12,
                fontWeight: '500',
                color: index === activeCategory ? (isDark ? '#000' : '#fff') : colors.accent
              }}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView 
        refreshControl={<RefreshControl
          refreshing={loading}
          onRefresh={fetchSpaces}
          colors={[colors.text]}
          tintColor={colors.text}
        />} 
        showsVerticalScrollIndicator={false} 
        style={{ flex: 1, height: '100%', backgroundColor: colors.tertiary }}>

        {/* No Results Message */}
        {filteredSpaces.length === 0 && !loading && (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 80 }}>
            <Ionicons name="search-outline" size={64} color={colors.textTertiary} />
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.text, marginTop: 16 }}>No spaces found</Text>
            <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 8 }}>
              {searchQuery ? `No results for "${searchQuery}"` : 'No spaces available in this category'}
            </Text>
            {searchQuery && (
              <TouchableOpacity 
                onPress={handleClearSearch}
                style={{ backgroundColor: colors.accent, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 20, marginTop: 24 }}
              >
                <Text style={{ color: isDark ? '#000' : '#fff', fontWeight: '600' }}>Clear Search</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Featured Venues */}
        {filteredSpaces.length > 0 && (
          <View style={{ marginTop: 32 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, marginBottom: 16 }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.text }}>Featured Venues</Text>
              <TouchableOpacity>
                <Text style={{ color: colors.text, fontWeight: '600' }}>View All</Text>
              </TouchableOpacity>
            </View>

            <ScrollView decelerationRate={0.9} horizontal showsHorizontalScrollIndicator={false} className="pl-4">
              {filteredSpaces.map((hall: any) => (
              <TouchableOpacity
                key={hall.id}
                className="w-72 h-72 rounded-3xl overflow-hidden mr-4 bg-gray-700"
                onPress={() => navigate(`/space/${hall.id}`)}
              >
                <Image
                  source={{ uri: hall["spaces-images"]?.[0]?.link }}
                  className="absolute w-full h-full"
                />
                <View className="absolute inset-0 bg-black/30" />
                <View className="absolute bottom-0 left-0 right-0 p-4">
                  <Text className="text-white text-2xl font-bold mb-1">{hall.name}</Text>
                  <View className="flex-row items-center gap-x-3">
                    <View className="flex-row items-center gap-x-1">
                      <Ionicons name="location" size={16} color="white" />
                      <Text className="text-gray-200 text-sm">{hall.location}</Text>
                    </View>
                    <View className="flex-row items-center gap-x-1">
                      <Ionicons name="people" size={16} color="white" />
                      <Text className="text-gray-200 text-sm">{hall.capacity}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        )}

        {/* Recommended */}
        {filteredSpaces.length > 0 && (
        <View style={{ marginTop: 40 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, marginBottom: 16 }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.text }}>Recommended for You</Text>
            <TouchableOpacity>
              <Text style={{ color: colors.link, fontWeight: '600' }}>View All</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pl-4">
            {filteredSpaces.slice(0, 5).map((hall: any) => (
              <TouchableOpacity
                key={`rec-${hall.id}`}
                className="w-64 h-64 rounded-2xl overflow-hidden mr-4 bg-gray-700"
                onPress={() => navigate(`/space/${hall.id}`)}
              >
                <Image
                  source={{ uri: hall["spaces-images"]?.[0]?.link }}
                  className="absolute w-full h-full"
                />
                <View className="absolute inset-0 bg-black/25" />
                <View className="absolute bottom-0 left-0 right-0 p-3">
                  <Text className="text-white text-lg font-semibold">{hall.name}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        )}

        {/* Special Promotions */}
        {filteredSpaces.length > 0 && (
        <View style={{ marginTop: 40, marginBottom: 24 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, marginBottom: 16 }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.text }}>Special Promotions</Text>
            <TouchableOpacity>
              <Text style={{ color: colors.link, fontWeight: '600' }}>View All</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pl-4">
            {filteredSpaces.slice(0, 3).map((hall: any) => (
              <TouchableOpacity
                key={`promo-${hall.id}`}
                className="w-80 h-48 rounded-2xl overflow-hidden mr-4 bg-gray-700"
                onPress={() => navigate(`/space/${hall.id}`)}
              >
                <Image
                  source={{ uri: hall["spaces-images"]?.[0]?.link }}
                  className="absolute w-full h-full"
                />
                <View className="absolute inset-0 bg-black/40" />
                <View className="absolute top-0 left-0 right-0 p-4">
                  <Text className="text-white text-lg font-bold">Special Offer!</Text>
                  <Text className="text-white text-sm mt-1">
                    Book {hall.name} now and save 20%!
                  </Text>
                </View>
                <View className="absolute bottom-0 left-0 right-0 p-4">
                  <View className="flex-row items-center gap-x-2">
                    <Ionicons name="pricetag" size={16} color="white" />
                    <Text className="text-white text-sm font-semibold">
                      Limited Time Deal
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};


const App = () => {
  return <Home  />;
}


export default App;
