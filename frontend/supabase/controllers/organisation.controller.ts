import type { Organisation } from "@/types/database.type";
import { supabase } from "../supabase"

export const joinOrganisation = async (userId: string, organisationId: string) => {
    const { error } = await supabase
      .from("user_organisations")
      .insert([{ user_id: userId, organisation_id: organisationId }]);
  
    if (error) throw error;
    return { success: true };
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
  