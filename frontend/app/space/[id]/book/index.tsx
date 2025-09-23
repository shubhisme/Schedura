import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getSpaceById } from "@/supabase/controllers/spaces.controller";
//@ts-ignore
import { useLocalSearchParams, useRouter } from 'expo-router';
import {Calendar} from 'react-native-calendars';
import SafeBoundingView from "@/components/SafeBoundingView";
import dayjs from "dayjs"; 
import { sendBookRequest } from "@/supabase/controllers/request.controller";
import { useUser } from "@clerk/clerk-expo";
import { getBookingsForSpaceByMonthYear } from "@/supabase/controllers/booking.controller";

export default function HallBooking() {
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(false)
  const [calendarLoading, setCalendarLoading] = useState(false) 
  const [functionalLoading, setFunctionalLoading] = useState(false) 
  const [markedDates, setMarkedDates] = useState({});
  const [bookedDates, setBookedDates] = useState({});
  const { back } = useRouter();
  const [reason, setReason] = useState('');
  const [range, setRange] = useState<{ startDate?: string; endDate?: string }>({});
  const { user } = useUser();
  const [space, setSpace] = useState<any>();

  const fetchSpace = async () => {
    try {
      setLoading(true);
      const { data, error } = await getSpaceById(id as string);
      if (error) {
        console.error("Error fetching spaces:", error);
      } else {
        setSpace(data);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error in fetchSpaces:", error);
    }
  };

  const fetchBookingsForMonth = async (month: number, year: number) => {
    if(!space) return;
    setCalendarLoading(true);
    const {data, error} = await getBookingsForSpaceByMonthYear(space.id, month, year);
    if(error) {
      console.log("Error fetching bookings for month: ", error);
      return;
    }
    if(data) {
      const blockedDates: any = {};
      data.forEach((booking: any) => {
        let current = dayjs(booking.start_date);
        const end = dayjs(booking.end_date);
        while (current.isBefore(end) || current.isSame(end)) {
          const dateStr = current.format("YYYY-MM-DD");
          blockedDates[dateStr] = { disabled: true, disableTouchEvent: true, marked: true, dotColor: 'red' };
          current = current.add(1, "day");
        }
      });
      setBookedDates(blockedDates);
    }
    setCalendarLoading(false);
  }
  
  useEffect(() => {
    fetchSpace();
  }, []);

  useEffect(() => {
    fetchBookingsForMonth(dayjs().month() + 1, dayjs().year());
  }, [space]);
  
  const markDate = (date: string) => {
  let { startDate, endDate } = range;

  if (!startDate || (startDate && endDate)) {
    setRange({ startDate: date, endDate: undefined });
    setMarkedDates({
      [date]: { startingDay: true, endingDay: true, color: "black", textColor: "white" },
    });
    return;
  }

  if (dayjs(date).isAfter(dayjs(startDate))) {
    endDate = date;
    setRange({ startDate, endDate });

    const rangeObj: any = {};
    let current = dayjs(startDate);
    while (current.isBefore(dayjs(endDate)) || current.isSame(dayjs(endDate))) {
      const dateStr = current.format("YYYY-MM-DD");
      if (dateStr === startDate) {
        rangeObj[dateStr] = { startingDay: true, color: "black", textColor: "white" };
      } else if (dateStr === endDate) {
        rangeObj[dateStr] = { endingDay: true, color: "black", textColor: "white" };
      } else {
        rangeObj[dateStr] = { color: "black", textColor: "white" };
      }
      current = current.add(1, "day");
    }
    setMarkedDates(rangeObj);
  } else {
    setRange({ startDate: date, endDate: undefined });
    setMarkedDates({
      [date]: { startingDay: true, endingDay: true, color: "black", textColor: "white" },
    });
  }
};


  const sendBookingRequest = async() => {
    if (range.startDate && user) {
      setFunctionalLoading(true);
      const status = await sendBookRequest(space.id, range.startDate, range.endDate || range.startDate, user.id, reason);
      setFunctionalLoading(false);
      if(status.success){
        alert("Booking Request Sent Successfully");
      }
    }
  };

  if (loading || !space) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <StatusBar barStyle="dark-content" backgroundColor="#E9F0E9" />
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-600">Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }
  return (
    <SafeBoundingView className="flex-1 bg-tertiary">
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <ScrollView className="flex-1 relative" showsVerticalScrollIndicator={false}>
          <View className=" bg-tertiary flex-row justify-between items-center px-6 z-10 h-14">
            <TouchableOpacity 
                onPress={() => back()}
                className="bg-black/30 rounded-full p-3">
              <Ionicons name="arrow-back" size={15} color="white" />
            </TouchableOpacity>
          </View>
        <View className="bg-tertiary rounded-t-3xl -mt-6 relative ">

          <View className="p-6 pb-4">
            <View className="flex-row justify-between items-start mb-4">
              <View className="flex-1">
                <Text className="text-3xl font-bold text-gray-900 mb-2">{space.name}</Text>
                
              </View>
              
              <View className="bg-green-100 rounded-2xl px-4 py-2">
                <Text className="text-green-800 font-semibold">Available</Text>
              </View>
            </View>
            <View className="flex-row items-center mb-4">
              <View className="flex-row items-center bg-yellow-100 rounded-full px-3 py-1 mr-3">
                <Ionicons name="star" size={16} color="#F59E0B" />
                <Text className="text-yellow-800 font-semibold ml-1">4.8</Text>
              </View>
              <Text className="text-gray-600">Based on 124 reviews</Text>
            </View>
            <Calendar
                style={{ borderRadius: 16, overflow: 'hidden' }}
                onDayPress={day => {
                    markDate(day.dateString);
                }}
                onMonthChange={(month) => fetchBookingsForMonth(month.month, month.year)}
                markingType={'period'}
                markedDates={{...markedDates, ...bookedDates}}
                enableSwipeMonths={true}
                displayLoadingIndicator={calendarLoading}
                disableAllTouchEventsForDisabledDays={true}
                disabledByDefault={calendarLoading}
            />
          </View>
        </View>
        <View className="px-6">
          <Text className='mb-1 font-semibold text-xl'>Reason</Text>
          <TextInput
            placeholder="Reason for booking"
            value={reason}
            onChangeText={setReason}
            multiline
            numberOfLines={50}
            className="p-4 rounded-xl border-2 border-black h-40"
            textAlignVertical='top'
          />
        </View>
      </ScrollView>

      <View className="bg-white border-t border-gray-200 px-6 py-4">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold text-gray-900">₹{space.pph * Object.keys(markedDates).length}</Text>
            <Text className="text-gray-600">₹{space.pph} per day</Text>
          </View>
          <TouchableOpacity disabled={functionalLoading} onPress={sendBookingRequest} className="bg-gray-900 rounded-2xl px-8 py-3">
            <Text className="text-white font-semibold text-lg">Request Booking</Text>
          </TouchableOpacity>
        </View>
      </View>
      
    </SafeBoundingView>
  );
}