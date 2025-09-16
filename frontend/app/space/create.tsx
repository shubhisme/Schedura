import { ScrollView, Text, TouchableOpacity, View, TextInput, Alert, StatusBar, Animated, Easing } from 'react-native';
import SafeBoundingView from '@/components/SafeBoundingView';
import { useEffect, useRef, useState } from 'react';
import { createSpace } from '@/supabase/controllers/spaces.controller';
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { Image } from 'react-native';
import { useUser } from '@clerk/clerk-expo';
import { decode } from 'base64-arraybuffer'
import { AntDesign, Ionicons } from '@expo/vector-icons';
//@ts-ignore
import CSpace from "@/assets/images/illustrations/cspace.png"


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
  const [loading, setLoading] = useState(false)
  const [amenities, setAmenities] = useState([
    { name: "WiFi", icon: "wifi", id:1, selected:false },
    { name: "Parking", icon: "car", id:2, selected:false },
    { name: "AC", icon: "snow", id:3, selected:false },
    { name: "Projector", icon: "tv", id:4, selected:false },
    { name: "Catering", icon: "restaurant", id:5, selected:false },
    { name: "Sound System", icon: "volume-high", id:6, selected:false },
  ])
  const rotateValue = new Animated.Value(0); 

  const rotateAnimation = rotateValue.interpolate({
      inputRange: [0, 1], 
      outputRange: ['0deg', '360deg'], 
  });
  useEffect(() => {
    if(loading){
      Animated.loop(
        Animated.timing(rotateValue, {
          toValue: 1, 
          duration: 2000, 
          easing: Easing.linear, 
          useNativeDriver: true, 
        })
      ).start()
    }
  }, [loading]);

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
      id: undefined
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
    setLoading(true);
  };

  // yet to make the submission functional
  const handleAmenities = (id:number) =>{
    let amenitiesCopy = [...amenities];
    amenitiesCopy[id].selected = !amenitiesCopy[id].selected;
    setAmenities(amenitiesCopy) 
  }
  return (
    <SafeBoundingView className="flex-1 bg-white">
      <StatusBar backgroundColor="#E9F0E9" />
      <ScrollView className=' bg-tertiary'>
        <View className='p-6 bg-primary rounded-b-3xl pb-12'>
          <Text className="text-black text-4xl font-bold mt-6">Create new Space</Text>
          <Text className='mt-2 text-xl'>Set up your space and let people {'\n'}reserve it with ease</Text>
          <Image source={CSpace}  className='absolute -right-2 bottom-0'/>
        </View>

        <Text className='text-2xl font-bold mx-5 mt-6'>Basic Details</Text>
        <View className="mb-6 p-6 gap-y-6">
          <View>
            <Text className='mb-1 font-semibold text-xl'>Name</Text>
            <TextInput
              placeholder="Convention Center"
              value={name}
              onChangeText={setName}
              className="p-4 rounded-xl border-2 border-black"
            />
          </View>
          <View>
            <Text className='mb-1 font-semibold text-xl'>Capacity</Text>
            <TextInput
              placeholder="200"
              keyboardType="numeric"
              value={capacity}
              onChangeText={setCapacity}
              className="p-4 rounded-xl border-2 border-black"
            />
          </View>
          <View>
            <Text className='mb-1 font-semibold text-xl'>Location</Text>
            <TextInput
              placeholder="Panaji, Goa"
              value={location}
              onChangeText={setLocation}
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
          <View>
            <Text className='mb-1 font-semibold text-xl'>Price per Day {"($)"}</Text>
            <TextInput
              placeholder="20000"
              value={pph}
              onChangeText={setPph}
              className="p-4 rounded-xl border-2 border-black"
            />
          </View>
          <View>
            <Text className='mb-1 font-semibold text-xl'>Facilities and Amenities</Text>
            <View className='border-black border-2 p-5 rounded-xl flex-row flex-wrap gap-5 gap-x-8'>
              {
                amenities.map((facility, i)=>(
                  <TouchableOpacity onPress={()=>handleAmenities(i)} key={facility.id} className='flex-row gap-2 items-center'>
                    <View className='p-2.5 rounded-xl  w-fit' style={{backgroundColor: facility.selected ? "#dcfce7" : "#f3f4f6"}}>
                      <Ionicons name={facility.icon} size={15} color={facility.selected ? '#10B981' : '#6B7280'}/>
                    </View>
                    <Text className='font-medium' style={{color: facility.selected ? '#111827' : '#9ca3af'}}>{facility.name}</Text>
                  </TouchableOpacity>
                ))
              }
            </View>
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
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            className='bg-black p-4 rounded-2xl mt-4 flex-row items-center justify-center gap-x-5'
          >
            <Text className='text-primary text-lg text-center font-semibold'>
              Add Space
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
    </SafeBoundingView>
  );
}
