// VoiceTester.tsx
import React, { useState } from 'react';
import { SafeAreaView, View, Text, Button, ScrollView, StyleSheet } from 'react-native';
import * as Speech from 'expo-speech';

export default function VoiceTester() {
  const [voices, setVoices] = useState<Speech.Voice[] | null>(null);

  const listVoices = async () => {
    try {
      const available = await Speech.getAvailableVoicesAsync();
      setVoices(available);
      console.log("Voices found:", available);
    } catch (err) {
      console.error("Error fetching voices:", err);
    }
  };

  const speakWithVoice = (voice: Speech.Voice) => {
    Speech.stop();
    Speech.speak("Hello! Testing you can find robin in the wooods robins like to travel " + voice.name, {
      voice: voice.identifier, // or voice.voiceURI
      rate: 1.0,
      pitch: 1.1,
      language: 'en-US',
    });
  };

  return (
    // Wrap everything in a SafeAreaView so the iOS notch doesn't hide it
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Outer container for padding */}
      <View style={styles.container}>
        <Button title="List Available Voices" onPress={listVoices} />

        {voices && (
          <ScrollView style={{ marginTop: 20 }}>
            {voices.map((v, i) => (
              <View key={i} style={{ marginBottom: 12 }}>
                <Text style={{ fontWeight: 'bold' }}>
                  {v.name} ({v.identifier})
                </Text>
                <Text>Lang: {v.language}</Text>
                <Button
                  title="Speak Test"
                  onPress={() => speakWithVoice(v)}
                />
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    // any other styling you like
  }
});
