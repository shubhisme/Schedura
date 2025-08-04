import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Feather } from '@expo/vector-icons';

interface Tab {
  name:string,
  title:string,
  icon:any
}

const tabs:Tab[] = [
  {
    name:"index",
    title:"Home",
    icon:"map-pin",
  },
  {
    name:"schedule",
    title:"Schedule",
    icon:"calendar",
  },
  {
    name:"explore",
    title:"Explore",
    icon:"bell",
  },
  {
    name:"profile",
    title:"Profile",
    icon:"user",
  },
]

export default function TabLayout() {

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "black",
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
          },
          default: {},
        }),
      }}>
      
      {
        tabs.map((tab, i)=>(
          <Tabs.Screen
            key={i}
            name={tab.name}
            options={{
              title: tab.title,
              tabBarShowLabel:false,
              tabBarIcon: ({ color }) => <Feather size={24} name={tab.icon} color={color} />,
              tabBarStyle:{paddingTop:10}
            }}
          />
        ))
      }
    </Tabs>
  );
}
