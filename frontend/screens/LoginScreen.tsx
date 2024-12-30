import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { googleSignIn, signOutUser } from "../auth/authService";

const LoginScreen: React.FC = () => {
  const handleGoogleSignIn = async () => {
    const user = await googleSignIn();
    if (user) {
      console.log("Logged in user:", user.displayName);
    }
  };

  const handleSignOut = async () => {
    await signOutUser();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Robin Song</Text>
      <Button title="Sign in with Google" onPress={handleGoogleSignIn} />
      <Button title="Sign Out" onPress={handleSignOut} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
});

export default LoginScreen;
