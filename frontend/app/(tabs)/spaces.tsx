import { Image, ScrollView, Text, TouchableOpacity, View, StatusBar, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
//@ts-ignore
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { getMySpaces } from '@/supabase/controllers/spaces.controller';
import { useUser } from '@clerk/clerk-expo';
import { useTheme } from '@/contexts/ThemeContext';
import { getOrganisationByUserId } from '@/supabase/controllers/organisation.controller';

export default function SpacesScreen() {
  const { colors, isDark } = useTheme();
  const { navigate, back } = useRouter();
  const [spaces, setSpaces] = useState<any>();
  const { user } = useUser();
  const [refreshing, setRefreshing] = useState(false);
  const [organization, setOrganization] = useState<any>(null); // Add state for organization

  const fetchMySpaces = async () => {
    const { data } = await getMySpaces(user?.id!);
    setSpaces(data);
  }
  
  useEffect(() => {
    fetchMySpaces()
  },[])

  useEffect(() => {
    const fetchOrganization = async () => {
      // Fetch organization details here
      const orgData = await getOrganisationByUserId(user?.id!);
      setOrganization(orgData.data[0]);
    };
    
    fetchOrganization();
  }, [user]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.backgroundSecondary }}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.primary} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={fetchMySpaces}
            colors={[colors.text]}
            tintColor={colors.text}
          />
        }
      >
        <View style={{ backgroundColor: colors.primary, paddingHorizontal: 24, paddingTop: 24, paddingBottom: 32, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }}>
          <View style={{ marginBottom: 16 }}>
            <Text style={{ color: colors.accent, fontSize: 30, fontWeight: 'bold' }}>My Spaces</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 18, marginTop: 4 }}>Manage your venues</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 16 }}>
            <View style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.8)', borderRadius: 16, padding: 16, flex: 1 }}>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.text }}>{spaces?.length || 0}</Text>
              <Text style={{ fontSize: 14, color: colors.textSecondary }}>Total Spaces</Text>
            </View>
            <View style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.8)', borderRadius: 16, padding: 16, flex: 1 }}>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.success }}>Active</Text>
              <Text style={{ fontSize: 14, color: colors.textSecondary }}>Status</Text>
            </View>
          </View>
        </View>

        <View  style={{ paddingHorizontal: 24, paddingVertical: 32 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <Text style={{ color: colors.text, fontSize: 20, fontWeight: 'bold' }}>Your Venues</Text>
            <TouchableOpacity
              onPress={() => navigate('/space/create')}
              style={{ backgroundColor: colors.accent, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, flexDirection: 'row', alignItems: 'center' }}
            >
              <Ionicons name="add" size={20} color={isDark ? '#000' : '#E9F0E9'} />
              <Text style={{ color: isDark ? '#000' : '#ffffff', fontWeight: '600', marginLeft: 4 }}>Add Space</Text>
            </TouchableOpacity>
          </View>

          {spaces && spaces.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 16, paddingRight: 24 }}>
              {spaces.map((space: any) => (
                <TouchableOpacity
                  key={space.id}
                  onPress={() => navigate(`/spaces?id=${space.id}`)}
                  style={{ backgroundColor: colors.card, borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: colors.border, width: 288 }}
                >
                  <View style={{ position: 'relative' }}>
                    <Image
                      source={{
                        uri: space['spaces-images']?.[0]?.link || 'https://via.placeholder.com/300x200.png?text=No+Image+Available'
                      }}
                      style={{ height: 192, width: '100%' }}
                    />
                    <View style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.15)' }} />
                    <View style={{ position: 'absolute', top: 12, right: 12, backgroundColor: colors.success, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 }}>
                      <Text style={{ color: '#ffffff', fontSize: 12, fontWeight: '600' }}>Active</Text>
                    </View>
                  </View>
                  <View style={{ padding: 20 }}>
                    <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.text, marginBottom: 8 }}>{space.name}</Text>
                    <View style={{ gap: 8 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={{ backgroundColor: colors.backgroundSecondary, borderRadius: 20, padding: 4, marginRight: 12 }}>
                          <Ionicons name="location" size={14} color={colors.textSecondary} />
                        </View>
                        <Text style={{ color: colors.textSecondary, flex: 1 }}>{space.location}</Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={{ backgroundColor: colors.backgroundSecondary, borderRadius: 20, padding: 4, marginRight: 12 }}>
                          <Ionicons name="people" size={14} color={colors.textSecondary} />
                        </View>
                        <Text style={{ color: colors.textSecondary }}>Up to {space.capacity} guests</Text>
                      </View>
                    </View>
                    <View style={{ flexDirection: 'row', marginTop: 16, gap: 8 }}>
                      <TouchableOpacity
                        onPress={() => navigate(`/space/${space.id}/manage`)}
                        style={{ backgroundColor: colors.accent, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 8, flex: 1 }}
                      >
                        <Text style={{ color: isDark ? '#000' : '#ffffff', textAlign: 'center', fontWeight: '600' }}>Manage</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => navigate(`/space/${space.id}/edit`)}
                        style={{ backgroundColor: colors.backgroundSecondary, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 8, flex: 1 }}
                      >
                        <Text style={{ color: colors.text, textAlign: 'center', fontWeight: '600' }}>Edit</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <View style={{ backgroundColor: colors.card, borderRadius: 24, borderWidth: 2, borderStyle: 'dashed', borderColor: colors.border, padding: 32, alignItems: 'center', justifyContent: 'center' }}>
              <View style={{ backgroundColor: colors.backgroundSecondary, borderRadius: 40, padding: 16, marginBottom: 16 }}>
                <MaterialCommunityIcons name="home-plus-outline" size={48} color={colors.textTertiary} />
              </View>
              <Text style={{ fontSize: 20, fontWeight: '600', color: colors.text, marginBottom: 8 }}>No spaces yet</Text>
              <Text style={{ color: colors.textSecondary, textAlign: 'center', marginBottom: 24 }}>Create your first venue to start managing bookings</Text>
              <TouchableOpacity
                onPress={() => navigate('/space/create')}
                style={{ backgroundColor: colors.accent, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12 }}
              >
                <Text style={{ color: isDark ? '#000' : '#ffffff', fontSize: 18, fontWeight: '600' }}>Create Your First Space</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={{ paddingHorizontal: 24, paddingBottom: 32 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <Text style={{ color: colors.text, fontSize: 20, fontWeight: 'bold' }}>Organization</Text>
            <TouchableOpacity>
              <Ionicons name="information-circle-outline" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          {organization ? ( // Check if organization exists
            <View style={{ backgroundColor: colors.card, borderRadius: 24, padding: 24, borderWidth: 1, borderColor: colors.border }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
                {(() => {
                  const orgImage =
                  organization?.logo ||
                  organization?.image ||
                  organization?.['organisation-image']?.[0]?.link ||
                  organization?.['organisation_images']?.[0]?.link ||
                  organization?.images?.[0]?.link;

                  return (
                  <View style={{ width: 64, height: 64, borderRadius: 12, overflow: 'hidden', marginRight: 16, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}>
                    {orgImage ? (
                    <Image
                      source={{ uri: orgImage }}
                      style={{ width: '100%', height: '100%' }}
                      resizeMode="cover"
                    />
                    ) : (
                    <MaterialCommunityIcons name="office-building" size={32} color={colors.accent} />
                    )}
                  </View>
                  );
                })()}
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text, marginBottom: 4 }}>{organization.name}</Text>
                  <Text style={{ color: colors.textSecondary }}>Details about the organization</Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <TouchableOpacity
                  onPress={() => navigate('/organisation/create')}
                  style={{ backgroundColor: colors.accent, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 12, flex: 1, borderWidth: 2, borderColor: colors.accent }}
                >
                  <Text style={{ color: isDark ? '#000' : '#ffffff', fontSize: 16, textAlign: 'center', fontWeight: '600' }}>Manage</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => navigate('/organisation/join')}
                  style={{ borderWidth: 2, borderColor: colors.border, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 12, flex: 1 }}
                >
                  <Text style={{ color: colors.text, fontSize: 16, textAlign: 'center', fontWeight: '600' }}>Join</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={{ backgroundColor: colors.card, borderRadius: 24, borderWidth: 2, borderStyle: 'dashed', borderColor: colors.border, padding: 32, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 20, fontWeight: '600', color: colors.text, marginBottom: 8 }}>No organization yet</Text>
              <Text style={{ color: colors.textSecondary, textAlign: 'center', marginBottom: 24 }}>Create or join an organization to collaborate</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <TouchableOpacity
                  onPress={() => navigate('/organisation/create')}
                  style={{ backgroundColor: colors.accent, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 12, flex: 1, borderWidth: 2, borderColor: colors.accent }}
                >
                  <Text style={{ color: isDark ? '#000' : '#ffffff', fontSize: 16, textAlign: 'center', fontWeight: '600' }}>Create</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => navigate('/organisation/join')}
                  style={{ borderWidth: 2, borderColor: colors.border, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 12, flex: 1 }}
                >
                  <Text style={{ color: colors.text, fontSize: 16, textAlign: 'center', fontWeight: '600' }}>Join</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}