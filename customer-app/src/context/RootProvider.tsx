import React, { ReactNode, useEffect } from 'react';
import { AppConfigProvider } from './AppConfigContext';
import { ServiceProvider } from './ServiceContext';
import { CartProvider } from './CartContext';
import { BookingProvider } from './BookingContext';
import { AuthProvider } from './AuthContext';
import { NotificationProvider } from './NotificationContext';
import { webSocketService } from '../api/WebSocketService';

export const RootProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  useEffect(() => {
    webSocketService.connect();
  }, []);

  return (
    <AppConfigProvider>
      <AuthProvider>
        <NotificationProvider>
          <ServiceProvider>
            <CartProvider>
              <BookingProvider>
                {children}
              </BookingProvider>
            </CartProvider>
          </ServiceProvider>
        </NotificationProvider>
      </AuthProvider>
    </AppConfigProvider>
  );
};
