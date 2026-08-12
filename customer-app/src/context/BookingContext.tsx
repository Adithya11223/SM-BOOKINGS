import React, { createContext, useState, ReactNode, useCallback, useMemo, useEffect } from 'react';
import { Booking } from '../types';
import { BookingService } from '../api/BookingService';
import { webSocketService } from '../api/WebSocketService';
import { Alert, AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BOOKING_REFS_KEY = '@my_booking_references';

interface BookingContextType {
  bookings: Booking[];
  addBooking: (booking: Partial<Booking>) => Promise<string | null>;
  deleteBooking: (bookingId: string) => Promise<void>;
  markCustomerViewed: (bookingId: string) => Promise<void>;
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
        setBookings(prev => {
          if (prev.some(b => b.id === data.id)) {
            return prev.map(b => b.id === data.id ? BookingService.mapToFrontend(data) : b);
          }
          return prev;
        });
      }
      // We intentionally ignore 'CREATED' actions here.
      // Since there is no user login, a device only owns bookings created locally on it.
      // Local creations are already added to state and AsyncStorage by addBooking.
      // Processing generic CREATED events would cause other users' bookings to show up.
    };

    webSocketService.subscribe('/topic/bookings', handleBookingUpdate);
    
    // Add AppState listener to refetch bookings when coming to foreground
    // This is crucial because WebSockets drop messages while the app is backgrounded
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        fetchBookings();
      }
    });

    return () => {
      webSocketService.unsubscribe('/topic/bookings', handleBookingUpdate);
      subscription.remove();
    };
  }, [fetchBookings]);

  const addBooking = useCallback(async (bookingData: Partial<Booking>) => {
    try {
      setIsLoading(true);
      const deviceIdStr = await AsyncStorage.getItem('deviceId');
      if (deviceIdStr) {
        (bookingData as any).deviceId = deviceIdStr;
      }
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

  const deleteBooking = useCallback(async (bookingId: string) => {
    try {
      setIsLoading(true);
      
      const bookingToDelete = bookings.find(b => b.id === bookingId);
      const bookingNumber = (bookingToDelete as any)?.bookingNumber;

      // Remove from API
      await BookingService.deleteBooking(bookingId);
      
      // Remove from AsyncStorage
      if (bookingNumber) {
        const refsStr = await AsyncStorage.getItem(BOOKING_REFS_KEY);
        if (refsStr) {
          const refs: string[] = JSON.parse(refsStr);
          const updatedRefs = refs.filter(r => r !== bookingNumber);
          await AsyncStorage.setItem(BOOKING_REFS_KEY, JSON.stringify(updatedRefs));
        }
      }

      setBookings(prev => prev.filter(b => b.id !== bookingId));
    } catch (error) {
      console.error('Failed to delete booking:', error);
      Alert.alert('Error', 'Failed to delete booking.');
      fetchBookings(); // Refresh to ensure state matches backend
    } finally {
      setIsLoading(false);
    }
  }, [bookings, fetchBookings]);

  const markCustomerViewed = useCallback(async (bookingId: string) => {
    // Optimistic UI update
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, hasUnreadCustomerUpdates: false } : b));
    try {
      await BookingService.markCustomerViewed(bookingId);
    } catch (error) {
      console.error('Failed to mark booking as viewed:', error);
    }
  }, []);

  const value = useMemo(() => ({
    bookings,
    addBooking,
    deleteBooking,
    markCustomerViewed,
    isLoading,
    refreshBookings: fetchBookings
  }), [bookings, addBooking, deleteBooking, markCustomerViewed, isLoading, fetchBookings]);

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
};
