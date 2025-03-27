// VoiceCommandManager.tsx
import React, { useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import Voice, { SpeechResultsEvent, SpeechErrorEvent } from '@react-native-voice/voice';
import * as SpeechFeedback from 'expo-speech';

import { usePreferences } from '../../backend/src/contexts/PreferencesContext';
import { useCurrentScreen } from '../context/CurrentScreenContext';
import { navigate, openChatModal, closeChatModal, navigationRef } from './navigationService';

/**
 * Robust Command Mapping:
 * 
 * Supported commands and their synonyms (order matters):
 * 
 * 1. Identify Tab:
 *    - Synonyms: "identify", "go to identify", "open identify", "show identify", "start identify"
 * 
 * 2. Forecast Tab:
 *    - Synonyms: "forecast", "go to forecast", "open forecast", "show forecast", "start forecast"
 * 
 * 3. History Tab:
 *    - Synonyms: "history", "go to history", "open history", "show history"
 * 
 * 4. Settings Tab:
 *    - Synonyms: "settings", "go to settings", "open settings", "show settings"
 * 
 * 5. Close Chat Modal:
 *    - Synonyms: "close chat", "exit chat", "hide chat"
 * 
 * 6. Chat Modal (open):
 *    - Synonyms: "chat", "go to chat", "open chat", "show chat"
 * 
 * 7. Start Detection:
 *    - Synonyms: "start detection", "begin detection", "activate detection"
 * 
 * 8. Stop Detection:
 *    - Synonyms: "stop detection", "end detection", "deactivate detection"
 */
const commandMapping: { command: string; synonyms: string[] }[] = [
  { command: 'Identify', synonyms: ['identify', 'go to identify', 'open identify', 'show identify', 'start identify'] },
  { command: 'Forecast', synonyms: ['forecast', 'go to forecast', 'open forecast', 'show forecast', 'start forecast'] },
  { command: 'History', synonyms: ['history', 'go to history', 'open history', 'show history'] },
  { command: 'Settings', synonyms: ['settings', 'go to settings', 'open settings', 'show settings'] },
  // Reorder: Check for closing chat commands before the general chat command.
  { command: 'close chat', synonyms: ['close chat', 'exit chat', 'hide chat'] },
  { command: 'chat', synonyms: ['chat', 'go to chat', 'open chat', 'show chat'] },
  { command: 'start detection', synonyms: ['start detection', 'begin detection', 'activate detection'] },
  { command: 'stop detection', synonyms: ['stop detection', 'end detection', 'deactivate detection'] }
];

/**
 * Cleans the recognized text and attempts to match a command.
 */
const parseCommand = (recognizedText: string): string | null => {
  // Remove non-alphabet characters (except spaces) and convert to lowercase.
  const cleanedText = recognizedText.replace(/[^a-zA-Z\s]/g, '').toLowerCase();
  // First try to match using whole-word boundaries.
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

const DEBOUNCE_DELAY = 600; // Extended debounce delay in milliseconds

const VoiceCommandManager: React.FC = () => {
  const { voiceCommandsEnabled } = usePreferences();
  const { currentScreen } = useCurrentScreen();

  const recognitionInProgress = useRef(false);
  const cooldownTimeout = useRef<NodeJS.Timeout | null>(null);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const lastRecognizedText = useRef<string>('');
  const alertShown = useRef(false);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const showAlertOnce = (title: string, message: string) => {
    if (!alertShown.current) {
      alertShown.current = true;
      Alert.alert(title, message, [
        { text: 'OK', onPress: () => { alertShown.current = false; } },
      ]);
      SpeechFeedback.speak(message);
    }
  };

  const processCommand = (commandName: string) => {
    const currentRoute = navigationRef.getCurrentRoute()?.name || '';
    console.log(`Current route: "${currentRoute}", Command: "${commandName}"`);

    // Handle detection commands separately
    if (commandName === 'start detection') {
      showAlertOnce('Voice Command', 'Starting detection (not yet implemented)');
      return;
    }
    if (commandName === 'stop detection') {
      showAlertOnce('Voice Command', 'Stopping detection (not yet implemented)');
      return;
    }

    // Process chat commands
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
    // For other commands, if chat modal is open, close it.
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
      // Use the last element for a more complete phrase.
      const recognizedPhrase = event.value[event.value.length - 1].toLowerCase().trim();
      console.log("Recognized phrase:", recognizedPhrase);
      
      // Store the latest phrase and reset the debounce timer.
      lastRecognizedText.current = recognizedPhrase;
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
      
      // Wait DEBOUNCE_DELAY milliseconds before processing.
      debounceTimeout.current = setTimeout(() => {
        const command = parseCommand(lastRecognizedText.current);
        if (!command) {
          showAlertOnce('Voice Command', `Command not recognized: ${lastRecognizedText.current}`);
        }
        if (command && !cooldownTimeout.current) {
          console.log('Voice Command:', command);
          stopListening();
          processCommand(command);
          // 2‑second cooldown to prevent repeat triggers.
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
