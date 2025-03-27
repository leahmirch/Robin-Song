// TabNavigator.tsx
import React, { useEffect, useState } from 'react';
import { Image, View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useCurrentScreen } from '../context/CurrentScreenContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import IdentifyScreen from '../screens/IdentifyScreen';
import ForecastScreen from '../screens/ForecastScreen';
import HistoryScreen from '../screens/HistoryScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ChatButton from '../components/ChatButton';
import ChatModal from '../components/ChatModal';
import Ionicons from 'react-native-vector-icons/Ionicons';
import colors from '../assets/theme/colors';
import { setOpenChatModal, setCloseChatModal, setIsChatModalOpen } from './navigationService';

function LogoTitle() {
  return (
    <Image 
      style={{ width: 44, height: 50 }}
      source={require('../assets/img/logos/robinNoText72.png')}
    />
  );
}

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const { currentScreen, setCurrentScreen } = useCurrentScreen();
  const insets = useSafeAreaInsets();
  const hiddenScreens = ['Settings'];
  
  // Set chat modal callbacks
  useEffect(() => {
    setOpenChatModal(() => setModalVisible(true));
    setCloseChatModal(() => setModalVisible(false));
  }, []);

  // Keep the chat modal state in sync with navigationService
  useEffect(() => {
    setIsChatModalOpen(modalVisible);
  }, [modalVisible]);
  
  
  return (
    <View style={styles.container}>
      <Tab.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#F6CFBC',
          },
          headerTitle: (props: React.JSX.IntrinsicAttributes) => <LogoTitle {...props} />,
          headerTitleAlign: 'center',
          headerLeft: null,
          tabBarStyle: {
            backgroundColor: colors.bottomnav,
          },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: '#E2BFA9',
          tabBarLabelStyle: {
            fontFamily: 'Radio Canada',
          },
        }}
        screenListeners={{
          state: (e: any) => {
            if (e?.data?.state) {
              const route = e.data.state.routes[e.data.state.index];
              setCurrentScreen(route?.name || '');
              console.log("Updated currentScreen:", route?.name);
            }
          },
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
          name="Settings"
          component={SettingsScreen}
          options={{
            tabBarIcon: ({ color, size }: { color: string; size: number }) => (
              <Ionicons name="person" size={size} color={color} />
            ),
          }}
        />
      </Tab.Navigator>

      {!hiddenScreens.includes(currentScreen) && (
        <ChatButton 
          style={{ bottom: insets.bottom + 60 }}
          onPress={() => setModalVisible(true)}
        />
      )}

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
