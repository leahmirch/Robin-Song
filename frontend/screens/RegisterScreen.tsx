import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView, Text, StyleSheet, Image, View } from 'react-native';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import TextFormField from '../components/TextForm';
import Button from '../components/Button';
import OrDivider from '../components/OrDivider';
import NavLink from '../components/NavLink';
import colors from '../assets/theme/colors';
import { registerUser } from '../auth/authService';
import { CommonActions } from '@react-navigation/native';
import ErrorMessage from "../components/ErrorMessage";

export default function RegisterScreen() {
  const navigation = useNavigation();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {
    console.log("Attempting to register user...");
  
    if (!firstName || !lastName || !email || !password) {
      setError("All fields are required to register.");
      console.log("Error Set:", error);
      return;
    }
  
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Invalid email format.");
      console.log("Error Set:", error);
      return;
    }

    setLoading(true);
    
    try {
      const result = await registerUser(firstName, lastName, email, password);
      if (result) {
        console.log("User registered successfully:", result);

        navigation.dispatch(
          CommonActions.reset({
            index: 1,
            routes: [{ name: "Login", params: { successMessage: "Account created successfully! Please log in below." } }],
          })
        );
      }
    } catch (error: any) {
      console.log("Registration failed:", error.message);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

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
      <View style={styles.spacing}>
        <Image
          source={require('../assets/img/logos/robinNoText72.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Welcome to Robin!</Text>

        <Text style={styles.subtitle}>Enter your information to create an account.</Text>

        <ErrorMessage message={error} />

        <View style={styles.names}>
          <TextFormField
            placeholder="First Name"
            value={firstName} 
            onChangeText={setFirstName}
            autoCapitalize="none"
            style={{marginBottom: 20, width: '49%'}}
            textStyle={styles.form}
          />

          <TextFormField
            placeholder="Last Name" 
            value={lastName} 
            onChangeText={setLastName}
            autoCapitalize="none"
            style={{marginBottom: 20, width: '49%'}}
            textStyle={styles.form}
          />
        </View>
        

        <TextFormField
          placeholder="Email"
          value={email} 
          onChangeText={setEmail} 
          keyboardType="email-address"
          autoCapitalize="none"
          style={{marginBottom: 20}}
          textStyle={styles.form}
        />

        <TextFormField
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          isPassword
          style={{marginBottom: 12}}
          textStyle={styles.form}
        />

        <Button
          title={loading ? "Creating Account..." : "Create Account"}
          onPress={handleRegister}
          variant="primary"
          style={styles.form}
          textStyle={{fontSize: 20}}
        />

        <OrDivider />

        <Button
          title="Continue with Google"
          onPress={handleGoogleSignIn}
          variant="card"
          icon={<MaterialCommunityIcons name="google" size={25} color={colors.accent} />}
        />

        <View style={styles.accountLayout}>
          <Text style={styles.accountText}>
            Have an account?
          </Text>
          <NavLink
            text="Sign in"
            targetTab="Login"
            textStyle={[styles.accountLink, styles.accountText]}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignContent: 'center',
    backgroundColor: colors.background,
  },
  spacing: {
    padding: 24,
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
    alignSelf: 'center',
    marginBottom: 24,
  },
  form: {
    fontSize: 20,
    height: 50,
  },
  names: {
    flexDirection: 'row',
    gap: 6,
  },
  accountLayout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  accountText: {
    fontFamily: 'Radio Canada',
    fontSize: 18,
    color: colors.secondary,
    marginRight: 4,
  },
  accountLink: {
    fontWeight: 'bold',
  },
});
