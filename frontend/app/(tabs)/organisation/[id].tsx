import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar, Alert, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '@clerk/clerk-expo';
import SafeBoundingView from '@/components/SafeBoundingView';
import { useTheme } from '@/contexts/ThemeContext';
import { getOrganisationById, getUserOrganisations, checkUserMembership, leaveOrganisation } from '@/supabase/controllers/organisation.controller';
import { getOrganisationJoinRequests, approveJoinRequest, rejectJoinRequest, createJoinRequest, getUserJoinRequests } from '@/supabase/controllers/join-requests.controller';
import { getOrganisationRoles } from '@/supabase/controllers/roles.controller';

export default function OrganisationDetailsScreen() {
  const { colors, isDark } = useTheme();
  const { id } = useLocalSearchParams();
  const { back } = useRouter();
  const { user } = useUser();
  
  const [organisation, setOrganisation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [joinRequests, setJoinRequests] = useState<any[]>([]);
  const [userJoinRequest, setUserJoinRequest] = useState<any>(null);
  const [requestsLoading, setRequestsLoading] = useState(false);

  useEffect(() => {
    if (id && user?.id) {
      loadOrganisationDetails();
      checkMembership();
      checkUserJoinRequest();
    }
  }, [id, user?.id]);

  const loadOrganisationDetails = async () => {
    try {
      setLoading(true);
      const result = await getOrganisationById(id as string);
      if (result.error) {
        Alert.alert('Error', result.error);
        back();
        return;
      }
      setOrganisation(result.data);
      
      // Check if user is owner and load join requests
      if (user?.id && result.data?.ownerid === user.id) {
        setIsOwner(true);
        await loadJoinRequests();
      } else {
        setIsOwner(false);
      }
    } catch (error) {
      console.error('Error loading organisation:', error);
      Alert.alert('Error', 'Failed to load organisation details');
      back();
    } finally {
      setLoading(false);
    }
  };

  const loadJoinRequests = async () => {
    if (!user?.id || !id) return;
    try {
      setRequestsLoading(true);
      const requests = await getOrganisationJoinRequests(id as string, user.id);
      setJoinRequests(requests);
    } catch (error) {
      console.error('Error loading join requests:', error);
    } finally {
      setRequestsLoading(false);
    }
  };

  const checkMembership = async () => {
    if (!user?.id) return;
    try {
      const userOrgs = await getUserOrganisations(user.id);
      const isAlreadyMember = userOrgs.some((org: any) => org.organisation_id === id);
      setIsMember(isAlreadyMember);
    } catch (error) {
      console.error('Error checking membership:', error);
    }
  };

  const checkUserJoinRequest = async () => {
    if (!user?.id) return;
    try {
      const requests = await getUserJoinRequests(user.id);
      const pendingRequest = requests.find((req: any) => 
        req.organisation_id === id && req.status === 'pending'
      );
      setUserJoinRequest(pendingRequest || null);
    } catch (error) {
      console.error('Error checking join request:', error);
    }
  };

  const handleJoinLeave = async () => {
    if (!user?.id || !organisation) {
      Alert.alert('Error', 'Please log in to continue.');
      return;
    }

    setActionLoading(true);
    try {
      if (isMember) {
        await leaveOrganisation(user.id, organisation.id);
        Alert.alert('Success', `Left ${organisation.name} successfully!`);
        setIsMember(false);
      } else {
        // Send join request instead of direct joining
        await createJoinRequest(user.id, organisation.id, `I would like to join ${organisation.name}`);
        Alert.alert('Success', `Join request sent to ${organisation.name}! You'll be notified when it's approved.`);
        await checkUserJoinRequest(); // Refresh request status
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update membership.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveRequest = async (requestId: string, requestedRole: number) => {
    if (!user?.id) return;
    
    try {
      await approveJoinRequest(requestId, user.id, requestedRole);
      Alert.alert('Success', 'Join request approved successfully!');
      await loadJoinRequests(); // Refresh requests
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to approve request.');
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    if (!user?.id) return;
    
    try {
      await rejectJoinRequest(requestId, user.id);
      Alert.alert('Success', 'Join request rejected.');
      await loadJoinRequests(); // Refresh requests
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to reject request.');
    }
  };

  if (loading) {
    return (
      <SafeBoundingView className="flex-1" style={{ backgroundColor: colors.background }}>
        <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.card} />
        <View className="flex-1 justify-center items-center">
          <Text style={{ color: colors.text }} className="text-lg">Loading...</Text>
        </View>
      </SafeBoundingView>
    );
  }

  if (!organisation) {
    return (
      <SafeBoundingView className="flex-1" style={{ backgroundColor: colors.background }}>
        <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.card} />
        <View className="flex-1 justify-center items-center">
          <Text style={{ color: colors.text }} className="text-lg">Organisation not found</Text>
        </View>
      </SafeBoundingView>
    );
  }

  return (
    <SafeBoundingView className="flex-1" style={{ backgroundColor: colors.background }}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.card} />
      
      {/* Header */}
      <View
        className="flex-row items-center justify-between px-4 py-3 border-b"
        style={{ backgroundColor: colors.card, borderBottomColor: colors.border }}
      >
        <TouchableOpacity onPress={back} className="p-2">
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text className="text-lg font-semibold" style={{ color: colors.text }}>
          Organisation Details
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1">
        {/* Organisation Header */}
        <View
          className="p-6 items-center mb-4 rounded-b-3xl"
          style={{ backgroundColor: colors.card }}
        >
          {organisation.logo ? (
            <Image 
              source={{ uri: organisation.logo }} 
              className="w-[120px] h-[120px] rounded-full mb-4"
              style={{ backgroundColor: colors.backgroundSecondary }}
            />
          ) : (
            <View
              className="w-[120px] h-[120px] rounded-full items-center justify-center mb-4"
              style={{ backgroundColor: colors.backgroundSecondary }}
            >
              <Ionicons name="business" size={48} color={colors.textSecondary} />
            </View>
          )}
          
          <Text className="text-2xl font-bold text-center mb-2" style={{ color: colors.text }}>
            {organisation.name}
          </Text>
          
          <View
            className="px-3 py-1.5 rounded-full mb-4"
            style={{ backgroundColor: colors.backgroundSecondary }}
          >
            <Text style={{ color: colors.text, fontWeight: '600' }}>
              {organisation.type}
            </Text>
          </View>

          {/* Join/Leave/Request Button - Show for non-owners */}
          {!isOwner && (
            <TouchableOpacity
              onPress={handleJoinLeave}
              disabled={actionLoading || (userJoinRequest && userJoinRequest.status === 'pending')}
              className={`px-8 py-3 rounded-xl flex-row items-center ${actionLoading ? 'opacity-70' : ''} ${isMember ? 'border' : ''}`}
              style={{
                backgroundColor: isMember 
                  ? colors.backgroundSecondary 
                  : userJoinRequest && userJoinRequest.status === 'pending'
                    ? '#FFA500'
                    : colors.accent,
                borderColor: colors.border
              }}
            >
              <Ionicons 
                name={
                  isMember 
                    ? "exit-outline" 
                    : userJoinRequest && userJoinRequest.status === 'pending'
                      ? "hourglass-outline"
                      : "add-circle-outline"
                } 
                size={20} 
                color={
                  isMember 
                    ? colors.text 
                    : userJoinRequest && userJoinRequest.status === 'pending'
                      ? "white"
                      : "white"
                } 
              />
              <Text className="text-base font-semibold ml-2" style={{ color: isMember ? colors.text : 'white' }}>
                {actionLoading 
                  ? 'Processing...' 
                  : isMember 
                    ? 'Leave Organisation' 
                    : userJoinRequest && userJoinRequest.status === 'pending'
                      ? 'Request Pending'
                      : 'Send Join Request'
                }
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Organisation Details */}
        <View className="px-6 space-y-6">
          
          {/* Join Requests Section - Only for Owners */}
          {isOwner && (
            <View className="p-5 rounded-lg border" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center">
                  <Ionicons name="people-outline" size={24} color={colors.accent} />
                  <Text className="text-lg font-semibold ml-3" style={{ color: colors.text }}>
                    Join Requests
                  </Text>
                </View>
                {joinRequests.length > 0 && (
                  <View className="rounded-full min-w-[24px] h-6 justify-center items-center" style={{ backgroundColor: colors.accent }}>
                    <Text className="text-xs font-semibold" style={{ color: 'white' }}>
                      {joinRequests.length}
                    </Text>
                  </View>
                )}
              </View>
              
              {requestsLoading ? (
                <Text className="text-base text-center" style={{ color: colors.textSecondary }}>
                  Loading requests...
                </Text>
              ) : joinRequests.length === 0 ? (
                <Text className="text-base text-center" style={{ color: colors.textSecondary }}>
                  No pending join requests
                </Text>
              ) : (
                <View className="space-y-3">
                  {joinRequests.map((request: any) => (
                    <View key={request.id} className="p-4 rounded-lg border" style={{ backgroundColor: colors.backgroundSecondary, borderColor: colors.border }}>
                      <View className="flex-row items-center mb-3">
                        <View className="w-10 h-10 rounded-full justify-center items-center" style={{ backgroundColor: colors.accent }}>
                          <Text className="text-white font-semibold text-base">
                            {request.users?.name?.charAt(0).toUpperCase() || 'U'}
                          </Text>
                        </View>
                        <View className="flex-1 ml-3">
                          <Text className="font-semibold" style={{ color: colors.text }}>
                            {request.users?.name || 'Unknown User'}
                          </Text>
                          <Text className="text-sm" style={{ color: colors.textSecondary }}>
                            {request.users?.email}
                          </Text>
                        </View>
                      </View>
                      
                      {request.message && (
                        <Text className="text-sm italic mb-3" style={{ color: colors.textSecondary }}>
                          "{request.message}"
                        </Text>
                      )}
                      
                      <View className="flex-col items-start justify-center">
                        <Text className="text-xs" style={{ color: colors.textSecondary }}>
                          Requested: {new Date(request.created_at).toLocaleDateString()}
                        </Text>
                        
                        <View className="mt-2 flex-row gap-x-2">
                          <TouchableOpacity
                            onPress={() => handleRejectRequest(request.id)}
                            className="px-3 py-1.5 rounded-md flex-row items-center"
                            style={{ backgroundColor: '#FF6B6B' }}
                          >
                            <Ionicons name="close" size={16} color="white" />
                            <Text className="text-xs font-semibold ml-1" style={{ color: 'white' }}>
                              Reject
                            </Text>
                          </TouchableOpacity>
                          
                          <TouchableOpacity
                            onPress={() => {
                              (async () => {
                                try {
                                  // Try to fetch roles for this organisation. Assumes a controller function `getOrganisationRoles`
                                  // exists and returns either an array or an object with a `data` array.
                                  const res = await getOrganisationRoles(id as string);
                                  const roles = Array.isArray(res) ? res :  [];

                                  if (!roles || roles.length === 0) {
                                    // Fallback: no roles found — ask to approve as 'member'
                                    Alert.alert(
                                      'No roles found',
                                      'No roles configured for this organisation. Approve as Member?',
                                      [
                                        { text: 'Cancel', style: 'cancel' },
                                        { text: 'OK', onPress: () => handleApproveRequest(request.id, 'member') }
                                      ]
                                    );
                                    return;
                                  }

                                  // Build buttons from roles. Use a sensible field for the role value (key/slug/name).
                                  const buttons = roles.map((r: any) => {
                                    const label = r.name ?? r.label ?? String(r.role ?? 'Role');
                                    const value = r.id;
                                    return {
                                      text: label,
                                      onPress: () => handleApproveRequest(request.id, value)
                                    };
                                  });

                                  // Always include cancel as last option
                                  buttons.push({ text: 'Cancel', style: 'cancel' });

                                  Alert.alert('Assign Role', 'Choose a role for this member:', buttons);
                                } catch (error) {
                                  console.error('Error fetching roles:', error);
                                  Alert.alert(
                                    'Error',
                                    'Failed to load roles. Approve as Member instead?',
                                    [
                                      { text: 'Cancel', style: 'cancel' },
                                    ]
                                  );
                                }
                              })()
                            }}
                            className="px-3 py-1.5 rounded-md flex-row items-center"
                            style={{ backgroundColor: colors.accent }}
                          >
                            <Ionicons name="checkmark" size={16} color="white" />
                            <Text className="text-xs font-semibold ml-1" style={{ color: 'white' }}>
                              Approve
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* Description */}
          <View className="p-5 rounded-lg border" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
            <View className="flex-row items-center mb-3">
              <Ionicons name="document-text-outline" size={24} color={colors.accent} />
              <Text className="text-lg font-semibold ml-3" style={{ color: colors.text }}>
                About
              </Text>
            </View>
            <Text className="text-base" style={{ color: colors.textSecondary, lineHeight: 24 }}>
              {organisation.description || 'No description available.'}
            </Text>
          </View>

          {/* Organisation Info */}
          <View className="p-5 rounded-lg border" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
            <View className="flex-row items-center mb-4">
              <Ionicons name="information-circle-outline" size={24} color={colors.accent} />
              <Text className="text-lg font-semibold ml-3" style={{ color: colors.text }}>
                Information
              </Text>
            </View>
            
            <View className="space-y-3">
              <View className="flex-row justify-between">
                <Text className="text-base" style={{ color: colors.textSecondary }}>Type:</Text>
                <Text className="text-base font-medium" style={{ color: colors.text }}>
                  {organisation.type}
                </Text>
              </View>
              
              <View className="flex-row justify-between">
                <Text className="text-base" style={{ color: colors.textSecondary }}>Created:</Text>
                <Text className="text-base font-medium" style={{ color: colors.text }}>
                  {new Date(organisation.created_at).toLocaleDateString()}
                </Text>
              </View>
              
              <View className="flex-row justify-between">
                <Text className="text-base" style={{ color: colors.textSecondary }}>Membership Status:</Text>
                <View className="px-2 py-1 rounded-md" style={{ backgroundColor: isMember ? colors.accent : colors.backgroundSecondary }}>
                  <Text className="text-sm font-semibold" style={{ color: isMember ? 'white' : colors.textSecondary }}>
                    {isMember ? 'Member' : 'Not a member'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Bottom spacing */}
        <View className="h-8" />
      </ScrollView>
    </SafeBoundingView>
  );
}
