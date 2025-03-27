// ToastProvider.tsx
import React, { createContext, useState, useContext } from 'react';
import CustomToast from './CustomToast';

type ToastContextType = {
  showToast: (message: string) => void;
};

const ToastContext = createContext<ToastContextType>({
  showToast: () => {},
});

export const useToast = () => useContext(ToastContext);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toastMessage, setToastMessage] = useState('');
  const [visible, setVisible] = useState(false);

  const showToast = (message: string) => {
    setToastMessage(message);
    setVisible(true);
  };

  const hideToast = () => {
    setVisible(false);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <CustomToast message={toastMessage} visible={visible} onHide={hideToast} />
    </ToastContext.Provider>
  );
};
