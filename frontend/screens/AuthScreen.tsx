
import React from 'react';
import { View, Text, Image, StyleSheet, SafeAreaView, Alert, ScrollView } from 'react-native';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import colors from '../assets/theme/colors';
import TextFormField from '../components/TextForm';
import Button from '../components/Button';
import OrDivider from '../components/OrDivider';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import * as AuthSession from 'expo-auth-session';


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
    <SafeAreaView style={styles.container}>
      <View style={styles.area}>
        <Image
          source={require('../assets/img/logos/robinNoText72.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.title}>Sign in to Robin!</Text>

        <Text style={styles.subtitle}>Enter your account information to sign in.</Text>

          <TextFormField
            placeholder="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            style={{marginBottom: 24}}
            textStyle={styles.form}
          />

          <TextFormField
            placeholder="Password"
            isPassword
            style={{marginBottom: 16}}
            textStyle={styles.form}
          />

        <Button
          title="Sign In"
          onPress={() => Alert.alert('Sign In Button Pressed')}
          variant="primary"
          style={styles.form}
          textStyle={{fontSize: 24}}
        />

        <OrDivider />

        <Button
          title="Sign in with Google"
          onPress={handleGoogleSignIn}
          variant="card"
          icon={<MaterialCommunityIcons name="google" size={35} color={colors.accent} />}
        />

        <Text style={styles.noAccount}>
          Don't have an account? <strong>Sign up</strong>
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignContent: "center",
  },
  area: {
    padding: 24,
  },
  logo: {
    width: 150,
    height: 150,
    alignSelf: "center",
  },
  title: {
    fontFamily: 'Caprasimo',
    fontSize: 32,
    color: colors.secondary,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: 'Radio Canada',
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 22,
  },
  form: {
    fontSize: 24,
    height: 50,
  },
  sizeContainer: {
    marginBottom: 24,
  },
  noAccount: {
    fontFamily: 'Radio Canada',
    fontSize: 20,
    color: colors.secondary,
    alignSelf: 'center',
    justifyContent: 'flex-end',
    marginTop: 80,
    marginBottom: 16,
  }
});
