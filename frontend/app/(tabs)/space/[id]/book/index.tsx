import React, { useState, useEffect, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getSpaceById } from "@/supabase/controllers/spaces.controller";
//@ts-ignore
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Calendar } from 'react-native-calendars';
import SafeBoundingView from "@/components/SafeBoundingView";
import dayjs from "dayjs"; 
import { sendBookRequest } from "@/supabase/controllers/request.controller";
import { useUser } from "@clerk/clerk-expo";
import { getBookingsForSpaceByMonthYear } from "@/supabase/controllers/booking.controller";
import { useTheme } from '@/contexts/ThemeContext';
import { getUserRole, isUserInOrganization } from "@/supabase/controllers/user_role.controller";
import { getRole } from "@/supabase/controllers/roles.controller";
import { useFocusEffect } from "@react-navigation/native";

export default function HallBooking() {
  const { colors, isDark } = useTheme();
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(false)
  const [calendarLoading, setCalendarLoading] = useState(false) 
  const [functionalLoading, setFunctionalLoading] = useState(false) 
  const [markedDates, setMarkedDates] = useState({});
  const [bookedDates, setBookedDates] = useState({});
  const { back, navigate } = useRouter();
  const [reason, setReason] = useState('');
  const [range, setRange] = useState<{ startDate?: string; endDate?: string }>({});
  const { user } = useUser();
  const [space, setSpace] = useState<any>();
  const [canBook, setCanBook] = useState<boolean>(false);
  const [privilegeChecked, setPrivilegeChecked] = useState<boolean>(false);
  const [privilegeMessage, setPrivilegeMessage] = useState<string>("");

  // 🔹 Disable all past dates
  const getDisabledPastDates = () => {
    const today = dayjs().startOf("day");
    const disabled: any = {};
    for (let i = 0; i < 365; i++) {
      const date = today.subtract(i + 1, "day").format("YYYY-MM-DD");
      disabled[date] = { disabled: true, disableTouchEvent: true };
    }
    return disabled;
  };

  const [pastDisabledDates] = useState(getDisabledPastDates());

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
  
  const checkBookingPrivilege = async (space: any, user: any) => {
    // If no organization, allow booking
    if (!space.organizationid) {
      setCanBook(true);
      setPrivilegeChecked(true);
      return;
    }
    // If no user, disallow
    if (!user) {
      setCanBook(false);
      setPrivilegeChecked(true);
      setPrivilegeMessage("You must be logged in to request a booking.");
      return;
    }
    // Check if user is in organization
    const isMember = await isUserInOrganization(user.id, space.organizationid);
    if (!isMember) {
      setCanBook(false);
      setPrivilegeChecked(true);
      setPrivilegeMessage("You are not a member of this organization.");
      return;
    }
    // Get user role
    const userRole = await getUserRole(user.id);
    if (!userRole || !userRole.role) {
      setCanBook(false);
      setPrivilegeChecked(true);
      setPrivilegeMessage("No role assigned. Contact your organization admin.");
      return;
    }
    // Get role privileges
    const role = await getRole(userRole.role);
  
    if (!role || typeof role.id !== "number") {
      setCanBook(false);
      setPrivilegeChecked(true);
      setPrivilegeMessage("Role not found. Contact your organization admin.");
      return;
    }
    if (role.priviledges >= 2) {
      setCanBook(true);
      setPrivilegeChecked(true);
    } else {
      setCanBook(false);
      setPrivilegeChecked(true);
      setPrivilegeMessage("You don't have enough privileges to request booking.");
    }
  };

  useEffect(() => {
    fetchSpace();
  }, [id]);

  useEffect(() => {
    fetchBookingsForMonth(dayjs().month(), dayjs().year());
  }, [space]);

  // use focus effect to re-check privileges when screen gains focus
  useFocusEffect(
    useCallback(() => {
      if (space && user) {
        checkBookingPrivilege(space, user);
      } else if (space && !space.organizationid) {
        setCanBook(true);
        setPrivilegeChecked(true);
      }
      // no cleanup needed
    }, [space, user])
  );
  
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
        navigate('/(info)/request/successful' as any);
      }
    }
  };

  if (loading || !space || !privilegeChecked) {
    return (
      <SafeAreaView className="flex-1">
        <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.card} />
        <View className="flex-1 items-center justify-center" style={{ backgroundColor: colors.background }}>
          <Text style={{ color: colors.textSecondary }}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show privilege message if not allowed
  if (!canBook) {
    return (
      <SafeBoundingView className="flex-1" style={{ backgroundColor: colors.backgroundSecondary }}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <View className="flex-1 items-center justify-center p-8">
          <Ionicons name="lock-closed" size={48} color={colors.error} style={{ marginBottom: 24 }} />
          <Text className="text-xl font-bold mb-3 text-center" style={{ color: colors.text }}>
            Booking Not Allowed
          </Text>
          <Text className="text-base text-center" style={{ color: colors.textSecondary }}>
            {privilegeMessage || "You do not have permission to request a booking for this space."}
          </Text>
        </View>
      </SafeBoundingView>
    );
  }

  return (
    <SafeBoundingView className="flex-1" style={{ backgroundColor: colors.backgroundSecondary }}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <ScrollView className="flex-1 relative" showsVerticalScrollIndicator={false}>
        <View
          className="flex-row justify-between items-center px-6 z-10 h-14"
          style={{ backgroundColor: colors.backgroundSecondary }}
        >
          <TouchableOpacity 
              onPress={() => back()}
              className="rounded-full p-3"
              style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
          >
            <Ionicons name="arrow-back" size={15} color="white" />
          </TouchableOpacity>
        </View>

        <View
          className="rounded-t-2xl -mt-6 relative"
          style={{ backgroundColor: colors.backgroundSecondary }}
        >
          <View className="p-6 pb-4">
            <View className="flex-row justify-between items-start mb-4">
              <View className="flex-1">
                <Text className="text-3xl font-bold mb-2" style={{ color: colors.text }}>{space.name}</Text>
              </View>
              
              <View className="rounded-lg px-4 py-2" style={{ backgroundColor: colors.success + '20' }}>
                <Text className="font-semibold" style={{ color: colors.success }}>Available</Text>
              </View>
            </View>

            <View className="flex-row items-center mb-4">
              <View className="flex-row items-center rounded-full px-3 py-1 mr-3" style={{ backgroundColor: '#FEF3C7' }}>
                <Ionicons name="star" size={16} color="#F59E0B" />
                <Text className="font-semibold ml-1" style={{ color: '#92400E' }}>4.8</Text>
              </View>
              <Text style={{ color: colors.textSecondary }}>Based on 124 reviews</Text>
            </View>

            <View className="rounded-lg overflow-hidden">
              <Calendar
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
                  onMonthChange={(month) => fetchBookingsForMonth(month.month-1, month.year)}
                  markingType={'period'}
                  markedDates={{ ...pastDisabledDates, ...markedDates, ...bookedDates }}
                  enableSwipeMonths={true}
                  displayLoadingIndicator={calendarLoading}
                  disableAllTouchEventsForDisabledDays={true}
              />
            </View>
          </View>
        </View>

        <View className="px-6">
          <Text className="mb-1 font-semibold text-lg" style={{ color: colors.text }}>Reason</Text>
          <TextInput
            placeholder="Reason for booking"
            placeholderTextColor={colors.textSecondary}
            value={reason}
            onChangeText={setReason}
            multiline
            numberOfLines={50}
            className="p-4 rounded-xl border-2 h-40"
            style={{ borderColor: colors.border, backgroundColor: colors.card, color: colors.text }}
            textAlignVertical='top'
          />
        </View>
      </ScrollView>

      <View className="border-t p-4 px-6" style={{ backgroundColor: colors.card, borderTopColor: colors.border }}>
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold" style={{ color: colors.text }}>₹{space.pph * Object.keys(markedDates).length}</Text>
            <Text style={{ color: colors.textSecondary }}>₹{space.pph} per day</Text>
          </View>
          <TouchableOpacity disabled={functionalLoading} onPress={sendBookingRequest} className="rounded-lg px-8 py-3" style={{ backgroundColor: colors.accent }}>
            <Text className="text-base font-semibold" style={{ color: 'white' }}>Request Booking</Text>
          </TouchableOpacity>
        </View>
      </View>
      
    </SafeBoundingView>
  );
}
