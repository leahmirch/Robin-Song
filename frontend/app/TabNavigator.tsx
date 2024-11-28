import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import IdentifyScreen from '../screens/IdentifyScreen';
import ForecastScreen from '../screens/ForecastScreen';
import HistoryScreen from '../screens/HistoryScreen';
import ProfileScreen from '../screens/ProfileScreen';
import Ionicons from 'react-native-vector-icons/Ionicons';
import colors from '../assets/theme/colors';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
        screenOptions={{
            headerShown: false,
            tabBarStyle:  {
                backgroundColor: colors.bottomnav,
            },
            tabBarActiveTintColor: colors.primary,
            tabBarInactiveTintColor: '#E2BFA9',
            tabBarLabelStyle: {
                fontFamily: 'Radio Canada',
            }
        }}
    >
      <Tab.Screen
        name="Identify"
        component={IdentifyScreen}
        options={{
            tabBarIcon: ({ color, size }: { color: string; size: number }) => (
                <Ionicons name="mic" size={size} color={color} />
            ),
        }}
      />
      <Tab.Screen
        name="Forecast"
        component={ForecastScreen}
        options={{
            tabBarIcon: ({ color, size }: { color: string; size: number }) => (
                <Ionicons name="location-sharp" size={size} color={color} />
            ),
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
            tabBarIcon: ({ color, size }: { color: string; size: number }) => (
                <Ionicons name="bookmark" size={size} color={color} />
            ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
            tabBarIcon: ({ color, size }: { color: string; size: number }) => (
                <Ionicons name="person" size={size} color={color} />
            ),
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;
