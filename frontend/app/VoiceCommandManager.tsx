// VoiceCommandManager.tsx
import React, { useEffect, useRef } from 'react';
import { Alert } from 'react-native';

// We only import these two event types, which definitely exist.
import Voice, { SpeechResultsEvent, SpeechErrorEvent } from '@react-native-voice/voice';
import * as SpeechFeedback from 'expo-speech';

import { usePreferences } from '../../backend/src/contexts/PreferencesContext';
import { useCurrentScreen } from '../context/CurrentScreenContext';
import {
  navigate,
  openChatModal,
  closeChatModal,
  navigationRef,
  setVoiceQuestion
} from './navigationService';
import { speakAppText } from './ttsHelper';

const WAKE_WORD = 'robin';

// -- define your command arrays
const generalCommands = [
  { command: 'Identify', synonyms: ['identify','go to identify','open identify','show identify','start identify'] },
  { command: 'Forecast', synonyms: ['forecast','go to forecast','open forecast','show forecast','start forecast'] },
  { command: 'History',  synonyms: ['history','go to history','open history','show history'] },
  { command: 'Settings', synonyms: ['settings','go to settings','open settings','show settings'] },
  { command: 'close chat', synonyms: ['close chat','exit chat','hide chat'] },
  { command: 'chat', synonyms: ['chat','go to chat','open chat','show chat'] },
  { command: 'start detection', synonyms: ['start detection','begin detection','activate detection'] },
  { command: 'stop detection', synonyms: ['stop detection','end detection','deactivate detection'] },
  { command: 'logout', synonyms: ['logout','log out','sign out','exit account'] },
  { command: 'login', synonyms: ['login','log in','sign in'] }
];

const settingsCommands = [
  {
    command: 'enable voice commands',
    synonyms: ['enable voice commands','turn on voice commands','activate voice commands']
  },
  {
    command: 'disable voice commands',
    synonyms: ['disable voice commands','turn off voice commands','deactivate voice commands']
  },
  {
    command: 'enable audio feedback',
    synonyms: ['enable audio feedback','turn on audio feedback','activate audio feedback']
  },
  {
    command: 'disable audio feedback',
    synonyms: ['disable audio feedback','turn off audio feedback','deactivate audio feedback']
  },
  {
    command: 'enable location',
    synonyms: [
      'enable location','turn on location','activate location',
      'enable location for predictions','turn on location for predictions'
    ]
  },
  {
    command: 'disable location',
    synonyms: [
      'disable location','turn off location','deactivate location',
      'disable location for predictions','turn off location for predictions'
    ]
  }
];

// merge them
const commandMapping = [...generalCommands, ...settingsCommands];

function parseCommand(recognizedText: string): string | null {
  const lowerText = recognizedText.toLowerCase();
  if (!lowerText.includes(WAKE_WORD)) {
    console.log(`Wake word "${WAKE_WORD}" not detected. Ignoring input.`);
    return null;
  }
  const textWithoutWake = lowerText.replace(new RegExp(`\\b${WAKE_WORD}\\b`, 'gi'), '').trim();
  const cleanedText = textWithoutWake.replace(/[^a-zA-Z\s]/g, '').toLowerCase();

  // exact match
  for (const mapping of commandMapping) {
    for (const syn of mapping.synonyms) {
      const cleanedSyn = syn.replace(/[^a-zA-Z\s]/g, '').toLowerCase();
      const regex = new RegExp(`\\b${cleanedSyn}\\b`);
      if (regex.test(cleanedText)) {
        return mapping.command;
      }
    }
  }
  // substring
  for (const mapping of commandMapping) {
    for (const syn of mapping.synonyms) {
      const cleanedSyn = syn.replace(/[^a-zA-Z\s]/g, '').toLowerCase();
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
  // handle "asked," "asking," "asks"
  text = text.replace(/\basked\b/g, 'ask');
  text = text.replace(/\basking\b/g, 'ask');
  text = text.replace(/\basks\b/g, 'ask');

  const match = text.match(/\b(?:ask|question)\s+(.*)/);
  if (!match) return null;
  return match[1].trim();
}

const DEBOUNCE_DELAY = 600;

const VoiceCommandManager: React.FC = () => {
  const {
    voiceCommandsEnabled,
    audioFeedbackEnabled,
    setVoiceCommandsEnabled,
    setAudioFeedbackEnabled,
    locationEnabled,
    setLocationEnabled
  } = usePreferences();
  const { currentScreen } = useCurrentScreen();

  // keep track of TTS on/off
  const audioFeedbackRef = useRef(audioFeedbackEnabled);
  useEffect(() => {
    audioFeedbackRef.current = audioFeedbackEnabled;
  }, [audioFeedbackEnabled]);

  // define showAlertOnce inside
  function showAlertOnce(title: string, message: string) {
    Alert.alert(title, message, [{ text: 'OK' }]);
    if (audioFeedbackRef.current) {
      console.log("Audio feedback enabled; speaking: " + message);
      speakAppText(message); // now uses your universal TTS settings
    } else {
      console.log("Audio feedback disabled; not speaking: " + message);
    }
  }
  // recognition states
  const recognitionInProgress = useRef(false);
  const cooldownTimeout = useRef<NodeJS.Timeout | null>(null);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const lastRecognizedText = useRef<string>('');

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
    const currentRoute = navigationRef.getCurrentRoute()?.name || '';
    console.log(`Current route: "${currentRoute}", Command: "${commandName}"`);

    // settings toggles
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

    // auth
    if (commandName === 'logout') {
      showAlertOnce('Voice Command', 'Logging out');
      navigate("Home");
      return;
    }
    if (commandName === 'login') {
      showAlertOnce('Voice Command', 'Navigating to Login');
      navigate("Login");
      return;
    }

    // detection
    if (commandName === 'start detection') {
      showAlertOnce('Voice Command', 'Starting detection (not yet implemented)');
      return;
    }
    if (commandName === 'stop detection') {
      showAlertOnce('Voice Command', 'Stopping detection (not yet implemented)');
      return;
    }

    // chat
    if (commandName === 'chat') {
      openChatModal();
      showAlertOnce('Voice Command', 'Opening Chat');
      return;
    }
    if (commandName === 'close chat') {
      closeChatModal();
      showAlertOnce('Voice Command', 'Closing Chat');
      return;
    }
    if (currentRoute.toLowerCase() === 'chat') {
      closeChatModal();
    }

    // normal nav
    if (currentRoute.trim().toLowerCase() === commandName.trim().toLowerCase()) {
      showAlertOnce('Voice Command', `Already on ${commandName} tab`);
    } else {
      navigate(commandName);
      showAlertOnce('Voice Command', `Navigating to ${commandName}`);
    }
  }

  // partial results => do nothing
  function onSpeechPartial(event: SpeechResultsEvent) {
    // partial transcripts are ignored, so we don't get multiple pop-ups
  }

  // final results => parse commands or questions
  function onSpeechResults(event: SpeechResultsEvent) {
    if (event.value && event.value.length > 0) {
      const recognizedPhrase = event.value[event.value.length - 1].toLowerCase().trim();
      console.log("Final recognized phrase:", recognizedPhrase);

      lastRecognizedText.current = recognizedPhrase;
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

      // wait a short DEBOUNCE
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
          // maybe "robin ask [question]"
          const extractedQuestion = parseAskQuestion(lastRecognizedText.current);
          if (extractedQuestion) {
            stopListening();
            showAlertOnce("Voice Command", "Sending your question now");
            openChatModal();
            setVoiceQuestion(extractedQuestion);

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
    if (event.error?.message?.includes('already started')) {
      console.log('Already started error encountered. Ignoring.');
    } else {
      showAlertOnce('Voice Error', JSON.stringify(event.error));
    }
    stopListening();
    if (!cooldownTimeout.current) {
      setTimeout(() => startListening(), 1000);
    }
  }

  // watch voiceCommandsEnabled
  useEffect(() => {
    if (voiceCommandsEnabled) {
      Voice.onSpeechResults = onSpeechResults;       // final results
      Voice.onSpeechPartialResults = onSpeechPartial; // partial => do nothing
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
