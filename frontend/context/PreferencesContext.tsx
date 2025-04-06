// PreferencesContext.tsx
import React, { createContext, useContext, useState } from 'react';

type PreferencesContextType = {
  voiceCommandsEnabled: boolean;
  setVoiceCommandsEnabled: (enabled: boolean) => void;
  audioFeedbackEnabled: boolean;
  setAudioFeedbackEnabled: (enabled: boolean) => void;
  locationEnabled: boolean;
  setLocationEnabled: (enabled: boolean) => void;
  detectionActive: boolean;
  setDetectionActive: (active: boolean) => void;
  // NEW: Show popups for recognized commands
  showCommandPopups: boolean;
  setShowCommandPopups: (enabled: boolean) => void;
};

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export const PreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default voice commands to true.
  const [voiceCommandsEnabled, setVoiceCommandsEnabled] = useState(true);
  // Default audio feedback to false.
  const [audioFeedbackEnabled, setAudioFeedbackEnabled] = useState(false);
  // Default location to false.
  const [locationEnabled, setLocationEnabled] = useState(false);
  // Default detection to false.
  const [detectionActive, setDetectionActive] = useState(false);

  // NEW: By default, show popups for recognized commands
  const [showCommandPopups, setShowCommandPopups] = useState(true);

  return (
    <PreferencesContext.Provider
      value={{
        voiceCommandsEnabled,
        setVoiceCommandsEnabled,
        audioFeedbackEnabled,
        setAudioFeedbackEnabled,
        locationEnabled,
        setLocationEnabled,
        detectionActive,
        setDetectionActive,
        // NEW
        showCommandPopups,
        setShowCommandPopups,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
};

export const usePreferences = () => {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
};