import { ScrollView, Text, TouchableOpacity, View, TextInput, Alert, StatusBar, Animated, Easing } from 'react-native';
import SafeBoundingView from '@/components/SafeBoundingView';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createSpace } from '@/supabase/controllers/spaces.controller';
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { Image } from 'react-native';
import { useUser } from '@clerk/clerk-expo';
import { decode } from 'base64-arraybuffer'
import { AntDesign, Ionicons } from '@expo/vector-icons';
//@ts-ignore
import CSpace from "@/assets/images/illustrations/cspace.png"
import RolesModal from '@/components/Modals/RolesModal';
import { createOrganisation } from '@/supabase/controllers/organisation.controller';
import { useFocusEffect } from '@react-navigation/native';


export default function CreateOrganisationScreen() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<any>({filePath:"", fileData:"", fileType:"", fileUri:""})
  const [loading, setLoading] = useState(false)
  const [rolesModalVisible, setRolesModalVisible] = useState(false)

  const { user } = useUser();

  const rotateValue = new Animated.Value(0); 

  const rotateAnimation = rotateValue.interpolate({
      inputRange: [0, 1], 
      outputRange: ['0deg', '360deg'], 
  });
  useFocusEffect(
    useCallback(() => {
      let animation: Animated.CompositeAnimation | null = null;
      if (loading) {
        animation = Animated.loop(
          Animated.timing(rotateValue, {
            toValue: 1,
            duration: 2000,
            easing: Easing.linear,
            useNativeDriver: true,
          })
        );
        animation.start();
      }
      return () => {
        if (animation) {
          rotateValue.setValue(0);
          animation.stop();
        }
      };
    }, [loading])
  );

  async function pickAndUploadFile(spaceId: string) {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["image/*"],
        copyToCacheDirectory: true
      });
  
      if (result.canceled) {
        console.log("User cancelled file picker");
        return null;
      }
      const file = result.assets[0];
      const fileExt = file.name.split(".").pop();
      const fileName = `${spaceId}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;
      const base64 = await FileSystem.readAsStringAsync(file.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const fileData = decode(base64);
  
      setImages({
        filePath,
        fileData,
        fileType: file.mimeType,
        fileUri: file.uri,
      });
  
      return filePath;
    } catch (err) {
      console.error("Error picking/uploading file:", err);
      return null;
    }
  }
  const handleSubmit = async () => {
    setLoading(true);
    if (!name || !description) {
      Alert.alert('Error', 'Please fill in all fields.');
      setLoading(false);
      return;
    }
    try {
      const { data, error } = await createOrganisation(user?.id!, name, description, "Educational", images);
      if (error || !data) {
        Alert.alert('Error', error || 'Failed to create organisation.');
        return;
      }
      console.log('Organisation created:', data);
    }
    catch (error) {
      Alert.alert('Error', 'An unexpected error occurred.');
      return;
    }
    setLoading(false);
  };

 
  return (
    <SafeBoundingView className="flex-1 bg-white">
      <StatusBar backgroundColor="#E9F0E9" />
      <ScrollView className=' bg-tertiary'>
        <View className='p-6 bg-primary rounded-b-3xl pb-12'>
          <Text className="text-black text-4xl font-bold mt-6">Create Organisation</Text>
          <Text className='mt-2 text-xl'>Set up your space and let people {'\n'}reserve it with ease</Text>
          <Image source={CSpace}  className='absolute -right-2 bottom-0'/>
        </View>

        <View className="mb-6 p-6 gap-y-6">
          <TouchableOpacity
                  onPress={async () => {
                      const url = await pickAndUploadFile("schedura-space");
                      if (url) {
                        console.log("Uploaded file URL:", url);
                      }
                  }}
                  className=" border-2 border-dashed p-4 rounded-xl h-20 w-20 justify-center items-center"
                >
                  <Ionicons name="add" size={24} color="black" />
          </TouchableOpacity>    
          <View>
            <Text className='mb-1 font-semibold text-xl'>Organisation Name</Text>
            <TextInput
              placeholder="Convention Center"
              value={name}
              onChangeText={setName}
              className="p-4 rounded-xl border-2 border-black"
            />
          </View>
          
          <View>
            <Text className='mb-1 font-semibold text-xl'>Description</Text>
            <TextInput
              placeholder="A very spacious and elegant hall with..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={50}
              className="p-4 rounded-xl border-2 border-black h-40"
              textAlignVertical='top'
            />
          </View>
          
          
          <View className="flex-row items-center gap-4">
            {
              images.fileUri ?
              <View className='rounded-xl overflow-hidden border border-black/20 w-fit'>
                  <Image 
                      className='h-20 w-20'
                      source={{uri:images.fileUri}}
                  />
              </View>
              :
              <></>
            }
                
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            className='bg-black p-4 rounded-2xl mt-4 flex-row items-center justify-center gap-x-5'
          >
            <Text className='text-primary text-lg text-center font-semibold'>
              Create Organisation
            </Text>
            {
              loading &&
              <Animated.View
                style={{
                  transform: [{ rotate: rotateAnimation }],
                }}
                className="border-t-2 border-l-2 border-r-2 border-b-2 border-r-white border-l-white border-t-white h-5 w-5 rounded-full "
              >
              </Animated.View>
              }
            </TouchableOpacity>
        </View>
      </ScrollView>
      <RolesModal visible={rolesModalVisible} setVisible={setRolesModalVisible} />
    </SafeBoundingView>
  );
}
