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
import { useTheme } from '@/contexts/ThemeContext';

export default function HallBooking() {
  const { colors, isDark } = useTheme();
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
        let current = dayjs(booking.start);
        console.log(booking.start)
        const end = dayjs(booking.end);
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
  }, [id]);


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
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.card} />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: colors.textSecondary }}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }
  return (
    <SafeBoundingView style={{ flex: 1, backgroundColor: colors.backgroundSecondary }}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <ScrollView style={{ flex: 1, position: 'relative' }} showsVerticalScrollIndicator={false}>
          <View style={{ backgroundColor: colors.backgroundSecondary, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, zIndex: 10, height: 56 }}>
            <TouchableOpacity 
                onPress={() => back()}
                style={{ backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 24, padding: 12 }}>
              <Ionicons name="arrow-back" size={15} color="white" />
            </TouchableOpacity>
          </View>
        <View style={{ backgroundColor: colors.backgroundSecondary, borderTopLeftRadius: 24, borderTopRightRadius: 24, marginTop: -24, position: 'relative' }}>

          <View style={{ padding: 24, paddingBottom: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 30, fontWeight: 'bold', color: colors.text, marginBottom: 8 }}>{space.name}</Text>
                
              </View>
              
              <View style={{ backgroundColor: colors.success + '20', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 8 }}>
                <Text style={{ color: colors.success, fontWeight: '600' }}>Available</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF3C7', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4, marginRight: 12 }}>
                <Ionicons name="star" size={16} color="#F59E0B" />
                <Text style={{ color: '#92400E', fontWeight: '600', marginLeft: 4 }}>4.8</Text>
              </View>
              <Text style={{ color: colors.textSecondary }}>Based on 124 reviews</Text>
            </View>
            <Calendar
                style={{ borderRadius: 16, overflow: 'hidden' }}
                theme={{
                  backgroundColor: colors.card,
                  calendarBackground: colors.card,
                  textSectionTitleColor: colors.textSecondary,
                  selectedDayBackgroundColor: colors.accent,
                  selectedDayTextColor: '#ffffff',
                  todayTextColor: colors.link,
                  dayTextColor: colors.text,
                  textDisabledColor: colors.textSecondary,
                  monthTextColor: colors.text,
                  textMonthFontWeight: 'bold',
                  arrowColor: colors.accent,
                }}
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
        <View style={{ paddingHorizontal: 24 }}>
          <Text style={{ marginBottom: 4, fontWeight: '600', fontSize: 20, color: colors.text }}>Reason</Text>
          <TextInput
            placeholder="Reason for booking"
            placeholderTextColor={colors.textSecondary}
            value={reason}
            onChangeText={setReason}
            multiline
            numberOfLines={50}
            style={{ padding: 16, borderRadius: 12, borderWidth: 2, borderColor: colors.border, height: 160, backgroundColor: colors.card, color: colors.text }}
            textAlignVertical='top'
          />
        </View>
      </ScrollView>

      <View style={{ backgroundColor: colors.card, borderTopWidth: 1, borderTopColor: colors.border, paddingHorizontal: 24, paddingVertical: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.text }}>₹{space.pph * Object.keys(markedDates).length}</Text>
            <Text style={{ color: colors.textSecondary }}>₹{space.pph} per day</Text>
          </View>
          <TouchableOpacity disabled={functionalLoading} onPress={sendBookingRequest} style={{ backgroundColor: colors.accent, borderRadius: 16, paddingHorizontal: 32, paddingVertical: 12 }}>
            <Text style={{ color: 'white', fontWeight: '600', fontSize: 18 }}>Request Booking</Text>
          </TouchableOpacity>
        </View>
      </View>
      
    </SafeBoundingView>
  );
}