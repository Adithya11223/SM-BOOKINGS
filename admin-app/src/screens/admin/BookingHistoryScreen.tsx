import React, { useState } from 'react';
import { useBookings } from '../../hooks/';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AdminRootStackParamList } from '../../navigation/admin/AdminTypes';
import { theme, shadows } from '../../theme';
import { formatDate } from '../../utils/formatters';
import { TopAppBar } from '../../components/navigation/TopAppBar';
import { SearchBar } from '../../components/inputs/SearchBar';

type Props = NativeStackScreenProps<AdminRootStackParamList, 'BookingHistory'>;

export default function BookingHistoryScreen({ navigation }: Props) {
  const { bookings } = useBookings();
  const [search, setSearch] = useState('');

  // Show only completed and cancelled for history
  const historyBookings = bookings.filter(b => 
    (b.status === 'completed' || b.status === 'cancelled') &&
    (b.customerName.toLowerCase().includes(search.toLowerCase()) || 
     b.id.toLowerCase().includes(search.toLowerCase()))
  );

  const HistoryCard = ({ booking }: { booking: any }) => (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.bookingId}>{booking.id}</Text>
        <Text style={[styles.status, { color: booking.status === 'completed' ? theme.colors.success : theme.colors.error }]}>
          {booking.status.toUpperCase()}
        </Text>
      </View>
      <Text style={styles.customerName}>{booking.customerName}</Text>
      <Text style={styles.date}>{formatDate(booking.date)} at {booking.time}</Text>
      <View style={styles.footer}>
        <Text style={styles.type}>{booking.type === 'salon' ? 'Visiting Shop' : 'Home Service'}</Text>
        <Text style={styles.price}>₹{booking.totalPrice.toFixed(2)}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <TopAppBar title="Booking History" onBackPress={() => navigation.goBack()} />
      
      <View style={styles.searchContainer}>
        <SearchBar 
          value={search} 
          onChangeText={setSearch} 
          placeholder="Search by Name or ID..." 
        />
      </View>

      <FlatList
        data={historyBookings}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => <HistoryCard booking={item} />}
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
    marginBottom: theme.spacing.sm,
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
  }
});
