import React, { useState, useEffect } from 'react';
import { Image, SafeAreaView, ScrollView, Text, StyleSheet, View, Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import colors from '../assets/theme/colors';
import Card from '../components/Card';
import Accordion from '../components/Accordion';
import TextFormField from '../components/TextForm';
import Button from '../components/Button';
import Toggle from '../components/Toggle';
import { API_BASE_URL } from "../../database/firebaseConfig";
import { usePreferences } from "../../backend/src/contexts/PreferencesContext";


const SettingsScreen: React.FC = () => {
  const navigation = useNavigation();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [locationEnabled, setLocationEnabled] = useState<boolean>(false);
  const { voiceCommandsEnabled, setVoiceCommandsEnabled } = usePreferences();
  const userId = "FsDwDpHUD6XQU3egNNCOJLCTiNg1"; // Hardcoded user-id (needs to change with user sessions)

  useFocusEffect(
    React.useCallback(() => {
      const fetchUserPrefs = async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/users/${userId}`);
          if (!response.ok) {
            console.error("Failed to fetch user doc from server");
            return;
          }
          const userData = await response.json();
          setLocationEnabled(Boolean(userData.locationPreferences));
        } catch (err) {
          console.error("Error fetching user prefs:", err);
        }
      };
      fetchUserPrefs();
    }, [])
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Account</Text>
        <View style={styles.accountCard}>
          <View style={styles.leftSide}>
            <View style={styles.topRow}>
              <Image source={require("../assets/img/robin.png")} style={styles.image} />
            </View>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.label}>Location</Text>
          </View>
          <View>
            <View style={styles.topRow}>
              <Text style={styles.name}>Jodi Joven</Text>
            </View>
            <Text style={styles.infoText}>jodijov@umich.edu</Text>
            <Text style={styles.infoText}>Dearborn, Michigan</Text>
          </View>
        </View>

        <Text style={styles.title}>Settings</Text>
        <Accordion title="Change Name" startIcon="account-edit-outline">
          <TextFormField
            label="Change First Name"
            placeholder="Jodi"
            value={firstName}
            onChangeText={setFirstName}
            keyboardType="name-phone-pad"
            autoCapitalize="none"
          />
          <TextFormField
            label="Change Last Name"
            placeholder="Joven"
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
            placeholder="jodijov@umich.edu"
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
          title="Enable Location for Predictions"
          startIcon="map-marker-outline"
          value={locationEnabled}
          onToggle={async (newValue) => {
            setLocationEnabled(newValue);
            try {
              const patchResp = await fetch(`${API_BASE_URL}/users/${userId}preferences`, {
                method: 'PATCH',
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
            onPress={() => navigation.navigate("Home")}
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
    marginBottom: 5,
  },
  image: {
    width: 65,
    height: 65,
    marginBottom: 10,
    borderRadius: 50,
  },
  buttonContainer: {
    marginTop: 24,
  },
});

export default SettingsScreen;