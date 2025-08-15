import { Image, ScrollView, Text, TouchableOpacity, View, StatusBar, Modal, TextInput, Alert } from 'react-native';
import SafeBoundingView from '@/components/SafeBoundingView';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { getMySpaces, deleteMySpace } from '@/supabase/controllers/spaces.controller';
import { useUser } from '@clerk/clerk-expo';
import { supabase } from '../../supabase/supabase';

export default function SpacesScreen() {
  const { navigate } = useRouter();
  const [spaces, setSpaces] = useState<any>();
  const { user } = useUser();
  

  const [showManageModal, setShowManageModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateOrgModal, setShowCreateOrgModal] = useState(false);
  const [showJoinOrgModal, setShowJoinOrgModal] = useState(false);
  const [selectedSpace, setSelectedSpace] = useState<any>(null);
  

  const [editForm, setEditForm] = useState({ name: '', location: '', capacity: '' });
  const [orgForm, setOrgForm] = useState({ name: '', description: '' });
  const [joinCode, setJoinCode] = useState('');
  
  const fetchMySpaces = async () => {
    const { data } = await getMySpaces(user?.id!);
    console.log(data)
    setSpaces(data);
  }
  
  useEffect(() => {
    fetchMySpaces()
  },[])


  const handleManageSpace = (space: any) => {
    setSelectedSpace(space);
    setShowManageModal(true);
  };


  const handleEditSpace = (space: any) => {
    setSelectedSpace(space);
    setEditForm({
      name: space.name,
      location: space.location,
      capacity: space.capacity.toString()
    });
    setShowEditModal(true);
  };


  const saveEditChanges = async () => {
    try {
      if (!editForm.name || !editForm.location || !editForm.capacity) {
        Alert.alert('Error', 'Please fill in all fields');
        return;
      }
      const capacity = parseInt(editForm.capacity, 10);
      if (isNaN(capacity) || capacity <= 0) {
        Alert.alert('Error', 'Please enter a valid capacity');
        return;
      }
      const { data, error } = await supabase
        .from('spaces')
        .update({
          name: editForm.name,
          location: editForm.location,
          capacity: capacity,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedSpace.id)
        .eq('user_id', user?.id);
  
      if (error) {
        throw new Error(error.message);
      }
  
      Alert.alert('Success', 'Space updated successfully!');
      setShowEditModal(false);
      setEditForm({ name: '', location: '', capacity: '' }); 
      fetchMySpaces(); 
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to update space');
    }
  };


  const handleCreateOrganization = async () => {
    try {
    
      Alert.alert('Success', 'Cult created successfully!');
      setShowCreateOrgModal(false);
      setOrgForm({ name: '', description: '' });
    } catch (error) {
      Alert.alert('Error', 'Failed to create Cult');
    }
  };


  const handleJoinOrganization = async () => {
    try {
    
      Alert.alert('Success', 'Successfully joined Cult!');
      setShowJoinOrgModal(false);
      setJoinCode('');
    } catch (error) {
      Alert.alert('Error', 'Failed to join Cult. Check your code.');
    }
  };


  const handleDeleteSpace = (spaceId: string) => {
    Alert.alert(
      'Delete Space',
      'Are you sure you want to delete this space? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { data, error } = await deleteMySpace(spaceId, user?.id!);
              if (error) {
                throw new Error(error.message);
              }
              Alert.alert('Success', 'Space deleted successfully!');
              setShowManageModal(false);
              fetchMySpaces(); 
            } catch (error) {
              Alert.alert('Error', error instanceof Error ? error.message : 'Failed to delete space');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeBoundingView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#E9F0E9" />
      
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        <View style={{ backgroundColor: '#E9F0E9' }} className='px-6 pt-6 pb-8 rounded-b-3xl'>
          <View className="flex-row items-center justify-between mb-4">
            <View>
              <Text className="text-black text-3xl font-bold">My Spaces</Text>
              <Text className="text-gray-600 text-lg mt-1">Manage your venues</Text>
            </View>
            <TouchableOpacity className="bg-white/70 p-3 rounded-full">
              <Ionicons name="settings-outline" size={24} color="#374151" />
            </TouchableOpacity>
          </View>
          

          <View className="flex-row space-x-4 mt-4 gap-2">
            <View className="bg-white/80 rounded-2xl p-4  flex-1">
              <Text className="text-2xl font-bold text-gray-900">{spaces?.length || 0}</Text>
              <Text className="text-sm text-gray-600">Total Spaces</Text>
            </View>
            <View className="bg-white/80 rounded-2xl p-4 flex-1">
              <Text className="text-2xl font-bold text-green-600">Active</Text>
              <Text className="text-sm text-gray-600">Status</Text>
            </View>
          </View>
        </View>

        <View className="px-6 py-8">
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-gray-900 text-xl font-bold">
              Your Venues
            </Text>
            <TouchableOpacity 
              onPress={() => navigate('/(tabs)/add-space')} 
              className="bg-gray-900 px-4 py-2 rounded-full flex-row items-center"
            >
              <Ionicons name="add" size={20} color="#E9F0E9" />
              <Text className="text-white font-semibold ml-1">Add Space</Text>
            </TouchableOpacity>
          </View>
          
          {spaces && spaces.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 16, paddingRight: 24 }}>
              {spaces.map((space: any) => (
                <TouchableOpacity 
                  key={space.id} 
                  onPress={() => navigate(`/spaces/${space.id}`)} 
                  className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 w-72"
                >
                  <View className="relative">
                    <Image 
                      source={{
                        uri: space['spaces-images']?.[0]?.link || 'https://via.placeholder.com/300x200.png?text=No+Image+Available'
                      }}
                      className='h-48 w-full'
                    />
                    <View className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              
                    <View className="absolute top-3 right-3 bg-green-500 rounded-full px-3 py-1">
                      <Text className="text-white text-xs font-semibold">Active</Text>
                    </View>
                    <TouchableOpacity className="absolute top-3 left-3 bg-white/20 rounded-full p-2">
                      <Ionicons name="heart-outline" size={18} color="white" />
                    </TouchableOpacity>
                  </View>
                  
                  <View className="p-5">
                    <Text className="text-xl font-bold text-gray-900 mb-2">{space.name}</Text>
                    
                    <View className="space-y-2">
                      <View className="flex-row items-center">
                        <View className="bg-gray-100 rounded-full p-1 mr-3">
                          <Ionicons name="location" size={14} color="#6B7280" />
                        </View>
                        <Text className="text-gray-600 flex-1">{space.location}</Text>
                      </View>
                      
                      <View className="flex-row items-center">
                        <View className="bg-gray-100 rounded-full p-1 mr-3">
                          <Ionicons name="people" size={14} color="#6B7280" />
                        </View>
                        <Text className="text-gray-600">Up to {space.capacity} guests</Text>
                      </View>
                    </View>
                    
          
                    <View className="flex-row mt-4 gap-2">
                      <TouchableOpacity 
                        onPress={() => handleManageSpace(space)}
                        className="bg-gray-900 rounded-2xl px-4 py-2 flex-1"
                      >
                        <Text className="text-white text-center font-semibold">Manage</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        onPress={() => handleEditSpace(space)}
                        className="bg-gray-100 rounded-2xl px-4 py-2 flex-1"
                      >
                        <Text className="text-gray-900 text-center font-semibold">Edit</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <View className="bg-white rounded-3xl border-2 border-dashed border-gray-300 p-8 items-center justify-center">
              <View className="bg-gray-100 rounded-full p-4 mb-4">
                <MaterialCommunityIcons name="home-plus-outline" size={48} color="#9CA3AF" />
              </View>
              <Text className="text-xl font-semibold text-gray-900 mb-2">No spaces yet</Text>
              <Text className="text-gray-600 text-center mb-6">Create your first venue to start managing bookings</Text>
              <TouchableOpacity 
                onPress={() => navigate('/(tabs)/add-space')} 
                className='bg-gray-900 py-3 px-6 rounded-2xl'
              >
                <Text className='text-white text-lg font-semibold'>Create Your First Space</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View className="px-6 pb-8">
          <View className='flex-row items-center justify-between mb-6'>
            <Text className="text-gray-900 text-xl font-bold">
              Organization
            </Text>
            <TouchableOpacity>
              <Ionicons name="information-circle-outline" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          
          <View className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <View className="flex-row items-center mb-6">
              <View className="bg-gradient-to-br from-blue-50 to-indigo-100 p-4 rounded-2xl mr-4">
                <MaterialCommunityIcons name="office-building" size={32} color="#4F46E5" />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-gray-900 mb-1">Cult Hub</Text>
                <Text className="text-gray-600">Join or create an Cult to collaborate</Text>
              </View>
            </View>
            
  
            <View className="bg-gray-50 rounded-2xl p-4 mb-6">
              <Text className="font-semibold text-gray-900 mb-3">Benefits of joining:</Text>
              <View className="space-y-2">
                <View className="flex-row items-center">
                  <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                  <Text className="text-gray-600 ml-2">Shared space management</Text>
                </View>
                <View className="flex-row items-center">
                  <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                  <Text className="text-gray-600 ml-2">Team collaboration tools</Text>
                </View>
                <View className="flex-row items-center">
                  <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                  <Text className="text-gray-600 ml-2">Advanced analytics</Text>
                </View>
              </View>
            </View>
            
            <View className='flex-row space-x-3 gap-2'>
              <TouchableOpacity 
                onPress={() => setShowCreateOrgModal(true)}
                className='bg-gray-900 py-3 px-4 rounded-2xl flex-1'
              >
                <Text className='text-white text-base text-center font-semibold'>Create a Cult</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => setShowJoinOrgModal(true)}
                className='border-2 border-gray-200 py-3 px-4 rounded-2xl flex-1'
              >
                <Text className='text-gray-900 text-base text-center font-semibold'>Join a Cult</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <Modal visible={showManageModal} animationType="slide" presentationStyle="pageSheet">
          <SafeBoundingView className="flex-1 bg-gray-50">
            <View className="flex-row items-center justify-between p-6 bg-white border-b border-gray-200">
              <Text className="text-xl font-bold">Manage Space</Text>
              <TouchableOpacity onPress={() => setShowManageModal(false)}>
                <Ionicons name="close" size={24} color="#374151" />
              </TouchableOpacity>
            </View>
            
            {selectedSpace && (
              <ScrollView className="flex-1 p-6">
                <View className="bg-white rounded-3xl p-6 mb-4">
                  <Text className="text-2xl font-bold mb-2">{selectedSpace.name}</Text>
                  <Text className="text-gray-600 mb-4">{selectedSpace.location}</Text>
                  
                  <Image 
                    source={{ uri: selectedSpace['spaces-images']?.[0]?.link }}
                    className="w-full h-48 rounded-2xl mb-6"
                  />
                  
                  <View className="space-y-4">
                    
                    <TouchableOpacity 
                      onPress={() => handleDeleteSpace(selectedSpace.id)}
                      className="bg-red-500 py-4 rounded-2xl"
                    >
                      <Text className="text-white text-center font-semibold text-lg">Delete Space</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
            )}
          </SafeBoundingView>
        </Modal>

        <Modal visible={showEditModal} animationType="slide" presentationStyle="pageSheet">
          <SafeBoundingView className="flex-1 bg-gray-50">
            <View className="flex-row items-center justify-between p-6 bg-white border-b border-gray-200">
              <Text className="text-xl font-bold">Edit Space</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Ionicons name="close" size={24} color="#374151" />
              </TouchableOpacity>
            </View>
            
            <ScrollView className="flex-1 p-6">
              <View className="bg-white rounded-3xl p-6">
                <View className="mb-6">
                  <Text className="text-lg font-semibold mb-2">Space Name</Text>
                  <TextInput
                    value={editForm.name}
                    onChangeText={(text) => setEditForm({...editForm, name: text})}
                    className="border border-gray-300 rounded-2xl px-4 py-3 text-lg"
                    placeholder="Enter space name"
                  />
                </View>
                
                <View className="mb-6">
                  <Text className="text-lg font-semibold mb-2">Location</Text>
                  <TextInput
                    value={editForm.location}
                    onChangeText={(text) => setEditForm({...editForm, location: text})}
                    className="border border-gray-300 rounded-2xl px-4 py-3 text-lg"
                    placeholder="Enter location"
                  />
                </View>
                
                <View className="mb-8">
                  <Text className="text-lg font-semibold mb-2">Capacity</Text>
                  <TextInput
                    value={editForm.capacity}
                    onChangeText={(text) => setEditForm({...editForm, capacity: text})}
                    className="border border-gray-300 rounded-2xl px-4 py-3 text-lg"
                    placeholder="Enter capacity"
                    keyboardType="numeric"
                  />
                </View>
                
                <TouchableOpacity 
                  onPress={saveEditChanges}
                  className="bg-gray-900 py-4 rounded-2xl"
                >
                  <Text className="text-white text-center font-semibold text-lg">Save Changes</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </SafeBoundingView>
        </Modal>

        <Modal visible={showCreateOrgModal} animationType="slide" presentationStyle="pageSheet">
          <SafeBoundingView className="flex-1 bg-gray-50">
            <View className="flex-row items-center justify-between p-6 bg-white border-b border-gray-200">
              <Text className="text-xl font-bold">Create Cult</Text>
              <TouchableOpacity onPress={() => setShowCreateOrgModal(false)}>
                <Ionicons name="close" size={24} color="#374151" />
              </TouchableOpacity>
            </View>
            
            <ScrollView className="flex-1 p-6">
              <View className="bg-white rounded-3xl p-6">
                <View className="mb-6">
                  <Text className="text-lg font-semibold mb-2">Cult Name</Text>
                  <TextInput
                    value={orgForm.name}
                    onChangeText={(text) => setOrgForm({...orgForm, name: text})}
                    className="border border-gray-300 rounded-2xl px-4 py-3 text-lg"
                    placeholder="Enter Cult name"
                  />
                </View>
                
                <View className="mb-8">
                  <Text className="text-lg font-semibold mb-2">Description</Text>
                  <TextInput
                    value={orgForm.description}
                    onChangeText={(text) => setOrgForm({...orgForm, description: text})}
                    className="border border-gray-300 rounded-2xl px-4 py-3 text-lg h-32"
                    placeholder="Enter Cult description"
                    multiline
                    textAlignVertical="top"
                  />
                </View>
                
                <TouchableOpacity 
                  onPress={handleCreateOrganization}
                  className="bg-gray-900 py-4 rounded-2xl"
                >
                  <Text className="text-white text-center font-semibold text-lg">Create Cult</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </SafeBoundingView>
        </Modal>

        <Modal visible={showJoinOrgModal} animationType="slide" presentationStyle="pageSheet">
          <SafeBoundingView className="flex-1 bg-gray-50">
            <View className="flex-row items-center justify-between p-6 bg-white border-b border-gray-200">
              <Text className="text-xl font-bold">Join Cult</Text>
              <TouchableOpacity onPress={() => setShowJoinOrgModal(false)}>
                <Ionicons name="close" size={24} color="#374151" />
              </TouchableOpacity>
            </View>
            
            <ScrollView className="flex-1 p-6">
              <View className="bg-white rounded-3xl p-6">
                <View className="mb-6">
                  <Text className="text-lg font-semibold mb-2">Cult Code</Text>
                  <TextInput
                    value={joinCode}
                    onChangeText={setJoinCode}
                    className="border border-gray-300 rounded-2xl px-4 py-3 text-lg"
                    placeholder="Enter Cult code"
                    autoCapitalize="characters"
                  />
                </View>
                
                <View className="bg-blue-50 rounded-2xl p-4 mb-8">
                  <Text className="text-blue-800 font-semibold mb-2">How to join:</Text>
                  <Text className="text-blue-700">Ask your Cult admin for the invitation code and enter it above.</Text>
                </View>
                
                <TouchableOpacity 
                  onPress={handleJoinOrganization}
                  className="bg-gray-900 py-4 rounded-2xl"
                >
                  <Text className="text-white text-center font-semibold text-lg">Join Cult</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </SafeBoundingView>
        </Modal>
      </ScrollView>
    </SafeBoundingView>
  );
}