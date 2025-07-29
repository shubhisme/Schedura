import Box from '@/components/Box';
import { Text, View } from 'react-native';
import { Link, useRouter } from 'expo-router';
import LoginButton from '@/components/Button/LoginButton';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import SafeBoundingView from '@/components/SafeBoundingView';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { updateUserInfo } from '@/supabase/controllers/user.controller';


export default function HomeScreen() {
  const { isSignedIn } = useAuth()
  const { user } = useUser()
  const { replace } = useRouter();


  const handleRedirect = async () => {  
      const status = await updateUserInfo(user)
      console.log(status)
      if(status == 201 || status == 409) {
        return replace('/(tabs)')
      }
  }

  if (isSignedIn) {
    handleRedirect()
  }

  return (
    <SafeBoundingView className="flex-1">
      <Text className='text-7xl font-bold'>Schedura.</Text>
      <View className='w-full flex items-center px-8 py-10 absolute bottom-0'>
        <Text className=' mb-2 font-bold'>By continuing you agree with our <Link href={"https://google.com"} className='underline'>terms and conditions</Link>.</Text>
        <LoginButton />
      </View>
    </SafeBoundingView>
  );
}
