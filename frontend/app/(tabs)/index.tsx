import Box from '@/components/Box';
import { useState } from 'react';
import { TextInput, Text, View } from 'react-native';


export default function HomeScreen() {

  const [text, setText] = useState('CHECK')
  return (
    <View className='flex flex-col h-screen w-screen'>
      <View className='bg-purple-500 p-10 pt-20 w-full'>
        <Text className='text-white text-5xl'>Schedura</Text>
      </View>
      <View className='bg-blue-500 h-1/2 flex items-center justify-center w-full'>
        <Text className='text-white text-5xl'>Check</Text>
      </View>
      <View className='bg-purple-200 h-20 b-2 border-blacka'>
        <TextInput
          className='h-20 p-5 text-black'
          defaultValue={text}
          onChangeText={newText => setText(newText)}
        />
        <Text className='text-2xl'>
          {text}
        </Text>
      </View>
    </View>
  );
}
