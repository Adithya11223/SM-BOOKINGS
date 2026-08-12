import { useContext } from 'react';
import { BookingContext } from '../context/BookingContext';

export const useBookings = () => {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBookings must be used within a BookingProvider');
  }

  const {
    bookings,
    addBooking,
    updateBookingStatus,
    partialAcceptBooking,
    deleteBooking,
    markAdminViewed,
    isLoading,
    refreshBookings
  } = context;

  return {
    bookings,
    addBooking,
    updateBookingStatus,
    partialAcceptBooking,
    deleteBooking,
    markAdminViewed,
    isLoading,
    refreshBookings
  };
};
