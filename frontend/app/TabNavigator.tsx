import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import IdentifyScreen from '../screens/IdentifyScreen';
import ForecastScreen from '../screens/ForecastScreen';
import HistoryScreen from '../screens/HistoryScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ChatButton from '../components/ChatButton';
import ChatModal from '../components/ChatModal';
import AuthScreen from '../screens/AuthScreen';
import Ionicons from 'react-native-vector-icons/Ionicons';
import colors from '../assets/theme/colors';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={styles.container}>
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

        <Tab.Screen
          name="Login"
          component={AuthScreen}
          options={{
            tabBarIcon: ({ color, size }: { color: string; size: number }) => (
              <Ionicons name="log-in" size={size} color={color} />
            ),
            tabBarLabel: 'Login',
          }}
        />

    </Tab.Navigator>
     
    <ChatButton 
      onPress={() => setModalVisible(true)} 
      hiddenScreens={['Profile']}
    />

    <ChatModal
      visible={modalVisible}
      onClose={() => setModalVisible(false)}
    />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default TabNavigator;
