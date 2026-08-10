import React from 'react';
import { useBookings } from '../../hooks/';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BookingService } from '../../api/BookingService';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { AdminRootStackParamList } from '../../navigation/admin/AdminTypes';
import { theme } from '../../theme';
import { formatDate } from '../../utils/formatters';
import { TopAppBar } from '../../components/navigation/TopAppBar';
import { StatusBadge } from '../../components/badges/StatusBadge';
import { SectionHeader } from '../../components/typography/SectionHeader';
import { Button } from '../../components/buttons/Button';
import { MotiView } from 'moti';

type Props = NativeStackScreenProps<AdminRootStackParamList, 'AdminBookingDetails'>;

export default function AdminBookingDetailsScreen({ route, navigation }: Props) {
  const { bookingId } = route.params;
  const { updateBookingStatus, partialAcceptBooking } = useBookings();
  const [booking, setBooking] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [selectedServiceIds, setSelectedServiceIds] = React.useState<string[]>([]);

  React.useEffect(() => {
    const fetchDetails = async () => {
      try {
        const fullBooking = await BookingService.getBookingById(bookingId);
        setBooking(fullBooking);
        if (fullBooking.status === 'pending') {
          setSelectedServiceIds(fullBooking.items.map((i: any) => i.service.id));
        }
      } catch (error) {
        console.error("Failed to load booking details", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [bookingId]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <TopAppBar title="Details" onBackPress={() => navigation.goBack()} />
        <View style={styles.errorContainer}>
          <Text style={{color: theme.colors.textSecondary}}>Loading details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!booking) {
    return (
      <SafeAreaView style={styles.container}>
        <TopAppBar title="Details" onBackPress={() => navigation.goBack()} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Booking not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleCall = () => {
    Linking.openURL(`tel:${booking.customerPhone}`);
  };

  const handleWhatsApp = () => {
    Linking.openURL(`whatsapp://send?phone=${booking.customerPhone}&text=Hi ${booking.customerName}, regarding your booking...`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <TopAppBar title={`Booking #${(booking as any).bookingNumber || booking.id.substring(0, 8)}`} onBackPress={() => navigation.goBack()} />
      
      <ScrollView contentContainerStyle={styles.content}>
        
        <MotiView 
          from={{ opacity: 0, translateY: -20 }}
          animate={{ opacity: 1, translateY: 0 }}
          style={styles.headerCard}
        >
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
        </MotiView>

        <MotiView 
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 100 }}
        >
          <SectionHeader title="Customer Info" style={styles.sectionHeader} />
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Name</Text>
              <Text style={styles.infoValue}>{booking.customerName}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Phone</Text>
              <Text style={styles.infoValue}>{booking.customerPhone}</Text>
            </View>
            
            <View style={styles.contactActions}>
              <TouchableOpacity style={styles.contactBtn} onPress={handleCall}>
                <MaterialIcons name="phone" size={20} color={theme.colors.primary} />
                <Text style={styles.contactBtnText}>Call</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.contactBtn} onPress={handleWhatsApp}>
                <FontAwesome name="whatsapp" size={20} color={theme.colors.success} />
                <Text style={[styles.contactBtnText, { color: theme.colors.success }]}>WhatsApp</Text>
              </TouchableOpacity>
            </View>

            {booking.type !== 'salon' && booking.address ? (
              <View style={[styles.infoRow, { marginTop: theme.spacing.md }]}>
                <Text style={styles.infoLabel}>Address</Text>
                <Text style={styles.infoValue}>{booking.address}</Text>
              </View>
            ) : null}
            
            {booking.notes ? (
              <View style={{ marginTop: theme.spacing.sm }}>
                <Text style={styles.infoLabel}>Notes:</Text>
                <Text style={styles.notesText}>{booking.notes}</Text>
              </View>
            ) : null}
          </View>
        </MotiView>

        <MotiView 
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 200 }}
        >
          <SectionHeader title="Services Requested" style={styles.sectionHeader} />
          <View style={styles.card}>
            {booking.items.map((item: any, index: number) => {
              const isSelected = selectedServiceIds.includes(item.service.id);
              return (
              <View key={item.service.id} style={[styles.serviceRow, index > 0 && styles.borderTop]}>
                {booking.status === 'pending' && (
                  <TouchableOpacity
                    onPress={() => {
                      if (isSelected) {
                        setSelectedServiceIds(prev => prev.filter(id => id !== item.service.id));
                      } else {
                        setSelectedServiceIds(prev => [...prev, item.service.id]);
                      }
                    }}
                    style={{ marginRight: theme.spacing.sm }}
                  >
                    <MaterialIcons 
                      name={isSelected ? "check-box" : "check-box-outline-blank"} 
                      size={24} 
                      color={isSelected ? theme.colors.primary : theme.colors.border} 
                    />
                  </TouchableOpacity>
                )}
                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceName}>{item.service.name}</Text>
                  <Text style={styles.serviceQty}>Qty: {item.quantity}</Text>
                </View>
                <Text style={styles.servicePrice}>₹{(item.service.price * item.quantity).toFixed(2)}</Text>
              </View>
            )})}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalValue}>₹{booking.totalPrice.toFixed(2)}</Text>
            </View>
          </View>
        </MotiView>

        {/* Admin Actions */}
        {booking.status === 'pending' && (
          <MotiView 
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 300 }}
            style={styles.adminActions}
          >
            <Button 
              title={selectedServiceIds.length === booking.items.length ? "Accept Booking" : "Accept Selected Services"} 
              disabled={selectedServiceIds.length === 0}
              onPress={async () => {
                if (selectedServiceIds.length === booking.items.length) {
                  updateBookingStatus(booking.id, 'confirmed');
                } else {
                  await partialAcceptBooking(booking.id, selectedServiceIds);
                }
                navigation.goBack();
              }} 
            />
            <Button 
              title="Reject Booking" 
              variant="outline"
              style={{ marginTop: theme.spacing.md }}
              onPress={() => {
                updateBookingStatus(booking.id, 'cancelled');
                navigation.goBack();
              }} 
            />
          </MotiView>
        )}
        
        {booking.status === 'confirmed' && (
          <MotiView 
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 300 }}
            style={styles.adminActions}
          >
            <Button 
              title="Mark as Completed" 
              onPress={() => {
                updateBookingStatus(booking.id, 'completed');
                navigation.goBack();
              }} 
            />
          </MotiView>
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
  contactActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  contactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    flex: 1,
    justifyContent: 'center',
  },
  contactBtnText: {
    marginLeft: 6,
    fontSize: theme.typography.bodySmall.fontSize,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  linkText: {
    color: theme.colors.primary,
    fontWeight: '600',
    marginTop: theme.spacing.sm,
  },
  notesText: {
    marginTop: 4,
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
    fontStyle: 'italic',
  },
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
  adminActions: {
    marginTop: theme.spacing.xl,
  }
});
