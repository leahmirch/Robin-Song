// Import the functions you need from the SDKs you need
import Constants from "expo-constants";
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: Constants.manifest?.extra?.FIREBASE_API_KEY || process.env.FIREBASE_API_KEY,
  authDomain: Constants.manifest?.extra?.FIREBASE_AUTH_DOMAIN || process.env.FIREBASE_AUTH_DOMAIN,
  projectId: Constants.manifest?.extra?.FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID,
  storageBucket: Constants.manifest?.extra?.FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: Constants.manifest?.extra?.FIREBASE_MESSAGING_SENDER_ID || process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: Constants.manifest?.extra?.FIREBASE_APP_ID || process.env.FIREBASE_APP_ID,
  measurementId: Constants.manifest?.extra?.FIREBASE_MEASUREMENT_ID || process.env.FIREBASE_MEASUREMENT_ID,
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app); // For tracking user behavior
const db = getFirestore(app); // For storing/retrieving bird detection data
console.log("Final Firebase Config:", firebaseConfig);


export { db };

