import Box from '@/components/Box';
import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { TextInput, Text, View, TouchableOpacity } from 'react-native';


export default function HomeScreen() {

  const [text, setText] = useState('CHECK')
  return (
    <View className='flex flex-col h-screen w-screen'>
      <View className='bg-primary w-full p-10'>
        <View>
          <View>
            <Text className='text-4xl font-bold'>Halls</Text>
          </View>
        </View>
        <View className='flex flex-row gap-5 mt-5'>
          <TextInput 
            placeholder='Search for halls'
            className='bg-white p-5 flex-1 rounded-xl text-lg'
          />
          <TouchableOpacity className='bg-white rounded-xl items-center justify-center aspect-square'>
            <Feather name="search" size={24} color="black" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
