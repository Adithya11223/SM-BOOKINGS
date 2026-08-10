import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

type AuthContextType = {
  isLoaded: boolean;
  isSignedIn: boolean;
  user: { id: string; name: string; phone: string } | null;
  signIn: (token: string, id: string, name: string, phone: string) => Promise<void>;
  signOut: () => Promise<void>;
  getToken: () => Promise<string | null>;
};

export const AuthContext = createContext<AuthContextType>({
  isLoaded: false,
  isSignedIn: false,
  user: null,
  signIn: async () => {},
  signOut: async () => {},
  getToken: async () => null,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [user, setUser] = useState<{ id: string; name: string; phone: string } | null>(null);

  useEffect(() => {
    checkToken();
  }, []);

  const checkToken = async () => {
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      const id = await SecureStore.getItemAsync('auth_id');
      const name = await SecureStore.getItemAsync('auth_name');
      const phone = await SecureStore.getItemAsync('auth_phone');
      if (token) {
        if (id) setUser({ id, name: name || 'Customer', phone: phone || '' });
        setIsSignedIn(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoaded(true);
    }
  };

  const signIn = async (token: string, id: string, name: string, phone: string) => {
    await SecureStore.setItemAsync('auth_token', token);
    await SecureStore.setItemAsync('auth_id', id);
    await SecureStore.setItemAsync('auth_name', name || 'Customer');
    await SecureStore.setItemAsync('auth_phone', phone || '');
    setUser({ id, name: name || 'Customer', phone: phone || '' });
    setIsSignedIn(true);
  };

  const signOut = async () => {
    await SecureStore.deleteItemAsync('auth_token');
    await SecureStore.deleteItemAsync('auth_id');
    await SecureStore.deleteItemAsync('auth_name');
    await SecureStore.deleteItemAsync('auth_phone');
    setUser(null);
    setIsSignedIn(false);
  };

  const getToken = async () => {
    return await SecureStore.getItemAsync('auth_token');
  };

  return (
    <AuthContext.Provider value={{ isLoaded, isSignedIn, user, signIn, signOut, getToken }}>
      {children}
    </AuthContext.Provider>
  );
};
