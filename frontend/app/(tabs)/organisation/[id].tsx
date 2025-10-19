import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar, Alert, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '@clerk/clerk-expo';
import SafeBoundingView from '@/components/SafeBoundingView';
import { useTheme } from '@/contexts/ThemeContext';
import { getOrganisationById, getUserOrganisations, checkUserMembership, leaveOrganisation } from '@/supabase/controllers/organisation.controller';
import { getOrganisationJoinRequests, approveJoinRequest, rejectJoinRequest, createJoinRequest, getUserJoinRequests } from '@/supabase/controllers/join-requests.controller';

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

  const handleApproveRequest = async (requestId: string, requestedRole: string = 'member') => {
    if (!user?.id) return;
    
    try {
      await approveJoinRequest(requestId, user.id, requestedRole as 'admin' | 'member');
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
      <SafeBoundingView style={{ flex: 1, backgroundColor: colors.background }}>
        <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.card} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: colors.text, fontSize: 18 }}>Loading...</Text>
        </View>
      </SafeBoundingView>
    );
  }

  if (!organisation) {
    return (
      <SafeBoundingView style={{ flex: 1, backgroundColor: colors.background }}>
        <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.card} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: colors.text, fontSize: 18 }}>Organisation not found</Text>
        </View>
      </SafeBoundingView>
    );
  }

  return (
    <SafeBoundingView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.card} />
      
      {/* Header */}
      <View style={{ 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        paddingHorizontal: 16, 
        paddingVertical: 12,
        backgroundColor: colors.card,
        borderBottomWidth: 1,
        borderBottomColor: colors.border
      }}>
        <TouchableOpacity onPress={back} style={{ padding: 8 }}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text }}>
          Organisation Details
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={{ flex: 1 }}>
        {/* Organisation Header */}
        <View style={{ 
          padding: 24, 
          backgroundColor: colors.card, 
          alignItems: 'center',
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24,
          marginBottom: 16
        }}>
          {organisation.logo ? (
            <Image 
              source={{ uri: organisation.logo }} 
              style={{ 
                width: 120, 
                height: 120, 
                borderRadius: 60, 
                backgroundColor: colors.backgroundSecondary,
                marginBottom: 16
              }} 
            />
          ) : (
            <View style={{ 
              width: 120, 
              height: 120, 
              borderRadius: 60, 
              backgroundColor: colors.backgroundSecondary, 
              justifyContent: 'center', 
              alignItems: 'center',
              marginBottom: 16
            }}>
              <Ionicons name="business" size={48} color={colors.textSecondary} />
            </View>
          )}
          
          <Text style={{ 
            fontSize: 28, 
            fontWeight: 'bold', 
            color: colors.text, 
            textAlign: 'center',
            marginBottom: 8
          }}>
            {organisation.name}
          </Text>
          
          <View style={{ 
            backgroundColor: colors.backgroundSecondary, 
            paddingHorizontal: 12, 
            paddingVertical: 6, 
            borderRadius: 16,
            marginBottom: 16
          }}>
            <Text style={{ color: colors.text, fontWeight: '600' }}>
              {organisation.type}
            </Text>
          </View>

          {/* Join/Leave/Request Button - Show for non-owners */}
          {!isOwner && (
            <TouchableOpacity
              onPress={handleJoinLeave}
              disabled={actionLoading || (userJoinRequest && userJoinRequest.status === 'pending')}
              style={{
                backgroundColor: isMember 
                  ? colors.backgroundSecondary 
                  : userJoinRequest && userJoinRequest.status === 'pending'
                    ? '#FFA500'
                    : colors.accent,
                paddingHorizontal: 32,
                paddingVertical: 12,
                borderRadius: 20,
                borderWidth: isMember ? 1 : 0,
                borderColor: colors.border,
                opacity: actionLoading ? 0.7 : 1,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8
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
              <Text style={{
                color: isMember ? colors.text : "white",
                fontWeight: '600',
                fontSize: 16
              }}>
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
        <View style={{ paddingHorizontal: 24, gap: 24 }}>
          
          {/* Join Requests Section - Only for Owners */}
          {isOwner && (
            <View style={{ 
              backgroundColor: colors.card, 
              padding: 20, 
              borderRadius: 16,
              borderWidth: 1,
              borderColor: colors.border
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="people-outline" size={24} color={colors.accent} />
                  <Text style={{ 
                    fontSize: 18, 
                    fontWeight: '600', 
                    color: colors.text, 
                    marginLeft: 12 
                  }}>
                    Join Requests
                  </Text>
                </View>
                {joinRequests.length > 0 && (
                  <View style={{ 
                    backgroundColor: colors.accent, 
                    borderRadius: 12, 
                    minWidth: 24, 
                    height: 24, 
                    justifyContent: 'center', 
                    alignItems: 'center' 
                  }}>
                    <Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>
                      {joinRequests.length}
                    </Text>
                  </View>
                )}
              </View>
              
              {requestsLoading ? (
                <Text style={{ color: colors.textSecondary, fontSize: 16, textAlign: 'center' }}>
                  Loading requests...
                </Text>
              ) : joinRequests.length === 0 ? (
                <Text style={{ color: colors.textSecondary, fontSize: 16, textAlign: 'center' }}>
                  No pending join requests
                </Text>
              ) : (
                <View style={{ gap: 12 }}>
                  {joinRequests.map((request: any) => (
                    <View key={request.id} style={{ 
                      backgroundColor: colors.backgroundSecondary, 
                      padding: 16, 
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: colors.border
                    }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                        <View style={{ 
                          width: 40, 
                          height: 40, 
                          borderRadius: 20, 
                          backgroundColor: colors.accent, 
                          justifyContent: 'center', 
                          alignItems: 'center' 
                        }}>
                          <Text style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>
                            {request.users?.name?.charAt(0).toUpperCase() || 'U'}
                          </Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={{ color: colors.text, fontWeight: '600', fontSize: 16 }}>
                            {request.users?.name || 'Unknown User'}
                          </Text>
                          <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
                            {request.users?.email}
                          </Text>
                        </View>
                      </View>
                      
                      {request.message && (
                        <Text style={{ 
                          color: colors.textSecondary, 
                          fontSize: 14, 
                          marginBottom: 12,
                          fontStyle: 'italic'
                        }}>
                          "{request.message}"
                        </Text>
                      )}
                      
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                          Requested: {new Date(request.created_at).toLocaleDateString()}
                        </Text>
                        
                        <View style={{ flexDirection: 'row', gap: 8 }}>
                          <TouchableOpacity
                            onPress={() => handleRejectRequest(request.id)}
                            style={{
                              backgroundColor: '#FF6B6B',
                              paddingHorizontal: 12,
                              paddingVertical: 6,
                              borderRadius: 8,
                              flexDirection: 'row',
                              alignItems: 'center',
                              gap: 4
                            }}
                          >
                            <Ionicons name="close" size={16} color="white" />
                            <Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>
                              Reject
                            </Text>
                          </TouchableOpacity>
                          
                          <TouchableOpacity
                            onPress={() => {
                              Alert.alert(
                                'Assign Role',
                                'Choose a role for this member:',
                                [
                                  { text: 'Cancel', style: 'cancel' },
                                  { 
                                    text: 'Member', 
                                    onPress: () => handleApproveRequest(request.id, 'member') 
                                  },
                                  { 
                                    text: 'Admin', 
                                    onPress: () => handleApproveRequest(request.id, 'admin') 
                                  }
                                ]
                              );
                            }}
                            style={{
                              backgroundColor: colors.accent,
                              paddingHorizontal: 12,
                              paddingVertical: 6,
                              borderRadius: 8,
                              flexDirection: 'row',
                              alignItems: 'center',
                              gap: 4
                            }}
                          >
                            <Ionicons name="checkmark" size={16} color="white" />
                            <Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>
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
          <View style={{ 
            backgroundColor: colors.card, 
            padding: 20, 
            borderRadius: 16,
            borderWidth: 1,
            borderColor: colors.border
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Ionicons name="document-text-outline" size={24} color={colors.accent} />
              <Text style={{ 
                fontSize: 18, 
                fontWeight: '600', 
                color: colors.text, 
                marginLeft: 12 
              }}>
                About
              </Text>
            </View>
            <Text style={{ 
              color: colors.textSecondary, 
              fontSize: 16, 
              lineHeight: 24 
            }}>
              {organisation.description || 'No description available.'}
            </Text>
          </View>

          {/* Organisation Info */}
          <View style={{ 
            backgroundColor: colors.card, 
            padding: 20, 
            borderRadius: 16,
            borderWidth: 1,
            borderColor: colors.border
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <Ionicons name="information-circle-outline" size={24} color={colors.accent} />
              <Text style={{ 
                fontSize: 18, 
                fontWeight: '600', 
                color: colors.text, 
                marginLeft: 12 
              }}>
                Information
              </Text>
            </View>
            
            <View style={{ gap: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ color: colors.textSecondary, fontSize: 16 }}>Type:</Text>
                <Text style={{ color: colors.text, fontSize: 16, fontWeight: '500' }}>
                  {organisation.type}
                </Text>
              </View>
              
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ color: colors.textSecondary, fontSize: 16 }}>Created:</Text>
                <Text style={{ color: colors.text, fontSize: 16, fontWeight: '500' }}>
                  {new Date(organisation.created_at).toLocaleDateString()}
                </Text>
              </View>
              
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ color: colors.textSecondary, fontSize: 16 }}>Membership Status:</Text>
                <View style={{ 
                  backgroundColor: isMember ? colors.accent : colors.backgroundSecondary, 
                  paddingHorizontal: 8, 
                  paddingVertical: 4, 
                  borderRadius: 8 
                }}>
                  <Text style={{ 
                    color: isMember ? 'white' : colors.textSecondary, 
                    fontSize: 14, 
                    fontWeight: '600' 
                  }}>
                    {isMember ? 'Member' : 'Not a member'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Bottom spacing */}
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeBoundingView>
  );
}