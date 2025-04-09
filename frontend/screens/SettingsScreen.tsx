// SettingsScreen.tsx
import React, { useState } from 'react';
import { Image, SafeAreaView, ScrollView, Text, StyleSheet, View, Alert, Pressable} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import colors from '../assets/theme/colors';
import Accordion from '../components/Accordion';
import TextFormField from '../components/TextForm';
import Button from '../components/Button';
import Toggle from '../components/Toggle';
import VoiceCommandHelp from './VoiceCommandsHelp';
import { API_BASE_URL } from "../../database/firebaseConfig";
import { useUserData } from '../UserContext'; 
import { usePreferences } from "../context/PreferencesContext";
import { Ionicons } from "@expo/vector-icons";

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation();

  // Local states for name/email/password
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Local userID, set from fetchUserData
  const [userId, setUserId] = useState<string | null>(null);

  // Grab your user data context
  const { userData, setUserData } = useUserData();

  // Local profile picture state
  const [profilePicture, setProfilePicture] = useState<string>(''); 

  // Get your toggles from PreferencesContext
  const {
    voiceCommandsEnabled,
    setVoiceCommandsEnabled,
    audioFeedbackEnabled,
    setAudioFeedbackEnabled,
    locationEnabled,
    setLocationEnabled,
    showCommandPopups,
    setShowCommandPopups,
  } = usePreferences();

  // Mappings for images
  const getImageSource = (path: string) => {
    if (!path) return require("../assets/img/robin.png");

    const normalizedPath = path.replace(/\.\.\//g, "").trim().toLowerCase();
    const imageMappings: { [key: string]: any } = {
      "assets/img/blue_jay.png": require("../assets/img/blue_jay.png"),
      "assets/img/american_crow.png": require("../assets/img/american_crow.png"),
      "assets/img/canada_goose.png": require("../assets/img/canada_goose.png"),
      "assets/img/canvasback.png": require("../assets/img/canvasback.png"),
      "assets/img/common_grackle.png": require("../assets/img/common_grackle.png"),
      "assets/img/european_starling.png": require("../assets/img/european_starling.png"),
      "assets/img/mallard.png": require("../assets/img/mallard.png"),
      "assets/img/northern_cardinal.png": require("../assets/img/northern_cardinal.png"),
      "assets/img/red-winged-blackbird.png": require("../assets/img/red-winged-blackbird.png"),
      "assets/img/ring-billed-gull.png": require("../assets/img/ring-billed-gull.png"),
      "assets/img/tree-swallow.png": require("../assets/img/tree-swallow.png"),
      "assets/img/turkey_vulture.png": require("../assets/img/turkey_vulture.png"),
      "assets/img/american_woodcock.png": require("../assets/img/american_woodcock.png"),
    };

    const result = imageMappings[normalizedPath];
    return result || require("../assets/img/robin.png");
  };

  const profilePictures = [
    "assets/img/blue_jay.png",
    "assets/img/american_crow.png",
    "assets/img/canada_goose.png",
    "assets/img/canvasback.png",
    "assets/img/common_grackle.png",
    "assets/img/european_starling.png",
    "assets/img/mallard.png",
    "assets/img/northern_cardinal.png",
    "assets/img/red-winged-blackbird.png",
    "assets/img/ring-billed-gull.png",
    "assets/img/tree-swallow.png",
    "assets/img/turkey_vulture.png",
    "assets/img/american_woodcock.png",
  ];

  // Fetch user data from server, set userId, location, etc
  const fetchUserData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/me`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch user data');
      const data = await response.json();

      setUserId(data.id);
      setLocationEnabled(Boolean(data.locationPreferences));
      setFirstName(data.firstName || '');
      setLastName(data.lastName || '');
      setEmail(data.email || '');

      if (data.profilePicture) {
        setProfilePicture(data.profilePicture);
      } else {
        const random = profilePictures[Math.floor(Math.random() * profilePictures.length)];
        setProfilePicture(random);
        await fetch(`${API_BASE_URL}/users/${data.id}`, {
          method: 'PATCH',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profilePicture: random }),
        });
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchUserData(); 
    }, [])
  );

  // Handler for logging out
  const handleLogout = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      if (response.ok) {
        setUserData(null);
        navigation.reset({
          index: 0,
          routes: [{ name: "Home" }],
        });
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
        <Text accessibilityRole="header" style={styles.title}>
          Account
        </Text>

        <View
          accessible={true}
          accessibilityLabel={`Your account information. Name: ${userData?.firstName} ${userData?.lastName}. Email address: ${userData?.email}`}
          style={styles.accountCard}
        >
          <View style={styles.leftSide}>
            <View style={styles.topRow}>
              <Image
                accessible={true}
                accessibilityLabel="Account Profile Picture"
                source={getImageSource(profilePicture)}
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

        <Text accessibilityRole="header" style={styles.title}>
          Settings
        </Text>

        <Accordion title="Change Name" startIcon="account-edit-outline">
          <TextFormField
            label="Change First Name"
            placeholder="First"
            value={firstName}
            onChangeText={setFirstName}
            keyboardType="name-phone-pad"
            autoCapitalize="none"
          />
          <TextFormField
            label="Change Last Name"
            placeholder="Last"
            value={lastName}
            onChangeText={setLastName}
            keyboardType="name-phone-pad"
            autoCapitalize="none"
          />
          <Button
            title="Submit"
            variant="primary"
            onPress={async () => {
              if (!userId) return Alert.alert('Error', 'No user ID available');
              try {
                const resp = await fetch(`${API_BASE_URL}/users/${userId}`, {
                  method: 'PATCH',
                  credentials: 'include',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ firstName, lastName }),
                });
                if (!resp.ok) throw new Error('Failed to update name');

                const userResp = await fetch(`${API_BASE_URL}/users/me`, {
                  credentials: 'include',
                });
                if (!userResp.ok) throw new Error('Failed to refresh user data');

                const updatedUser = await userResp.json();
                setUserData(updatedUser);

                Alert.alert('Success', 'Name updated!');
              } catch (error) {
                Alert.alert('Error', (error as Error).message);
              }
            }}
          />
        </Accordion>

        <Accordion title="Change Email Address" startIcon="email-edit-outline">
          <TextFormField
            label="Change Email"
            placeholder="example@gmail.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Button
            title="Submit"
            variant="primary"
            onPress={async () => {
              if (!userId) return Alert.alert('Error', 'No user ID available');
              try {
                const resp = await fetch(`${API_BASE_URL}/users/${userId}`, {
                  method: 'PATCH',
                  credentials: 'include',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email }),
                });
                if (!resp.ok) throw new Error('Failed to update email');
                Alert.alert('Success', 'Email updated! Please log in again.');
                handleLogout();
              } catch (error) {
                Alert.alert('Error', (error as Error).message);
              }
            }}
          />
        </Accordion>

        <Accordion title="Change Password" startIcon="shield-edit-outline">
          <TextFormField
            label="New Password"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            isPassword
          />
          <Button
            title="Submit"
            variant="primary"
            onPress={async () => {
              if (!userId) return Alert.alert('Error', 'No user ID available');
              try {
                const resp = await fetch(`${API_BASE_URL}/users/${userId}/password`, {
                  method: 'PATCH',
                  credentials: 'include',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ password }),
                });
                if (!resp.ok) throw new Error('Failed to update password');
                Alert.alert('Success', 'Password changed!');
                setPassword('');
              } catch (error) {
                Alert.alert('Error', (error as Error).message);
              }
            }}
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
          description="Enabling voice commands allows you to navigate the app using verbal commands. Microphone access is required."
        />

        <Toggle
          title="Enable Audio Feedback"
          startIcon="volume-plus"
          value={audioFeedbackEnabled}
          onToggle={(newValue) => {
            setAudioFeedbackEnabled(newValue);
            console.log("Audio feedback toggle is now:", newValue);
          }}
          description="Enable spoken feedback for commands."
        />

        <Toggle
          title="Show Command Popups"
          startIcon="alert-circle-outline"
          value={showCommandPopups}
          onToggle={(newValue) => {
            setShowCommandPopups(newValue);
            console.log("Show command popups is now:", newValue);
          }}
          description="Enable or disable on-screen alerts after a voice command is recognized."
        />

        <Toggle
          title="Enable Location for Forecast"
          startIcon="map-marker-outline"
          value={locationEnabled}
          onToggle={async (newValue) => {
            setLocationEnabled(newValue);
            if (!userId) return;
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
          description="Enable your location for personalized predictions."
        />

        <VoiceCommandHelp />

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Robin's Privacy Policy"
          onPress={() => navigation.navigate("PrivacyPolicy")}
          style={({ pressed }) => [
            styles.row,
            pressed && { opacity: 0.6 },
          ]}
        >
          <Text style={styles.rowText}>Robin's Privacy Policy</Text>
          <Ionicons name="chevron-forward" size={22} color={colors.primary} />
        </Pressable>

        <View style={styles.buttonContainer}>
          <Button
            title="Logout"
            onPress={handleLogout}
            variant="secondary"
          />
          <Button
            title="Delete Account"
            variant="primary"
            onPress={() => {
              if (!userId) {
                Alert.alert('Error', 'No user ID to delete.'); 
                return;
              }
              Alert.alert(
                "Are you sure?",
                "This action will permanently delete your account and cannot be undone.",
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                      try {
                        const resp = await fetch(`${API_BASE_URL}/users/${userId}`, {
                          method: 'DELETE',
                          credentials: 'include',
                        });
                        if (!resp.ok) throw new Error('Failed to delete account');

                        Alert.alert("Account Deleted", "Your account has been successfully deleted.");
                        setUserData(null);
                        navigation.reset({
                          index: 0,
                          routes: [{ name: "Home" }],
                        });
                      } catch (error) {
                        Alert.alert("Error", (error as Error).message);
                        console.error("Account deletion failed:", error);
                      }
                    }
                  },
                ]
              );
            }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Styling remains identical
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
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 18,
    backgroundColor: colors.card,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  rowText: {
    fontFamily: "Radio Canada",
    fontSize: 18,
    color: colors.text,
  },
});

export default SettingsScreen;
