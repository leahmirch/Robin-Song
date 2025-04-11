// ttsHelper.ts
import * as Speech from 'expo-speech';
import { Platform } from 'react-native';

let isSpeaking = false;
let onFinishCallback: (() => void) | null = null;

export function speakAppText(
  text: string,
  options?: {
    rate?: number;
    pitch?: number;
    language?: string;
    voice?: string;
    onFinish?: () => void;
  }
) {
  if (isSpeaking) {
    console.log("TTS already speaking. Skipping new request:", text);
    return;
  }

  const defaultOptions = {
    rate: 1.0,
    pitch: 1.2,
    language: 'en-US',
    voice: Platform.OS === 'ios' ? 'com.apple.ttsbundle.Samantha-compact' : undefined,
  };

  const ttsOptions: Speech.SpeechOptions = {
    ...defaultOptions,
    ...options,
    onDone: () => {
      isSpeaking = false;
      console.log("Speech finished:", text);
      if (onFinishCallback) onFinishCallback();
    },
    onStopped: () => {
      isSpeaking = false;
      console.log("Speech manually stopped.");
      if (onFinishCallback) onFinishCallback();
    },
    onError: (error) => {
      isSpeaking = false;
      console.log("Speech error:", error);
      if (onFinishCallback) onFinishCallback();
    },
  };

  onFinishCallback = options?.onFinish || null;
  isSpeaking = true;

  console.log("speakAppText options:", ttsOptions, "Text:", text);
  Speech.speak(text, ttsOptions);
}

export function stopSpeaking() {
  if (isSpeaking) {
    Speech.stop();
    isSpeaking = false;
    onFinishCallback = null;
  }
}
