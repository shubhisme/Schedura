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
//import MapLocationPicker from '@/components/MapLocationPicker';

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
    setLoading(true);
    if (!name || !capacity || !location || !description || !pph) {
      Alert.alert('Error', 'Please fill all fields');
      setLoading(false);
      return;
    }

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
    <SafeBoundingView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.card} />
      <ScrollView style={{ backgroundColor: colors.backgroundSecondary }}>
        <View style={{ padding: 24, backgroundColor: colors.accent, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, paddingBottom: 48 }}>
          <Text style={{ color: colors.text, fontSize: 36, fontWeight: 'bold', marginTop: 24 }}>Create new Space</Text>
          <Text style={{ marginTop: 8, fontSize: 20, color: colors.text }}>Set up your space and let people {'\n'}reserve it with ease</Text>
          <Image source={CSpace} style={{ position: 'absolute', right: -8, bottom: 0 }} />
        </View>

        <Text style={{ fontSize: 24, fontWeight: 'bold', marginHorizontal: 20, marginTop: 24, color: colors.text }}>Basic Details</Text>
        <View style={{ marginBottom: 24, padding: 24, gap: 24 }}>
          <View>
            <Text style={{ marginBottom: 4, fontWeight: '600', fontSize: 20, color: colors.text }}>Name</Text>
            <TextInput
              placeholder="Convention Center"
              placeholderTextColor={colors.textSecondary}
              value={name}
              onChangeText={setName}
              style={{ padding: 16, borderRadius: 12, borderWidth: 2, borderColor: colors.border, backgroundColor: colors.card, color: colors.text }}
            />
          </View>
          <View>
            <Text style={{ marginBottom: 4, fontWeight: '600', fontSize: 20, color: colors.text }}>Capacity</Text>
            <TextInput
              placeholder="200"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
              value={capacity}
              onChangeText={setCapacity}
              style={{ padding: 16, borderRadius: 12, borderWidth: 2, borderColor: colors.border, backgroundColor: colors.card, color: colors.text }}
            />
          </View>
          <View>
            <Text style={{ marginBottom: 4, fontWeight: '600', fontSize: 20, color: colors.text }}>Location</Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TextInput
                placeholder="Panaji, Goa"
                placeholderTextColor={colors.textSecondary}
                value={location}
                onChangeText={setLocation}
                style={{ flex: 1, padding: 16, borderRadius: 12, borderWidth: 2, borderColor: colors.border, backgroundColor: colors.card, color: colors.text }}
              />
              <TouchableOpacity
                onPress={() => setShowMapPicker(true)}
                style={{ padding: 16, borderRadius: 12, borderWidth: 2, borderColor: colors.border, backgroundColor: colors.card, justifyContent: 'center', alignItems: 'center' }}
              >
                <Ionicons name="map" size={24} color={colors.accent} />
              </TouchableOpacity>
            </View>
            {selectedMapLocation && (
              <View style={{ marginTop: 8, padding: 12, backgroundColor: colors.backgroundSecondary, borderRadius: 8 }}>
                <Text style={{ color: colors.text, fontSize: 12, fontWeight: '500' }}>
                  Selected coordinates: {selectedMapLocation.latitude.toFixed(6)}, {selectedMapLocation.longitude.toFixed(6)}
                </Text>
                {selectedMapLocation.address && (
                  <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 2 }}>
                    {selectedMapLocation.address}
                  </Text>
                )}
              </View>
            )}
          </View>
          <View>
            <Text style={{ marginBottom: 4, fontWeight: '600', fontSize: 20, color: colors.text }}>Description</Text>
            <TextInput
              placeholder="A very spacious and elegant hall with..."
              placeholderTextColor={colors.textSecondary}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={50}
              style={{ padding: 16, borderRadius: 12, borderWidth: 2, borderColor: colors.border, height: 160, backgroundColor: colors.card, color: colors.text }}
              textAlignVertical='top'
            />
          </View>
          <View>
            <Text style={{ marginBottom: 4, fontWeight: '600', fontSize: 20, color: colors.text }}>Price per Day {"($)"}</Text>
            <TextInput
              placeholder="20000"
              placeholderTextColor={colors.textSecondary}
              value={pph}
              onChangeText={setPph}
              style={{ padding: 16, borderRadius: 12, borderWidth: 2, borderColor: colors.border, backgroundColor: colors.card, color: colors.text }}
            />
          </View>
          <View>
            <Text style={{ marginBottom: 4, fontWeight: '600', fontSize: 20, color: colors.text }}>Category</Text>
            <View style={{ borderColor: colors.border, borderWidth: 2, padding: 20, borderRadius: 12, flexDirection: 'row', flexWrap: 'wrap', gap: 12, backgroundColor: colors.card }}>
              {
                categories.map((cat)=>(
                  <TouchableOpacity 
                    onPress={()=>setCategory(cat)} 
                    key={cat} 
                    style={{ paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, backgroundColor: category === cat ? colors.accent : colors.backgroundSecondary }}
                  >
                    <Text style={{ fontWeight: '500', color: category === cat ? 'white' : colors.textSecondary }}>{cat}</Text>
                  </TouchableOpacity>
                ))
              }
            </View>
          </View>
          <View>
            <Text style={{ marginBottom: 4, fontWeight: '600', fontSize: 20, color: colors.text }}>Facilities and Amenities</Text>
            <View style={{ borderColor: colors.border, borderWidth: 2, padding: 20, borderRadius: 12, flexDirection: 'row', flexWrap: 'wrap', gap: 20, columnGap: 32, backgroundColor: colors.card }}>
              {
                amenities.map((facility, i)=>(
                  <TouchableOpacity onPress={()=>handleAmenities(i)} key={facility.id} style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                    <View style={{ padding: 10, borderRadius: 12, backgroundColor: facility.selected ? (isDark ? '#065f46' : '#dcfce7') : colors.backgroundSecondary }}>
                      <Ionicons name={facility.icon as any} size={15} color={facility.selected ? '#10B981' : colors.textSecondary}/>
                    </View>
                    <Text style={{ fontWeight: '500', color: facility.selected ? colors.text : colors.textSecondary }}>{facility.name}</Text>
                  </TouchableOpacity>
                ))
              }
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            {
              images.fileUri ?
              <View style={{ borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: colors.border, width: 'auto' }}>
                  <Image 
                      style={{ height: 80, width: 80 }}
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
                  style={{ borderWidth: 2, borderStyle: 'dashed', padding: 16, borderRadius: 12, height: 80, width: 80, justifyContent: 'center', alignItems: 'center', borderColor: colors.border, backgroundColor: colors.card }}
                >
                  <Ionicons name="add" size={24} color={colors.text} />
            </TouchableOpacity>      
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            style={{ backgroundColor: colors.accent, padding: 16, borderRadius: 16, marginTop: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 20 }}
          >
            <Text style={{ color: 'white', fontSize: 18, textAlign: 'center', fontWeight: '600' }}>
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
      
      {/*<MapLocationPicker
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
      />*/}
    </SafeBoundingView>
  );
}
