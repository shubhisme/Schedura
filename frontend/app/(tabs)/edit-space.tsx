import { ScrollView, Text, TouchableOpacity, View, TextInput, Alert, Image } from "react-native";
import SafeBoundingView from "@/components/SafeBoundingView";
import { useEffect, useState } from "react";
import * as DocumentPicker from "expo-document-picker";
import { useUser } from "@clerk/clerk-expo";
import { getMySpaces, updateSpace } from "@/supabase/controllers/spaces.controller";
import type { Space } from "@/types/database.type";

export default function EditSpacesScreen() {
  const { user } = useUser();
  const [spaces, setSpaces] = useState<any>([]);
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
  const fetchMySpaces = async () => {
    const { data } = await getMySpaces(user?.id!);
    console.log(data)
    setSpaces(data);
  }
  useEffect(() => {
    fetchMySpaces()
  }, [user?.id])

  const handleSelectSpace = (spaceId: string) => {
    const found = spaces.find((s: any) => s.id === spaceId);
    if (found) {
      setSelectedSpace(found);
      setName(found.name || "");
      setCapacity(found.capacity?.toString() || "");
      setLocation(found.location || "");
      setDescription(found.description || "");
      setPph(found.pph?.toString() || "");
      if ((found as any)["spaces-images"]?.length > 0) {
        setImages({
          ...images,
          fileUri: (found as any)["spaces-images"][0].link,
        });
      }
    }
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

    const { data, error } = await updateSpace(selectedSpace.id, user?.id!, {
      name,
      capacity: parseInt(capacity),
      location,
      description,
      pph,
    });

    if (error) {
      Alert.alert("Error", error.message);
    } else {
      Alert.alert("Success", "Space updated successfully");
    }
  };

  return (
    <SafeBoundingView className="flex-1">
      <ScrollView>
        <View className="p-6 bg-primary rounded-b-3xl pb-7">
          <Text className="text-black text-3xl font-bold mt-6">Edit Spaces</Text>
        </View>

        <View className="p-6 gap-4">
          {/* Space Selector */}
          <View className="bg-white p-4 rounded-xl border border-gray-200">
            <Text className="mb-2 text-gray-700 font-semibold">Select Space</Text>
            <ScrollView horizontal className="flex-row gap-3">
              {spaces.map((s: any) => (
                <TouchableOpacity
                  key={s.id}
                  onPress={() => handleSelectSpace(s.id)}
                  className={`px-4 py-2 rounded-xl ${
                    selectedSpace?.id === s.id ? "bg-black" : "bg-gray-200"
                  }`}
                >
                  <Text
                    className={`${
                      selectedSpace?.id === s.id ? "text-white" : "text-black"
                    }`}
                  >
                    {s.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

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
                className="bg-white p-4 rounded-xl border border-gray-200"
              />
              <TextInput
                placeholder="Price per Hour"
                keyboardType="numeric"
                value={pph}
                onChangeText={setPph}
                className="bg-white p-4 rounded-xl border border-gray-200"
              />

              {/* Image preview */}
              {images.fileUri ? (
                <View className="rounded-xl overflow-hidden border border-black/20 w-fit">
                  <Image className="h-20 w-20" source={{ uri: images.fileUri }} />
                </View>
              ) : null}

              <TouchableOpacity
                onPress={() => pickAndUploadFile(selectedSpace.id)}
                className="bg-black p-4 rounded-xl mt-2"
              >
                <Text className="text-white text-center">Upload New Image</Text>
              </TouchableOpacity>

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
