import React, { createContext, useState, ReactNode, useCallback, useMemo, useEffect } from 'react';
import { AuthResponse, AuthService } from '../api/AuthService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

interface AuthContextType {
  user: AuthResponse | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initial check for existing token (to keep user logged in)
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = await AsyncStorage.getItem('adminToken');
        const id = await AsyncStorage.getItem('adminId');
        if (token && id) {
          // If token exists, we could validate it via a `/me` endpoint
          // For now, we assume they are logged in.
          // Alternatively, we could decode JWT here.
          setUser({ id, token, type: 'Bearer', name: 'Admin', email: '', role: 'ADMIN' });
        }
      } catch (error) {
        console.error('Error loading token', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUser();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const authData = await AuthService.login(email, password);
      await AsyncStorage.setItem('adminToken', authData.token);
      await AsyncStorage.setItem('adminId', authData.id);
      setUser(authData);
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      Alert.alert('Login Failed', 'Invalid credentials or network error.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      await AuthService.logout();
    } catch (error) {
      console.error('Logout API error (ignoring local clear)', error);
    } finally {
      await AsyncStorage.removeItem('adminToken');
      await AsyncStorage.removeItem('adminId');
      setUser(null);
      setIsLoading(false);
    }
  }, []);

  const value = useMemo(() => ({
    user,
    isLoading,
    login,
    logout
  }), [user, isLoading, login, logout]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
