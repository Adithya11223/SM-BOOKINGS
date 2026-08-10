import React, { createContext, useState, ReactNode, useCallback, useEffect, useMemo } from 'react';
import { BusinessSettings } from '../types';
import { BusinessService } from '../api/BusinessService';
import { webSocketService } from '../api/WebSocketService';

interface AppConfigContextType {
  businessSettings: BusinessSettings | null;
  refreshSettings: () => Promise<void>;
  updateBusinessSettings: (settings: Partial<BusinessSettings>) => Promise<void>;
  isLoading: boolean;
  appMode: 'customer' | 'admin';
  setAppMode: (mode: 'customer' | 'admin') => void;
}

export const AppConfigContext = createContext<AppConfigContextType | undefined>(undefined);

export const AppConfigProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [businessSettings, setBusinessSettings] = useState<BusinessSettings | null>(null);
  const [appMode, setAppMode] = useState<'customer' | 'admin'>('customer');
  const [isLoading, setIsLoading] = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      const settings = await BusinessService.getSettings();
      setBusinessSettings(settings);
    } catch (error) {
      console.error('Failed to fetch business settings:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateBusinessSettings = useCallback(async (settings: Partial<BusinessSettings>) => {
    try {
      setIsLoading(true);
      const updated = await BusinessService.updateSettings(settings);
      setBusinessSettings(updated);
    } catch (error) {
      console.error('Failed to update business settings:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();

    const handleBusinessUpdate = (payload: any) => {
      setBusinessSettings(payload);
    };

    webSocketService.subscribe('/topic/business', handleBusinessUpdate);

    return () => {
      webSocketService.unsubscribe('/topic/business', handleBusinessUpdate);
    };
  }, [fetchSettings]);

  const value = useMemo(() => ({
    businessSettings,
    refreshSettings: fetchSettings,
    updateBusinessSettings,
    isLoading,
    appMode,
    setAppMode,
  }), [businessSettings, appMode, fetchSettings, updateBusinessSettings, isLoading]);

  return (
    <AppConfigContext.Provider value={value}>
      {children}
    </AppConfigContext.Provider>
  );
};
