module.exports = {
  expo: {
    name: "robin-song",
    owner: "robin-song",
    slug: "robin-song",
    scheme: "robinsong",
    orientation: "portrait",
    icon: "./frontend/assets/img/logos/robinAppIcon.png",
    android: {
      jsEngine: "hermes",
      package: "com.robinsong.robinsong",
      googleServicesFile:
        process.env.GOOGLE_SERVICES_JSON || "./google-services/google-services.json",
      config: {
        googleMaps: {
          apiKey: "temporary"
        }
      }
    },
    ios: {
      bundleIdentifier: "com.robinsong.robinsong",
      googleServicesFile:
        process.env.GOOGLE_SERVICES_INFO || "./google-services/GoogleService-Info.plist",
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        NSLocationWhenInUseUsageDescription: "We use your location to show bird hotspots near you.",
        NSMicrophoneUsageDescription: "We use your microphone audio to detect birds near you.",
        NSSpeechRecognitionUsageDescription: "Allow Robin to securely recognize user speech."
      },
      config: {
        googleMapsApiKey: "temporary"
      }
    },
    plugins: [
      "@react-native-firebase/app",
      "@react-native-firebase/auth",
      "expo-font",
      [
        "expo-splash-screen",
        {
          backgroundColor: "#ECA08D",
          image: "./frontend/assets/img/logos/robinAppIcon.png"
        }
      ],
      [
        "expo-build-properties",
        {
          ios: {
            useFrameworks: "static"
          }
        }
      ],
      [
        "expo-av",
        {
          "microphonePermission": "Allow Robin to access your microphone."
        }
      ],
      [
        "expo-location",
        {
          "locationAlwaysAndWhenInUsePermission": "Allow Robin to use your location."
        }
      ],
      [
        "@react-native-voice/voice",
        {
          microphonePermission: "Allow $(PRODUCT_NAME) to access your microphone",
          speechRecognitionPermission: "Allow $(PRODUCT_NAME) to securely recognize user speech"
        }
      ]
    ],
    extra: {
      eas: {
        projectId: "1a6b53c7-9874-4c72-93cf-b6b6799eef84"
      },
      EXPO_PUBLIC_FIREBASE_API_KEY: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
      EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
      EXPO_PUBLIC_FIREBASE_PROJECT_ID: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
      EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
      EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      EXPO_PUBLIC_FIREBASE_APP_ID: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
      EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
      EXPO_PUBLIC_FIREBASE_WEB_CLIENT_ID: process.env.EXPO_PUBLIC_FIREBASE_WEB_CLIENT_ID,
      EXPO_PUBLIC_UNSPLASH_ACCESS_KEY: process.env.EXPO_PUBLIC_UNSPLASH_ACCESS_KEY,
      EXPO_PUBLIC_SERVER_BASE_URL: process.env.EXPO_PUBLIC_SERVER_BASE_URL
    }
  }
};