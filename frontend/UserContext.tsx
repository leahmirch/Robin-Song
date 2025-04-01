import React, { createContext, useState, useContext, ReactNode } from 'react';

export interface IUserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface IUserDataContext {
  userData: IUserData | null;
  setUserData: (userData: IUserData | null) => void;
}

const UserDataContext = createContext<IUserDataContext>({
  userData: null,
  setUserData: () => {},
});

export const UserDataProvider = ({ children }: { children: ReactNode }) => {
  const [userData, setUserData] = useState<IUserData | null>(null);

  return (
    <UserDataContext.Provider value={{ userData, setUserData }}>
      {children}
    </UserDataContext.Provider>
  );
};

export const useUserData = () => useContext(UserDataContext);
