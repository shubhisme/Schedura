import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StatusBar, Alert } from 'react-native';
import SafeBoundingView from '@/components/SafeBoundingView';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const BillingPaymentsScreen = () => {
  const router = useRouter();
  
  const [currentPlan] = useState('Free');
  const [billingCycle] = useState('Monthly');

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
      className={`bg-white rounded-2xl p-6 mb-4 ${plan.popular ? 'border-2 border-indigo-600' : ''}`}
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
      }}
    >
      {plan.popular && (
        <View className="bg-indigo-600 px-3 py-1 rounded-full self-start mb-3">
          <Text className="text-white text-xs font-bold">MOST POPULAR</Text>
        </View>
      )}
      
      <Text className="text-2xl font-bold text-gray-900">{plan.name}</Text>
      <View className="flex-row items-baseline mt-2">
        <Text className="text-4xl font-bold text-gray-900">{plan.price}</Text>
        <Text className="text-gray-500 ml-2">/ {plan.period}</Text>
      </View>
      
      <View className="mt-6 mb-6">
        {plan.features.map((feature: string, index: number) => (
          <View key={index} className="flex-row items-center mb-3">
            <Ionicons name="checkmark-circle" size={20} color="#10b981" />
            <Text className="text-gray-700 ml-3">{feature}</Text>
          </View>
        ))}
      </View>
      
      {plan.current ? (
        <View className="bg-gray-100 py-3 rounded-xl items-center">
          <Text className="text-gray-600 font-semibold">Current Plan</Text>
        </View>
      ) : (
        <TouchableOpacity 
          onPress={() => handleUpgrade(plan.id)}
          className={`py-3 rounded-xl items-center ${plan.popular ? 'bg-indigo-600' : 'bg-black'}`}
        >
          <Text className="text-white font-semibold">Upgrade to {plan.name}</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeBoundingView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      {/* Header */}
      <View className="bg-white px-6 py-4 flex-row items-center border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()} className="p-2 mr-3">
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900">Billing & Payments</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Current Plan Overview */}
        <View className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 mx-6 mt-6 rounded-2xl">
          <Text className="text-white text-lg font-semibold">Current Plan</Text>
          <Text className="text-white text-3xl font-bold mt-2">{currentPlan}</Text>
          <Text className="text-white/80 mt-1">{billingCycle} billing</Text>
        </View>

        {/* Plans */}
        <View className="px-6 py-6">
          <Text className="text-xl font-bold text-gray-900 mb-4">Available Plans</Text>
          {plans.map(plan => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </View>

        {/* Payment Methods */}
        <View className="px-6 py-6 bg-white border-t border-gray-200">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold text-gray-900">Payment Methods</Text>
            <TouchableOpacity onPress={handleAddPaymentMethod}>
              <Ionicons name="add-circle" size={28} color="#6366f1" />
            </TouchableOpacity>
          </View>
          
          {paymentMethods.map(method => (
            <TouchableOpacity
              key={method.id}
              onPress={() => handleManagePaymentMethod(method.id)}
              className="bg-gray-50 rounded-2xl p-4 mb-3 flex-row items-center"
            >
              <View className="bg-white p-3 rounded-xl">
                <Ionicons name="card-outline" size={24} color="#6b7280" />
              </View>
              <View className="flex-1 ml-4">
                <Text className="text-gray-900 font-semibold">
                  {method.brand} •••• {method.last4}
                </Text>
                <Text className="text-gray-500 text-sm mt-1">Expires {method.expiry}</Text>
              </View>
              {method.isDefault && (
                <View className="bg-green-100 px-3 py-1 rounded-full">
                  <Text className="text-green-700 text-xs font-semibold">Default</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Transaction History */}
        <View className="px-6 py-6">
          <Text className="text-xl font-bold text-gray-900 mb-4">Transaction History</Text>
          
          {transactions.map(transaction => (
            <View
              key={transaction.id}
              className="bg-white rounded-2xl p-4 mb-3 flex-row items-center"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              <View className="bg-green-50 p-3 rounded-xl">
                <Ionicons name="checkmark-circle" size={24} color="#10b981" />
              </View>
              <View className="flex-1 ml-4">
                <Text className="text-gray-900 font-semibold">{transaction.description}</Text>
                <Text className="text-gray-500 text-sm mt-1">{transaction.date}</Text>
              </View>
              <View className="items-end">
                <Text className="text-gray-900 font-bold">{transaction.amount}</Text>
                <TouchableOpacity 
                  onPress={() => handleDownloadInvoice(transaction.id)}
                  className="mt-1"
                >
                  <Text className="text-indigo-600 text-sm">Invoice</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        <View className="h-8" />
      </ScrollView>
    </SafeBoundingView>
  );
};

export default BillingPaymentsScreen;
