import React, { useState, useMemo } from 'react';
import { useBookings } from '../hooks/';
import { MaterialIcons } from '@expo/vector-icons';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { Booking } from '../types';
import { theme } from '../theme';
import { formatDate } from '../utils/formatters';
import { TopAppBar } from '../components/navigation/TopAppBar';
import { BookingCard } from '../components/cards/BookingCard';
import { EmptyState } from '../components/states/EmptyState';
import { SortModal, SortOption } from '../components/overlays/SortModal';

type TabType = 'upcoming' | 'completed' | 'cancelled';

export default function MyBookingsScreen({ navigation }: any) {
  const { bookings, deleteBooking, markCustomerViewed } = useBookings();
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');
  const [isSortModalVisible, setIsSortModalVisible] = useState(false);

  const filteredBookings = useMemo(() => {
    return bookings.filter(booking => {
      if (activeTab === 'upcoming') {
        return booking.status === 'pending' || booking.status === 'confirmed';
      }
      return booking.status === activeTab;
    }).sort((a, b) => {
      if (sortBy === 'date-desc') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      } else if (sortBy === 'date-asc') {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortBy === 'price-desc') {
        return b.totalPrice - a.totalPrice;
      } else if (sortBy === 'price-asc') {
        return a.totalPrice - b.totalPrice;
      }
      return 0;
    });
  }, [bookings, activeTab, sortBy]);

  const renderTab = (title: string, tabValue: TabType) => {
    const isActive = activeTab === tabValue;
    return (
      <TouchableOpacity 
        style={[styles.tab, isActive && styles.tabActive]}
        onPress={() => setActiveTab(tabValue)}
      >
        <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
          {title}
        </Text>
      </TouchableOpacity>
    );
  };

  const getSortLabel = (sort: SortOption) => {
    switch (sort) {
      case 'date-desc': return 'Date: Newest';
      case 'date-asc': return 'Date: Oldest';
      case 'price-desc': return 'Price: High';
      case 'price-asc': return 'Price: Low';
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      "Delete Booking",
      "Are you sure you want to permanently delete this cancelled booking?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: () => deleteBooking(id) 
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <TopAppBar title="My Bookings" />
      
      <View style={styles.tabsContainer}>
        {renderTab('Upcoming', 'upcoming')}
        {renderTab('Completed', 'completed')}
        {renderTab('Cancelled', 'cancelled')}
      </View>

      {activeTab !== 'upcoming' && (
        <View style={styles.sortContainer}>
          <Text style={styles.sortLabel}>Sort By:</Text>
          <TouchableOpacity 
            style={styles.sortTriggerButton}
            onPress={() => setIsSortModalVisible(true)}
            activeOpacity={0.7}
          >
            <MaterialIcons name="sort" size={18} color={theme.colors.primary} />
            <Text style={styles.sortTriggerText}>
              {getSortLabel(sortBy)}
            </Text>
            <MaterialIcons name="arrow-drop-down" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>
      )}

      <SortModal
        visible={isSortModalVisible}
        onClose={() => setIsSortModalVisible(false)}
        selectedOption={sortBy}
        onSelectOption={setSortBy}
      />

      <FlatList
        data={filteredBookings}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState 
            icon="event-busy"
            title="No Bookings Found"
            description={`You have no ${activeTab} bookings.`}
          />
        }
        renderItem={({ item }) => (
          <BookingCard
            serviceName={item.items && item.items.length > 0
              ? item.items[0]?.service?.name + (item.items.length > 1 ? ` +${item.items.length - 1} more` : '')
              : (item.type === 'salon' ? 'Visiting Shop' : 'Home Service')}
            date={formatDate(item.date)}
            time={item.time}
            status={item.status}
            showUnreadDot={item.hasUnreadCustomerUpdates}
            onDelete={item.status === 'cancelled' ? () => handleDelete(item.id) : undefined}
            onPress={() => {
              if (item.hasUnreadCustomerUpdates) {
                markCustomerViewed(item.id);
              }
              // @ts-ignore - navigation type mismatch between stack and tab for nested routing, 
              // but standard push works at runtime because they share the root stack
              navigation.getParent()?.navigate('BookingDetails', { bookingId: item.id })
            }}
          />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    marginBottom: theme.spacing.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
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
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  sortLabel: {
    fontSize: theme.typography.bodySmall.fontSize,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  sortTriggerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 7,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 6,
  },
  sortTriggerText: {
    color: theme.colors.text,
    fontSize: theme.typography.bodySmall.fontSize,
    fontWeight: '600',
  },
});
