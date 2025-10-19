import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StatusBar, Alert, TextInput } from 'react-native';
import SafeBoundingView from '@/components/SafeBoundingView';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { updateUserUpiId } from '@/supabase/controllers/user.controller';

const BillingPaymentsScreen = () => {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  
  const [currentPlan] = useState('Free');
  const [billingCycle] = useState('Monthly');
  const [upiId, setUpiId] = useState('');
  const [savingUpi, setSavingUpi] = useState(false);

  const handleSaveUpi = async () => {
    if (!upiId.trim()) {
      Alert.alert('Validation', 'Please enter a valid UPI ID');
      return;
    }
    setSavingUpi(true);
    try {
      await updateUserUpiId(upiId.trim());
      Alert.alert('Success', 'UPI ID updated successfully');
    }catch (err) {
      Alert.alert('Error', 'Failed to update UPI ID');
    }finally {
      setSavingUpi(false);
    }
  };
  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: '$0',
      period: 'forever',
      features: [
        'Up to 3 space listings',
        'Basic booking management',
        'Email support',
        'Standard analytics'
      ],
      current: true
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '$29',
      period: 'per month',
      features: [
        'Unlimited space listings',
        'Advanced booking management',
        'Priority support',
        'Advanced analytics',
        'Custom branding',
        'API access'
      ],
      current: false,
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: '$99',
      period: 'per month',
      features: [
        'Everything in Pro',
        'Dedicated account manager',
        '24/7 phone support',
        'Custom integrations',
        'White-label solution',
        'SLA guarantee'
      ],
      current: false
    }
  ];

  const paymentMethods = [
    {
      id: '1',
      type: 'card',
      brand: 'Visa',
      last4: '4242',
      expiry: '12/25',
      isDefault: true
    },
    {
      id: '2',
      type: 'card',
      brand: 'Mastercard',
      last4: '8888',
      expiry: '08/26',
      isDefault: false
    }
  ];

  const transactions = [
    { id: '1', date: '2025-10-01', amount: '$29.00', description: 'Pro Plan - Monthly', status: 'Paid' },
    { id: '2', date: '2025-09-01', amount: '$29.00', description: 'Pro Plan - Monthly', status: 'Paid' },
    { id: '3', date: '2025-08-01', amount: '$29.00', description: 'Pro Plan - Monthly', status: 'Paid' },
  ];

  const handleUpgrade = (planId: string) => {
    Alert.alert(
      'Upgrade Plan',
      `Upgrade to ${plans.find(p => p.id === planId)?.name} plan?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Upgrade', 
          onPress: () => Alert.alert('Success', 'Plan upgraded successfully!')
        }
      ]
    );
  };

  const handleAddPaymentMethod = () => {
    Alert.alert(
      'Add Payment Method',
      'This would open a payment form to add a new card or payment method',
      [{ text: 'OK' }]
    );
  };

  const handleManagePaymentMethod = (methodId: string) => {
    Alert.alert(
      'Manage Payment Method',
      'What would you like to do?',
      [
        { text: 'Set as Default', onPress: () => Alert.alert('Success', 'Default payment method updated') },
        { text: 'Remove', style: 'destructive', onPress: () => Alert.alert('Success', 'Payment method removed') },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const handleDownloadInvoice = (transactionId: string) => {
    Alert.alert('Success', 'Invoice downloaded to your device');
  };

  const PlanCard = ({ plan }: any) => (
    <View 
      style={{
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 24,
        marginBottom: 16,
        borderWidth: plan.popular ? 2 : 0,
        borderColor: plan.popular ? colors.link : 'transparent',
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
      }}
    >
      {plan.popular && (
        <View style={{ backgroundColor: colors.link, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, alignSelf: 'flex-start', marginBottom: 12 }}>
          <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>MOST POPULAR</Text>
        </View>
      )}
      
      <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.text }}>{plan.name}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: 8 }}>
        <Text style={{ fontSize: 36, fontWeight: 'bold', color: colors.text }}>{plan.price}</Text>
        <Text style={{ color: colors.textSecondary, marginLeft: 8 }}>/ {plan.period}</Text>
      </View>
      
      <View style={{ marginTop: 24, marginBottom: 24 }}>
        {plan.features.map((feature: string, index: number) => (
          <View key={index} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
            <Text style={{ color: colors.textSecondary, marginLeft: 12 }}>{feature}</Text>
          </View>
        ))}
      </View>
      
      {plan.current ? (
        <View style={{ backgroundColor: colors.backgroundSecondary, paddingVertical: 12, borderRadius: 12, alignItems: 'center' }}>
          <Text style={{ color: colors.textSecondary, fontWeight: '600' }}>Current Plan</Text>
        </View>
      ) : (
        <TouchableOpacity 
          onPress={() => handleUpgrade(plan.id)}
          style={{ 
            paddingVertical: 12, 
            borderRadius: 12, 
            alignItems: 'center',
            backgroundColor: plan.popular ? colors.link : colors.accent
          }}
        >
          <Text style={{ color: plan.popular ? 'white' : (isDark ? '#000' : 'white'), fontWeight: '600' }}>
            Upgrade to {plan.name}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeBoundingView style={{ flex: 1, backgroundColor: colors.backgroundSecondary }}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.card} />
      
      {/* Header */}
      <View style={{ 
        backgroundColor: colors.card, 
        paddingHorizontal: 24, 
        paddingVertical: 16, 
        flexDirection: 'row', 
        alignItems: 'center', 
        borderBottomWidth: 1, 
        borderBottomColor: colors.border 
      }}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 8, marginRight: 12 }}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.text }}>Billing & Payments</Text>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Current Plan Overview */}
       <View className="px-6 py-4 ">
          <Text className="text-sm text-gray-700 mb-2">UPI ID</Text>
          <TextInput
            value={upiId}
            onChangeText={setUpiId}
            placeholder="example@upi"
            autoCapitalize="none"
            keyboardType="default"
            className="bg-gray-50 rounded-xl px-4 py-3 mb-3 border border-gray-200"
            editable={!savingUpi}
          />
          <TouchableOpacity
            onPress={handleSaveUpi}
            disabled={savingUpi}
            className={`py-3 rounded-xl items-center ${savingUpi ? 'bg-gray-300' : 'bg-primary'}`}
          >
            <Text className="text-black font-semibold">{savingUpi ? 'Saving...' : 'Save UPI'}</Text>
          </TouchableOpacity>
        </View>
        <View style={{ 
          padding: 24, 
          marginHorizontal: 24, 
          marginTop: 24, 
          borderRadius: 16,
          backgroundColor: colors.link
        }}>
          <Text style={{ color: 'white', fontSize: 18, fontWeight: '600' }}>Current Plan</Text>
          <Text style={{ color: 'white', fontSize: 30, fontWeight: 'bold', marginTop: 8 }}>{currentPlan}</Text>
          <Text style={{ color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>{billingCycle} billing</Text>
        </View>

        {/* Plans */}
        <View style={{ paddingHorizontal: 24, paddingVertical: 24 }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.text, marginBottom: 16 }}>Available Plans</Text>
          {plans.map(plan => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </View>

        {/* Payment Methods */}
        <View style={{ 
          paddingHorizontal: 24, 
          paddingVertical: 24, 
          backgroundColor: colors.card, 
          borderTopWidth: 1, 
          borderTopColor: colors.border 
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.text }}>Payment Methods</Text>
            <TouchableOpacity onPress={handleAddPaymentMethod}>
              <Ionicons name="add-circle" size={28} color={colors.link} />
            </TouchableOpacity>
          </View>
          
          {paymentMethods.map(method => (
            <TouchableOpacity
              key={method.id}
              onPress={() => handleManagePaymentMethod(method.id)}
              style={{ backgroundColor: colors.backgroundSecondary, borderRadius: 16, padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center' }}
            >
              <View style={{ backgroundColor: colors.card, padding: 12, borderRadius: 12 }}>
                <Ionicons name="card-outline" size={24} color={colors.textSecondary} />
              </View>
              <View style={{ flex: 1, marginLeft: 16 }}>
                <Text style={{ color: colors.text, fontWeight: '600' }}>
                  {method.brand} •••• {method.last4}
                </Text>
                <Text style={{ color: colors.textSecondary, fontSize: 14, marginTop: 4 }}>Expires {method.expiry}</Text>
              </View>
              {method.isDefault && (
                <View style={{ backgroundColor: isDark ? '#14532d' : '#d1fae5', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 }}>
                  <Text style={{ color: isDark ? '#86efac' : '#065f46', fontSize: 12, fontWeight: '600' }}>Default</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Transaction History */}
        <View style={{ paddingHorizontal: 24, paddingVertical: 24 }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.text, marginBottom: 16 }}>Transaction History</Text>
          
          {transactions.map(transaction => (
            <View
              key={transaction.id}
              style={{
                backgroundColor: colors.card,
                borderRadius: 16,
                padding: 16,
                marginBottom: 12,
                flexDirection: 'row',
                alignItems: 'center',
                shadowColor: colors.shadow,
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              <View style={{ backgroundColor: isDark ? '#14532d' : '#d1fae5', padding: 12, borderRadius: 12 }}>
                <Ionicons name="checkmark-circle" size={24} color={colors.success} />
              </View>
              <View style={{ flex: 1, marginLeft: 16 }}>
                <Text style={{ color: colors.text, fontWeight: '600' }}>{transaction.description}</Text>
                <Text style={{ color: colors.textSecondary, fontSize: 14, marginTop: 4 }}>{transaction.date}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ color: colors.text, fontWeight: 'bold' }}>{transaction.amount}</Text>
                <TouchableOpacity 
                  onPress={() => handleDownloadInvoice(transaction.id)}
                  style={{ marginTop: 4 }}
                >
                  <Text style={{ color: colors.link, fontSize: 14 }}>Invoice</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeBoundingView>
  );
};

export default BillingPaymentsScreen;
