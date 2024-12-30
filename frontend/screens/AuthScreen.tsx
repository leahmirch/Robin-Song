import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import colors from '../assets/theme/colors';

export default function AuthScreen() {
  const handleGoogleSignIn = async () => {
    try {
      const auth = getAuth();
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      console.log('User signed in with Google');
    } catch (error) {
      console.error('Error during sign-in:', error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Logo or App Branding */}
      <Image
        style={styles.logo}
        resizeMode="contain"
      />

      {/* Welcome Text */}
      <Text style={styles.title}>Welcome to Robin!</Text>
      <Text style={styles.subtitle}>
        Sign in to save your bird sightings and access your history anytime.
      </Text>

      {/* Google Sign-In Button */}
      <TouchableOpacity style={styles.googleButton} onPress={handleGoogleSignIn}>
        <Image
          style={styles.googleIcon}
        />
        <Text style={styles.googleButtonText}>Sign in with Google</Text>
      </TouchableOpacity>

      {/* Optional Footer */}
      <Text style={styles.footerText}>Your adventure with birds starts here! 🐦</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 20,
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  title: {
    fontFamily: 'Caprasimo',
    fontSize: 28,
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontFamily: 'Radio Canada',
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  googleIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  googleButtonText: {
    fontFamily: 'Radio Canada',
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  footerText: {
    fontFamily: 'Radio Canada Italic',
    fontSize: 14,
    color: colors.secondary,
    textAlign: 'center',
    marginTop: 40,
  },
});
