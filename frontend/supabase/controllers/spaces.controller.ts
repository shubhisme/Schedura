import type { Space } from "@/types/database.type";
import { supabase } from "../supabase"

export async function createSpace(spaceData:Space, file: {filePath:string, fileData:string, fileType:string}) {
  const { data, error } = await supabase
    .from("spaces")
    .insert([
      {
        name: spaceData.name,
        capacity: spaceData.capacity,
        location: spaceData.location,
        description: spaceData.description,
        pph: spaceData.pph,
        ownerid: spaceData.ownerid,
        organizationid: spaceData.organizationid
      }
    ])
    .select();
  const spaceId = data ? data[0].id! : null;
  
  const uploadedFileLink = await uploadFile(file);
  
  await supabase
    .from("spaces-images")
    .insert([
      {
        spaceid:spaceId,
        link: uploadedFileLink
      }
    ])
    .select();
    
  return {data, error};
}
export async function deleteMySpace(spaceId: string, userId: string) {
  try {
    const { data: spaceData, error: spaceError } = await supabase
      .from("spaces")
      .select("ownerid")
      .eq("id", spaceId)
      .single();

    if (spaceError || !spaceData) {
      return { data: null, error: new Error("Space not found") };
    }

    if (spaceData.ownerid !== userId) {
      return { data: null, error: new Error("Unauthorized: You can only delete your own spaces") };
    }
    const { data: imagesData, error: imagesError } = await supabase
      .from("spaces-images")
      .select("link")
      .eq("spaceid", spaceId);

    if (imagesError) {
      console.error("Error fetching images:", imagesError);
      return { data: null, error: imagesError };
    }

    if (imagesData && imagesData.length > 0) {
      const filePaths = imagesData.map((image) => image.link.split("/").pop() || "");
      const { error: storageError } = await supabase.storage
        .from("spaces")
        .remove(filePaths);

      if (storageError) {
        console.error("Error deleting files from storage:", storageError);
        return { data: null, error: storageError };
      }
    }

    const { error: imagesDeleteError } = await supabase
      .from("spaces-images")
      .delete()
      .eq("spaceid", spaceId);

    if (imagesDeleteError) {
      console.error("Error deleting image records:", imagesDeleteError);
      return { data: null, error: imagesDeleteError };
    }

    const { data, error: deleteError } = await supabase
      .from("spaces")
      .delete()
      .eq("id", spaceId)
      .select();

    if (deleteError) {
      console.error("Error deleting space:", deleteError);
      return { data: null, error: deleteError };
    }

    return { data: { message: "Space deleted successfully" }, error: null };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { data: null, error: error instanceof Error ? error : new Error("Unknown error occurred") };
  }
}
export async function updateSpace(spaceId: string, userId: string, spaceData: Partial<Space>) {
  try {
    const { data: spaceCheck, error: checkError } = await supabase
      .from("spaces")
      .select("ownerid")
      .eq("id", spaceId)
      .single();

    if (checkError || !spaceCheck) {
      return { data: null, error: new Error("Space not found") };
    }

    if (spaceCheck.ownerid !== userId) {
      return { data: null, error: new Error("Unauthorized: You can only edit your own spaces") };
    }

    const { data, error } = await supabase
      .from("spaces")
      .update({
        name: spaceData.name,
        location: spaceData.location,
        capacity: spaceData.capacity,
        description: spaceData.description,
        pph: spaceData.pph,
        updated_at: new Date().toISOString(),
      })
      .eq("id", spaceId)
      .select();

    if (error) {
      console.error("Error updating space:", error);
      return { data: null, error };
    }

    return { data: data[0], error: null };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { data: null, error: error instanceof Error ? error : new Error("Unknown error occurred") };
  }
}
const uploadFile = async({filePath, fileData, fileType}:{filePath:string, fileData:string, fileType:string}) => {
  const { data, error } = await supabase
  .storage
  .from("spaces")
  .upload(filePath, fileData, {
      contentType: fileType || "application/octet-stream"
  });

  if (error) {
    console.error("Upload error:", error);
    return null;
  }

  console.log("File uploaded:", data);

  const { data: publicUrlData } = supabase.storage
  .from("spaces")
  .getPublicUrl(filePath);

  console.log("Public URL:", publicUrlData.publicUrl);

  return publicUrlData.publicUrl;
}

export const getImagefromId = async (spaceId:string)=>
{
    const {data, error} = await supabase.from("spaces_images").select("link").eq("spaceid", spaceId);
    console.log("Link fetch data: ",data);

    if(error){console.log("Link fetch error: ",error?.message)}
    return {data, error};
} 

export const getSpaceFromId = async (spaceId:string)=>
{
    const {data, error} = await supabase.from("spaces").select("*").eq("id",spaceId).single();
    const spaceImage = await getImagefromId(spaceId);

    return {data, error, spaceImage};
}

export const getSpaces = async () => {
  const { data, error } = await supabase
    .from('spaces')
    .select('*, spaces-images(link)')
  return { data, error };
}

export const getMySpaces = async (userId:string) => {
  const { data, error } = await supabase
    .from('spaces')
    .select('*, spaces-images(link)')
    .eq('ownerid', userId)
    return { data, error };
}

export const getSpaceById = async (spaceId: string) => {
  const { data, error } = await supabase
    .from('spaces')
    .select('*, spaces-images(link)')
    .eq('id', spaceId)
    .single();

  type SpaceWithImages = Space & { 'spaces-images'?: { link: string }[]; images?: string[] };

  let spaceData = data as SpaceWithImages | null;
  if (spaceData && Array.isArray(spaceData['spaces-images'])) {
    spaceData.images = spaceData['spaces-images'].map((img) => img.link);
  }
  return { data: spaceData, error };
}