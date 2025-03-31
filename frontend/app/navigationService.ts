// navigationService.ts

import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

// Internal callback storage
let _openChatModal: () => void;
let _closeChatModal: () => void;

// We'll store a setter for the "voiceQuestion" state in TabNavigator.
let setVoiceQuestionCallback: ((question: string) => void) | null = null;

// New state tracker for chat modal visibility
let _isChatModalOpen = false;

let readBirdSectionCallback: ((section: string) => void) | null = null;

export function setReadBirdSectionCallback(fn: (section: string) => void) {
  readBirdSectionCallback = fn;
}

export function getReadBirdSectionCallback() {
  return readBirdSectionCallback;
}

export const setIsChatModalOpen = (isOpen: boolean) => {
  _isChatModalOpen = isOpen;
};

export const isChatModalOpen = () => _isChatModalOpen;

/**
 * Sets the callback that opens the chat modal.
 * This should be called from TabNavigator as soon as it mounts.
 */
export const setOpenChatModal = (callback: () => void) => {
  _openChatModal = callback;
  console.log('setOpenChatModal: Callback set.');
};

/**
 * Sets the callback that closes the chat modal.
 * This should be called from TabNavigator as soon as it mounts.
 */
export const setCloseChatModal = (callback: () => void) => {
  _closeChatModal = callback;
  console.log('setCloseChatModal: Callback set.');
};

/**
 * Invokes the stored open chat modal callback.
 */
export const openChatModal = () => {
  if (_openChatModal) {
    console.log('openChatModal: Invoking open callback.');
    _openChatModal();
  } else {
    console.warn('openChatModal: Callback not set.');
  }
};

/**
 * Invokes the stored close chat modal callback.
 */
export const closeChatModal = () => {
  if (_closeChatModal) {
    console.log('closeChatModal: Invoking close callback.');
    _closeChatModal();
  } else {
    console.warn('closeChatModal: Callback not set.');
  }
};

/**
 * A generic navigate function that uses the navigation ref.
 */
export const navigate = (name: string, params?: any) => {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name as never, params as never);
  } else {
    console.warn('navigate: Navigation is not ready.');
  }
};

export function setVoiceQuestionSetter(fn: (question: string) => void) {
  setVoiceQuestionCallback = fn;
}

export function setVoiceQuestion(question: string) {
  if (setVoiceQuestionCallback) {
    setVoiceQuestionCallback(question);
  }
}
