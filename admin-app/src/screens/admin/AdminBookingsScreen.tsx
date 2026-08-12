import React, { useState, useMemo, useEffect } from 'react';
import { useBookings, useNotifications } from '../../hooks/';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, TextInput, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { AdminTabParamList } from '../../navigation/admin/AdminTypes';
import { theme, shadows } from '../../theme';
import { formatDate } from '../../utils/formatters';
import { TopAppBar } from '../../components/navigation/TopAppBar';
import { EmptyState } from '../../components/states/EmptyState';
import { StatusBadge } from '../../components/badges/StatusBadge';
import { MaterialIcons } from '@expo/vector-icons';
import { MotiView, MotiScrollView } from 'moti';

type Props = BottomTabScreenProps<AdminTabParamList, 'AdminBookings'>;

type TabType = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export default function AdminBookingsScreen({ navigation }: Props) {
  const { bookings, updateBookingStatus, deleteBooking } = useBookings();
  const { unreadCount } = useNotifications();
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [isLoading, setIsLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');

  const filteredBookings = useMemo(() => {
    return bookings.filter(booking => {
      const matchesTab = booking.status === activeTab;
      const matchesSearch = searchQuery.length > 0 
        ? (booking.bookingNumber?.toLowerCase().includes(searchQuery.toLowerCase()) || false)
        : true;
      return matchesTab && matchesSearch;
    });
  }, [bookings, activeTab, searchQuery]);

  const handleTabChange = (tab: TabType) => {
    setIsLoading(true);
    setActiveTab(tab);
    setTimeout(() => {
      setIsLoading(false);
    }, 400); // Simulate network load
  };

  const renderTab = (title: string, tabValue: TabType) => {
    const isActive = activeTab === tabValue;
    return (
      <TouchableOpacity 
        style={[styles.tab, isActive && styles.tabActive]}
        onPress={() => handleTabChange(tabValue)}
      >
        <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
          {title}
        </Text>
      </TouchableOpacity>
    );
  };

  const AdminBookingCard = ({ booking, index }: { booking: any, index: number }) => (
    <MotiView 
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'spring', delay: index * 100 }}
      style={styles.card}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.bookingId}>{booking.bookingNumber || booking.id}</Text>
        <StatusBadge status={booking.status} />
      </View>
      
      <View style={styles.customerRow}>
        <MaterialIcons name="person" size={20} color={theme.colors.primary} />
        <View style={styles.customerInfo}>
          <Text style={styles.customerName}>{booking.customerName}</Text>
          <Text style={styles.customerPhone}>{booking.customerPhone}</Text>
        </View>
      </View>

      <View style={styles.detailsRow}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Type</Text>
          <Text style={styles.detailValue}>{booking.type === 'salon' ? 'Visiting Shop' : 'Home Service'}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Date</Text>
          <Text style={styles.detailValue}>{formatDate(booking.date)}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Time</Text>
          <Text style={styles.detailValue}>{booking.time}</Text>
        </View>
      </View>
      
      <View style={styles.servicesContainer}>
        <Text style={styles.detailLabel}>Services ({booking.items.length})</Text>
        <Text style={styles.servicesText} numberOfLines={2}>
          {booking.items.map((i: any) => i.service.name).join(', ')}
        </Text>
      </View>

      <View style={styles.footerRow}>
        <Text style={styles.amountText}>₹{booking.totalPrice.toFixed(2)}</Text>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => {
              // @ts-ignore
              navigation.getParent()?.navigate('AdminBookingDetails', { bookingId: booking.id });
            }}
          >
            <MaterialIcons name="visibility" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
          
          {booking.status === 'pending' && (
            <>
              <TouchableOpacity 
                style={[styles.actionBtn, { backgroundColor: theme.colors.error }]}
                onPress={() => updateBookingStatus(booking.id, 'cancelled')}
              >
                <Text style={styles.actionBtnText}>Reject</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionBtn, { backgroundColor: theme.colors.success }]}
                onPress={() => updateBookingStatus(booking.id, 'confirmed')}
              >
                <Text style={styles.actionBtnText}>Accept</Text>
              </TouchableOpacity>
            </>
          )}

          {booking.status === 'confirmed' && (
            <TouchableOpacity 
              style={[styles.actionBtn, { backgroundColor: theme.colors.primary }]}
              onPress={() => updateBookingStatus(booking.id, 'completed')}
            >
              <Text style={styles.actionBtnText}>Complete</Text>
            </TouchableOpacity>
          )}

          {booking.status === 'cancelled' && (
            <TouchableOpacity 
              style={[styles.iconButton, { marginLeft: 8 }]}
              onPress={() => {
                Alert.alert(
                  'Delete Booking',
                  'Are you sure you want to permanently delete this cancelled booking?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Delete', style: 'destructive', onPress: () => deleteBooking(booking.id) }
                  ]
                );
              }}
            >
              <MaterialIcons name="delete-outline" size={20} color={theme.colors.error} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </MotiView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <TopAppBar 
        title="Manage Bookings" 
      />
      
      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={20} color={theme.colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by booking code..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={theme.colors.textSecondary}
          autoCapitalize="characters"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <MaterialIcons name="close" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.tabsContainer}>
        <MotiScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          from={{ opacity: 0, translateX: 50 }}
          animate={{ opacity: 1, translateX: 0 }}
        >
          {renderTab('Pending', 'pending')}
          {renderTab('Confirmed', 'confirmed')}
          {renderTab('Completed', 'completed')}
          {renderTab('Cancelled', 'cancelled')}
        </MotiScrollView>
      </View>

      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredBookings}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <EmptyState 
              icon="event-available"
              title="No Bookings"
              description={`There are no ${activeTab} bookings.`}
            />
          }
          renderItem={({ item, index }) => <AdminBookingCard booking={item} index={index} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  tabsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.card,
    marginTop: theme.spacing.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: Platform.OS === 'ios' ? theme.spacing.sm : 2,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  searchIcon: {
    marginRight: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
    padding: 0,
    minHeight: 40,
  },
  tab: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: theme.colors.primary,
  },
  tabText: {
    fontSize: theme.typography.bodySmall.fontSize,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  tabTextActive: {
    color: theme.colors.primary,
  },
  list: {
    padding: theme.spacing.md,
    flexGrow: 1,
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...shadows.medium,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  bookingId: {
    fontSize: theme.typography.subtitle.fontSize,
    fontWeight: '700',
    color: theme.colors.text,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${theme.colors.primary}10`,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  customerInfo: {
    marginLeft: theme.spacing.sm,
  },
  customerName: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600',
    color: theme.colors.text,
  },
  customerPhone: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.textSecondary,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: theme.typography.bodySmall.fontSize,
    fontWeight: '500',
    color: theme.colors.text,
  },
  servicesContainer: {
    marginBottom: theme.spacing.md,
  },
  servicesText: {
    fontSize: theme.typography.bodySmall.fontSize,
    color: theme.colors.text,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  amountText: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    alignItems: 'center',
  },
  actionBtn: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.sm,
  },
  actionBtnText: {
    color: theme.colors.background,
    fontSize: theme.typography.bodySmall.fontSize,
    fontWeight: '600',
  },
  iconButton: {
    padding: 6,
    backgroundColor: theme.colors.border,
    borderRadius: theme.borderRadius.round,
  }
});
