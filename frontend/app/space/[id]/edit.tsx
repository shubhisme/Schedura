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

export default function EditSpacesScreen() {
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
    handleSelectSpace(id)
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

    const { data, error } = await updateSpace(selectedSpace.id, user?.id!, images.filePath , images.fileData , images.fileType, {
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
      <SafeBoundingView className="flex-1">
        <ScrollView>
          <View className="p-6 bg-primary rounded-b-3xl pb-7">
            <Text className="text-black text-3xl font-bold mt-6">Loading...</Text>
          </View>
        </ScrollView>
      </SafeBoundingView>
    );
  }

  return (
    <SafeBoundingView className="flex-1 bg-white">
      <ScrollView>
        <View className="p-6 bg-primary rounded-b-3xl pb-7">
          <Text className="text-black text-3xl font-bold mt-6">Edit Spaces</Text>
        </View>

        <View className="p-6 gap-4">
          {selectedSpace && (
            <>
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
                multiline
                onChangeText={setDescription}
                numberOfLines={10}
                className="bg-white p-4 rounded-xl border border-gray-200"
              />
              <TextInput
                placeholder="Price per Hour"
                keyboardType="numeric"
                value={pph}
                onChangeText={setPph}
                className="bg-white p-4 rounded-xl border border-gray-200"
              />
              <View className="flex-row items-center gap-4">
                {/* Image preview */}
                {images.fileUri ? (
                  <View className="rounded-xl overflow-hidden border border-black/20 w-fit">
                    <Image className="h-20 w-20" source={{ uri: images.fileUri }} />
                  </View>
                ) : null}

                <TouchableOpacity
                  onPress={() => pickAndUploadFile(selectedSpace.id)}
                  className=" border-2 border-dashed p-4 rounded-xl h-20 w-20 justify-center items-center"
                >
                  <Ionicons name="add" size={24} color="black" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={handleSubmit}
                className="bg-black p-4 rounded-2xl mt-4"
              >
                <Text className="text-primary text-lg text-center font-semibold">
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
