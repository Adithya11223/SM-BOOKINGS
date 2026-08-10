import React, { createContext, useState, ReactNode, useCallback, useEffect, useMemo } from 'react';
import { BusinessSettings } from '../types';
import { BusinessService } from '../api/BusinessService';
import { webSocketService } from '../api/WebSocketService';

interface AppConfigContextType {
  businessSettings: BusinessSettings | null;
  refreshSettings: () => Promise<void>;
  appMode: 'customer' | 'admin';
  setAppMode: (mode: 'customer' | 'admin') => void;
}

export const AppConfigContext = createContext<AppConfigContextType | undefined>(undefined);

export const AppConfigProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [businessSettings, setBusinessSettings] = useState<BusinessSettings | null>(null);
  const [appMode, setAppMode] = useState<'customer' | 'admin'>('customer');

  const fetchSettings = useCallback(async () => {
    try {
      const settings = await BusinessService.getSettings();
      setBusinessSettings(settings);
    } catch (error) {
      console.error('Failed to fetch business settings:', error);
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
    appMode,
    setAppMode,
  }), [businessSettings, appMode, fetchSettings]);

  return (
    <AppConfigContext.Provider value={value}>
      {children}
    </AppConfigContext.Provider>
  );
};
