import { getBookingOfSpace } from '@/supabase/controllers/analytics';
import { useLocalSearchParams } from 'expo-router'
import React, { useEffect } from 'react'
import { Dimensions, View } from 'react-native'
import { BarChart } from 'react-native-chart-kit';

function Daysofweek() {
    const {id} = useLocalSearchParams();

    const data = {
  labels: ["January", "February", "March", "April", "May", "June"],
  datasets: [
    {
      data: [20, 45, 28, 80, 99, 43]
    }
  ]
};

const chartConfig = {
  backgroundGradientFrom: "#1E2923",
  backgroundGradientFromOpacity: 0,
  backgroundGradientTo: "#08130D",
  backgroundGradientToOpacity: 0.5,
  color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
  strokeWidth: 2, // optional, default 3
  barPercentage: 0.5,
  useShadowColorFromDataset: false // optional
};

const graphStyle = {
      marginVertical: 8,
      borderRadius: 16
    }

const screenWidth = Dimensions.get("window").width;

    useEffect(()=>{
        if(!id){console.log("no space found in params: ")}

        // handelData();
    })

    // const handelData = async()=>{
    //     try{
        
    //         const {data , error} = await getBookingOfSpace();
    //         if(error || !data){
    //             console.log("no data found after fetch");
    //             return;
    //         }



    //     }catch(error){

    //     }
    // }

  return (
    <>
        <View>
            <BarChart
                yAxisSuffix='Y'
                style={graphStyle}
                data={data}
                width={screenWidth}
                height={220}
                yAxisLabel="$"
                chartConfig={chartConfig}
                verticalLabelRotation={30}
                />
        </View>
    </>
  )
}

export default Daysofweek