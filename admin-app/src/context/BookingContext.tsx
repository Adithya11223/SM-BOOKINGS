import React, { createContext, useState, ReactNode, useCallback, useMemo, useEffect } from 'react';
import { Booking, BookingStatus } from '../types';
import { BookingService } from '../api/BookingService';
import { webSocketService } from '../api/WebSocketService';
import { Alert, AppState } from 'react-native';
import { useAuth } from '../hooks/useAuth';

interface BookingContextType {
  bookings: Booking[];
  addBooking: (booking: Partial<Booking>) => Promise<string | null>; 
  updateBookingStatus: (bookingId: string, status: BookingStatus) => Promise<void>;
  partialAcceptBooking: (bookingId: string, acceptedServiceIds: string[]) => Promise<void>;
  deleteBooking: (bookingId: string) => Promise<void>;
  markAdminViewed: (bookingId: string) => Promise<void>;
  isLoading: boolean;
  refreshBookings: () => Promise<void>;
}

export const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const { user } = useAuth();
  
  const fetchBookings = useCallback(async () => {
    if (!user) return; // Do not fetch if not authenticated
    try {
      setIsLoading(true);
      const fetchedBookings = await BookingService.getBookings({ size: 1000, sort: 'createdAt' });
      setBookings(fetchedBookings);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      setBookings([]);
      return;
    }
    
    fetchBookings();

    const handleBookingUpdate = (payload: any) => {
      const { action, data } = payload;
      if (!data) {
        fetchBookings();
        return;
      }
      const mappedData = BookingService.mapToFrontend(data);
      if (action === 'UPDATED' || action === 'STATUS_CHANGED' || action === 'STATUS_UPDATE') {
        setBookings(prev => {
          const exists = prev.some(b => b.id === mappedData.id);
          if (exists) {
            return prev.map(b => b.id === mappedData.id ? mappedData : b);
          }
          return [mappedData, ...prev];
        });
      } else if (action === 'CREATED') {
        setBookings(prev => {
          if (!prev.find(b => b.id === mappedData.id)) {
            return [mappedData, ...prev];
          }
          return prev;
        });
      }
      // Trigger instant refetch to ensure all stats & metrics update in real-time
      fetchBookings();
    };

    webSocketService.subscribe('/topic/bookings', handleBookingUpdate);
    
    // Add AppState listener to refetch bookings when coming to foreground
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        fetchBookings();
      }
    });

    return () => {
      webSocketService.unsubscribe('/topic/bookings', handleBookingUpdate);
      subscription.remove();
    };
  }, [fetchBookings, user]);

  const addBooking = useCallback(async (bookingData: Partial<Booking>) => {
    try {
      setIsLoading(true);
      const newBooking = await BookingService.createBooking(bookingData);
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

  const updateBookingStatus = useCallback(async (bookingId: string, status: BookingStatus) => {
    try {
      // Optimistic UI update
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status } : b));
      await BookingService.updateBookingStatus(bookingId, status);
    } catch (error) {
      console.error('Failed to update booking status:', error);
      // We should ideally revert the pessimistic update here if we kept the old state
      Alert.alert('Error', 'Failed to update booking status.');
      fetchBookings(); // Refetch to sync state
    }
  }, [fetchBookings]);

  const partialAcceptBooking = useCallback(async (bookingId: string, acceptedServiceIds: string[]) => {
    try {
      await BookingService.partialAcceptBooking(bookingId, acceptedServiceIds);
      // We rely on websockets to fetch the newly created booking and updated original booking
    } catch (error) {
      console.error('Failed to partially accept booking:', error);
      Alert.alert('Error', 'Failed to partially accept booking.');
      fetchBookings();
    }
  }, [fetchBookings]);

  const deleteBooking = useCallback(async (bookingId: string) => {
    try {
      setBookings(prev => prev.filter(b => b.id !== bookingId));
      await BookingService.deleteBooking(bookingId);
    } catch (error) {
      console.error('Failed to delete booking:', error);
      Alert.alert('Error', 'Failed to delete booking.');
      fetchBookings();
    }
  }, [fetchBookings]);

  const markAdminViewed = useCallback(async (bookingId: string) => {
    // Optimistic UI update
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, hasUnreadAdminUpdates: false } : b));
    try {
      await BookingService.markAdminViewed(bookingId);
    } catch (error) {
      console.error('Failed to mark booking as viewed:', error);
    }
  }, []);

  const value = useMemo(() => ({
    bookings,
    addBooking,
    updateBookingStatus,
    partialAcceptBooking,
    deleteBooking,
    markAdminViewed,
    isLoading,
    refreshBookings: fetchBookings
  }), [bookings, addBooking, updateBookingStatus, partialAcceptBooking, deleteBooking, markAdminViewed, isLoading, fetchBookings]);

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
};
