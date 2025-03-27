// VoiceCommandManager.tsx
import React, { useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import Voice, { SpeechResultsEvent, SpeechErrorEvent } from '@react-native-voice/voice';
import * as SpeechFeedback from 'expo-speech';

import { usePreferences } from '../../backend/src/contexts/PreferencesContext';
import { useCurrentScreen } from '../context/CurrentScreenContext';
import { navigate, openChatModal, closeChatModal, isChatModalOpen, navigationRef } from './navigationService';

const VoiceCommandManager: React.FC = () => {
  const { voiceCommandsEnabled } = usePreferences();
  // Retaining context for backward compatibility (if needed elsewhere)
  const { currentScreen } = useCurrentScreen();

  const recognitionInProgress = useRef(false);
  const cooldownTimeout = useRef<NodeJS.Timeout | null>(null);
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
        {
          text: 'OK',
          onPress: () => {
            alertShown.current = false;
          },
        },
      ]);
      SpeechFeedback.speak(message);
    }
  };

  const processCommand = (commandName: string) => {
    const currentRoute = navigationRef.getCurrentRoute()?.name || '';
    console.log(`Current route: "${currentRoute}", Command: "${commandName}"`);
  
    if (commandName === 'chat') {
      if (isChatModalOpen()) {
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
    // If any other tab command is given, and the chat modal is open, close it first.
    if (isChatModalOpen()) {
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
      let recognizedPhrase = event.value[0].toLowerCase().trim();
      console.log("Recognized phrase:", recognizedPhrase);
      let command: string | null = null;
      if (recognizedPhrase.includes('settings')) {
        command = 'Settings';
      } else if (recognizedPhrase.includes('forecast')) {
        command = 'Forecast';
      } else if (recognizedPhrase.includes('history')) {
        command = 'History';
      } else if (recognizedPhrase.includes('chat')) {
        if (recognizedPhrase.includes('close')) {
          command = 'close chat';
        } else {
          command = 'chat';
        }
      } else if (recognizedPhrase.includes('identify') || recognizedPhrase === 'i' || recognizedPhrase === 'id') {
        command = 'Identify';
      } else {
        // Use showAlertOnce to avoid multiple popups even when the command is not recognized.
        showAlertOnce('Voice Command', `Command not recognized: ${recognizedPhrase}`);
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
      // Use showAlertOnce to display errors only once.
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
