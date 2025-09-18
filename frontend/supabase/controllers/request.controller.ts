import type { Space,UserProfile } from "@/types/database.type";
import { supabase } from "../supabase"
import { use } from "react";

export const sendBookRequest = async(space_id:string , start_date: string , end_date:string, user_id:string)=>{
    const {error} =await supabase.from("requests").insert({spaceid: space_id , start: start_date , end: end_date , approved:false, created_by:user_id})

    if(error){console.log("Error Inserting in Requests table: ",error); throw error;}

    return{success: true}
}

// export const approveBookRequest= async()=>{
//     const {error} = await supabase.from("requests")
// }