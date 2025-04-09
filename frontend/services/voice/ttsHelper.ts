// ttsHelper.ts
import * as Speech from 'expo-speech';
import { Platform } from 'react-native';

export function speakAppText(
  text: string,
  options?: {
    rate?: number;
    pitch?: number;
    language?: string;
    voice?: string;
  }
) {
  const defaultOptions = {
    rate: 1.0,
    pitch: 1.2,
    language: 'en-US',
    voice: Platform.OS === 'ios' ? 'com.apple.ttsbundle.Samantha-compact' : undefined,
  };

  const ttsOptions = { ...defaultOptions, ...options };

  console.log("speakAppText options:", ttsOptions, "Text:", text); // DEBUG log

  Speech.speak(text, ttsOptions);
}
export function stopSpeaking() {
  Speech.stop();
}
