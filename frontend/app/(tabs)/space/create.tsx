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
import { useTheme } from '@/contexts/ThemeContext';
import { getOrganisationByUserId } from '@/supabase/controllers/organisation.controller';
import MapLocationPicker from '@/components/MapLocationPicker';
import { supabase } from '@/supabase/supabase';
import { getUserUpiId } from '@/supabase/controllers/user.controller';

interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}


export default function AddSpacesScreen() {
  const { colors, isDark } = useTheme();
  const [name, setName] = useState('');
  const [capacity, setCapacity] = useState('');
  const [location, setLocation] = useState('');
  const [selectedMapLocation, setSelectedMapLocation] = useState<Location | null>(null);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [description, setDescription] = useState('');
  const [pph, setPph] = useState('');
  const [ownerid, setOwnerId] = useState('');
  const [organizationid, setOrganizationId] = useState('');
  const [category, setCategory] = useState<'Wedding' | 'Corporate' | 'Birthday' | 'Conference' | 'Social'>('Social');
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
  
  const categories: Array<'Wedding' | 'Corporate' | 'Birthday' | 'Conference' | 'Social'> = ['Wedding', 'Corporate', 'Birthday', 'Conference', 'Social'];
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
    // Require signed-in user
    if (!user) {
      Alert.alert('Not signed in', 'Please sign in before creating a space.');
      return;
    }

    // Read UPI id from users table (source of truth)
    try {
      const userUpiId = await getUserUpiId(user?.id)
      if (!userUpiId) {
        Alert.alert(
          'UPI ID Required',
          'Please add your UPI ID in your profile before creating a space.'
        );
        return;
      }
      // upi available, continue
    } catch (err) {
      console.error('Error fetching user upi:', err);
      Alert.alert('Error', 'Could not verify UPI. Try again later.');
      return;
    }

    setLoading(true);
    if (!name || !capacity || !location || !description || !pph) {
      Alert.alert('Error', 'Please fill all fields');
      setLoading(false);
      return;
    }
    // get the id of the organisation the user belongs to
    const organisation = await getOrganisationByUserId(user?.id!);
    const orgid = organisation.data ?  organisation?.data[0].id : null;
    const { data, error } = await createSpace({
      name,
      capacity: parseInt(capacity),
      location,
      latitude: selectedMapLocation?.latitude,
      longitude: selectedMapLocation?.longitude,
      description,
      pph,
      ownerid: user?.id!,
      id: undefined,
      category,
      amenities: amenities.filter(facility=>facility.selected).map(facility=>facility.name),
      organizationid: parseInt(orgid!) || undefined,
    }, images);
    console.log(error)
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Success', 'Space added successfully');
      setName('');
      setCapacity('');
      setLocation('');
      setSelectedMapLocation(null);
      setDescription('');
      setPph('');
      setOwnerId('');
      setOrganizationId('');
    }
    setLoading(false);
  };

  // yet to make the submission functional
  const handleAmenities = (id:number) =>{
    let amenitiesCopy = [...amenities];
    amenitiesCopy[id].selected = !amenitiesCopy[id].selected;
    setAmenities(amenitiesCopy) 
  }
  return (
    <SafeBoundingView className="flex-1" style={{ backgroundColor: colors.background }}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.card} />
      <ScrollView style={{ backgroundColor: colors.backgroundSecondary }}>
        <View className="p-6 pb-12 rounded-b-2xl" style={{ backgroundColor: colors.accent }}>
          <Text className="text-4xl font-bold mt-6" style={{ color: colors.text }}>Create new Space</Text>
          <Text className="mt-2 text-lg" style={{ color: colors.text }}>Set up your space and let people {'\n'}reserve it with ease</Text>
          <Image source={CSpace} className="absolute right-2 bottom-0" />
        </View>

        <Text className="text-2xl font-bold mx-5 mt-6" style={{ color: colors.text }}>Basic Details</Text>
        <View className="mb-6 p-6 space-y-6">
          <View>
            <Text className="mb-1.5 font-semibold text-lg" style={{ color: colors.text }}>Name</Text>
            <TextInput
              placeholder="Convention Center"
              placeholderTextColor={colors.textSecondary}
              value={name}
              onChangeText={setName}
              className="p-4 rounded-xl border-2"
              style={{ borderColor: colors.border, backgroundColor: colors.card, color: colors.text }}
            />
          </View>
          <View>
            <Text className="mb-1.5 font-semibold text-lg" style={{ color: colors.text }}>Capacity</Text>
            <TextInput
              placeholder="200"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
              value={capacity}
              onChangeText={setCapacity}
              className="p-4 rounded-xl border-2"
              style={{ borderColor: colors.border, backgroundColor: colors.card, color: colors.text }}
            />
          </View>
          <View>
            <Text className="mb-1.5 font-semibold text-lg" style={{ color: colors.text }}>Location</Text>
            <View className="flex-row space-x-3">
              <TextInput
                placeholder="Panaji, Goa"
                placeholderTextColor={colors.textSecondary}
                value={location}
                onChangeText={setLocation}
                className="flex-1 p-4 rounded-xl border-2"
                style={{ borderColor: colors.border, backgroundColor: colors.card, color: colors.text }}
              />
              <TouchableOpacity
                onPress={() => setShowMapPicker(true)}
                className="p-4 rounded-xl border-2 items-center justify-center"
                style={{ borderColor: colors.border, backgroundColor: colors.card }}
              >
                <Ionicons name="map" size={24} color={colors.accent} />
              </TouchableOpacity>
            </View>
            {selectedMapLocation && (
              <View className="mt-2 p-3 rounded-md" style={{ backgroundColor: colors.backgroundSecondary }}>
                <Text className="text-xs font-medium" style={{ color: colors.text }}>
                  Selected coordinates: {selectedMapLocation.latitude.toFixed(6)}, {selectedMapLocation.longitude.toFixed(6)}
                </Text>
                {selectedMapLocation.address && (
                  <Text className="text-xs mt-0.5" style={{ color: colors.textSecondary }}>
                    {selectedMapLocation.address}
                  </Text>
                )}
              </View>
            )}
          </View>
          <View>
            <Text className="mb-1.5 font-semibold text-lg" style={{ color: colors.text }}>Description</Text>
            <TextInput
              placeholder="A very spacious and elegant hall with..."
              placeholderTextColor={colors.textSecondary}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={50}
              className="p-4 rounded-xl border-2 h-40"
              style={{ borderColor: colors.border, backgroundColor: colors.card, color: colors.text }}
              textAlignVertical='top'
            />
          </View>
          <View>
            <Text className="mb-1.5 font-semibold text-lg" style={{ color: colors.text }}>Price per Day {"($)"}</Text>
            <TextInput
              placeholder="20000"
              placeholderTextColor={colors.textSecondary}
              value={pph}
              onChangeText={setPph}
              className="p-4 rounded-xl border-2"
              style={{ borderColor: colors.border, backgroundColor: colors.card, color: colors.text }}
            />
          </View>
          <View>
            <Text className="mb-1.5 font-semibold text-lg" style={{ color: colors.text }}>Category</Text>
            <View className="border-2 p-5 rounded-xl flex-row flex-wrap gap-3" style={{ borderColor: colors.border, backgroundColor: colors.card }}>
              {
                categories.map((cat)=>(
                  <TouchableOpacity 
                    onPress={()=>setCategory(cat)} 
                    key={cat} 
                    className="px-4 py-2 rounded-full"
                    style={{ backgroundColor: category === cat ? colors.accent : colors.backgroundSecondary }}
                  >
                    <Text className="font-medium" style={{ color: category === cat ? 'white' : colors.textSecondary }}>{cat}</Text>
                  </TouchableOpacity>
                ))
              }
            </View>
          </View>
          <View>
            <Text className="mb-1.5 font-semibold text-lg" style={{ color: colors.text }}>Facilities and Amenities</Text>
            <View className="border-2 p-5 rounded-xl flex-row flex-wrap" style={{ borderColor: colors.border, backgroundColor: colors.card }}>
              {
                amenities.map((facility, i)=>(
                  <TouchableOpacity onPress={()=>handleAmenities(i)} key={facility.id} className="flex-row items-center space-x-2 mb-3 mr-4">
                    <View className="p-2 rounded-lg" style={{ backgroundColor: facility.selected ? (isDark ? '#065f46' : '#dcfce7') : colors.backgroundSecondary }}>
                      <Ionicons name={facility.icon as any} size={15} color={facility.selected ? '#10B981' : colors.textSecondary}/>
                    </View>
                    <Text className="font-medium" style={{ color: facility.selected ? colors.text : colors.textSecondary }}>{facility.name}</Text>
                  </TouchableOpacity>
                ))
              }
            </View>
          </View>
          <View className="flex-row items-center space-x-4">
            {
              images.fileUri ?
              <View className="rounded-lg overflow-hidden border" style={{ borderColor: colors.border }}>
                  <Image 
                      className="h-20 w-20"
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
                  className="border-2 border-dashed p-4 rounded-xl h-20 w-20 items-center justify-center"
                  style={{ borderColor: colors.border, backgroundColor: colors.card }}
                >
                  <Ionicons name="add" size={24} color={colors.text} />
            </TouchableOpacity>      
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            className="px-4 py-4 rounded-lg mt-4 flex-row items-center justify-center space-x-5"
            style={{ backgroundColor: colors.accent }}
          >
            <Text className="text-lg font-semibold" style={{ color: 'white' }}>
              Add Space
            </Text>
            {
              loading &&
              <Animated.View
                style={{
                  transform: [{ rotate: rotateAnimation }],
                  borderTopWidth: 2,
                  borderLeftWidth: 2,
                  borderRightWidth: 2,
                  borderBottomWidth: 2,
                  borderRightColor: 'white',
                  borderLeftColor: 'white',
                  borderTopColor: 'white',
                  borderBottomColor: 'transparent',
                  height: 20,
                  width: 20,
                  borderRadius: 10
                }}
              >
              </Animated.View>
              }
            </TouchableOpacity>
        </View>
      </ScrollView>
      
      <MapLocationPicker
        visible={showMapPicker}
        onLocationSelect={(location) => {
          setSelectedMapLocation(location);
          if (location.address) {
            setLocation(location.address);
          }
          setShowMapPicker(false);
        }}
        onCancel={() => setShowMapPicker(false)}
        initialLocation={selectedMapLocation || undefined}
      />
    </SafeBoundingView>
  );
}
