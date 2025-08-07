import { supabase } from "../supabase"

export const updateUserInfo = async (user:any) => {
    console.log("UPDATING USERS")
    if (user) {
        const { id, primaryEmailAddress, fullName } = user
        try {
            const data = await supabase.from("users").insert({
                id,
                email:primaryEmailAddress.emailAddress,
                name:fullName,
            })
            return data.status
        }
        catch(error){
            
        }
    }
}