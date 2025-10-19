import { getBookingOfSpace } from '@/supabase/controllers/analytics';
import { useLocalSearchParams } from 'expo-router'
import { useEffect, useState } from 'react'
import { Text, View , Dimensions } from 'react-native';
import { BarChart } from 'react-native-chart-kit';

function Daysofweek() {
  const { id } = useLocalSearchParams();
  const [dayscount, setDayscount] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);
  
  const maxValue = Math.max(...dayscount, 1);
  const roundedMax = Math.ceil(maxValue);
  const safeSegments = roundedMax > 0 ? roundedMax : 1;
  
  const Xdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  
  const data = {
    labels: Xdays,
    datasets: [
      {
        data: dayscount.length > 0 ? dayscount : [0, 0, 0, 0, 0, 0, 0]
      }
    ]
  };
  
  const chartConfig = {
    backgroundGradientFrom: "#000000",
    backgroundGradientFromOpacity: 1,
    backgroundGradientTo: "#ffffff",
    backgroundGradientToOpacity: 0.5,
    color: (opacity = 1) => `rgba(60, 60, 60, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    decimalPlaces: 0
  };
  
  const graphStyle = {
    marginVertical: 8,
    borderRadius: 16
  };
  
  const screenWidth = Dimensions.get("window").width;
  
  const handleData = async () => {
    try {
      const { data, error } = await getBookingOfSpace(id as string);
      if (error || !data) {
        console.log("no data found after fetch");
        return;
      }
      
      // Initialize array with 7 zeros (Mon-Sun)
      const weekdayCnt = new Array(7).fill(0);
      
      data.forEach(b => {
        console.log(b.start);
        const day = new Date(b.start).getDay();
        console.log("day is: ", day);
        
        // Convert Sunday (0) to index 6, and shift other days back by 1
        // getDay(): 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
        // Array index: 0=Mon, 1=Tue, 2=Wed, 3=Thu, 4=Fri, 5=Sat, 6=Sun
        const adjustedDay = day === 0 ? 6 : day - 1;
        weekdayCnt[adjustedDay]++;
      });
      
      console.log("weekend counts: ", weekdayCnt);
      setDayscount(weekdayCnt);
    } catch (error) {
      console.log("Error fetching booking data:", error);
    }
  };
  
  useEffect(() => {
    if (!id) {
      console.log("no space found in params");
      return;
    }
    handleData();
  }, [id]);
  
  return (
    <View>
      <Text className='font-semibold text-center text-2xl'>
        Bookings By Day Of Week
      </Text>
      <Text className='text-center text-sm mb-2 text-gray-800'>
        Find which day is most booked.
      </Text>
      <BarChart
        yAxisSuffix=''
        style={graphStyle}
        data={data}
        width={screenWidth}
        height={220}
        yAxisLabel=""
        chartConfig={chartConfig}
        fromZero={true}
        segments={safeSegments}
      />
    </View>
  );
}

export default Daysofweek;