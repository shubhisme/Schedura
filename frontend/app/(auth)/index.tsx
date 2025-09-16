import Box from '@/components/Box';
import LoginButton from '@/components/Button/LoginButton';
import SafeBoundingView from '@/components/SafeBoundingView';
import { useState } from 'react';
import { TextInput, Text, View } from 'react-native';


export default function HomeScreen() {

  return (
    <SafeBoundingView className="flex-1 justify-center items-center">
      <View className='w-full px-10'>
        <LoginButton />
      </View>
    </SafeBoundingView>
  );
}
