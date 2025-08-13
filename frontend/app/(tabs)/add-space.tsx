import { ScrollView, Text, TouchableOpacity, View, TextInput, Alert } from 'react-native';
import SafeBoundingView from '@/components/SafeBoundingView';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { createSpace } from '@/supabase/controllers/spaces.controller';
import * as DocumentPicker from "expo-document-picker";
import { supabase } from '@/supabase/supabase';
import { Image } from 'react-native';
import { useUser } from '@clerk/clerk-expo';
import { decode } from 'base64-arraybuffer'

export default function AddSpacesScreen() {
  const [name, setName] = useState('');
  const [capacity, setCapacity] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [pph, setPph] = useState('');
  const [ownerid, setOwnerId] = useState('');
  const [organizationid, setOrganizationId] = useState('');
  const [images, setImages] = useState<any>({filePath:"", fileData:"", fileType:"", fileUri:""})
  const { user } = useUser();

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
            const response = await fetch(file.uri);
            const fileData = await (await response.blob()).arrayBuffer();
            setImages({filePath, fileData, fileType:file.mimeType, fileUri:file.uri})
        } catch (err) {
            console.error("Error picking/uploading file:", err);
            return null;
        }
    }


  const handleSubmit = async () => {
    if (!name || !capacity || !location || !description || !pph) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    const { data, error } = await createSpace({
      name,
      capacity: parseInt(capacity),
      location,
      description,
      pph,
      ownerid: user?.id!,
    }, images);
    console.log(error)
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Success', 'Space added successfully');
      setName('');
      setCapacity('');
      setLocation('');
      setDescription('');
      setPph('');
      setOwnerId('');
      setOrganizationId('');
    }
  };

  return (
    <SafeBoundingView className="flex-1">
      <ScrollView>
        <View className='p-6 bg-primary rounded-b-3xl pb-7'>
          <Text className="text-black text-3xl font-bold mt-6">Add Spaces</Text>
        </View>

        <View className="mb-6 p-6 gap-4">
          <TextInput
            placeholder="Name"
            value={name}
            onChangeText={setName}
            className="bg-white p-4 rounded-xl border border-gray-200"
          />
          <TextInput
            placeholder="Capacity"
            keyboardType="numeric"
            value={capacity}
            onChangeText={setCapacity}
            className="bg-white p-4 rounded-xl border border-gray-200"
          />
          <TextInput
            placeholder="Location"
            value={location}
            onChangeText={setLocation}
            className="bg-white p-4 rounded-xl border border-gray-200"
          />
          <TextInput
            placeholder="Description"
            value={description}
            onChangeText={setDescription}
            multiline
            className="bg-white p-4 rounded-xl border border-gray-200"
          />
          <TextInput
            placeholder="Price per Hour"
            value={pph}
            onChangeText={setPph}
            className="bg-white p-4 rounded-xl border border-gray-200"
          />
          <View>
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
            onPress={async () => {
                const url = await pickAndUploadFile("space123");
                if (url) {
                console.log("Uploaded file URL:", url);
                // Save this URL in your spaces table along with other fields
                }
            }}
            className="bg-black p-4 rounded-xl mt-2"
            >
            <Text className="text-white text-center">Upload Image</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSubmit}
            className='bg-black p-4 rounded-2xl mt-4'
          >
            <Text className='text-primary text-lg text-center font-semibold'>
              Add Space
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeBoundingView>
  );
}
