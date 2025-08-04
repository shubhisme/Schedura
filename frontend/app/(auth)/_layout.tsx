import { Redirect, Stack, useRouter } from 'expo-router'
import { useAuth, useUser } from '@clerk/clerk-expo'
import { updateUserInfo } from '@/supabase/controllers/user.controller';

export default function AuthRoutesLayout() {
  const { isSignedIn } = useAuth()
  const { user } = useUser()
  const { replace } = useRouter();

  

  const handleRedirect = async () => {  
      await updateUserInfo(user)
      
      /*if(data?.user?.onboardingCompleted) {
        //return replace('/onboarding')
      }*/
      return replace('/(tabs)')
  }

  if (isSignedIn) {
    handleRedirect()
  }

  return <Stack screenOptions={{headerShown:false}}/>
}