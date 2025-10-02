import React, { useState, useEffect } from "react";
import { View, Text, Image, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, Share, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getSpaceById } from "@/supabase/controllers/spaces.controller";
//@ts-ignore
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';

const { width } = Dimensions.get('window');

export default function HallDetails() {
  const { colors, isDark } = useTheme();
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(false) 
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const { back, push } = useRouter();

  
  const facilities = [
    { name: "WiFi", icon: "wifi", available: true },
    { name: "Parking", icon: "car", available: true },
    { name: "AC", icon: "snow", available: true },
    { name: "Projector", icon: "tv", available: true },
    { name: "Catering", icon: "restaurant", available: false },
    { name: "Sound System", icon: "volume-high", available: true },
  ];

  const [space, setSpace] = useState<any>();

  const fetchSpace = async () => {
    try {
      setLoading(true);
      const { data, error } = await getSpaceById(id as string);
      if (error) {
        console.error("Error fetching spaces:", error);
      } else {
        setSpace(data);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error in fetchSpaces:", error);
    }
  };

  useEffect(() => {
    fetchSpace();
  }, []);
  
  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this amazing venue: ${space.name} at ${space.location}`,
      });
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };
  if (loading || !space) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.card} />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: colors.textSecondary }}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.backgroundSecondary }}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View style={{ position: 'relative' }}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={({ nativeEvent }) => {
              const slide = Math.ceil(nativeEvent.contentOffset.x / nativeEvent.layoutMeasurement.width);
              if (slide !== currentImageIndex) {
                setCurrentImageIndex(slide);
              }
            }}
            scrollEventThrottle={20}
          >
            {space?.images.map((image: any, index: number) => (
              <Image
                key={index}
                source={{ uri: image }}
                style={{ width, height: 300, backgroundColor: colors.backgroundSecondary }}
              />
            ))}
          </ScrollView>
          

          {space?.images.length > 1 && (
            <View style={{ position: 'absolute', bottom: 16, alignSelf: 'center', flexDirection: 'row', gap: 8 }}>
              {space.images.map((_: any, index: number) => (
                <View
                  key={index}
                  style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: index === currentImageIndex ? 'white' : 'rgba(255,255,255,0.5)' }}
                />
              ))}
            </View>
          )}
          

          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, paddingTop: 48 }}>
            <TouchableOpacity 
                onPress={() => back()}
                style={{ backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 24, padding: 12 }}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity 
                onPress={handleShare}
                style={{ backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 24, padding: 12 }}
              >
                <Ionicons name="share-outline" size={24} color="white" />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => setIsFavorite(!isFavorite)}
                style={{ backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 24, padding: 12 }}
              >
                <Ionicons 
                  name={isFavorite ? "heart" : "heart-outline"} 
                  size={24} 
                  color={isFavorite ? "#EF4444" : "white"} 
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={{ backgroundColor: colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, marginTop: -24, position: 'relative', zIndex: 10 }}>

          <View style={{ padding: 24, paddingBottom: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 30, fontWeight: 'bold', color: colors.text, marginBottom: 8 }}>{space.name}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <View style={{ backgroundColor: colors.backgroundSecondary, borderRadius: 20, padding: 8, marginRight: 12 }}>
                    <Ionicons name="location" size={16} color={colors.textSecondary} />
                  </View>
                  <Text style={{ color: colors.textSecondary, fontSize: 18, flex: 1 }}>{space.location}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ backgroundColor: colors.backgroundSecondary, borderRadius: 20, padding: 8, marginRight: 12 }}>
                    <Ionicons name="people" size={16} color={colors.textSecondary} />
                  </View>
                  <Text style={{ color: colors.textSecondary, fontSize: 18 }}>Up to {space.capacity} guests</Text>
                </View>
              </View>
              
              <View style={{ backgroundColor: colors.success + '20', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 8 }}>
                <Text style={{ color: colors.success, fontWeight: '600' }}>Available</Text>
              </View>
            </View>
            

            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF3C7', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4, marginRight: 12 }}>
                <Ionicons name="star" size={16} color="#F59E0B" />
                <Text style={{ color: '#92400E', fontWeight: '600', marginLeft: 4 }}>4.8</Text>
              </View>
              <Text style={{ color: colors.textSecondary }}>Based on 124 reviews</Text>
            </View>
          </View>


          <View style={{ paddingHorizontal: 24, paddingBottom: 24 }}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity onPress={()=>push(`/space/${id}/book` as any)} style={{ backgroundColor: colors.accent, borderRadius: 16, paddingHorizontal: 24, paddingVertical: 12, flex: 1 }}>
                <Text style={{ color: 'white', textAlign: 'center', fontWeight: '600', fontSize: 18, marginVertical: 'auto' }}>Book Now</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ borderWidth: 2, borderColor: colors.border, borderRadius: 16, paddingHorizontal: 24, paddingVertical: 12, flex: 1, backgroundColor: colors.card }}>
                <Text style={{ color: colors.text, textAlign: 'center', fontWeight: '600', fontSize: 18 }}>Check Avail</Text>
              </TouchableOpacity>
            </View>
          </View>


          <View style={{ paddingHorizontal: 24, paddingVertical: 16, borderTopWidth: 1, borderTopColor: colors.border }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.text, marginBottom: 16 }}>About This Venue</Text>
            <Text style={{ color: colors.textSecondary, lineHeight: 24, fontSize: 16 }}>
              Experience luxury and elegance at {space.name}. Our premium venue offers the perfect setting for your special events, from intimate gatherings to grand celebrations. With state-of-the-art facilities and exceptional service, we ensure your event will be unforgettable.
            </Text>
          </View>


          <View style={{ paddingHorizontal: 24, paddingVertical: 16, borderTopWidth: 1, borderTopColor: colors.border }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.text, marginBottom: 16 }}>Facilities & Amenities</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {facilities.map((facility, index) => (
                <View 
                  key={index} 
                  style={{ 
                    flexDirection: 'row', 
                    alignItems: 'center', 
                    marginRight: 24, 
                    marginBottom: 16,
                    opacity: space.amenities.includes(facility.name) ? 1 : 0.5
                  }}
                >
                  <View style={{ 
                    padding: 8, 
                    borderRadius: 12, 
                    marginRight: 12,
                    backgroundColor: space.amenities.includes(facility.name) ? colors.success + '20' : colors.backgroundSecondary
                  }}>
                    <Ionicons 
                      name={facility.icon as any} 
                      size={20} 
                      color={space.amenities.includes(facility.name) ? colors.success : colors.textSecondary} 
                    />
                  </View>
                  <Text style={{ 
                    fontWeight: '500',
                    color: space.amenities.includes(facility.name) ? colors.text : colors.textSecondary
                  }}>
                    {facility.name}
                  </Text>
                  {!space.amenities.includes(facility.name) && (
                    <Text style={{ color: colors.textSecondary, marginLeft: 4 }}>(Not Available)</Text>
                  )}
                </View>
              ))}
            </View>
          </View>


          <View style={{ paddingHorizontal: 24, paddingVertical: 16, borderTopWidth: 1, borderTopColor: colors.border }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.text, marginBottom: 16 }}>Pricing</Text>
            <View style={{ backgroundColor: colors.accent + '10', borderRadius: 16, padding: 24 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.text }}>₹{space.pph}</Text>
                <Text style={{ color: colors.textSecondary }}>per day</Text>
              </View>
              <Text style={{ color: colors.textSecondary, marginBottom: 16 }}>Base price includes venue rental for 8 hours</Text>
              <View style={{ gap: 8 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ color: colors.textSecondary }}>Security deposit</Text>
                  <Text style={{ color: colors.text, fontWeight: '600' }}>₹{space.pph}</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ color: colors.textSecondary }}>Cleaning fee</Text>
                  <Text style={{ color: colors.text, fontWeight: '600' }}>₹{space.pph}</Text>
                </View>
              </View>
            </View>
          </View>


          <View style={{ paddingHorizontal: 24, paddingVertical: 16, borderTopWidth: 1, borderTopColor: colors.border }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.text, marginBottom: 16 }}>Location</Text>
            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: 16, paddingVertical: 12 }}>
              <Ionicons name="map" size={20} color={colors.text} />
              <Text style={{ color: colors.text, fontWeight: '600', marginLeft: 8 }}>View on Map</Text>
            </TouchableOpacity>
          </View>


          <View style={{ paddingHorizontal: 24, paddingVertical: 16, borderTopWidth: 1, borderTopColor: colors.border }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.text }}>Reviews</Text>
              <TouchableOpacity>
                <Text style={{ color: colors.link, fontWeight: '600' }}>See All</Text>
              </TouchableOpacity>
            </View>
            
            <View style={{ gap: 16 }}>
              {[1, 2].map((review) => (
                <View key={review} style={{ backgroundColor: colors.backgroundSecondary, borderRadius: 16, padding: 16 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <View style={{ width: 40, height: 40, backgroundColor: colors.border, borderRadius: 20, marginRight: 12 }}></View>
                      <Text style={{ fontWeight: '600', color: colors.text }}>John Doe</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name="star" size={16} color="#F59E0B" />
                      <Text style={{ color: colors.textSecondary, marginLeft: 4 }}>5.0</Text>
                    </View>
                  </View>
                  <Text style={{ color: colors.textSecondary }}>
                    Amazing venue with excellent facilities. The staff was very helpful and the location is perfect for events.
                  </Text>
                </View>
              ))}
            </View>
          </View>


          <View style={{ paddingHorizontal: 24, paddingVertical: 16, borderTopWidth: 1, borderTopColor: colors.border, marginBottom: 32 }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.text, marginBottom: 16 }}>Contact Host</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity style={{ backgroundColor: '#10B981', borderRadius: 16, paddingHorizontal: 24, paddingVertical: 12, flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="call" size={20} color="white" />
                <Text style={{ color: 'white', fontWeight: '600', marginLeft: 8 }}>Call</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ backgroundColor: '#3B82F6', borderRadius: 16, paddingHorizontal: 24, paddingVertical: 12, flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="chatbubble" size={20} color="white" />
                <Text style={{ color: 'white', fontWeight: '600', marginLeft: 8 }}>Message</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={{ backgroundColor: colors.card, borderTopWidth: 1, borderTopColor: colors.border, paddingHorizontal: 24, paddingVertical: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.text }}>₹{space.pph}</Text>
            <Text style={{ color: colors.textSecondary }}>per day</Text>
          </View>
          <TouchableOpacity onPress={()=>push(`/space/${id}/book` as any)} style={{ backgroundColor: colors.accent, borderRadius: 16, paddingHorizontal: 32, paddingVertical: 12 }}>
            <Text style={{ color: 'white', fontWeight: '600', fontSize: 18 }}>Book Now</Text>
          </TouchableOpacity>
        </View>
      </View>
      
    </SafeAreaView>
  );
}