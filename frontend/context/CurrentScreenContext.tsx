import React, { createContext, useContext, useState } from 'react';

type CurrentScreenContextType = {
  currentScreen: string;
  setCurrentScreen: (screen: string) => void;
};

const CurrentScreenContext = createContext<CurrentScreenContextType | undefined>(undefined);

export const useCurrentScreen = () => {
  const context = useContext(CurrentScreenContext);
  if (!context) {
    throw new Error('useCurrentScreen must be used within a CurrentScreenProvider');
  }
  return context;
};

export const CurrentScreenProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentScreen, setCurrentScreen] = useState<string>('');
  return (
    <CurrentScreenContext.Provider value={{ currentScreen, setCurrentScreen }}>
      {children}
    </CurrentScreenContext.Provider>
  );
};
