import React, { createContext, useState, ReactNode, useCallback, useMemo, useEffect } from 'react';
import { Booking } from '../types';
import { BookingService } from '../api/BookingService';
import { webSocketService } from '../api/WebSocketService';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BOOKING_REFS_KEY = '@my_booking_references';

interface BookingContextType {
  bookings: Booking[];
  addBooking: (booking: Partial<Booking>) => Promise<string | null>; 
  isLoading: boolean;
  refreshBookings: () => Promise<void>;
}

export const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchBookings = useCallback(async () => {
    try {
      setIsLoading(true);
      const refsStr = await AsyncStorage.getItem(BOOKING_REFS_KEY);
      if (!refsStr) {
        setBookings([]);
        return;
      }
      
      const refs: string[] = JSON.parse(refsStr);
      const validRefs = refs.filter(r => !!r && r !== 'undefined' && r !== 'null');
      if (validRefs.length === 0) {
        setBookings([]);
        return;
      }

      // Fetch all saved references in one parallel bulk call
      const fetchedBookings = await BookingService.getBookingsByReferences(validRefs).catch(e => {
          console.error('Failed to fetch bookings in bulk', e);
          return [];
      });
      
      setBookings(fetchedBookings);
    } catch (error) {
      console.error('Failed to fetch bookings from AsyncStorage:', error);
      Alert.alert('Error', 'Failed to load your bookings.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();

    const handleBookingUpdate = (payload: any) => {
      const { action, data } = payload;
      if (action === 'UPDATED') {
        setBookings(prev => prev.map(b => b.id === data.id ? BookingService.mapToFrontend(data) : b));
      } else if (action === 'CREATED') {
        const mappedData = BookingService.mapToFrontend(data);
        setBookings(prev => {
          if (!prev.find(b => b.id === mappedData.id)) {
            return [mappedData, ...prev];
          }
          return prev;
        });
      }
    };

    webSocketService.subscribe('/topic/bookings', handleBookingUpdate);

    return () => {
      webSocketService.unsubscribe('/topic/bookings', handleBookingUpdate);
    };
  }, [fetchBookings]);

  const addBooking = useCallback(async (bookingData: Partial<Booking>) => {
    try {
      setIsLoading(true);
      const newBooking = await BookingService.createBooking(bookingData);
      
      // Save reference to AsyncStorage
      const refsStr = await AsyncStorage.getItem(BOOKING_REFS_KEY);
      const refs: string[] = refsStr ? JSON.parse(refsStr) : [];
      const refNumber = (newBooking as any).bookingNumber;
      if (refNumber && !refs.includes(refNumber)) {
          refs.push(refNumber);
          await AsyncStorage.setItem(BOOKING_REFS_KEY, JSON.stringify(refs));
      }
      
      setBookings(prev => {
        if (!prev.find(b => b.id === newBooking.id)) {
          return [newBooking, ...prev];
        }
        return prev;
      });
      return newBooking.id;
    } catch (error) {
      console.error('Failed to create booking:', error);
      Alert.alert('Error', 'Failed to create booking. Please try again.');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value = useMemo(() => ({
    bookings,
    addBooking,
    isLoading,
    refreshBookings: fetchBookings
  }), [bookings, addBooking, isLoading, fetchBookings]);

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
};
