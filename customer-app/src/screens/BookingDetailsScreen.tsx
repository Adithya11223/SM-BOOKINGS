import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { Booking } from '../types';
import { BookingService } from '../api/BookingService';
import { theme } from '../theme';
import { formatDate } from '../utils/formatters';
import { TopAppBar } from '../components/navigation/TopAppBar';
import { StatusBadge } from '../components/badges/StatusBadge';
import { SectionHeader } from '../components/typography/SectionHeader';
import { EmptyState } from '../components/states/EmptyState';
import { MaterialIcons } from '@expo/vector-icons';
import { ReviewModal } from '../components/overlays/ReviewModal';

import { useBookings, useNotifications } from '../hooks/';

type Props = NativeStackScreenProps<RootStackParamList, 'BookingDetails'>;

export default function BookingDetailsScreen({ route, navigation }: Props) {
  const { bookingId } = route.params;
  const { bookings, markCustomerViewed } = useBookings();
  const { markBookingNotificationsAsRead } = useNotifications();
  
  const initialBooking = bookings.find(b => b.id === bookingId);
  const [booking, setBooking] = useState<Booking | undefined>(initialBooking);
  const [isLoading, setIsLoading] = useState(!initialBooking);
  const [selectedReviewService, setSelectedReviewService] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    // Mark booking updates and notifications as read immediately on visit
    markCustomerViewed(bookingId);
    markBookingNotificationsAsRead(bookingId);

    const fetchDetails = async () => {
      try {
        setIsLoading(true);
        const fullBooking = await BookingService.getBookingById(bookingId);
        setBooking(fullBooking);
        if (fullBooking.hasUnreadCustomerUpdates) {
          markCustomerViewed(bookingId);
        }
      } catch (error) {
        console.error('Failed to fetch full booking details:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetails();
  }, [bookingId]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <TopAppBar title="Booking Details" onBackPress={() => navigation.goBack()} />
        <View style={styles.errorContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!booking) {
    return (
      <SafeAreaView style={styles.container}>
        <TopAppBar title="Booking Details" onBackPress={() => navigation.goBack()} />
        <EmptyState 
          icon="event-busy"
          title="Booking No Longer Active"
          description="This booking has been cancelled, completed, or is no longer available."
          actionTitle="Back to Bookings"
          onAction={() => navigation.goBack()}
        />
      </SafeAreaView>
    );
  }

  const TimelineItem = ({ title, active, isLast = false }: { title: string, active: boolean, isLast?: boolean }) => (
    <View style={styles.timelineRow}>
      <View style={styles.timelineLeft}>
        <View style={[styles.timelineNode, active && styles.timelineNodeActive]}>
          {active && <View style={styles.timelineNodeInner} />}
        </View>
        {!isLast && <View style={[styles.timelineLine, active && styles.timelineLineActive]} />}
      </View>
      <View style={styles.timelineContent}>
        <Text style={[styles.timelineText, active && styles.timelineTextActive]}>{title}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <TopAppBar title={`Booking #${(booking as any).bookingNumber || booking.id.substring(0, 8)}`} onBackPress={() => navigation.goBack()} />
      
      <ScrollView contentContainerStyle={styles.content}>
        
        <View style={styles.headerCard}>
          <View style={styles.headerTop}>
            <Text style={styles.serviceType}>{booking.type === 'salon' ? 'Visiting Shop' : 'Home Service'}</Text>
            <StatusBadge status={booking.status} />
          </View>
          <View style={styles.dateTimeRow}>
            <MaterialIcons name="event" size={20} color={theme.colors.primary} />
            <Text style={styles.dateTimeText}>{formatDate(booking.date)}</Text>
            <View style={styles.dot} />
            <MaterialIcons name="schedule" size={20} color={theme.colors.primary} />
            <Text style={styles.dateTimeText}>{booking.time}</Text>
          </View>
        </View>

        <SectionHeader title="Status Timeline" style={styles.sectionHeader} />
        <View style={styles.card}>
          {booking.status === 'cancelled' ? (
            <TimelineItem title="Cancelled" active={true} isLast />
          ) : (
            <>
              <TimelineItem title="Pending" active={true} />
              <TimelineItem 
                title="Confirmed" 
                active={booking.status === 'confirmed' || booking.status === 'completed'} 
              />
              <TimelineItem 
                title="Completed" 
                active={booking.status === 'completed'} 
                isLast 
              />
            </>
          )}
        </View>

        <SectionHeader title="Customer Information" style={styles.sectionHeader} />
        <View style={styles.card}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Name</Text>
            <Text style={styles.infoValue}>{booking.customerName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phone</Text>
            <Text style={styles.infoValue}>{booking.customerPhone}</Text>
          </View>
          
          {booking.type !== 'salon' && booking.address ? (
            <View style={[styles.infoRow, { marginTop: theme.spacing.sm }]}>
              <Text style={styles.infoLabel}>Address</Text>
              <Text style={styles.infoValue}>{booking.address}</Text>
            </View>
          ) : null}
        </View>

        <SectionHeader title="Booked Services" style={styles.sectionHeader} />
        <View style={styles.card}>
          {booking.items.map((item, index) => (
            <View key={item.service.id} style={[styles.serviceRow, index > 0 && styles.borderTop]}>
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceName}>{item.service.name}</Text>
                <Text style={styles.serviceQty}>Qty: {item.quantity}</Text>
                {booking.status === 'completed' && (() => {
                  const existingReview = (booking as any)?.reviews?.find((r: any) => r.serviceId === item.service.id);
                  if (existingReview) {
                    return (
                      <View style={styles.reviewedBadge}>
                        <MaterialIcons name="star" size={14} color="#FFB800" />
                        <Text style={styles.reviewedText}>Rated {existingReview.rating}.0/5</Text>
                        {existingReview.comment ? (
                          <Text style={styles.reviewedCommentText} numberOfLines={1}>"{existingReview.comment}"</Text>
                        ) : null}
                      </View>
                    );
                  }
                  return (
                    <TouchableOpacity
                      style={styles.reviewBtn}
                      onPress={() => setSelectedReviewService({ id: item.service.id, name: item.service.name })}
                      activeOpacity={0.7}
                    >
                      <MaterialIcons name="star-rate" size={16} color="#FFD700" />
                      <Text style={styles.reviewBtnText}>Leave Review</Text>
                    </TouchableOpacity>
                  );
                })()}
              </View>
              <Text style={styles.servicePrice}>₹{(item.service.price * item.quantity).toFixed(2)}</Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>₹{booking.totalPrice.toFixed(2)}</Text>
          </View>
        </View>

        {selectedReviewService && (
          <ReviewModal
            visible={!!selectedReviewService}
            bookingId={booking.id}
            serviceId={selectedReviewService.id}
            serviceName={selectedReviewService.name}
            onClose={() => setSelectedReviewService(null)}
            onSuccess={() => {
              setSelectedReviewService(null);
              // Refetch booking details to show submitted review star rating immediately
              const refetch = async () => {
                try {
                  const fullBooking = await BookingService.getBookingById(bookingId);
                  setBooking(fullBooking);
                } catch (e) {
                  console.error(e);
                }
              };
              refetch();
            }}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: theme.typography.h3.fontSize,
    color: theme.colors.error,
  },
  content: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxxl,
  },
  headerCard: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  serviceType: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: '700',
    color: theme.colors.background,
  },
  dateTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    alignSelf: 'flex-start',
  },
  dateTimeText: {
    fontSize: theme.typography.bodySmall.fontSize,
    fontWeight: '600',
    color: theme.colors.text,
    marginLeft: 6,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.border,
    marginHorizontal: theme.spacing.sm,
  },
  sectionHeader: {
    paddingHorizontal: 0,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  
  // Timeline
  timelineRow: {
    flexDirection: 'row',
  },
  timelineLeft: {
    width: 30,
    alignItems: 'center',
  },
  timelineNode: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  timelineNodeActive: {
    backgroundColor: `${theme.colors.primary}30`,
  },
  timelineNodeInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
  },
  timelineLine: {
    width: 2,
    height: 30,
    backgroundColor: theme.colors.border,
    marginVertical: -2,
    zIndex: 1,
  },
  timelineLineActive: {
    backgroundColor: theme.colors.primary,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 24,
    paddingLeft: theme.spacing.sm,
  },
  timelineText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textSecondary,
    marginTop: -2,
  },
  timelineTextActive: {
    color: theme.colors.text,
    fontWeight: '600',
  },

  // Info Row
  infoRow: {
    flexDirection: 'row',
    marginBottom: theme.spacing.sm,
  },
  infoLabel: {
    width: 100,
    fontSize: theme.typography.bodySmall.fontSize,
    color: theme.colors.textSecondary,
  },
  infoValue: {
    flex: 1,
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
    fontWeight: '500',
  },

  // Services Row
  serviceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  borderTop: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  serviceInfo: {
    flex: 1,
    paddingRight: theme.spacing.sm,
  },
  serviceName: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
    marginBottom: 2,
  },
  serviceQty: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.textSecondary,
  },
  reviewedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  reviewedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D97706',
    marginLeft: 4,
  },
  reviewedCommentText: {
    fontSize: 11,
    fontStyle: 'italic',
    color: theme.colors.textSecondary,
    marginLeft: 6,
  },
  servicePrice: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600',
    color: theme.colors.text,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  totalLabel: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600',
    color: theme.colors.text,
  },
  totalValue: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  reviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    backgroundColor: '#FFF9C4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  reviewBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F57F17',
    marginLeft: 4,
  },
});
