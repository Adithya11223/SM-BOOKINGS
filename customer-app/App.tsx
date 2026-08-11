import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { RootNavigator } from './src/navigation/RootNavigator';
import { RootProvider } from './src/context/RootProvider';
import { ErrorBoundary } from './src/components/layout/ErrorBoundary';
import { navigationRef } from './src/navigation/navigationRef';
import { AuthProvider } from './src/context/AuthContext';
import { usePushNotifications } from './src/hooks/usePushNotifications';

import { AdManager } from './src/components/overlays/AdManager';

const AppContent = () => {
  return (
    <NavigationContainer ref={navigationRef}>
      <RootNavigator />
      <AdManager />
    </NavigationContainer>
  );
};

export default function App() {

  return (
    <AuthProvider>
      <SafeAreaProvider>
        <ErrorBoundary>
          <RootProvider>
            <AppContent />
            <StatusBar style="dark" />
          </RootProvider>
        </ErrorBoundary>
      </SafeAreaProvider>
    </AuthProvider>
  );
}
