import { ScrollView, Text, TouchableOpacity, View, TextInput, Alert, StatusBar, Animated, Easing } from 'react-native';
import SafeBoundingView from '@/components/SafeBoundingView';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createSpace } from '@/supabase/controllers/spaces.controller';
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { Image } from 'react-native';
import { useUser } from '@clerk/clerk-expo';
import { decode } from 'base64-arraybuffer'
import { AntDesign, Ionicons } from '@expo/vector-icons';
//@ts-ignore
import CSpace from "@/assets/images/illustrations/cspace.png"
import RolesModal from '@/components/Modals/RolesModal';
import { createOrganisation, searchOrganisations, getUserOrganisations, checkUserMembership } from '@/supabase/controllers/organisation.controller';
import { createJoinRequest, getUserJoinRequests } from '@/supabase/controllers/join-requests.controller';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '@/contexts/ThemeContext';
import { useRouter } from 'expo-router';


export default function JoinOrganisationScreen() {
  const { colors, isDark } = useTheme();
  const { push } = useRouter();
  const [name, setName] = useState('');
  const [organisations, setOrganisations] = useState<any[]>([]);
  const [userOrganisations, setUserOrganisations] = useState<any[]>([]);
  const [userJoinRequests, setUserJoinRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  
  const search = async (name:string) => {
    setName(name);
    if (name.trim() === '') {
      setOrganisations([]);
      return;
    }
    const data = await searchOrganisations(name);
    if(data.error){
      Alert.alert('Error', data.error);
      return;
    }
    setOrganisations(data.data || []);
  };

  const handleJoinOrganisation = async (organisationId: string, organisationName: string) => {
    if (!user?.id) {
      Alert.alert('Error', 'Please log in to send a join request.');
      return;
    }

    setLoading(true);
    try {
      await createJoinRequest(user.id, organisationId, `I would like to join ${organisationName}`);
      Alert.alert('Success', `Join request sent to ${organisationName}! You'll be notified when it's approved.`);
      // Refresh user join requests
      await loadUserJoinRequests();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send join request.');
    } finally {
      setLoading(false);
    }
  };

  const loadUserOrganisations = async () => {
    if (!user?.id) return;
    try {
      const userOrgs = await getUserOrganisations(user.id);
      setUserOrganisations(userOrgs);
    } catch (error) {
      console.error('Error loading user organisations:', error);
    }
  };

  const loadUserJoinRequests = async () => {
    if (!user?.id) return;
    try {
      const requests = await getUserJoinRequests(user.id);
      setUserJoinRequests(requests);
    } catch (error) {
      console.error('Error loading join requests:', error);
    }
  };

  const isAlreadyMember = (organisationId: string) => {
    return userOrganisations.some(org => org.organisation_id === organisationId);
  };

  const hasPendingRequest = (organisationId: string) => {
    return userJoinRequests.some(req => req.organisation_id === organisationId && req.status === 'pending');
  };

  const getRequestStatus = (organisationId: string) => {
    const request = userJoinRequests.find(req => req.organisation_id === organisationId);
    return request?.status || null;
  };

  // Load user organizations and join requests on component mount
  useFocusEffect(
    useCallback(() => {
      loadUserOrganisations();
      loadUserJoinRequests();
    }, [user?.id])
  );

 
  return (
    <SafeBoundingView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.card} />
      <ScrollView style={{ backgroundColor: colors.backgroundSecondary }}>
        <View style={{ padding: 24, backgroundColor: colors.accent, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, paddingBottom: 48 }}>
          <Text style={{ color: colors.text, fontSize: 36, fontWeight: 'bold', marginTop: 24 }}>Join Organisation</Text>
          <Text style={{ marginTop: 8, fontSize: 20, color: colors.text }}>Set up your space and let people {'\n'}reserve it with ease</Text>
          <Image source={CSpace} style={{ position: 'absolute', right: -8, bottom: 0 }} />
        </View>

        <View style={{ marginBottom: 24, padding: 24, gap: 24 }}>
          
          <View>
            <Text style={{ marginBottom: 4, fontWeight: '600', fontSize: 20, color: colors.text }}>Search</Text>
            <View style={{ paddingHorizontal: 8, borderRadius: 12, borderWidth: 2, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.card }}>
              <Ionicons name="search" size={20} color={colors.textSecondary} style={{ paddingHorizontal: 8 }} />
              <TextInput
                placeholder="Convention Center"
                placeholderTextColor={colors.textSecondary}
                value={name}
                onChangeText={search}
                style={{ padding: 16, borderRadius: 12, flex: 1, color: colors.text }}
              />
            </View>
          </View>
        </View>
        <View style={{ paddingHorizontal: 24 }}>
          {organisations.map((org:any) => {
            const isMember = isAlreadyMember(org.id);
            const pendingRequest = hasPendingRequest(org.id);
            const requestStatus = getRequestStatus(org.id);
            
            return (
              <View key={org.id} style={{ 
                borderRadius: 16, 
                marginBottom: 16, 
                backgroundColor: colors.card, 
                padding: 20, 
                borderWidth: 1, 
                borderColor: colors.border,
                shadowColor: colors.shadow,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 4
              }}>
                <TouchableOpacity 
                  onPress={() => push(`/organisation/${org.id}` as any)}
                  style={{ marginBottom: 16 }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                    {org.logo ? (
                      <Image source={{ uri: org.logo }} style={{ width: 80, height: 80, borderRadius: 16, backgroundColor: colors.backgroundSecondary }} />
                    ) : (
                      <View style={{ width: 80, height: 80, borderRadius: 16, backgroundColor: colors.backgroundSecondary, justifyContent: 'center', alignItems: 'center' }}>
                        <Ionicons name="business" size={36} color={colors.textSecondary} />
                      </View>
                    )}
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: 4 }}>{org.name}</Text>
                      <View style={{ 
                        backgroundColor: colors.backgroundSecondary, 
                        paddingHorizontal: 10, 
                        paddingVertical: 4, 
                        borderRadius: 12, 
                        alignSelf: 'flex-start',
                        marginBottom: 8
                      }}>
                        <Text style={{ color: colors.text, fontSize: 12, fontWeight: '600' }}>{org.type}</Text>
                      </View>
                      <Text style={{ color: colors.textSecondary, fontSize: 14, lineHeight: 20 }} numberOfLines={2}>
                        {org.description || 'No description available'}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                  </View>
                </TouchableOpacity>
                
                {/* Action Buttons */}
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <TouchableOpacity
                    onPress={() => push(`/organisation/${org.id}` as any)}
                    style={{
                      flex: 1,
                      backgroundColor: colors.backgroundSecondary,
                      paddingVertical: 12,
                      paddingHorizontal: 16,
                      borderRadius: 12,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8
                    }}
                  >
                    <Ionicons name="information-circle-outline" size={18} color={colors.text} />
                    <Text style={{ color: colors.text, fontWeight: '600' }}>View Details</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    onPress={() => handleJoinOrganisation(org.id, org.name)}
                    disabled={isMember || pendingRequest || requestStatus === 'rejected' || loading}
                    style={{ 
                      flex: 1,
                      backgroundColor: isMember 
                        ? colors.backgroundSecondary 
                        : pendingRequest 
                          ? '#FFA500' 
                          : requestStatus === 'rejected' 
                            ? '#FF6B6B' 
                            : colors.accent, 
                      paddingVertical: 12, 
                      paddingHorizontal: 16, 
                      borderRadius: 12, 
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      borderWidth: isMember ? 1 : 0,
                      borderColor: colors.border,
                      opacity: loading ? 0.7 : 1
                    }}
                  >
                    <Ionicons 
                      name={
                        isMember 
                          ? "checkmark-circle" 
                          : pendingRequest 
                            ? "hourglass-outline" 
                            : requestStatus === 'rejected' 
                              ? "close-circle-outline" 
                              : "add-circle-outline"
                      } 
                      size={18} 
                      color={
                        isMember 
                          ? colors.textSecondary 
                          : pendingRequest || requestStatus === 'rejected' 
                            ? 'white' 
                            : 'white'
                      } 
                    />
                    <Text style={{ 
                      color: isMember ? colors.textSecondary : 'white', 
                      fontWeight: '600' 
                    }}>
                      {isMember 
                        ? 'Joined' 
                        : pendingRequest 
                          ? 'Pending' 
                          : requestStatus === 'rejected' 
                            ? 'Rejected' 
                            : 'Join Now'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
          
          {organisations.length === 0 && name.trim() !== '' && (
            <View style={{ alignItems: 'center', marginTop: 32 }}>
              <Text style={{ color: colors.textSecondary, fontSize: 16 }}>No organisations found</Text>
            </View>
          )}
          
          {name.trim() === '' && (
            <View style={{ alignItems: 'center', marginTop: 32 }}>
              <Ionicons name="search" size={48} color={colors.textSecondary} />
              <Text style={{ color: colors.textSecondary, fontSize: 16, marginTop: 8 }}>Search for organisations to join</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeBoundingView>
  );
}
