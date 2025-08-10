import { Image, Text, View, Dimensions, StatusBar } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient'; // If you want gradient background
import { useAuth, useUser } from '@clerk/clerk-expo';
import { updateUserInfo } from '@/supabase/controllers/user.controller';
import Button from '@/components/Button';
//@ts-ignore
import Logo from "@/assets/images/logo.png";

const { width, height } = Dimensions.get('window');

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
    <>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Optional: Gradient Background */}
      <LinearGradient
        colors={['#667eea', '#764ba2']} // Adjust colors to match your primary color
        className="flex-1"
      >
        <View className="flex-1 justify-between px-6 pt-16 pb-8">
          
          {/* Header Section */}
          <View className="flex-1 justify-center items-center">
            {/* Logo with subtle shadow effect */}
            <View className="items-center mb-8">
              <View className="bg-white/10 rounded-full p-8 mb-6">
                <Image 
                  style={{
                    height: Math.min(width * 0.5, 200), 
                    width: Math.min(width * 0.5, 200),
                    resizeMode: 'contain'
                  }}
                  source={Logo}
                />
              </View>
              
              {/* App Title with better styling */}
              <Text className="text-5xl font-bold text-white text-center mb-3">
                Schedura.
              </Text>
              
              {/* Tagline */}
              <Text className="text-lg text-white/80 text-center max-w-sm leading-6">
                Organize your time, amplify your productivity
              </Text>
            </View>

            {/* Feature highlights */}
            <View className="flex-row justify-center space-x-8 mt-8">
              <View className="items-center">
                <View className="w-12 h-12 bg-white/20 rounded-full items-center justify-center mb-2">
                  <Text className="text-white text-xl">📅</Text>
                </View>
                <Text className="text-white/70 text-xs">Schedule</Text>
              </View>
              
              <View className="items-center">
                <View className="w-12 h-12 bg-white/20 rounded-full items-center justify-center mb-2">
                  <Text className="text-white text-xl">⏰</Text>
                </View>
                <Text className="text-white/70 text-xs">Reminders</Text>
              </View>
              
              <View className="items-center">
                <View className="w-12 h-12 bg-white/20 rounded-full items-center justify-center mb-2">
                  <Text className="text-white text-xl">📊</Text>
                </View>
                <Text className="text-white/70 text-xs">Analytics</Text>
              </View>
            </View>
          </View>

          {/* Bottom Section */}
          <View className="space-y-6">
            {/* Terms and Conditions */}
            <Text className="text-sm text-white/60 text-center leading-5 px-4">
              By continuing you agree with our{' '}
              <Link 
                href="https://google.com" 
                className="text-white underline font-medium"
              >
                terms and conditions
              </Link>
              {' '}and{' '}
              <Link 
                href="https://google.com" 
                className="text-white underline font-medium"
              >
                privacy policy
              </Link>
              .
            </Text>
            
            {/* CTA Button */}
            <Button 
              link="/(auth)" 
              text="Get Started"
            />
          </View>
        </View>
      </LinearGradient>
    </>
  );
}