import React, { useEffect, useRef } from 'react';
import { useBookings } from '../../hooks/';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/types';
import { theme } from '../../theme';
import { formatDate } from '../../utils/formatters';
import { Button } from '../../components/buttons/Button';

type Props = NativeStackScreenProps<RootStackParamList, 'BookingSuccess'>;

export default function BookingSuccessScreen({ route, navigation }: Props) {
  const { bookingId } = route.params;
  const { bookings } = useBookings();
  
  const booking = bookings.find(b => b.id === bookingId);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start();
  }, [scaleAnim, opacityAnim]);

  const handleGoHome = () => {
    navigation.popToTop(); // Back to MainTabs
  };

  const handleViewBookings = () => {
    navigation.popToTop();
    // Use timeout to allow pop to complete before navigating tabs
    setTimeout(() => {
      navigation.navigate('MainTabs', { screen: 'MyBookings' });
    }, 100);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Animated.View style={[styles.iconContainer, { transform: [{ scale: scaleAnim }] }]}>
          <MaterialIcons name="check-circle" size={80} color={theme.colors.success} />
        </Animated.View>
        
        <Text style={styles.title}>Booking Successful!</Text>
        <Text style={styles.subtitle}>Your appointment has been received.</Text>

        <Animated.View style={[styles.card, { opacity: opacityAnim }]}>
          <Text style={styles.cardLabel}>Booking ID</Text>
          <Text style={styles.bookingId}>{(booking as any)?.bookingNumber || bookingId}</Text>
          
          <View style={styles.divider} />
          
          {booking && (
            <View style={styles.detailsRow}>
              <View style={styles.detailItem}>
                <MaterialIcons name="event" size={20} color={theme.colors.textSecondary} />
                <Text style={styles.detailText}>
                  {formatDate(booking.date)}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <MaterialIcons name="schedule" size={20} color={theme.colors.textSecondary} />
                <Text style={styles.detailText}>{booking.time}</Text>
              </View>
            </View>
          )}
        </Animated.View>

      </View>

      <View style={styles.footer}>
        <Button 
          title="View My Bookings" 
          variant="primary" 
          onPress={handleViewBookings} 
          style={styles.button} 
        />
        <Button 
          title="Go to Home" 
          variant="outline" 
          onPress={handleGoHome} 
          style={styles.button} 
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
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  iconContainer: {
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.typography.h2.fontSize,
    fontWeight: theme.typography.h2.fontWeight,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xxl,
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardLabel: {
    fontSize: theme.typography.bodySmall.fontSize,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  bookingId: {
    fontSize: theme.typography.h2.fontSize,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    width: '100%',
    marginVertical: theme.spacing.lg,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    marginLeft: theme.spacing.sm,
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
    fontWeight: '500',
  },
  footer: {
    padding: theme.spacing.xl,
  },
  button: {
    marginBottom: theme.spacing.md,
  },
});
