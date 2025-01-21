
import React from 'react';
import { View, Text, Image, StyleSheet, SafeAreaView, Alert, ScrollView } from 'react-native';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import colors from '../assets/theme/colors';
import TextFormField from '../components/TextForm';
import Button from '../components/Button';
import OrDivider from '../components/OrDivider';
import NavLink from '../components/NavLink';
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
      <ScrollView contentContainerStyle={styles.scrollContent}>
      
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
          style={{marginBottom: 20}}
          textStyle={styles.form}
        />

        <TextFormField
          placeholder="Password"
          isPassword
          style={{marginBottom: 12}}
          textStyle={styles.form}
        />

        <Button
          title="Sign In"
          onPress={() => Alert.alert('Sign In Button Pressed')}
          variant="primary"
          style={styles.form}
          textStyle={{fontSize: 20}}
        />

        <OrDivider />

        <Button
          title="Sign in with Google"
          onPress={handleGoogleSignIn}
          variant="card"
          icon={<MaterialCommunityIcons name="google" size={25} color={colors.accent} />}
        />

        <View style={styles.noAccountLayout}>
          <Text style={styles.noAccountText}>
            Don't have an account?
          </Text>
          <NavLink
            text="Sign up"
            targetTab="Identify" //TO DO: change this link to registration tab once it exists. 
            textStyle={[styles.noAccountLink, styles.noAccountText]}
          />
        </View>
        
      </View>
      </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  area: {
    width: '100%',
  },
  logo: {
    width: 125,
    height: 125,
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
    marginBottom: 24,
    lineHeight: 22,
  },
  form: {
    fontSize: 20,
    height: 50,
  },
  sizeContainer: {
    marginBottom: 24,
  },
  noAccountLayout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  noAccountText: {
    fontFamily: 'Radio Canada',
    fontSize: 18,
    color: colors.secondary,
    marginRight: 4,
  },
  noAccountLink: {
    fontWeight: 'bold',
  },
});
