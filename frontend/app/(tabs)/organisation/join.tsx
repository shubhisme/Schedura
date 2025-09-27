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
import { createOrganisation, searchOrganisations } from '@/supabase/controllers/organisation.controller';
import { useFocusEffect } from '@react-navigation/native';


export default function JoinOrganisationScreen() {
  const [name, setName] = useState('');
  const [organisations, setOrganisations] = useState([]);
  
  const search = async (name:string) => {
    setName(name);
    if (name.trim() === '') {
      Alert.alert('Error', 'Please enter an organisation name.');
      return;
    }
    const data = await searchOrganisations(name);
    if(data.error){
      Alert.alert('Error', data.error);
      return;
    }
    setOrganisations(data.data || []);
  };

 
  return (
    <SafeBoundingView className="flex-1 bg-white">
      <StatusBar backgroundColor="#E9F0E9" />
      <ScrollView className=' bg-tertiary'>
        <View className='p-6 bg-primary rounded-b-3xl pb-12'>
          <Text className="text-black text-4xl font-bold mt-6">Join Organisation</Text>
          <Text className='mt-2 text-xl'>Set up your space and let people {'\n'}reserve it with ease</Text>
          <Image source={CSpace}  className='absolute -right-2 bottom-0'/>
        </View>

        <View className="mb-6 p-6 gap-y-6">
          
          <View>
            <Text className='mb-1 font-semibold text-xl'>Search</Text>
            <View className="px-2 rounded-xl border-2 border-black flex-row items-center space-x-2">
              <Ionicons name="search" size={20} color="black" className='px-2' />
              <TextInput
                placeholder="Convention Center"
                value={name}
                onChangeText={search}
                className="p-4 rounded-xl  border-black flex-1"
              />
            </View>
          </View>
        </View>
        <View className='px-6'>
          {organisations.map((org:any) => (
            <TouchableOpacity key={org.id} className='rounded-xl mb-4 flex-row items-center justify-between space-x-4'>
              <View className='flex-row items-center gap-x-2'>
                <Image source={{ uri: org.logo }} className=' w-16 h-16 rounded-xl' /> 
                <View>
                  <Text className='text-lg font-semibold'>{org.name}</Text>
                  <Text className='text-gray-600'>{org.type}</Text>
                </View>
              </View>
              <TouchableOpacity className=' bg-primary py-2 px-4 rounded-xl items-center'>
                <Text className='text-black font-semibold'>Request</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeBoundingView>
  );
}
