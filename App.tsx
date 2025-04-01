import React, { useState, useEffect } from "react";
import { useFonts } from "expo-font";
import { StyleSheet, ActivityIndicator } from "react-native";
import { app } from "./database/firebaseConfig";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { PreferencesProvider } from "./frontend/context/PreferencesContext";
import RootLayout from "./frontend/app/RootLayout"; 
import { UserDataProvider } from './frontend/UserContext';

const auth = getAuth(app);

export default function App() {
  const [loaded] = useFonts({
    'Caprasimo': require('./frontend/assets/fonts/Caprasimo.ttf'),
    'Radio Canada': require('./frontend/assets/fonts/RadioCanadaVariable.ttf'),
    'Radio Canada Italic': require('./frontend/assets/fonts/RadioCanadaItalic.ttf'),
  });

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);
      setIsLoading(false);
    });
    return unsubscribe;
  }, []);

  if (!loaded || isLoading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <UserDataProvider>
      <PreferencesProvider>
        <RootLayout />
      </PreferencesProvider>
    </UserDataProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'colors.background',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
