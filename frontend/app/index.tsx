import { Image, Text, View } from 'react-native';
import { Link, useRouter } from 'expo-router';
import LoginButton from '@/components/Button/LoginButton';
import SafeBoundingView from '@/components/SafeBoundingView';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { updateUserInfo } from '@/supabase/controllers/user.controller';
import Button from '@/components/Button';

//@ts-ignore
import Logo from "@/assets/images/logo.png";

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
    <SafeBoundingView className="flex-1 justify-center items-center bg-primary">
      <Image 
        style={{height:500, width:500}}
        source={Logo}
      />
      <Text className='text-7xl font-bold'>Schedura.</Text>
      <View className='w-full flex items-start justify-center px-8 py-10 absolute bottom-0'>
        <Text className=' mb-2 font-bold text-base text-left'>By continuing you agree with our <Link href={"https://google.com"} className='underline'>terms and conditions</Link>.</Text>
        <Button link={"/(auth)"} text='Get Started'/>
      </View>
    </SafeBoundingView>
  );
}
