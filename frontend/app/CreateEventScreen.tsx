import React, { useState, FC } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type EventCategory = 'Wedding' | 'Conference' | 'Corporate' | 'Birthday' | 'Social';


const FormInput: FC<{ icon: keyof typeof Ionicons.glyphMap; label: string; placeholder: string; value: string; onChangeText: (text: string) => void; keyboardType?: 'default' | 'numeric' }> = 
({ icon, label, placeholder, value, onChangeText, keyboardType = 'default' }) => (
    <View className="mb-4">
        <Text className="text-gray-600 font-medium mb-2">{label}</Text>
        <View className="flex-row items-center bg-gray-100 rounded-lg px-4">
            <Ionicons name={icon} size={20} color="#9ca3af" />
            <TextInput
                placeholder={placeholder}
                placeholderTextColor="#9ca3af"
                value={value}
                onChangeText={onChangeText}
                keyboardType={keyboardType}
                className="flex-1 text-base py-3 ml-3 text-gray-900"
            />
        </View>
    </View>
);

const CategorySelector: FC<{ selected: EventCategory, onSelect: (category: EventCategory) => void }> = ({ selected, onSelect }) => {
    const categories: { name: EventCategory, icon: keyof typeof Ionicons.glyphMap }[] = [
        { name: 'Wedding', icon: 'heart-outline' },
        { name: 'Corporate', icon: 'briefcase-outline' },
        { name: 'Birthday', icon: 'gift-outline' },
        { name: 'Conference', icon: 'people-outline' },
        { name: 'Social', icon: 'chatbubbles-outline' },
    ];

    return (
        <View className="mb-4">
            <Text className="text-gray-600 font-medium mb-2">Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
                {categories.map(cat => (
                    <TouchableOpacity
                        key={cat.name}
                        onPress={() => onSelect(cat.name)}
                        className={`py-3 px-4 rounded-lg border-2 ${selected === cat.name ? 'bg-purple-100 border-purple-600' : 'bg-gray-100 border-gray-200'}`}
                    >
                        <View className="flex-row items-center gap-2">
                            <Ionicons name={cat.icon} size={20} color={selected === cat.name ? '#7c3aed' : '#6b7280'} />
                            <Text className={`font-semibold ${selected === cat.name ? 'text-purple-600' : 'text-gray-700'}`}>{cat.name}</Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};

// --- Create Event Screen ---
const CreateEventScreen: FC<{ onCancel: () => void }> = ({ onCancel }) => {
    const [formState, setFormState] = useState({
        title: '',
        hallName: '',
        date: '',
        time: '',
        category: 'Wedding' as EventCategory,
        attendees: '',
    });

    const handleInputChange = (field: keyof typeof formState, value: string | EventCategory) => {
        setFormState(prev => ({ ...prev, [field]: value }));
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <StatusBar barStyle="dark-content" />
            <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
                <TouchableOpacity onPress={onCancel} className="p-2">
                    <Ionicons name="close-outline" size={28} color="#1f2937" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-900">Create New Event</Text>
                <View className="w-10" />
            </View>
            <ScrollView contentContainerStyle={{ padding: 20 }}>
                <FormInput
                    label="Event Title"
                    icon="text-outline"
                    placeholder="e.g., John & Jane's Wedding"
                    value={formState.title}
                    onChangeText={(text) => handleInputChange('title', text)}
                />
                <FormInput
                    label="Venue / Hall Name"
                    icon="business-outline"
                    placeholder="e.g., The Grandeur Hall"
                    value={formState.hallName}
                    onChangeText={(text) => handleInputChange('hallName', text)}
                />
                 <View className="flex-row gap-4">
                    <View className="flex-1">
                        <FormInput
                            label="Date"
                            icon="calendar-outline"
                            placeholder="e.g., Aug 10, 2025"
                            value={formState.date}
                            onChangeText={(text) => handleInputChange('date', text)}
                        />
                    </View>
                    <View className="flex-1">
                        <FormInput
                            label="Time"
                            icon="time-outline"
                            placeholder="e.g., 4:00 PM"
                            value={formState.time}
                            onChangeText={(text) => handleInputChange('time', text)}
                        />
                    </View>
                </View>
                <CategorySelector selected={formState.category} onSelect={(cat) => handleInputChange('category', cat)} />
                <FormInput
                    label="Number of Attendees"
                    icon="people-outline"
                    placeholder="e.g., 150"
                    value={formState.attendees}
                    onChangeText={(text) => handleInputChange('attendees', text)}
                    keyboardType="numeric"
                />
                <TouchableOpacity className="bg-purple-600 py-4 rounded-lg mt-6">
                    <Text className="text-white text-center font-bold text-lg">Create Event</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

export default CreateEventScreen;
