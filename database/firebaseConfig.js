// Import the functions you need from the SDKs you need
import Constants from "expo-constants";
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported as analyticsIsSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth, initializeAuth, browserSessionPersistence, browserLocalPersistence, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: Constants.expoConfig?.extra?.EXPO_PUBLIC_FIREBASE_API_KEY || process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: Constants.expoConfig?.extra?.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: Constants.expoConfig?.extra?.EXPO_PUBLIC_FIREBASE_PROJECT_ID || process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: Constants.expoConfig?.extra?.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: Constants.expoConfig?.extra?.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: Constants.expoConfig?.extra?.EXPO_PUBLIC_FIREBASE_APP_ID || process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: Constants.expoConfig?.extra?.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);

const db = getFirestore(app); // For storing/retrieving bird detection data


// Analytics (Optional, only for supported environments)
let analytics;
analyticsIsSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(app);
    console.log(' Analytics initialized');
  } else {
    console.warn('Analytics not supported in this environment');
  }
});

// Initialize Firebase Auth with platform-specific persistence
let auth;

if (Platform.OS === 'web') {
  // Web-specific persistence
  auth = getAuth(app);
  auth.setPersistence(browserLocalPersistence); // Use localStorage for persistence
  console.log('Auth initialized with browserLocalPersistence');
} else {
  // Mobile-specific persistence
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
  console.log('Auth initialized with AsyncStorage persistence');
}

export { db, auth, googleProvider, app };