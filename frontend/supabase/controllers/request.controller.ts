import type { Space,UserProfile } from "@/types/database.type";
import { supabase } from "../supabase"

export const sendBookRequest = async(space_id:string , start_date: Date , end_date:Date, created_by:UserProfile)=>{
    const {error} =await supabase.from("requests").insert([{spaceid: space_id , start: start_date.toISOString() , end: end_date.toISOString(), approved:false, created_by:created_by.id}])

    if(error){console.log("Error Inserting in Requests table: ",error); throw error;}

    return{success: true}
}

// export const approveBookRequest= async()=>{
//     const {error} = await supabase.from("requests")
// }