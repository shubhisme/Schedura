import { ScrollView, Text, TouchableOpacity, View, TextInput, Alert, Image } from "react-native";
import SafeBoundingView from "@/components/SafeBoundingView";
import { useEffect, useState } from "react";
import * as DocumentPicker from "expo-document-picker";
import { useUser } from "@clerk/clerk-expo";
import { getSpaceById, updateSpace } from "@/supabase/controllers/spaces.controller";
import type { Space } from "@/types/database.type";
//@ts-ignore
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from "@expo/vector-icons";
import SpacesScreen from "@/app/(tabs)/spaces";
import { useTheme } from '@/contexts/ThemeContext';

export default function EditSpacesScreen() {
  const { colors, isDark } = useTheme();
  const { user } = useUser();
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(false);
  const [selectedSpace, setSelectedSpace] = useState<Space | null>(null);
  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [pph, setPph] = useState("");
  const [images, setImages] = useState<any>({
    filePath: "",
    fileData: "",
    fileType: "",
    fileUri: "",
  });
  
  useEffect(() => {
    handleSelectSpace(id as string)
  }, [user?.id])

  const handleSelectSpace = async(spaceId: string) => {
    setLoading(true);
    const { data } = await getSpaceById(spaceId);
    if (data) {
      setSelectedSpace(data);
      setName(data.name || "");
      setCapacity(data.capacity?.toString() || "");
      setLocation(data.location || "");
      setDescription(data.description || "");
      setPph(data.pph?.toString() || "");
      if ((data as any)["spaces-images"]?.length > 0) {
        setImages({
          ...images,
          fileUri: data.images ? data.images[0] : "",
        });
      }
    }
    setLoading(false);
  };

  async function pickAndUploadFile(spaceId: string) {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["image/*"],
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      const file = result.assets[0];
      const fileExt = file.name.split(".").pop();
      const fileName = `${spaceId}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const response = await fetch(file.uri);
      const fileData = await (await response.blob()).arrayBuffer();

      setImages({
        filePath,
        fileData,
        fileType: file.mimeType,
        fileUri: file.uri,
      });
    } catch (err) {
      console.error("Error picking file:", err);
    }
  }

  const handleSubmit = async () => {
    if (!selectedSpace) {
      Alert.alert("Error", "Please select a space first");
      return;
    }
    if (!name || !capacity || !location || !description || !pph) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    const { data, error } = await updateSpace(selectedSpace.id!, user?.id!, images.filePath , images.fileData , images.fileType, {
      name,
      capacity: parseInt(capacity),
      location,
      description,
      pph,
    });

    if (error) {
      Alert.alert("Error", error.message);
    } else {
      Alert.alert("Success", `${selectedSpace.name} updated successfully`);
    }
  };

  if(loading) {
    return (
      <SafeBoundingView style={{ flex: 1, backgroundColor: colors.background }}>
        <ScrollView>
          <View style={{ padding: 24, backgroundColor: colors.accent, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, paddingBottom: 28 }}>
            <Text style={{ color: colors.text, fontSize: 30, fontWeight: 'bold', marginTop: 24 }}>Loading...</Text>
          </View>
        </ScrollView>
      </SafeBoundingView>
    );
  }

  return (
    <SafeBoundingView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView>
        <View style={{ padding: 24, backgroundColor: colors.accent, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, paddingBottom: 28 }}>
          <Text style={{ color: colors.text, fontSize: 30, fontWeight: 'bold', marginTop: 24 }}>Edit Spaces</Text>
        </View>

        <View style={{ padding: 24, gap: 16 }}>
          {selectedSpace && (
            <>
              <TextInput
                placeholder="Name"
                placeholderTextColor={colors.textSecondary}
                value={name}
                onChangeText={setName}
                style={{ backgroundColor: colors.card, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: colors.border, color: colors.text }}
              />
              <TextInput
                placeholder="Capacity"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
                value={capacity}
                onChangeText={setCapacity}
                style={{ backgroundColor: colors.card, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: colors.border, color: colors.text }}
              />
              <TextInput
                placeholder="Location"
                placeholderTextColor={colors.textSecondary}
                value={location}
                onChangeText={setLocation}
                style={{ backgroundColor: colors.card, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: colors.border, color: colors.text }}
              />
              <TextInput
                placeholder="Description"
                placeholderTextColor={colors.textSecondary}
                value={description}
                multiline
                onChangeText={setDescription}
                numberOfLines={10}
                style={{ backgroundColor: colors.card, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: colors.border, color: colors.text }}
              />
              <TextInput
                placeholder="Price per Hour"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
                value={pph}
                onChangeText={setPph}
                style={{ backgroundColor: colors.card, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: colors.border, color: colors.text }}
              />
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                {/* Image preview */}
                {images.fileUri ? (
                  <View style={{ borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: colors.border, width: 'auto' }}>
                    <Image style={{ height: 80, width: 80 }} source={{ uri: images.fileUri }} />
                  </View>
                ) : null}

                <TouchableOpacity
                  onPress={() => pickAndUploadFile(selectedSpace.id!)}
                  style={{ borderWidth: 2, borderStyle: 'dashed', padding: 16, borderRadius: 12, height: 80, width: 80, justifyContent: 'center', alignItems: 'center', borderColor: colors.border, backgroundColor: colors.card }}
                >
                  <Ionicons name="add" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={handleSubmit}
                style={{ backgroundColor: colors.accent, padding: 16, borderRadius: 16, marginTop: 16 }}
              >
                <Text style={{ color: 'white', fontSize: 18, textAlign: 'center', fontWeight: '600' }}>
                  Update Space
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </SafeBoundingView>
  );
}
