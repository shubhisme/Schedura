"use client";
import { getBookingOfSpace } from '@/supabase/controllers/analytics';
import { useLocalSearchParams } from 'expo-router'
import { useEffect, useState } from 'react'
import { Text, View , Dimensions } from 'react-native';
import { BarChart } from 'react-native-chart-kit';

function Daysofweek() {
    const {id} = useLocalSearchParams();
    const [dayscount , setDayscount] = useState<number[]>([]);

    const maxValue = Math.max(...dayscount, 1); 
const roundedMax = Math.ceil(maxValue); 

const safeSegments = roundedMax > 0 ? roundedMax : 1;


    const Xdays = ["Mon" , "Tue", "Wed" , "Thu" ,"Fri", "Sat", "Sun" ]

    const data = {
        labels: Xdays,
        datasets: [
            {
            data: dayscount
            }
        ]
    };

const chartConfig = {
  backgroundGradientFrom: "#000000",
  backgroundGradientFromOpacity: 1,
  backgroundGradientTo: "#ffffff",
  backgroundGradientToOpacity: 0.5,
  color: (opacity = 1) => `rgba(60, 60, 60, ${opacity})`,
  strokeWidth: 2, // optional, default 3
  barPercentage: 0.5,
  decimalPlaces:0
//   useShadowColorFromDataset: false // optional
};

const graphStyle = {
      marginVertical: 8,
      borderRadius: 16
    }

const screenWidth = Dimensions.get("window").width;

    useEffect(()=>{
        if(!id){console.log("no space found in params: ")}

        handelData();
    },[id])

    const handelData = async()=>{
        try{
            const {data , error} = await getBookingOfSpace(id as string);
            if(error || !data){
                console.log("no data found after fetch");
                return;
            }

            const weekdayCnt = new Array(7).fill(0);
            data.forEach(b =>{
                console.log(b.start);
                const day = new Date(b.start).getDay();
                console.log("day is : ",day);
                weekdayCnt[day]++;
            })
            console.log("weekend counts: ",weekdayCnt); 

            setDayscount(weekdayCnt);



        }catch(error){
            console.log("Error fetching booking data:", error);
        }
    }

  return (
    <>
        <View>
            <Text className='font-semibold text-center text-2xl'>Bookings By Day Of Week</Text>
            <Text className='text-center text-sm mb-2 text-gray-800'>Find which day is most booked.</Text>
            <BarChart
                yAxisSuffix=''
                style={graphStyle}
                data={data}
                width={screenWidth}
                height={220}
                yAxisLabel=""
                chartConfig={chartConfig}
                fromZero= {true}
                segments={roundedMax} 
                // verticalLabelRotation={30}
            />
        </View>
    </>
  )
}

export default Daysofweek