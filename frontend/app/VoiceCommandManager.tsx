// VoiceCommandManager.tsx
import React, { useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import Voice, { SpeechResultsEvent, SpeechErrorEvent } from '@react-native-voice/voice';
import * as Speech from 'expo-speech';

import { usePreferences } from '../context/PreferencesContext';
import { useCurrentScreen } from '../context/CurrentScreenContext';
import {
  navigate,
  openChatModal,
  closeChatModal,
  navigationRef,
  setVoiceQuestion,
  isChatModalOpen,
  getReadBirdSectionCallback,
} from './navigationService';
import { speakAppText } from '../services/voice/ttsHelper';

const WAKE_WORD = 'robin';

function normalizeText(text: string): string {
  return text
    .replace(/\breid\b/g, 'read')
    .replace(/\bbreed\b/g, 'read')
    .replace(/\bred\b/g, 'read')
    .replace(/\bdescripton\b/g, 'description')
    .replace(/\bdescritpion\b/g, 'description')
    .replace(/\bdescripshun\b/g, 'description')
    .replace(/\bhabit\b/g, 'habitat')
    .replace(/\bhabat\b/g, 'habitat')
    .replace(/\bhabite\b/g, 'habitat')
    .replace(/\bhabiit\b/g, 'habitat')
    .replace(/\bdie it\b/g, 'diet')
    .replace(/\bdite\b/g, 'diet')
    .replace(/\bdiett\b/g, 'diet')
    .replace(/\bat a glanse\b/g, 'at a glance')
    .replace(/\bat glance\b/g, 'at a glance')
    .replace(/\bat a gance\b/g, 'at a glance')
    .replace(/\bfeedin behavior\b/g, 'feeding behavior')
    .replace(/\bfeedn behavior\b/g, 'feeding behavior');
}

const generalCommands = [
  { command: 'Identify', synonyms: ['identify', 'go to identify', 'open identify', 'show identify', 'start identify'] },
  { command: 'Forecast', synonyms: ['forecast', 'go to forecast', 'open forecast', 'show forecast', 'start forecast'] },
  { command: 'History', synonyms: ['history', 'go to history', 'open history', 'show history'] },
  { command: 'Settings', synonyms: ['settings', 'go to settings', 'open settings', 'show settings'] },
  { command: 'close chat', synonyms: ['close chat', 'exit chat', 'hide chat'] },
  { command: 'chat', synonyms: ['chat', 'go to chat', 'open chat', 'show chat'] },
  { command: 'start detection', synonyms: ['start detection', 'start identification', 'begin detection', 'activate detection'] },
  { command: 'stop detection', synonyms: ['stop detection', 'stop identification', 'end detection', 'deactivate detection'] },
  { command: 'logout', synonyms: ['logout', 'log out', 'sign out', 'exit account'] },
  { command: 'login', synonyms: ['login', 'log in', 'sign in'] },
  { command: 'read description', synonyms: ['read description'] },
  { command: 'read diet', synonyms: ['read diet'] },
  { command: 'read habitat', synonyms: ['read habitat'] },
  { command: 'read at a glance', synonyms: ['read at a glance'] },
  { command: 'read feeding behavior', synonyms: ['read feeding behavior'] },
  { command: 'read migration and range', synonyms: ['read migration and range'] },
  { command: 'stop reading', synonyms: ['stop reading', 'cancel reading', 'silence', 'stop'] },
];

const settingsCommands = [
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
    synonyms: [
      'enable location', 'turn on location', 'activate location',
      'enable location for predictions', 'turn on location for predictions'
    ]
  },
  {
    command: 'disable location',
    synonyms: [
      'disable location', 'turn off location', 'deactivate location',
      'disable location for predictions', 'turn off location for predictions'
    ]
  }
];

const commandMapping = [...generalCommands, ...settingsCommands];

function parseCommand(recognizedText: string): string | null {
  const lowerText = recognizedText.toLowerCase();
  if (!lowerText.includes(WAKE_WORD)) {
    console.log(`Wake word "${WAKE_WORD}" not detected. Ignoring input.`);
    return null;
  }
  const textWithoutWake = lowerText.replace(new RegExp(`\\b${WAKE_WORD}\\b`, 'gi'), '').trim();
  const cleanedText = normalizeText(textWithoutWake.replace(/[^a-zA-Z\s]/g, '').toLowerCase());
  
  for (const mapping of commandMapping) {
    for (const syn of mapping.synonyms) {
      const cleanedSyn = normalizeText(syn.replace(/[^a-zA-Z\s]/g, '').toLowerCase());
      const regex = new RegExp(`\\b${cleanedSyn}\\b`);
      if (regex.test(cleanedText)) {
        return mapping.command;
      }
    }
  }
  for (const mapping of commandMapping) {
    for (const syn of mapping.synonyms) {
      const cleanedSyn = normalizeText(syn.replace(/[^a-zA-Z\s]/g, '').toLowerCase());
      if (cleanedText.includes(cleanedSyn)) {
        return mapping.command;
      }
    }
  }
  return null;
}

function parseAskQuestion(recognizedText: string): string | null {
  const lower = recognizedText.toLowerCase();
  if (!lower.includes(WAKE_WORD)) return null;
  let text = lower.replace(new RegExp(`\\b${WAKE_WORD}\\b`, 'gi'), '').trim();
  text = normalizeText(text);
  text = text.replace(/\basked\b/g, 'ask')
             .replace(/\basking\b/g, 'ask')
             .replace(/\basks\b/g, 'ask');
  const match = text.match(/\b(?:ask|question|query|inquire)\s+(.*)/);
  if (!match) return null;
  return match[1].trim();
}

const DEBOUNCE_DELAY = 600;

function handleSettingsCommand(
  commandName: string,
  setVoiceCommandsEnabled: (b: boolean) => void,
  setAudioFeedbackEnabled: (b: boolean) => void,
  setLocationEnabled: (b: boolean) => void,
  showAlert: (title: string, msg: string) => void
) {
  if (commandName === 'enable voice commands') {
    setVoiceCommandsEnabled(true);
    showAlert('Settings', 'Voice commands enabled');
    return;
  }
  if (commandName === 'disable voice commands') {
    setVoiceCommandsEnabled(false);
    showAlert('Settings', 'Voice commands disabled');
    return;
  }
  if (commandName === 'enable audio feedback') {
    setAudioFeedbackEnabled(true);
    showAlert('Settings', 'Audio feedback enabled');
    return;
  }
  if (commandName === 'disable audio feedback') {
    setAudioFeedbackEnabled(false);
    showAlert('Settings', 'Audio feedback disabled');
    return;
  }
  if (commandName === 'enable location') {
    setLocationEnabled(true);
    showAlert('Settings', 'Location enabled for predictions');
    return;
  }
  if (commandName === 'disable location') {
    setLocationEnabled(false);
    showAlert('Settings', 'Location disabled for predictions');
    return;
  }
}

function handleAuthCommand(commandName: string, showAlert: (title: string, msg: string) => void) {
  if (commandName === 'logout') {
    showAlert('Voice Command', 'Logging out');
    navigate("Home");
    return;
  }
  if (commandName === 'login') {
    showAlert('Voice Command', 'Navigating to Login');
    navigate("Login");
    return;
  }
}

function handleDetectionCommand(
  commandName: string,
  setDetectionActive: (b: boolean) => void,
  showAlert: (title: string, msg: string) => void
) {
  if (commandName === 'start detection') {
    setDetectionActive(true);
    showAlert('Voice Command', 'Starting detection');
    return;
  }
  if (commandName === 'stop detection') {
    setDetectionActive(false);
    showAlert('Voice Command', 'Stopping detection');
    return;
  }
}

function handleChatCommand(commandName: string, showAlert: (title: string, msg: string) => void) {
  if (commandName === 'chat') {
    openChatModal();
    showAlert('Voice Command', 'Opening Chat');
    return;
  }
  if (commandName === 'close chat') {
    closeChatModal();
    showAlert('Voice Command', 'Closing Chat');
    return;
  }
}

function handleReadSectionCommand(
  commandName: string,
  showAlert: (title: string, msg: string) => void
) {
  const section = commandName.replace(/^read\s+/i, '').trim();
  const readSectionCallback = getReadBirdSectionCallback();
  if (readSectionCallback) {
    readSectionCallback(section);
    showAlert('Voice Command', `Reading ${section}`);
  } else {
    showAlert('Voice Command', `No section available for ${section}`);
  }
}

function handleStopReadingCommand(showAlert: (title: string, msg: string) => void) {
  Speech.stop();
  showAlert('Voice Command', 'Stopping speech');
}

function handleNavigationCommand(
  commandName: string,
  currentRoute: string,
  showAlert: (title: string, msg: string) => void
) {
  if (currentRoute.trim().toLowerCase() === commandName.trim().toLowerCase()) {
    showAlert('Voice Command', `Already on ${commandName} tab`);
  } else {
    navigate(commandName);
    showAlert('Voice Command', `Navigating to ${commandName}`);
  }
}

const VoiceCommandManager: React.FC = () => {
  const {
    voiceCommandsEnabled,
    audioFeedbackEnabled,
    setVoiceCommandsEnabled,
    setAudioFeedbackEnabled,
    locationEnabled,
    setLocationEnabled,
    detectionActive,
    setDetectionActive,
  } = usePreferences();
  const { currentScreen } = useCurrentScreen();

  const audioFeedbackRef = useRef(audioFeedbackEnabled);
  useEffect(() => {
    audioFeedbackRef.current = audioFeedbackEnabled;
  }, [audioFeedbackEnabled]);

  function showAlertOnce(title: string, message: string) {
    Alert.alert(title, message, [{ text: 'OK' }]);
    if (audioFeedbackRef.current) {
      console.log("Audio feedback enabled; speaking: " + message);
      speakAppText(message);
    } else {
      console.log("Audio feedback disabled; not speaking: " + message);
    }
  }

  const recognitionInProgress = useRef(false);
  const cooldownTimeout = useRef<NodeJS.Timeout | null>(null);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const lastRecognizedText = useRef<string>('');

  useEffect(() => {
    if (voiceCommandsEnabled) {
      Voice.onSpeechResults = onSpeechResults;
      Voice.onSpeechPartialResults = () => {};
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

  async function startListening() {
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
  }

  async function stopListening() {
    try {
      await Voice.stop();
    } catch (e) {
      console.error('Error stopping voice:', e);
    } finally {
      recognitionInProgress.current = false;
    }
  }

  function processCommand(commandName: string) {
    let currentRoute = navigationRef.getCurrentRoute()?.name || '';
    console.log(`Current route: "${currentRoute}", Command: "${commandName}"`);

    if (isChatModalOpen()) {
      console.log("Chat modal is open; closing it before navigating.");
      closeChatModal();
      setTimeout(() => {
        currentRoute = navigationRef.getCurrentRoute()?.name || '';
        handleNavigationCommand(commandName, currentRoute, showAlertOnce);
      }, 500);
      return;
    }

    if (commandName.toLowerCase().startsWith("read ")) {
      return handleReadSectionCommand(commandName, showAlertOnce);
    }
    if (commandName === 'stop reading') {
      return handleStopReadingCommand(showAlertOnce);
    }
    if (
      commandName === 'enable voice commands' ||
      commandName === 'disable voice commands' ||
      commandName === 'enable audio feedback' ||
      commandName === 'disable audio feedback' ||
      commandName === 'enable location' ||
      commandName === 'disable location'
    ) {
      return handleSettingsCommand(commandName, setVoiceCommandsEnabled, setAudioFeedbackEnabled, setLocationEnabled, showAlertOnce);
    }
    if (commandName === 'logout' || commandName === 'login') {
      return handleAuthCommand(commandName, showAlertOnce);
    }
    if (commandName === 'start detection' || commandName === 'stop detection') {
      return handleDetectionCommand(commandName, setDetectionActive, showAlertOnce);
    }
    if (commandName === 'chat' || commandName === 'close chat') {
      return handleChatCommand(commandName, showAlertOnce);
    }
    return handleNavigationCommand(commandName, currentRoute, showAlertOnce);
  }

  function onSpeechResults(event: SpeechResultsEvent) {
    if (event.value && event.value.length > 0) {
      const recognizedPhrase = event.value[event.value.length - 1].toLowerCase().trim();
      console.log("Final recognized phrase:", recognizedPhrase);
      lastRecognizedText.current = recognizedPhrase;
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
      debounceTimeout.current = setTimeout(() => {
        const command = parseCommand(lastRecognizedText.current);
        if (command && !cooldownTimeout.current) {
          console.log('Voice Command:', command);
          stopListening();
          processCommand(command);
          cooldownTimeout.current = setTimeout(() => {
            cooldownTimeout.current = null;
            startListening();
          }, 2000);
        } else if (!command) {
          const extractedQuestion = parseAskQuestion(lastRecognizedText.current);
          if (extractedQuestion) {
            stopListening();
            showAlertOnce("Voice Command", "Sending your question now");
            openChatModal();
            setVoiceQuestion(extractedQuestion);
            lastRecognizedText.current = "";
            cooldownTimeout.current = setTimeout(() => {
              cooldownTimeout.current = null;
              startListening();
            }, 2000);
          } else {
            console.log(`No valid command recognized. phrase="${lastRecognizedText.current}"`);
          }
        } else {
          console.log('In cooldown, ignoring command:', command);
        }
        debounceTimeout.current = null;
      }, DEBOUNCE_DELAY);
    } else {
      stopListening();
      setTimeout(() => startListening(), 1000);
    }
  }

  function onSpeechError(event: SpeechErrorEvent) {
    console.error('Speech recognition error:', event.error);
    if (event.error?.message?.includes('No speech detected')) {
      console.log('No speech detected, restarting listening.');
    } else if (event.error?.message?.includes('already started')) {
      console.log('Already started error encountered. Ignoring.');
    } else {
      showAlertOnce('Voice Error', JSON.stringify(event.error));
    }
    stopListening();
    if (!cooldownTimeout.current) {
      setTimeout(() => startListening(), 1000);
    }
  }

  useEffect(() => {
    if (voiceCommandsEnabled) {
      Voice.onSpeechResults = onSpeechResults;
      Voice.onSpeechPartialResults = () => {
        console.log('Partial speech results received.');
      };
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

  return null;
};

export default VoiceCommandManager;
