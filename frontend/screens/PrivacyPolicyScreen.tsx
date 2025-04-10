import React, { useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  Pressable,
  useColorScheme,
} from "react-native";
import { WebView } from "react-native-webview";
import colors from "../assets/theme/colors";

const htmlAsset = require("../assets/Privacy-Policy/PrivacyPolicy.html");

export default function PrivacyPolicyScreen() {
  const isDark = useColorScheme() === "dark";

  const [progress, setProgress] = useState(0);  // 0 → 1
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
  screen: { flex: 1 },

  header: {
    alignItems: "center",
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#0002",
  },
  headerTitle: {
    fontFamily: "Caprasimo",
    fontSize: 28,
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
