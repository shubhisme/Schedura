import { Image } from 'expo-image';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Collapsible } from '@/components/Collapsible';
import { ExternalLink } from '@/components/ExternalLink';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import SafeBoundingView from '@/components/SafeBoundingView';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

export default function SpacesScreen() {
  return (
    <SafeBoundingView className="flex-1">
      <ScrollView>
        <View className='p-6 bg-primary rounded-b-3xl pb-7'>
          <Text className="text-black text-3xl font-bold mt-6">My Spaces</Text>
        </View>
        <View className="mb-6 p-6">
            <Text className="text-gray-600 text-base  font-bold mb-4 uppercase tracking-wide">
              My Spaces
            </Text>
            
            <View className="border-2 border-black border-dashed flex items-center justify-center rounded-3xl">
                <Text className='py-20 text-lg'>No spaces created</Text>
            </View>
            <TouchableOpacity className='bg-black p-2 px-2.5 rounded-2xl flex-1 mt-5'>
                <Text className='text-primary text-lg text-center mt-0.5 font-semibold'>+ Add</Text>
            </TouchableOpacity>
        </View>
        <View className="mb-6 p-6">
            <View className='flex-row items-center w-full justify-between mb-4'>
              <Text className="text-gray-600 text-base font-bold uppercase tracking-wide">
                Organisation
              </Text>
              <TouchableOpacity className='-mt-3'>
                <Feather name="info" size={20} color="black" />
              </TouchableOpacity>
            </View>
            <View className="bg-white flex-row gap-5 items-center rounded-3xl py-6 px-6">
              <View className={`p-3 rounded-xl bg-gray-50 aspect-square`}>
                <MaterialCommunityIcons name="office-building" size={36} color="black" />
              </View>
              <Text className='text-lg'>No organisation joined/owned</Text>
            </View>
            <View className='flex-row justify-between items-center gap-2 mt-4'>
              <TouchableOpacity className='bg-black p-2 px-2.5 rounded-2xl flex-1'>
                <Text className='text-primary text-base text-center mt-0.5 font-semibold'>Create Organisation</Text>
              </TouchableOpacity>
              <TouchableOpacity className='bg-primary border border-black/10 p-2 px-2.5 rounded-2xl flex-1'>
                <Text className='text-black text-base text-center mt-0.5 font-semibold'>Join Organisation</Text>
              </TouchableOpacity>
            </View>
        </View>
      </ScrollView>
    </SafeBoundingView>
  );
}
