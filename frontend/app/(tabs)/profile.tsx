import { StyleSheet, View } from 'react-native';
import SafeBoundingView from '@/components/SafeBoundingView';
import LogoutButton from '@/components/Button/LogoutButton';

export default function TabThreeScreen() {
  return (
    <SafeBoundingView className="flex-1">
      <View className=''>
        <LogoutButton />
      </View>
    </SafeBoundingView>
  );
}
