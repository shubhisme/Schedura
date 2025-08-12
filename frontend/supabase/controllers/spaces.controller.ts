import type { Space } from "@/types/database.type";
import { supabase } from "../supabase"

export async function createSpace(spaceData:Space) {
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

  if (error) {
    console.error("Error inserting space:", error);
    return { error };
  }

  return { data };
}
