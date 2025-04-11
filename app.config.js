module.exports = {
  expo: {
    name: "Robin",
    owner: "robin-song",
    slug: "robin-song",
    scheme: "robinsong",
    orientation: "portrait",
    icon: "./frontend/assets/img/logos/robinAppIcon.png",
    android: {
      jsEngine: "hermes",
      package: "com.robinsong.robinsong",
      icon: "./frontend/assets/img/logos/adaptive-icon.png",
      adaptiveIcon: {
        foregroundImage: "./frontend/assets/img/logos/adaptive-icon.png"
      },
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
        NSSpeechRecognitionUsageDescription: "Enabling speech recognition allows Robin to understand your voice commands and respond with bird information or actions tailored to your request."
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
          image: "./frontend/assets/img/logos/splash-icon.png",
          "imageWidth": 150
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
          "microphonePermission": "Robin needs access to your microphone to detect bird songs around you."
        }
      ],
      [
        "expo-location",
        {
          "locationAlwaysAndWhenInUsePermission": "Robin uses your location to predict where birds are most likely to appear near you."
        }
      ],
      [
        "@react-native-voice/voice",
        {
          microphonePermission: "Robin uses your microphone to listen for voice commands.",
          speechRecognitionPermission: "Robin uses speech recognition to understand what you say and respond with bird-related information."
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
      EXPO_PUBLIC_SERVER_BASE_URL: process.env.EXPO_PUBLIC_SERVER_BASE_URL
    }
  }
};