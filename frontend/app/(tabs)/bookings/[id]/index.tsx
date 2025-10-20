import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, StatusBar, ActivityIndicator, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
//@ts-ignore
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useUser } from "@clerk/clerk-expo";
import SafeBoundingView from "@/components/SafeBoundingView";
import { useTheme } from "@/contexts/ThemeContext";
import dayjs from "dayjs";
import { supabase } from "@/supabase/supabase";
import OneUpi from 'one-react-native-upi'

interface Booking {
  id: string;
  space_id: string;
  user_id: string;
  start: string;
  end: string;
  payment_status: string;
  total_amount: number;
  reason?: string;
  created_at: string;
  spaces?: {
    name: string;
    location: string;
    pph: number;
    capacity: number;
    'spaces-images'?: Array<{ link: string }>;
  };
  users?: {
    name: string;
    email: string;
  };
  ownerInfo?: {
    name: string;
    email: string;
    upiId: string;
  };
}

export default function BookingDetailsScreen() {
  const { id } = useLocalSearchParams();
  const { back, navigate } = useRouter();
  const { user } = useUser();
  const { colors, isDark } = useTheme();
  
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookingDetails();
  }, [id]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          spaces (
            name,
            ownerid,
            location,
            pph,
            capacity,
            spaces-images (link)
          ),
          users (
            name,
            email
          )
        `)
        .eq('id', id)
        .single();
    
      if (error) {
        console.error("Error fetching booking:", error);
      } else {
        const ownerInfo = await supabase
          .from('users')
          .select('name, email, upiId')
          .eq('id', data.spaces.ownerid)
          .single();
        
        if (ownerInfo) {
          setBooking({...data, ownerInfo: ownerInfo.data});
        }
      }
    } catch (error) {
      console.error("Error in fetchBookingDetails:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleProceedToPayment = () => {
    if(booking && booking.ownerInfo){
        const config =  {
            upiId: booking?.ownerInfo?.upiId,
            name: booking?.users?.name,
            note: 'Payment for booking ' + booking.id,
            amount: ((booking.spaces?.pph || 0) * days).toString(),
        }
        OneUpi.initiate(
              config,
              onSuccess,
              onFailure)
    }
  };

    const onSuccess = (success:any) => {
      navigate('/(info)/payment/successful');
    }
    const onFailure = (error:any) => {
      navigate('/(info)/payment/unsuccessful');
    }

  const calculateDays = () => {
    if (!booking) return 0;
    const start = dayjs(booking.start);
    const end = dayjs(booking.end);
    return end.diff(start, 'day') + 1;
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'cancelled':
        return 'bg-red-500';
      case 'completed':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <SafeBoundingView style={{ flex: 1, backgroundColor: colors.background }}>
        <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={{ color: colors.text, fontSize: 18, marginTop: 16 }}>Loading booking details...</Text>
        </View>
      </SafeBoundingView>
    );
  }

  if (!booking) {
    return (
      <SafeBoundingView style={{ flex: 1, backgroundColor: colors.background }}>
        <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 }}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.textSecondary} />
          <Text style={{ color: colors.text, fontSize: 20, fontWeight: '600', marginTop: 16, textAlign: 'center' }}>
            Booking Not Found
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: 16, marginTop: 8, textAlign: 'center' }}>
            The booking you're looking for doesn't exist or has been removed.
          </Text>
          <TouchableOpacity onPress={back} style={{ marginTop: 24, backgroundColor: colors.accent, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 }}>
            <Text style={{ color: isDark ? '#000' : '#fff', fontWeight: '600' }}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeBoundingView>
    );
  }

  const days = calculateDays();

  return (
    <SafeBoundingView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
     

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
      

        <View style={{ paddingHorizontal: 24, paddingVertical: 24 }}>
          {/* Space Name & Status */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.text, fontSize: 24, fontWeight: 'bold', marginBottom: 8 }}>
                {booking.spaces?.name || 'Unknown Space'}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="location" size={16} color={colors.textSecondary} />
                <Text style={{ color: colors.textSecondary, marginLeft: 4 }}>
                  {booking.spaces?.location || 'Location not available'}
                </Text>
              </View>
            </View>
            
          </View>

          {/* Booking Info Card */}
          <View style={{ backgroundColor: colors.card, borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ color: colors.text, fontSize: 18, fontWeight: '600', marginBottom: 16 }}>Booking Information</Text>
            
            <View style={{ gap: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />
                  <Text style={{ color: colors.textSecondary, marginLeft: 8 }}>Check-in</Text>
                </View>
                <Text style={{ color: colors.text, fontWeight: '600' }}>
                  {dayjs(booking.start).format('MMM DD, YYYY')}
                </Text>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />
                  <Text style={{ color: colors.textSecondary, marginLeft: 8 }}>Check-out</Text>
                </View>
                <Text style={{ color: colors.text, fontWeight: '600' }}>
                  {dayjs(booking.end).format('MMM DD, YYYY')}
                </Text>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="time-outline" size={20} color={colors.textSecondary} />
                  <Text style={{ color: colors.textSecondary, marginLeft: 8 }}>Duration</Text>
                </View>
                <Text style={{ color: colors.text, fontWeight: '600' }}>
                  {days} {days === 1 ? 'Day' : 'Days'}
                </Text>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="people-outline" size={20} color={colors.textSecondary} />
                  <Text style={{ color: colors.textSecondary, marginLeft: 8 }}>Capacity</Text>
                </View>
                <Text style={{ color: colors.text, fontWeight: '600' }}>
                  Up to {booking.spaces?.capacity || 0} guests
                </Text>
              </View>
            </View>
          </View>

          {/* Reason */}
          {booking.reason && (
            <View style={{ backgroundColor: colors.card, borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: colors.border }}>
              <Text style={{ color: colors.text, fontSize: 18, fontWeight: '600', marginBottom: 8 }}>Booking Reason</Text>
              <Text style={{ color: colors.textSecondary, lineHeight: 24 }}>{booking.reason}</Text>
            </View>
          )}

          {/* User Details */}
          <View style={{ backgroundColor: colors.card, borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ color: colors.text, fontSize: 18, fontWeight: '600', marginBottom: 16 }}>Contact Information</Text>
            
            <View style={{ gap: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="person-outline" size={20} color={colors.textSecondary} />
                <Text style={{ color: colors.text, marginLeft: 12 }}>
                  {booking.users?.name}
                </Text>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="mail-outline" size={20} color={colors.textSecondary} />
                <Text style={{ color: colors.text, marginLeft: 12 }}>
                  {booking.users?.email || 'No email provided'}
                </Text>
              </View>
            </View>
          </View>

          {/* Price Breakdown */}
          <View style={{ backgroundColor: colors.card, borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ color: colors.text, fontSize: 18, fontWeight: '600', marginBottom: 16 }}>Price Breakdown</Text>
            
            <View style={{ gap: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: colors.textSecondary }}>₹{booking.spaces?.pph || 0} × {days} days</Text>
                <Text style={{ color: colors.text }}>₹{(booking.spaces?.pph || 0) * days}</Text>
              </View>

              <View style={{ borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12, marginTop: 8 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ color: colors.text, fontSize: 18, fontWeight: 'bold' }}>Total Amount</Text>
                  <Text style={{ color: colors.text, fontSize: 24, fontWeight: 'bold' }}>
                    ₹{booking.total_amount || (booking.spaces?.pph || 0) * days}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Booking Metadata */}
          <View style={{ backgroundColor: colors.card, borderRadius: 16, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ color: colors.textSecondary, fontSize: 12, marginBottom: 4 }}>Booking ID: {booking.id}</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
              Created: {dayjs(booking.created_at).format('MMM DD, YYYY HH:mm')}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Payment Button */}
      {booking.payment_status === 'pending' && (
        <View style={{ backgroundColor: colors.card, borderTopWidth: 1, borderTopColor: colors.border, paddingHorizontal: 24, paddingVertical: 16 }}>
          <TouchableOpacity
            onPress={handleProceedToPayment}
            className="bg-primary"
            style={{  borderRadius: 16, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
          >
            <Ionicons name="card-outline" size={24} color="#000" />
            <Text className="text-black" style={{  fontSize: 18, fontWeight: '600', marginLeft: 8 }}>
              Proceed to Payment
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeBoundingView>
  );
}