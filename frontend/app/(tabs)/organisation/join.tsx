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
import { createOrganisation, searchOrganisations } from '@/supabase/controllers/organisation.controller';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '@/contexts/ThemeContext';


export default function JoinOrganisationScreen() {
  const { colors, isDark } = useTheme();
  const [name, setName] = useState('');
  const [organisations, setOrganisations] = useState<any[]>([]);
  
  const search = async (name:string) => {
    setName(name);
    if (name.trim() === '') {
      Alert.alert('Error', 'Please enter an organisation name.');
      return;
    }
    const data = await searchOrganisations(name);
    if(data.error){
      Alert.alert('Error', data.error);
      return;
    }
    setOrganisations(data.data || []);
  };

 
  return (
    <SafeBoundingView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.card} />
      <ScrollView style={{ backgroundColor: colors.backgroundSecondary }}>
        <View style={{ padding: 24, backgroundColor: colors.accent, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, paddingBottom: 48 }}>
          <Text style={{ color: colors.text, fontSize: 36, fontWeight: 'bold', marginTop: 24 }}>Join Organisation</Text>
          <Text style={{ marginTop: 8, fontSize: 20, color: colors.text }}>Set up your space and let people {'\n'}reserve it with ease</Text>
          <Image source={CSpace} style={{ position: 'absolute', right: -8, bottom: 0 }} />
        </View>

        <View style={{ marginBottom: 24, padding: 24, gap: 24 }}>
          
          <View>
            <Text style={{ marginBottom: 4, fontWeight: '600', fontSize: 20, color: colors.text }}>Search</Text>
            <View style={{ paddingHorizontal: 8, borderRadius: 12, borderWidth: 2, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.card }}>
              <Ionicons name="search" size={20} color={colors.textSecondary} style={{ paddingHorizontal: 8 }} />
              <TextInput
                placeholder="Convention Center"
                placeholderTextColor={colors.textSecondary}
                value={name}
                onChangeText={search}
                style={{ padding: 16, borderRadius: 12, flex: 1, color: colors.text }}
              />
            </View>
          </View>
        </View>
        <View style={{ paddingHorizontal: 24 }}>
          {organisations.map((org:any) => (
            <TouchableOpacity key={org.id} style={{ borderRadius: 12, marginBottom: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16, backgroundColor: colors.card, padding: 16, borderWidth: 1, borderColor: colors.border }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Image source={{ uri: org.logo }} style={{ width: 64, height: 64, borderRadius: 12, backgroundColor: colors.backgroundSecondary }} /> 
                <View>
                  <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text }}>{org.name}</Text>
                  <Text style={{ color: colors.textSecondary }}>{org.type}</Text>
                </View>
              </View>
              <TouchableOpacity style={{ backgroundColor: colors.accent, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 12, alignItems: 'center' }}>
                <Text style={{ color: 'white', fontWeight: '600' }}>Request</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeBoundingView>
  );
}
