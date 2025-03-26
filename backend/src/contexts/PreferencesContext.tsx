// backend/src/contexts/PreferencesContext.tsx
import React, { createContext, useContext, useState, ReactNode } from "react";

interface PreferencesContextProps {
  voiceCommandsEnabled: boolean;
  setVoiceCommandsEnabled: (value: boolean) => void;
  // Add other global prefs if desired, e.g. locationEnabled
}

const PreferencesContext = createContext<PreferencesContextProps>({
  voiceCommandsEnabled: false,
  setVoiceCommandsEnabled: () => {},
});

export const PreferencesProvider = ({ children }: { children: ReactNode }) => {
  const [voiceCommandsEnabled, setVoiceCommandsEnabled] = useState(false);

  return (
    <PreferencesContext.Provider value={{ voiceCommandsEnabled, setVoiceCommandsEnabled }}>
      {children}
    </PreferencesContext.Provider>
  );
};

export const usePreferences = () => useContext(PreferencesContext);
