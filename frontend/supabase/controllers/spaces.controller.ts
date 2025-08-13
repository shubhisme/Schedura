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
    .select(); // returns inserted rows
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