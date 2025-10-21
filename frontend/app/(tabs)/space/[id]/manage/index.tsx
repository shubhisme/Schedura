"use client";
import { Dimensions, Text, ScrollView, View, TouchableOpacity, Modal } from 'react-native';
import { LineChart } from "react-native-chart-kit";
import { getBookingOfSpace } from '@/supabase/controllers/analytics';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import Totalbookings from '@/components/Analytics/Totalbookings';
import Daysofweek from '@/components/Analytics/Daysofweek';

interface DataPointInfo {
  month: string;
  value: number;
  index: number;
  x: number;
  y: number;
}

export default function MangeSpaceScreen() {
  const { id } = useLocalSearchParams();

  const [labels, setLabels] = useState<string[]>([]);
  const [dataSet, setDataSet] = useState<number[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<DataPointInfo | null>(null);
  const [showModal, setShowModal] = useState(false);

  const months_map: Record<string, string> = {
    "01": "Jan", "02": "Feb", "03": "Mar", "04": "Apr",
    "05": "May", "06": "Jun", "07": "Jul", "08": "Aug",
    "09": "Sep", "10": "Oct", "11": "Nov", "12": "Dec"
  };

  const months_full: Record<string, string> = {
    "Jan": "January", "Feb": "February", "Mar": "March", "Apr": "April",
    "May": "May", "Jun": "June", "Jul": "July", "Aug": "August",
    "Sep": "September", "Oct": "October", "Nov": "November", "Dec": "December"
  };

  useEffect(() => {
    handleAnalyticsData();
  }, [id]);

  async function handleAnalyticsData() {
    try {
      const { data } = await getBookingOfSpace(id as string);
      if (!data || !Array.isArray(data)) return;

      const start_month_map = new Map<string, number>();

      data.forEach(ele => {
        if (!ele?.start) return;
        
        try {
          const start_date = new Date(ele.start);
          if (isNaN(start_date.getTime())) return;
          
          const month = start_date.toISOString().slice(5, 7);
          start_month_map.set(month, (start_month_map.get(month) || 0) + 1);
        } catch (err) {
          console.log("Invalid date:", ele.start);
        }
      });

      // Sort months chronologically
      const sortedEntries = Array.from(start_month_map.entries()).sort((a, b) => 
        a[0].localeCompare(b[0])
      );

      const labelsArr: string[] = [];
      const valuesArr: number[] = [];

      sortedEntries.forEach(([month, count]) => {
        if (months_map[month]) {
          labelsArr.push(months_map[month]);
          valuesArr.push(Number(count) || 0);
        }
      });

      setLabels(labelsArr);
      setDataSet(valuesArr);

      console.log("Monthly booking data:", { labelsArr, valuesArr });

    } catch (error) {
      console.log("Error fetching booking data:", error);
    }
  }

  const handleDataPointClick = (data: any) => {
    const { value, index } = data;
    const month = labels[index];
    
    setSelectedPoint({
      month,
      value,
      index,
      x: data.x,
      y: data.y
    });
    setShowModal(true);
  };

  const calculateGrowth = (index: number) => {
    if (index === 0) return null;
    const current = dataSet[index];
    const previous = dataSet[index - 1];
    const growth = ((current - previous) / previous) * 100;
    return growth;
  };

  return (
    <ScrollView className='w-full'>
      <Totalbookings/>

      {dataSet.length > 0 && (
        <View className='bg-transparent px-4'>
          <Text className='font-semibold text-center text-xl mt-4'>Month On Month Growth</Text>
          <Text className='text-center text-sm mb-2 text-gray-800'>
            Shows the monthly growth of booked spaces. Tap any point for details.
          </Text>

          {/* Inline Data Point Display */}
          {selectedPoint && !showModal && (
            <View className='bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3'>
              <Text className='text-sm font-semibold text-blue-900'>
                {months_full[selectedPoint.month] || selectedPoint.month}
              </Text>
              <Text className='text-2xl font-bold text-blue-600'>
                {selectedPoint.value} bookings
              </Text>
            </View>
          )}

          <LineChart
            data={{
              labels: labels,
              datasets: [{ data: dataSet.length > 0 ? dataSet : [0] }],
            }}
            width={Dimensions.get("window").width - 32}
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
                r: "8",
                strokeWidth: "2",
                stroke: "#ffa726",
                fill: "#fff"
              }
            }}
            fromZero={true}
            bezier
            style={{
              marginVertical: 8,
              borderRadius: 8
            }}
            onDataPointClick={handleDataPointClick}
          />

          {/* Summary Stats Below Chart */}
          {dataSet.length > 0 && (
            <View className='flex-row justify-around bg-gray-50 rounded-lg p-4 mt-2'>
              <View className='items-center'>
                <Text className='text-xs text-gray-600'>Total</Text>
                <Text className='text-lg font-bold text-gray-900'>
                  {dataSet.reduce((a, b) => a + b, 0)}
                </Text>
              </View>
              <View className='items-center'>
                <Text className='text-xs text-gray-600'>Average</Text>
                <Text className='text-lg font-bold text-gray-900'>
                  {Math.round(dataSet.reduce((a, b) => a + b, 0) / dataSet.length)}
                </Text>
              </View>
              <View className='items-center'>
                <Text className='text-xs text-gray-600'>Peak</Text>
                <Text className='text-lg font-bold text-gray-900'>
                  {Math.max(...dataSet)}
                </Text>
              </View>
            </View>
          )}
        </View>
      )}

      {/* Modal for Detailed View */}
      <Modal
        visible={showModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <TouchableOpacity 
          activeOpacity={1}
          onPress={() => setShowModal(false)}
          className='flex-1 justify-center items-center bg-black/50'
        >
          <TouchableOpacity 
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            className='bg-white rounded-2xl p-6 mx-6 w-80 shadow-lg'
          >
            {selectedPoint && (
              <>
                <View className='items-center mb-4'>
                  <Text className='text-gray-500 text-sm'>
                    {months_full[selectedPoint.month] || selectedPoint.month}
                  </Text>
                  <Text className='text-4xl font-bold text-gray-600 mt-1'>
                    {selectedPoint.value}
                  </Text>
                  <Text className='text-gray-600 text-sm'>bookings</Text>
                </View>

                <View className='border-t border-gray-200 pt-4 gap-y-3'>
                  {/* Growth Rate */}
                  {selectedPoint.index > 0 && (
                    <View className='flex-row justify-between items-center'>
                      <Text className='text-gray-600'>Growth Rate</Text>
                      <View className='flex-row items-center'>
                        {(() => {
                          const growth = calculateGrowth(selectedPoint.index);
                          if (growth === null) return null;
                          const isPositive = growth >= 0;
                          return (
                            <>
                              <Text className={`font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                                {isPositive ? '+' : ''}{growth.toFixed(1)}%
                              </Text>
                              <Text className='ml-1'>{isPositive ? '📈' : '📉'}</Text>
                            </>
                          );
                        })()}
                      </View>
                    </View>
                  )}

                  {/* Comparison with Average */}
                  <View className='flex-row justify-between items-center'>
                    <Text className='text-gray-600'>vs. Average</Text>
                    <Text className='font-semibold text-gray-900'>
                      {selectedPoint.value > (dataSet.reduce((a, b) => a + b, 0) / dataSet.length) 
                        ? 'Above ⭐' 
                        : 'Below'}
                    </Text>
                  </View>

                  {/* Position */}
                  <View className='flex-row justify-between items-center'>
                    <Text className='text-gray-600'>Ranking</Text>
                    <Text className='font-semibold text-gray-900'>
                      {dataSet
                        .map((val, idx) => ({ val, idx }))
                        .sort((a, b) => b.val - a.val)
                        .findIndex(item => item.idx === selectedPoint.index) + 1} of {dataSet.length}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() => setShowModal(false)}
                  className='bg-gray-600 rounded-lg py-3 mt-6'
                >
                  <Text className='text-white text-center font-semibold'>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <Daysofweek/>
    </ScrollView>
  );
}