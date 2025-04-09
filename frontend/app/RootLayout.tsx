// RootLayout.tsx

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import TabNavigator from './TabNavigator';
import { CurrentScreenProvider } from '../context/CurrentScreenContext';
import { PreferencesProvider } from '../context/PreferencesContext';
import { navigationRef } from './navigationService';
import VoiceCommandManager from '../services/voice/VoiceCommandManager';
import VoiceTester from '../services/voice/VoiceTester';
import { useUserData } from '../UserContext';
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';


const Stack = createNativeStackNavigator();

export default function RootLayout() {
  const { userData } = useUserData();

  return (
    <PreferencesProvider>
      <NavigationContainer ref={navigationRef}>
        <CurrentScreenProvider>
          <Stack.Navigator initialRouteName={userData ? "Tabs" : "Home"}>
            {userData ? (
              <Stack.Screen
                name="Tabs"
                component={TabNavigator}
                options={{ headerShown: false }}
              />
            ) : (
              <>
                <Stack.Screen
                  name="Login"
                  component={LoginScreen}
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="Register"
                  component={RegisterScreen}
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="Home"
                  component={HomeScreen}
                  options={{ headerShown: false }}
                />
              </>
            )}
            <Stack.Screen
              name="PrivacyPolicy"
              component={PrivacyPolicyScreen}
              options={{ headerTitle: 'Privacy Policy' }}
            />
            <Stack.Screen name="VoiceTester" component={VoiceTester} />
          </Stack.Navigator>
          <VoiceCommandManager />
        </CurrentScreenProvider>
      </NavigationContainer>
    </PreferencesProvider>
  );
}
