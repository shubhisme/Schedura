import type { Organisation } from "@/types/database.type";
import { supabase } from "../supabase"
import { uploadFile } from "./spaces.controller";

// Remove direct joining - now users must send requests
export const joinOrganisation = async (userId: string, organisationId: string, role: 'admin' | 'member' = 'member') => {
    const { error } = await supabase
      .from("user_organisations")
      .insert([{ user_id: userId, organisation_id: organisationId, role }]);
  
    if (error) throw error;
    return { success: true };
  };

export const checkUserMembership = async (userId: string, organisationId: string) => {
  const { data, error } = await supabase
    .from("user_organisations")
    .select("role")
    .eq("user_id", userId)
    .eq("organisation_id", organisationId)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "not found"
  return data;
};
  
  export const getUserOrganisations = async (userId: string) => {
    const { data, error } = await supabase
      .from("user_organisations")
      .select("organisation_id, organisations(*)")
      .eq("user_id", userId);
  
    if (error) throw error;
    return data;
  };
  
  export const leaveOrganisation = async (userId: string, organisationId: string) => {
    const { error } = await supabase
      .from("user_organisations")
      .delete()
      .eq("user_id", userId)
      .eq("organisation_id", organisationId);
  
    if (error) throw error;
    return { success: true };
  };
  
  export const createOrganisation = async (userId: string, organisationName: string, description: string, type: "Educational" | "CoWorking", file:{filePath:string, fileData:string, fileType:string}): Promise<{ data: Organisation | null; error: string | null }> => {
    
    let fileurl = null;
    if(file.filePath !== "" && file.fileData !== "" && file.fileType !== ""){
      fileurl = await uploadFile({...file, table: "organisations"});
    }
    const { data, error } = await supabase
      .from("organisations")
      .insert([{ ownerid: userId, name: organisationName, description, type, logo: fileurl }])
      .select()
      .single();
    console.log("createOrganisation", { data, error });

    if (!error && data?.id) {
      const { error: updateError } = await supabase
      .from("users")
      .update({ orgid: data.id })
      .eq("id", userId);

      if (updateError) {
      return { data: null, error: updateError.message };
      }
    }
    if (error) {
      return { data: null, error: error.message };
    }

    return { data, error: null };
  }

  export const searchOrganisations = async (query: string): Promise<{ data: Organisation[] | null; error: string | null }> => {
    const { data, error } = await supabase
      .from("organisations")
      .select("*")
      .ilike("name", `%${query}%`)
      .limit(10);
    console.log("searchOrganisations", { data, error });
    if (error) {
      return { data: null, error: error.message };
    }
    return { data, error: null };
  }

  export const getOrganisationById = async (organisationId: string): Promise<{ data: Organisation | null; error: string | null }> => {
    const { data, error } = await supabase
      .from("organisations")
      .select("*")
      .eq("id", organisationId)
      .single();
    console.log("getOrganisationById", { data, error });
    if (error) {
      return { data: null, error: error.message };
    }
    return { data, error: null };
  }

  // get Organisation by user id
  export const getOrganisationByUserId = async (userId: string): Promise<{ data: Organisation[] | null; error: string | null }> => {
    const { data, error } = await supabase
      .from("organisations")
      .select("*")
      .eq("ownerid", userId);
    console.log("getOrganisationByUserId", { data, error });
    if (error) {
      return { data: null, error: error.message };
    }
    return { data, error: null };
  }