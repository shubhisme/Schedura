import { FontAwesome6 } from "@expo/vector-icons";
import { Text, TouchableOpacity } from "react-native";
import * as AuthSession from 'expo-auth-session'
import { useSSO } from '@clerk/clerk-expo'
import { useCallback } from "react";

function LoginButton() {
  const { startSSOFlow } = useSSO()
  
    const onPress = useCallback(async () => {
      try {
        const { createdSessionId, setActive, signIn, signUp } = await startSSOFlow({
          strategy: 'oauth_google',
          redirectUrl: AuthSession.makeRedirectUri(),
        })
  
        if (createdSessionId) {
          setActive!({ session: createdSessionId })
          console.log(createdSessionId)
        } else {
        }
      } catch (err) {
        console.error(JSON.stringify(err, null, 2))
      }
    }, [])
  return (
    <TouchableOpacity className=" flex flex-row items-center justify-center gap-5 border border-[rgba(0,0,0,0.3)] p-3 w-full rounded-xl" onPress={onPress}> 
        <FontAwesome6 name="google" size={28} color="black"/>
        <Text className="text-xl font-bold tracking-wide">Continue with Google</Text>
    </TouchableOpacity>
  )
}

export default LoginButton