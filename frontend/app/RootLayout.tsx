// RootLayout.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import TabNavigator from './TabNavigator';
import { CurrentScreenProvider } from '../context/CurrentScreenContext';
import { PreferencesProvider } from '../../backend/src/contexts/PreferencesContext';
import { navigationRef } from './navigationService';
import VoiceCommandManager from './VoiceCommandManager';

const Stack = createNativeStackNavigator();

export default function RootLayout() {
  return (
    <NavigationContainer ref={navigationRef}>
      <PreferencesProvider>
        <CurrentScreenProvider>
          <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="Tabs" component={TabNavigator} />
          </Stack.Navigator>
          <VoiceCommandManager />
        </CurrentScreenProvider>
      </PreferencesProvider>
    </NavigationContainer>
  );
}
