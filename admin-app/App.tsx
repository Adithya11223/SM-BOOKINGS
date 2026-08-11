import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { AdminRootNavigator } from './src/navigation/admin/AdminRootNavigator';
import { RootProvider } from './src/context/RootProvider';
import { ErrorBoundary } from './src/components/layout/ErrorBoundary';
import { navigationRef } from './src/navigation/navigationRef';

import { usePushNotifications } from './src/hooks/usePushNotifications';

const AppContent = () => {
  
  return (
    <NavigationContainer ref={navigationRef}>
      <AdminRootNavigator />
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <RootProvider>
          <AppContent />
          <StatusBar style="dark" />
        </RootProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
