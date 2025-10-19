import { getRequestpending, getTotalBookings } from '@/supabase/controllers/analytics';
import { useLocalSearchParams } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { View , Text } from 'react-native';

function Totalbookings() {

    const [total_value , setTotal_value] = useState<number>(0)
    const [total_pend , setTotal_pend] = useState<number>(0)

    const {id} = useLocalSearchParams();

    useEffect(()=>{
        if(!id){console.log("NO sapce id exists."); return;}

        handelTotalBookings();
    }, [id])

    const handelTotalBookings = async()=>{
        try{
            const { data: totalData, error: totalError } = await getTotalBookings(id as string);
            const { data: pendingData, error: pendingError } = await getRequestpending(id as string);

            if (totalError || pendingError) {
                console.log("error fetching Total Bookings...", totalError || pendingError);
                return;
            }

            if (totalData == null && pendingData == null) { return; }

            setTotal_value(totalData ?? 0);
            setTotal_pend(pendingData ?? 0);
            console.log("total:", totalData, "pending:", pendingData);

        }catch(error){
            console.log("error fetching Total Bookings...", error);
        }
    }

  return (
    <View className='flex flex-col justify-center space-y-3 w-[100%] p-4'>
        <View className='border rounded-xl w-[100%] px-3 py-2 mb-2'>
            <Text className='text-2xl text-center font-semibold'>Total Bookings</Text>

            <Text className='text-xs font-light text-center'>Total bookings for this space.</Text>

            <Text className={`text-3xl font-bold text-center`}>
            {total_value}
            </Text>
        </View>

        <View className='border rounded-xl w-[100%] px-3 py-2'>
            <Text className='text-2xl text-center font-semibold'>Pending Bookings</Text>

            <Text className='text-xs font-light text-center'>Pending Bookings for this space.</Text>

            <Text
            className="text-3xl font-bold text-center"
            style={{ color: total_pend > 0 ? 'red' : 'green' }}
            >
            {total_pend}
            </Text>
        </View>
    </View>

  )
}

export default Totalbookings