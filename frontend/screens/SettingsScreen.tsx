import React, { useState, useEffect } from 'react';
import { Image, SafeAreaView, ScrollView, Text, StyleSheet, View, Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import colors from '../assets/theme/colors';
import Accordion from '../components/Accordion';
import TextFormField from '../components/TextForm';
import Button from '../components/Button';
import Toggle from '../components/Toggle';
import { API_BASE_URL } from "../../database/firebaseConfig";
import { useUserData } from '../UserContext'; 

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [locationEnabled, setLocationEnabled] = useState<boolean>(false);
  const [voiceCommandsEnabled, setVoiceCommandsEnabled] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(null);
  const { userData } = useUserData();
  
  useFocusEffect(
    React.useCallback(() => {
      const fetchUserData = async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/users/me`, {
            credentials: 'include', 
          });
          if (!response.ok) {
            console.error("Failed to fetch user data from server");
            return;
          }
          const userData = await response.json();
          setUserId(userData.id);
          setLocationEnabled(Boolean(userData.locationPreferences));
          setFirstName(userData.firstName || '');
          setLastName(userData.lastName || '');
          setEmail(userData.email || '');
        } catch (err) {
          console.error("Error fetching user data:", err);
        }
      };
      fetchUserData();
    }, [])
  );
  
  const handleLogout = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      if (response.ok) {
        navigation.navigate("Home");
      } else {
        console.error("Failed to log out");
        Alert.alert("Logout failed", "Please try again.");
      }
    } catch (error) {
      console.error("Logout error:", error);
      Alert.alert("Logout error", "An error occurred. Please try again.");
    }
  };
  

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text accessibilityRole="header" style={styles.title}>Account</Text>

        <View
          accessible={true}
          accessibilityLabel={`Your account information. Name: ${userData?.firstName} ${userData?.lastName}. Email address: ${userData?.email}`}
          style={styles.accountCard}
        >
          <View style={styles.leftSide}>
            <View style={styles.topRow}>
              <Image
                accessible={true}
                accessibilityLabel='Account Profile Picture'
                source={require("../assets/img/robin.png")}
                style={styles.image}
              />
            </View>
          </View>
          <View>
            <View style={styles.topRow}>
              <Text style={styles.name}>
                {userData?.firstName ?? ''} {userData?.lastName ?? ''}
              </Text>
              <Text style={styles.infoText}>{userData?.email ?? ''}</Text>
            </View>
          </View>
        </View>

        <Text accessibilityRole="header" style={styles.title}>Settings</Text>
        
        <Accordion title="Change Name" startIcon="account-edit-outline">
          <TextFormField
            label="Change First Name"
            placeholder={userData?.firstName}
            value={firstName}
            onChangeText={setFirstName}
            keyboardType="name-phone-pad"
            autoCapitalize="none"
          />
          <TextFormField
            label="Change Last Name"
            placeholder={userData?.lastName}
            value={lastName}
            onChangeText={setLastName}
            keyboardType="name-phone-pad"
            autoCapitalize="none"
          />
          <Button
            title="Submit"
            onPress={() => Alert.alert('Submit Button Pressed')}
            variant="primary"
          />
        </Accordion>

        <Accordion title="Change Email Address" startIcon="email-edit-outline">
          <TextFormField
            label="Change Email"
            placeholder={userData?.email}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Button
            title="Submit"
            onPress={() => Alert.alert('Submit Button Pressed')}
            variant="primary"
          />
        </Accordion>

        <Accordion title="Change Password" startIcon="shield-edit-outline">
          <TextFormField placeholder="Enter new password" isPassword />
          <Button
            title="Submit"
            onPress={() => Alert.alert('Submit Button Pressed')}
            variant="primary"
          />
        </Accordion>

        <Toggle
          title="Enable Voice Commands"
          startIcon="microphone-outline"
          value={voiceCommandsEnabled}
          onToggle={(newValue) => {
            setVoiceCommandsEnabled(newValue);
            console.log("Voice commands toggle is now:", newValue);
          }}
          description="Enabling voice commands allows you to navigate the app using verbal commands. Microphone access is required in order to enable voice commands."
        />

        <Toggle
          title="Enable Location for Forecast"
          startIcon="map-marker-outline"
          value={locationEnabled}
          onToggle={async (newValue) => {
            setLocationEnabled(newValue);
            try {
              const patchResp = await fetch(`${API_BASE_URL}/users/${userId}/preferences`, {
                method: 'PATCH',
                credentials: "include", 
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ locationPreferences: newValue }),
              });
              if (!patchResp.ok) {
                console.error("Failed to update locationPreferences on server");
              }
            } catch (err) {
              console.error("Error PATCHing preferences:", err);
            }
          }}
          description="Enable your location for personalized bird species predictions for your area. Location access is required in order to receive bird forecast prediction local to your area."
        />


        <View style={styles.buttonContainer}>
        <Button
          title="Logout"
          onPress={handleLogout}
          variant="secondary"
        />
          <Button
            title="Delete Account"
            onPress={() => Alert.alert('Delete Account Pressed')}
            variant="primary"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    padding: 10,
  },
  title: {
    fontFamily: 'Caprasimo',
    fontSize: 36,
    color: colors.secondary,
    marginBottom: 10,
    textAlign: 'center',
  },
  accountCard: {
    flexDirection: 'row',
    marginBottom: 24,
    backgroundColor: colors.card,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    elevation: 5,
    shadowRadius: 4,
  },
  leftSide: {
    width: 90,
  },
  topRow: {
    height: 75,
    justifyContent: 'center',
  },
  name: {
    fontFamily: 'Caprasimo',
    fontSize: 32,
    color: colors.primary,
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Radio Canada',
    color: colors.primary,
    marginBottom: 5,
  },
  infoText: {
    fontSize: 18,
    fontFamily: 'Radio Canada',
    color: colors.text,
  },
  image: {
    width: 65,
    height: 65,
    borderRadius: 50,
  },
  buttonContainer: {
    marginTop: 24,
  },
});

export default SettingsScreen;
