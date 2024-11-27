import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import IdentifyScreen from '../screens/IdentifyScreen';
import ForecastScreen from '../screens/ForecastScreen';
import HistoryScreen from '../screens/HistoryScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="Identify"
        component={IdentifyScreen}
      />
      <Tab.Screen
        name="Forecast"
        component={ForecastScreen}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;
