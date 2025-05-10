import React, { useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  Pressable,
  useColorScheme,
  Alert,
} from "react-native";
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from "@expo/vector-icons";
import { WebView } from "react-native-webview";
import colors from "../assets/theme/colors";

const htmlAsset = require("../assets/Privacy-Policy/PrivacyPolicy.html");

export default function PrivacyPolicyScreen() {
  const isDark = useColorScheme() === "dark";
  const navigation = useNavigation();

  const [progress, setProgress] = useState(0);
  const [hasError, setHasError] = useState(false);

  const ProgressBar = () =>
    progress < 1 && !hasError ? (
      <View style={styles.progressContainer}>
        <View
          style={[
            styles.progressBar,
            { width: `${Math.ceil(progress * 100)}%` },
          ]}
        />
      </View>
    ) : null;

  const ErrorView = () => (
    <View style={styles.loader}>
      <Ionicons name="chevron-forward" size={22} color={colors.primary} />
      <Text style={[styles.errorText, { color: colors.text }]}>
        Couldn’t load the policy.
      </Text>
      <Pressable
        style={styles.retryBtn}
        onPress={() => {
          setHasError(false);
          setProgress(0);
        }}
        accessibilityRole="button"
        accessibilityLabel="Retry loading"
      >
        <Text style={styles.retryText}>Try Again</Text>
      </Pressable>
    </View>
  );

  return (
    <SafeAreaView
      style={[
        styles.screen,
        { backgroundColor: isDark ? colors.black : colors.background },
      ]}
    >

      <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-back" size={22} color={colors.primary} />
        <Text style={{ fontFamily: 'Radio Canada', color: colors.text, fontSize: 18 }}>Back</Text>
      </Pressable>

      <View style={styles.header}>
        <Text
          accessibilityRole="header"
          style={[
            styles.headerTitle,
            { color: colors.secondary },
          ]}
        >
          Privacy Policy
        </Text>
      </View>

      <ProgressBar />

      <View
        style={[
          styles.card,
          { backgroundColor: isDark ? colors.cardDark : colors.card },
        ]}
      >
        <View style={styles.innerPad}>
          {hasError ? (
            <ErrorView />
          ) : (
            <WebView
              originWhitelist={["*"]}
              source={htmlAsset}
              startInLoadingState
              onLoadProgress={({ nativeEvent }) =>
                setProgress(nativeEvent.progress)
              }
              onError={() => setHasError(true)}
              style={{ backgroundColor: "transparent" }}
              injectedJavaScript={`
                (function() {
                  document.body.style.background = "transparent";
                  document.body.style.color = "${isDark ? "#dddddd" : "#333333"}";
                  document.body.style.margin = "0";
                  // extra padding inside the HTML as well (for edge cases)
                  document.body.style.padding = "0 4px";
                })();
                true;
              `}
              renderLoading={() => (
                <View style={styles.loader}>
                  <ActivityIndicator size="large" color={colors.primary} />
                </View>
              )}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { 
    flex: 1 
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    paddingLeft: 10,
  },
  header: {
    alignItems: "center",
    marginLeft: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.accent,
  },
  headerTitle: {
    justifyContent: 'center',
    alignSelf: 'center',
    fontFamily: "Caprasimo",
    fontSize: 28,
    pointerEvents: 'none',
    paddingVertical: 12,
  },
  progressContainer: {
    height: 2,
    backgroundColor: "transparent",
  },
  progressBar: {
    height: 2,
    backgroundColor: colors.primary,
  },
  card: {
    flex: 1,
    margin: 16,
    borderRadius: 10,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  innerPad: {
    flex: 1,
    padding: 16,          
  },
  loader: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  errorText: {
    fontFamily: "Radio Canada",
    fontSize: 16,
    marginBottom: 12,
  },
  retryBtn: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  retryText: {
    color: "#fff",
    fontFamily: "Radio Canada",
    fontSize: 16,
  },
});
