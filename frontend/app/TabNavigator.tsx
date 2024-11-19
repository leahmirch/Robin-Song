import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import HomeScreen from '../screens/HomeScreen';
import VoiceMatchScreen from '../screens/VoiceMatchScreen';

const Tab = createBottomTabNavigator();

function TabBarIcon({ name, color }: { name: React.ComponentProps<typeof FontAwesome>['name']; color: string }) {
    return <FontAwesome size={28} style={{ marginBottom: -3 }} name={name} color={color} />;
}

export default function TabNavigator() {
    return (
        <Tab.Navigator screenOptions={{ headerShown: false }}>
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{
                    title: 'Birds',
                    tabBarIcon: ({ color }: { color: string }) => <TabBarIcon name="twitter" color={color} />,
                }}
            />
            <Tab.Screen
                name="VoiceMatch"
                component={VoiceMatchScreen}
                options={{
                    title: 'Identify',
                    tabBarIcon: ({ color }: { color: string }) => <TabBarIcon name="search" color={color} />,
                }}
            />
        </Tab.Navigator>
    );
}
