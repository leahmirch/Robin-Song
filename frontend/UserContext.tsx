import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { API_BASE_URL } from '../database/firebaseConfig';

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

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/users/me`, {
          credentials: 'include', 
        });
        if (response.ok) {
          const data = await response.json();
          setUserData(data);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUser();
  }, []);

  return (
    <UserDataContext.Provider value={{ userData, setUserData }}>
      {children}
    </UserDataContext.Provider>
  );
};

export const useUserData = () => useContext(UserDataContext);