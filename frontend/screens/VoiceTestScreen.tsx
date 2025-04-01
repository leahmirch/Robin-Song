// VoiceTestScreen.tsx
import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Alert, StyleSheet, AppState, AppStateStatus } from "react-native";
import Voice, { SpeechResultsEvent, SpeechErrorEvent } from "@react-native-voice/voice";

const VoiceTestScreen: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", setAppState);
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    // Register callbacks on mount
    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechError = onSpeechError;
    // Cleanup on unmount
    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const onSpeechResults = (event: SpeechResultsEvent) => {
    if (event.value && event.value.length > 0) {
      const recognizedPhrase = event.value[0].toLowerCase();
      Alert.alert("Heard Voice Command", recognizedPhrase);
      console.log("Voice Command:", recognizedPhrase);
    }
    setIsListening(false);
  };

  const onSpeechError = (event: SpeechErrorEvent) => {
    console.error("Speech recognition error:", event.error);
    setIsListening(false);
    Alert.alert("Voice Error", JSON.stringify(event.error));
  };

  const startVoice = async () => {
    if (appState !== "active") {
      Alert.alert("Error", "App is not active; cannot start voice recognition.");
      return;
    }
    try {
      setIsListening(true);
      await Voice.start("en-US");
      console.log("Voice recognition started.");
    } catch (error) {
      console.error("Error starting voice:", error);
      setIsListening(false);
    }
  };

  const stopVoice = async () => {
    try {
      await Voice.stop();
      setIsListening(false);
      console.log("Voice recognition stopped.");
    } catch (error) {
      console.error("Error stopping voice:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Minimal @react-native-voice/voice Test</Text>
      <TouchableOpacity onPress={startVoice} style={styles.button}>
        <Text style={styles.buttonText}>Start Voice Recognition</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={stopVoice} style={styles.button}>
        <Text style={styles.buttonText}>Stop Voice Recognition</Text>
      </TouchableOpacity>
      <Text style={styles.info}>Listening: {isListening ? "Yes" : "No"}</Text>
    </View>
  );
};

export default VoiceTestScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#ccc",
    padding: 12,
    marginVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 16,
  },
  info: {
    marginTop: 20,
    fontSize: 16,
  },
});