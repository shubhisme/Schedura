import type { Space,UserProfile } from "@/types/database.type";
import { supabase } from "../supabase"
import { use } from "react";

export const sendBookRequest = async(space_id:string, start_date: string , end_date:string, user_id:string, reason:string)=>{
    const {error} =await supabase.from("requests").insert({spaceid: space_id , start: start_date , end: end_date , approved:false, created_by:user_id, reason:reason});

    if(error){console.log("Error Inserting in Requests table: ",error); throw error;}

    return{success: true}
}

export const getRequestsForSpace = async (space_id: string) => {
    const { data, error } = await supabase
        .from("requests")
        .select("*, users:created_by(*), space:spaceid(name)")
        .eq("spaceid", space_id)
        .order("created_at", { ascending: false });

    if (error) {
        console.log("Error Fetching Requests for space: ", error);
        throw error;
    }
    return {
        data: data as (UserProfile & { id: string; users: UserProfile; space: { name: string } })[] | null,
        error
    };
}