import React, { useState, useMemo } from 'react';
import { useBookings } from '../hooks/';
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

type TabType = 'upcoming' | 'completed' | 'cancelled';

export default function MyBookingsScreen({ navigation }: any) {
  const { bookings, deleteBooking } = useBookings();
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');

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

  type SortType = 'date-desc' | 'date-asc' | 'price-desc' | 'price-asc';
  const [sortBy, setSortBy] = useState<SortType>('date-desc');

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

  return (
    <SafeAreaView style={styles.container}>
      <TopAppBar title="My Bookings" />
      
      <View style={styles.tabsContainer}>
        {renderTab('Upcoming', 'upcoming')}
        {renderTab('Completed', 'completed')}
        {renderTab('Cancelled', 'cancelled')}
      </View>

      {activeTab !== 'upcoming' && (
        <View style={{ paddingHorizontal: theme.spacing.lg, marginBottom: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: theme.spacing.md }}>
            <Text style={{ fontSize: 14, color: theme.colors.textSecondary }}>Sort By:</Text>
            <TouchableOpacity 
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: theme.colors.surface,
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: theme.colors.border,
              }}
              onPress={() => {
                Alert.alert('Sort By', 'Choose an option', [
                  { text: 'Date: Newest', onPress: () => setSortBy('date-desc') },
                  { text: 'Date: Oldest', onPress: () => setSortBy('date-asc') },
                  { text: 'Price: High', onPress: () => setSortBy('price-desc') },
                  { text: 'Price: Low', onPress: () => setSortBy('price-asc') },
                  { text: 'Cancel', style: 'cancel' }
                ], { cancelable: true });
              }}
            >
              <Text style={{ color: theme.colors.text, marginRight: 8, fontSize: 14, fontWeight: '500' }}>
                {sortBy === 'date-desc' ? 'Date: Newest' : 
                 sortBy === 'date-asc' ? 'Date: Oldest' : 
                 sortBy === 'price-desc' ? 'Price: High' : 'Price: Low'}
              </Text>
              <MaterialIcons name="arrow-drop-down" size={20} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
        </View>
      )}

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
            onDelete={item.status === 'cancelled' ? () => handleDelete(item.id) : undefined}
            onPress={() => {
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
  sortChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  sortChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  sortChipText: {
    fontSize: 12,
    color: theme.colors.text,
  },
  sortChipTextActive: {
    color: '#FFF',
    fontWeight: 'bold',
  }
});
