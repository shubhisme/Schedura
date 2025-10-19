"use client";
import { Dimensions, Text, ScrollView } from 'react-native';
import { LineChart } from "react-native-chart-kit";
import { getBookingOfSpace } from '@/supabase/controllers/analytics';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import Totalbookings from '@/components/Analytics/Totalbookings';
import Daysofweek from '@/components/Analytics/Daysofweek';

export default function MangeSpaceScreen() {
  const { id } = useLocalSearchParams();

  const [labels, setLabels] = useState<string[]>([]);
  const [dataSet, setDataSet] = useState<number[]>([]);

  const months_map: Record<string, string> = {
    "01": "Jan", "02": "Feb", "03": "Mar", "04": "Apr",
    "05": "May", "06": "Jun", "07": "Jul", "08": "Aug",
    "09": "Sep", "10": "Oct", "11": "Nov", "12": "Dec"
  };

  useEffect(() => {
    handleAnalyticsData();
  }, [id]);

  async function handleAnalyticsData() {
    try {
      const { data } = await getBookingOfSpace(id as string);
      if (!data) return;

      const start_month_map = new Map<string, number>();

      data.forEach(ele => {
        const start_date = new Date(ele?.start);
        const month = start_date.toISOString().slice(5, 7); // safer than locale slice
        start_month_map.set(month, (start_month_map.get(month) || 0) + 1);
      });

      const labelsArr: string[] = [];
      const valuesArr: number[] = [];

      start_month_map.forEach((count, key) => {
        if (months_map[key]) {
          labelsArr.push(months_map[key]);
          valuesArr.push(count);
        }
      });

      setLabels(labelsArr);
      setDataSet(valuesArr);

    } catch (error) {
      console.log("Error fetching booking data:", error);
    }
  }

  return (
    <ScrollView className='w-full'>
        <Totalbookings/>
        <ScrollView className='bg-transparent'>
        <Text className='font-semibold text-center text-2xl'>Month On Month Growth</Text>
        <Text className='text-center text-sm mb-2 text-gray-800'>Shows the monthly growth of booked spaces.</Text>

        {dataSet.length > 0 ? (
            <LineChart
            data={{
                labels: labels,
                datasets: [{ data: dataSet }],
            }}
            width={Dimensions.get("window").width}
            height={280}
            yAxisInterval={1}
            chartConfig={{
                backgroundColor: "#f7f7f7",
                backgroundGradientFromOpacity: 0,
                backgroundGradientToOpacity: 0,
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(60, 60, 60, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(60, 60, 60, ${opacity})`,
                propsForDots: {
                r: "5",
                strokeWidth: "2",
                stroke: "#ffa726"
                }
            }}
            fromZero={true}
            bezier
            style={{
                marginVertical: 8,
                borderRadius: 8
            }}

            />
        ) : (
            <Text className='text-center text-gray-500'>Loading chart data...</Text>
        )}
        </ScrollView>
        <Daysofweek/>
    </ScrollView>
  );
}
