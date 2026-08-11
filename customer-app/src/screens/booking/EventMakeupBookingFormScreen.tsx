import React, { useState } from 'react';
import { useCart, useBookings } from '../../hooks/';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { theme } from '../../theme';
import { TopAppBar } from '../../components/navigation/TopAppBar';
import { Button } from '../../components/buttons/Button';
import { DatePicker } from '../../components/inputs/DatePicker';
import { TimePicker } from '../../components/inputs/TimePicker';
import { SectionHeader } from '../../components/typography/SectionHeader';
import { FloatingInput } from '../../components/inputs/FloatingInput';
import { MOCK_USER } from '../../constants/data';

type Props = NativeStackScreenProps<RootStackParamList, 'EventMakeupBookingForm'>;

export default function EventMakeupBookingFormScreen({ navigation }: Props) {
  const { cart, cartTotal, clearCart } = useCart();
  const { addBooking } = useBookings();
  
  const [name, setName] = useState(MOCK_USER.name);
  const [phone, setPhone] = useState(MOCK_USER.phone);
  const [address, setAddress] = useState(MOCK_USER.address);
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = () => {
    if (!name || !phone || !address) return;
    
    setIsLoading(true);

    setTimeout(async () => {
      const bookingId = await addBooking({
        type: 'home',
        items: cart,
        totalPrice: cartTotal,
        totalDuration: cart.reduce((acc, curr) => acc + curr.service.duration * curr.quantity, 0),
        date: date.toISOString(),
        time: time.toTimeString().substring(0, 5),
        customerName: name,
        customerPhone: phone,
        address,
        notes,
      });
      setIsLoading(false);

      if (bookingId) {
        clearCart();
        navigation.navigate('BookingSuccess', { bookingId });
      }
    }, 800);
  };

  return (
    <SafeAreaView style={styles.container}>
      <TopAppBar title="Home Service Booking" onBackPress={() => navigation.goBack()} />
      
      <KeyboardAwareScrollView 
        contentContainerStyle={styles.content}
        enableOnAndroid={true}
        keyboardOpeningTime={0}
      >
        <SectionHeader title="Contact Information" style={styles.sectionHeader} />
        
        <FloatingInput
          label="Full Name *"
          value={name}
          onChangeText={setName}
          placeholder="John Doe"
        />

        <FloatingInput
          label="Phone Number *"
          value={phone}
          onChangeText={setPhone}
          placeholder="+1 234 567 8900"
          keyboardType="phone-pad"
        />

        <SectionHeader title="Event Location" style={styles.sectionHeader} />
        <FloatingInput
          label="Full Address *"
          value={address}
          onChangeText={setAddress}
          placeholder="123 Event Venue, City, State"
          multiline
          style={{ height: 60 }}
        />

        <SectionHeader title="Event Time" style={styles.sectionHeader} />
        <DatePicker 
          date={date} 
          onChange={setDate} 
          minimumDate={new Date()} 
        />
        <TimePicker 
          time={time} 
          onChange={setTime} 
        />

        <SectionHeader title="Additional Notes" style={styles.sectionHeader} />
        <FloatingInput
          label="Any special requests? (Optional)"
          value={notes}
          onChangeText={setNotes}
          multiline
          style={{ height: 60 }}
        />

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Booking Summary</Text>
          {cart.map(item => (
            <View key={item.service.id} style={styles.summaryRow}>
              <Text style={styles.summaryItemText}>
                {item.quantity}x {item.service.name}
              </Text>
              <Text style={styles.summaryPrice}>
                ₹{(item.service.price * item.quantity).toFixed(2)}
              </Text>
            </View>
          ))}
          <View style={styles.summaryTotalRow}>
            <Text style={styles.summaryTotalText}>Total</Text>
            <Text style={styles.summaryTotalPrice}>₹{cartTotal.toFixed(2)}</Text>
          </View>
        </View>
      </KeyboardAwareScrollView>

      <View style={styles.footer}>
        <Button 
          title="Confirm Booking" 
          onPress={handleConfirm}
          disabled={!name || !phone || !address}
          isLoading={isLoading}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.lg,
  },
  sectionHeader: {
    paddingHorizontal: 0,
    marginTop: theme.spacing.md,
  },
  summaryCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginTop: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.primary + '30',
  },
  summaryTitle: {
    fontSize: theme.typography.subtitle.fontSize,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xs,
  },
  summaryItemText: {
    fontSize: theme.typography.bodySmall.fontSize,
    color: theme.colors.textSecondary,
    flex: 1,
  },
  summaryPrice: {
    fontSize: theme.typography.bodySmall.fontSize,
    color: theme.colors.text,
    fontWeight: '500',
  },
  summaryTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  summaryTotalText: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600',
    color: theme.colors.text,
  },
  summaryTotalPrice: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  footer: {
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
});
