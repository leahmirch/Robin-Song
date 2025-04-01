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


// NEW: Import from navigationService
import {
 setOpenChatModal,
 setCloseChatModal,
 setIsChatModalOpen,
 setVoiceQuestionSetter,
} from './navigationService'; // <-- Adjust path if needed


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


 // NEW: This will store any recognized question from VoiceCommandManager
 const [voiceQuestion, setVoiceQuestion] = useState('');


 const { currentScreen, setCurrentScreen } = useCurrentScreen();
 const insets = useSafeAreaInsets();


 // If you want to hide the chat button on certain screens
 const hiddenScreens = ['Settings'];


 useEffect(() => {
   // Provide callbacks to navigationService
   setOpenChatModal(() => setModalVisible(true));
   setCloseChatModal(() => setModalVisible(false));


   // Also provide a callback that VoiceCommandManager will call to set the recognized question
   setVoiceQuestionSetter((question: string) => {
     setVoiceQuestion(question);
     setModalVisible(true);  // automatically open the chat if not open
   });
 }, []);


 // Keep track in the navigationService so VoiceCommandManager can see if the chat is open
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
         headerLeft: () => null,
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


     {/* Conditionally render ChatButton unless we are on a hidden screen */}
     {!hiddenScreens.includes(currentScreen) && (
       <ChatButton
         style={{ bottom: insets.bottom + 60 }}
         onPress={() => setModalVisible(true)}
       />
     )}


     {/* Pass the recognized question to ChatModal */}
     <ChatModal
       visible={modalVisible}
       onClose={() => setModalVisible(false)}
       voiceQuestion={voiceQuestion}
       setVoiceQuestion={setVoiceQuestion}
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

