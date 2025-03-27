// VoiceCommandManager.tsx
import React, { useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import Voice, { SpeechResultsEvent, SpeechErrorEvent } from '@react-native-voice/voice';
import * as SpeechFeedback from 'expo-speech';

import { usePreferences } from '../../backend/src/contexts/PreferencesContext';
import { useCurrentScreen } from '../context/CurrentScreenContext';
import { navigate, openChatModal, closeChatModal, navigationRef } from './navigationService';

const WAKE_WORD = "robin"; // Only process commands if this word is spoken

// General navigation commands
const generalCommands: { command: string; synonyms: string[] }[] = [
  { command: 'Identify', synonyms: ['identify', 'go to identify', 'open identify', 'show identify', 'start identify'] },
  { command: 'Forecast', synonyms: ['forecast', 'go to forecast', 'open forecast', 'show forecast', 'start forecast'] },
  { command: 'History', synonyms: ['history', 'go to history', 'open history', 'show history'] },
  { command: 'Settings', synonyms: ['settings', 'go to settings', 'open settings', 'show settings'] },
  { command: 'close chat', synonyms: ['close chat', 'exit chat', 'hide chat'] },
  { command: 'chat', synonyms: ['chat', 'go to chat', 'open chat', 'show chat'] },
  { command: 'start detection', synonyms: ['start detection', 'begin detection', 'activate detection'] },
  { command: 'stop detection', synonyms: ['stop detection', 'end detection', 'deactivate detection'] },
  { command: 'logout', synonyms: ['logout', 'log out', 'sign out', 'exit account'] } // New logout command
];

// Settings-specific toggle commands
const settingsCommands: { command: string; synonyms: string[] }[] = [
  {
    command: 'enable voice commands',
    synonyms: ['enable voice commands', 'turn on voice commands', 'activate voice commands']
  },
  {
    command: 'disable voice commands',
    synonyms: ['disable voice commands', 'turn off voice commands', 'deactivate voice commands']
  },
  {
    command: 'enable audio feedback',
    synonyms: ['enable audio feedback', 'turn on audio feedback', 'activate audio feedback']
  },
  {
    command: 'disable audio feedback',
    synonyms: ['disable audio feedback', 'turn off audio feedback', 'deactivate audio feedback']
  },
  {
    command: 'enable location',
    synonyms: ['enable location', 'turn on location', 'activate location', 'enable location for predictions', 'turn on location for predictions']
  },
  {
    command: 'disable location',
    synonyms: ['disable location', 'turn off location', 'deactivate location', 'disable location for predictions', 'turn off location for predictions']
  }
];

const commandMapping = [...generalCommands, ...settingsCommands];

/**
 * Parses the recognized text.
 * - Checks for the wake word; if missing, returns null.
 * - Removes the wake word and then attempts to match the remainder against the command mapping.
 */
const parseCommand = (recognizedText: string): string | null => {
  const lowerText = recognizedText.toLowerCase();
  if (!lowerText.includes(WAKE_WORD)) {
    console.log(`Wake word "${WAKE_WORD}" not detected. Ignoring input.`);
    return null;
  }
  // Remove wake word from text
  const textWithoutWake = lowerText.replace(new RegExp(`\\b${WAKE_WORD}\\b`, 'g'), '').trim();
  const cleanedText = textWithoutWake.replace(/[^a-zA-Z\s]/g, '').toLowerCase();

  // First try matching using whole-word boundaries.
  for (const mapping of commandMapping) {
    for (const synonym of mapping.synonyms) {
      const cleanedSynonym = synonym.replace(/[^a-zA-Z\s]/g, '').toLowerCase();
      const regex = new RegExp(`\\b${cleanedSynonym}\\b`);
      if (regex.test(cleanedText)) {
        return mapping.command;
      }
    }
  }
  // Fallback: check if any synonym is a substring.
  for (const mapping of commandMapping) {
    for (const synonym of mapping.synonyms) {
      const cleanedSynonym = synonym.replace(/[^a-zA-Z\s]/g, '').toLowerCase();
      if (cleanedText.includes(cleanedSynonym)) {
        return mapping.command;
      }
    }
  }
  return null;
};

const DEBOUNCE_DELAY = 600;

const VoiceCommandManager: React.FC = () => {
  const { voiceCommandsEnabled, audioFeedbackEnabled, setVoiceCommandsEnabled, setAudioFeedbackEnabled, locationEnabled, setLocationEnabled } = usePreferences();
  const { currentScreen } = useCurrentScreen();

  // Use a ref for audioFeedback to always get the latest value.
  const audioFeedbackRef = useRef(audioFeedbackEnabled);
  useEffect(() => {
    audioFeedbackRef.current = audioFeedbackEnabled;
  }, [audioFeedbackEnabled]);

  // This function provides visual feedback via Alert and then speaks the message if audio feedback is enabled.
  const showAlertOnce = (title: string, message: string) => {
    Alert.alert(title, message, [{ text: 'OK' }]);
    if (audioFeedbackRef.current) {
      console.log("Audio feedback enabled; speaking: " + message);
      SpeechFeedback.speak(message, {
        language: 'en-US',
        rate: 1.0,
        pitch: 1.0,
        onDone: () => console.log("Spoken feedback finished"),
        onError: (error) => console.error("SpeechFeedback error:", error),
      });
    } else {
      console.log("Audio feedback disabled; not speaking: " + message);
    }
  };

  const recognitionInProgress = useRef(false);
  const cooldownTimeout = useRef<NodeJS.Timeout | null>(null);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const lastRecognizedText = useRef<string>('');

  useEffect(() => {
    if (voiceCommandsEnabled) {
      Voice.onSpeechResults = onSpeechResults;
      Voice.onSpeechError = onSpeechError;
      startListening();
    } else {
      stopListening();
    }
    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
      if (cooldownTimeout.current) clearTimeout(cooldownTimeout.current);
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
  }, [voiceCommandsEnabled]);

  const startListening = async () => {
    if (recognitionInProgress.current) {
      console.log("Already listening; skipping start.");
      return;
    }
    try {
      recognitionInProgress.current = true;
      await Voice.start('en-US');
      console.log('Voice recognition started.');
    } catch (e) {
      console.error('Error starting voice:', e);
      recognitionInProgress.current = false;
    }
  };

  const stopListening = async () => {
    try {
      await Voice.stop();
    } catch (e) {
      console.error('Error stopping voice:', e);
    } finally {
      recognitionInProgress.current = false;
    }
  };

  /**
   * Processes the recognized command.
   * - When on the Settings screen, if the command is one of the settings toggles,
   *   it updates the corresponding preference.
   * - For logout, it navigates to Home (and you can insert any auth sign-out logic if needed).
   * - Otherwise, it handles navigation as before.
   */
  const processCommand = (commandName: string) => {
    const currentRoute = navigationRef.getCurrentRoute()?.name || '';
    console.log(`Current route: "${currentRoute}", Command: "${commandName}"`);

    // If on the Settings screen, process settings-specific commands.
    if (currentRoute.toLowerCase() === 'settings') {
      if (commandName === 'enable voice commands') {
        setVoiceCommandsEnabled(true);
        showAlertOnce('Settings', 'Voice commands enabled');
        return;
      }
      if (commandName === 'disable voice commands') {
        setVoiceCommandsEnabled(false);
        showAlertOnce('Settings', 'Voice commands disabled');
        return;
      }
      if (commandName === 'enable audio feedback') {
        setAudioFeedbackEnabled(true);
        showAlertOnce('Settings', 'Audio feedback enabled');
        return;
      }
      if (commandName === 'disable audio feedback') {
        setAudioFeedbackEnabled(false);
        showAlertOnce('Settings', 'Audio feedback disabled');
        return;
      }
      if (commandName === 'enable location') {
        setLocationEnabled(true);
        showAlertOnce('Settings', 'Location enabled for predictions');
        return;
      }
      if (commandName === 'disable location') {
        setLocationEnabled(false);
        showAlertOnce('Settings', 'Location disabled for predictions');
        return;
      }
    }

    // Logout command (available on any screen)
    if (commandName === 'logout') {
      // You might want to call your auth signOut function here.
      showAlertOnce('Voice Command', 'Logging out');
      // For now, we navigate to Home.
      navigate("Home");
      return;
    }

    // Process general navigation commands.
    if (commandName === 'start detection') {
      showAlertOnce('Voice Command', 'Starting detection (not yet implemented)');
      return;
    }
    if (commandName === 'stop detection') {
      showAlertOnce('Voice Command', 'Stopping detection (not yet implemented)');
      return;
    }
    if (commandName === 'chat') {
      if (currentRoute.toLowerCase() === 'chat') {
        showAlertOnce('Voice Command', 'Already on Chat');
      } else if (openChatModal) {
        openChatModal();
        showAlertOnce('Voice Command', 'Opening Chat');
      } else {
        showAlertOnce('Voice Command', 'Chat modal not available');
      }
      return;
    }
    if (commandName === 'close chat') {
      if (closeChatModal) {
        closeChatModal();
        showAlertOnce('Voice Command', 'Closing Chat');
      }
      return;
    }
    if (currentRoute.toLowerCase() === 'chat') {
      closeChatModal();
    }
    if (currentRoute.trim().toLowerCase() === commandName.trim().toLowerCase()) {
      showAlertOnce('Voice Command', `Already on ${commandName} tab`);
    } else {
      navigate(commandName);
      showAlertOnce('Voice Command', `Navigating to ${commandName}`);
    }
  };

  const onSpeechResults = (event: SpeechResultsEvent) => {
    if (event.value && event.value.length > 0) {
      const recognizedPhrase = event.value[event.value.length - 1].toLowerCase().trim();
      console.log("Recognized phrase:", recognizedPhrase);
      
      lastRecognizedText.current = recognizedPhrase;
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
      
      debounceTimeout.current = setTimeout(() => {
        const command = parseCommand(lastRecognizedText.current);
        if (!command) {
          console.log(`No valid command recognized from: ${lastRecognizedText.current}. Ignoring.`);
          return;
        }
        if (command && !cooldownTimeout.current) {
          console.log('Voice Command:', command);
          stopListening();
          processCommand(command);
          cooldownTimeout.current = setTimeout(() => {
            cooldownTimeout.current = null;
            startListening();
          }, 2000);
        } else if (command) {
          console.log('In cooldown, ignoring command:', command);
        }
        debounceTimeout.current = null;
      }, DEBOUNCE_DELAY);
    } else {
      stopListening();
      setTimeout(() => startListening(), 1000);
    }
  };

  const onSpeechError = (event: SpeechErrorEvent) => {
    console.error('Speech recognition error:', event.error);
    if (event.error?.message?.includes('already started')) {
      console.log('Already started error encountered. Ignoring.');
    } else {
      showAlertOnce('Voice Error', JSON.stringify(event.error));
    }
    stopListening();
    if (!cooldownTimeout.current) {
      setTimeout(() => startListening(), 1000);
    }
  };

  return null;
};

export default VoiceCommandManager;