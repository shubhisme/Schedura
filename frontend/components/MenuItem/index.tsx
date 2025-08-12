import { Ionicons } from "@expo/vector-icons";
import { FC, useState } from "react";
import { Switch, Text, TouchableOpacity, View } from "react-native";


export const MenuItem: FC<{
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  subtitle?: string;
  isDestructive?: boolean;
  onPress?: () => void;
  hasToggle?: boolean;
  toggleValue?: boolean;
  onToggleChange?: (value: boolean) => void;
  disabled?: boolean;
  showBadge?: boolean;
  badgeText?: string;
}> = ({ 
  icon, 
  label, 
  subtitle,
  isDestructive, 
  onPress, 
  hasToggle, 
  toggleValue = false,
  onToggleChange,
  disabled,
  showBadge,
  badgeText
}) => {
  const [isEnabled, setIsEnabled] = useState(toggleValue);

  const toggleSwitch = () => {
    const newValue = !isEnabled;
    setIsEnabled(newValue);
    onToggleChange?.(newValue);
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      className={`flex-row items-center p-4 bg-white rounded-2xl mb-3 ${
        disabled ? 'opacity-50' : ''
      }`}
      disabled={hasToggle || disabled}
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      {/* Icon Container */}
      <View className={`p-3 rounded-xl ${
        isDestructive ? 'bg-red-50' : 'bg-gray-50'
      }`}>
        <Ionicons 
          name={icon} 
          size={22} 
          color={isDestructive ? "#ef4444" : "#6b7280"} 
        />
      </View>

      {/* Content */}
      <View className="flex-1 ml-4">
        <View className="flex-row items-center">
          <Text className={`text-base font-semibold ${
            isDestructive ? 'text-red-600' : 'text-gray-900'
          }`}>
            {label}
          </Text>
          {showBadge && badgeText && (
            <View className="bg-red-500 px-2 py-1 rounded-full ml-2">
              <Text className="text-white text-xs font-bold">{badgeText}</Text>
            </View>
          )}
        </View>
        {subtitle && (
          <Text className="text-gray-500 text-sm mt-1">{subtitle}</Text>
        )}
      </View>

      {/* Right Side */}
      {hasToggle ? (
        <Switch
          trackColor={{ false: "#e5e7eb", true: "#8b5cf6" }}
          thumbColor={isEnabled ? "#ffffff" : "#ffffff"}
          onValueChange={toggleSwitch}
          value={isEnabled}
        />
      ) : (
        <Ionicons name="chevron-forward-outline" size={20} color="#9ca3af" />
      )}
    </TouchableOpacity>
  );
};