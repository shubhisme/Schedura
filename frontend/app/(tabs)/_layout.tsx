import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
interface Tab {
  name: string;
  title: string;
  icon: any;
}

const tabs: Tab[] = [
  {
    name: "home",
    title: "Home",
    icon: "home",
  },
  {
    name:"schedule",
    title:"Schedule",
    icon:"calendar",
  },
  {
    name:"spaces",
    title:"My Spaces",
    icon:"key",
  },
  {
    name: "profile",
    title: "Profile",
    icon: "user",
  },
];


const CustomTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  return (
    <View className={`bg-gray-100 px-5 pt-4 ${Platform.OS === 'ios' ? 'pb-12' : 'pb-12'}`}>
      <View className="flex-row bg-white rounded-3xl py-3 px-2 shadow-lg shadow-black/10">
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

          const isFocused = state.index === index;
          const tab = tabs.find(t => t.name === route.name);

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };
          return (
            <TouchableOpacity
              key={index}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              onPress={onPress}
              className={`flex-1 items-center `}
            >
              <View className=''>
                <View className={`w-8 h-8 mx-auto items-center justify-center mb-0.5 ${
                  isFocused ? ' rounded-full' : ''
                }`}>
                  <Feather
                    name={tab?.icon}
                    size={25}
                    color={isFocused ? 'black' : '#8E8E93'}
                  />
                </View>
                <Text className={`text-sm font-medium text-center ${
                  isFocused ? 'text-black font-semibold' : 'text-gray-500/90'
                }`}>
                  {typeof label === 'string' ? label : ''}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      {tabs.map((tab, i) => (
        <Tabs.Screen
          key={i}
          name={tab.name}
          options={{title: tab.title,}}
        />
      ))}
    </Tabs>
  );
}