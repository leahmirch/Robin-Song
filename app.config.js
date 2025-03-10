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
            NSLocationWhenInUseUsageDescription: "We use your location to show bird hotspots near you."
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
      ]
    ],
    extra: {
      eas: {
        projectId: "1a6b53c7-9874-4c72-93cf-b6b6799eef84"
      },
      FIREBASE_API_KEY: process.env.FIREBASE_API_KEY || "${FIREBASE_API_KEY}",
      FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN || "${FIREBASE_AUTH_DOMAIN}",
      FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || "${FIREBASE_PROJECT_ID}",
      FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET || "${FIREBASE_STORAGE_BUCKET}",
      FIREBASE_MESSAGING_SENDER_ID:
        process.env.FIREBASE_MESSAGING_SENDER_ID || "${FIREBASE_MESSAGING_SENDER_ID}",
      FIREBASE_APP_ID: process.env.FIREBASE_APP_ID || "${FIREBASE_APP_ID}",
      FIREBASE_MEASUREMENT_ID:
        process.env.FIREBASE_MEASUREMENT_ID || "${FIREBASE_MEASUREMENT_ID}",
      UNSPLASH_ACCESS_KEY:
        process.env.EXPO_PUBLIC_UNSPLASH_ACCESS_KEY || "${EXPO_PUBLIC_UNSPLASH_ACCESS_KEY}"
    }
  }
};
