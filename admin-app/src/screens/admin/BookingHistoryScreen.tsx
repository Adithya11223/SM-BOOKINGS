import React, { useState } from 'react';
import { useBookings } from '../../hooks/';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Platform, Button, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AdminRootStackParamList } from '../../navigation/admin/AdminTypes';
import { theme, shadows } from '../../theme';
import { formatDate } from '../../utils/formatters';
import { TopAppBar } from '../../components/navigation/TopAppBar';
import { SearchBar } from '../../components/inputs/SearchBar';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialIcons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<AdminRootStackParamList, 'BookingHistory'>;

export default function BookingHistoryScreen({ navigation }: Props) {
  const { bookings, deleteBooking } = useBookings();
  const [search, setSearch] = useState('');
  
  // Date filter state
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  type SortType = 'date-desc' | 'date-asc' | 'price-desc' | 'price-asc';
  const [sortBy, setSortBy] = useState<SortType>('date-desc');

  // Show only completed and cancelled for history
  const historyBookings = bookings.filter(b => {
    // 1. Status filter
    if (b.status !== 'completed' && b.status !== 'cancelled') return false;

    // 2. Search filter (Name or Booking Code)
    const searchLower = search.toLowerCase();
    const displayId = b.bookingNumber || b.id;
    const matchesSearch = 
      b.customerName.toLowerCase().includes(searchLower) || 
      displayId.toLowerCase().includes(searchLower);
      
    if (!matchesSearch) return false;

    // 3. Date range filter
    const bookingDate = new Date(b.date);
    bookingDate.setHours(0, 0, 0, 0);

    if (fromDate) {
      const from = new Date(fromDate);
      from.setHours(0, 0, 0, 0);
      if (bookingDate < from) return false;
    }
    
    if (toDate) {
      const to = new Date(toDate);
      to.setHours(0, 0, 0, 0);
      if (bookingDate > to) return false;
    }

    return true;
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

  const onFromDateChange = (event: any, selectedDate?: Date) => {
    setShowFromPicker(Platform.OS === 'ios');
    if (selectedDate) setFromDate(selectedDate);
  };

  const onToDateChange = (event: any, selectedDate?: Date) => {
    setShowToPicker(Platform.OS === 'ios');
    if (selectedDate) setToDate(selectedDate);
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

  const HistoryCard = ({ booking }: { booking: any }) => {
    const displayId = booking.bookingNumber || booking.id;
    
    return (
      <TouchableOpacity 
        style={styles.card} 
        onPress={() => navigation.navigate('AdminBookingDetails', { bookingId: booking.id })}
      >
        <View style={styles.header}>
          <Text style={styles.bookingId}>{displayId}</Text>
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
            <Text style={[styles.status, { color: booking.status === 'completed' ? theme.colors.success : theme.colors.error }]}>
              {booking.status.toUpperCase()}
            </Text>
            {booking.status === 'cancelled' && (
              <TouchableOpacity onPress={() => handleDelete(booking.id)}>
                <MaterialIcons name="delete-outline" size={24} color={theme.colors.error} />
              </TouchableOpacity>
            )}
          </View>
        </View>
        <Text style={styles.customerName}>{booking.customerName}</Text>
        <Text style={styles.date}>{formatDate(booking.date)} at {booking.time}</Text>
        <View style={styles.footer}>
          <Text style={styles.type}>{booking.type === 'salon' ? 'Visiting Shop' : 'Home Service'}</Text>
          <Text style={styles.price}>₹{booking.totalPrice.toFixed(2)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <TopAppBar title="Booking History" onBackPress={() => navigation.goBack()} />
      
      <View style={styles.searchContainer}>
        <SearchBar 
          value={search} 
          onChangeText={setSearch} 
          placeholder="Search by Name or Code (e.g. BKG-HEM)..." 
        />
        
        <View style={styles.dateFilterContainer}>
          <TouchableOpacity style={styles.dateButton} onPress={() => setShowFromPicker(true)}>
            <Text style={styles.dateButtonText}>
              From: {fromDate ? fromDate.toLocaleDateString() : 'Any'}
            </Text>
          </TouchableOpacity>
          
          <Text style={styles.dateSeparator}>-</Text>
          
          <TouchableOpacity style={styles.dateButton} onPress={() => setShowToPicker(true)}>
            <Text style={styles.dateButtonText}>
              To: {toDate ? toDate.toLocaleDateString() : 'Any'}
            </Text>
          </TouchableOpacity>
          
          {(fromDate || toDate) && (
            <TouchableOpacity style={styles.clearButton} onPress={() => { setFromDate(undefined); setToDate(undefined); }}>
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={{ marginTop: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: theme.spacing.sm }}>
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
      </View>

      {showFromPicker && (
        <DateTimePicker
          value={fromDate || new Date()}
          mode="date"
          display="default"
          onChange={onFromDateChange}
        />
      )}
      
      {showToPicker && (
        <DateTimePicker
          value={toDate || new Date()}
          mode="date"
          display="default"
          onChange={onToDateChange}
        />
      )}

      <FlatList
        data={historyBookings}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => <HistoryCard booking={item} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No history matches your filters.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  searchContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  dateFilterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  dateButton: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  dateButtonText: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.text,
  },
  dateSeparator: {
    marginHorizontal: 8,
    color: theme.colors.textSecondary,
  },
  clearButton: {
    marginLeft: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: theme.colors.error + '20',
    borderRadius: theme.borderRadius.sm,
  },
  clearButtonText: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.error,
    fontWeight: '600',
  },
  list: {
    padding: theme.spacing.md,
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    ...shadows.soft,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  bookingId: {
    fontWeight: '700',
    color: theme.colors.text,
  },
  status: {
    fontSize: theme.typography.caption.fontSize,
    fontWeight: '700',
  },
  customerName: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '500',
    color: theme.colors.text,
  },
  date: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.textSecondary,
    marginBottom: 8,
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
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  type: {
    fontSize: theme.typography.bodySmall.fontSize,
    color: theme.colors.textSecondary,
  },
  price: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  emptyContainer: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    color: theme.colors.textSecondary,
  }
});
