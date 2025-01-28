import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CurrentScreenProvider } from '../context/CurrentScreenContext';
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import TabNavigator from './TabNavigator'

const Stack = createNativeStackNavigator();

export default function RootLayout() {
   return (
    <NavigationContainer>
        <CurrentScreenProvider>
            <Stack.Navigator initialRouteName="Home">
                <Stack.Screen 
                    name="Home" 
                    component={HomeScreen} 
                    options={{ headerShown: false }}
                />
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
                    name="Tabs"
                    component={TabNavigator}
                    options={{ headerShown: false }}
                />
            </Stack.Navigator>
        </CurrentScreenProvider>
    </NavigationContainer>
   );
}