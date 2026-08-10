import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import { theme, shadows } from '../../theme';
import { StatusBadge, BookingStatus } from '../badges/StatusBadge';

interface BookingCardProps {
  serviceName: string;
  customerName?: string; // Optional for customer view
  date: string;
  time: string;
  status: BookingStatus;
  onPress: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const BookingCard = ({
  serviceName,
  customerName,
  date,
  time,
  status,
  onPress
}: BookingCardProps) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return { transform: [{ scale: scale.value }] };
  });

  return (
    <AnimatedPressable 
      style={[styles.card, animatedStyle]}
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.98, { damping: 15 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 15 }); }}
      accessibilityRole="button"
    >
      <View style={styles.header}>
        <Text style={styles.serviceName} numberOfLines={1}>
          {serviceName}
        </Text>
        <StatusBadge status={status} />
      </View>

      {customerName && (
        <View style={styles.customerRow}>
          <MaterialIcons name="person-outline" size={20} color={theme.colors.textSecondary} />
          <Text style={styles.customerName}>{customerName}</Text>
        </View>
      )}

      <View style={styles.footer}>
        <View style={styles.dateTimeRow}>
          <View style={styles.dateTimeItem}>
            <MaterialIcons name="event" size={16} color={theme.colors.primary} />
            <Text style={styles.dateTimeText}>{date}</Text>
          </View>
          <View style={styles.dateTimeItem}>
            <MaterialIcons name="schedule" size={16} color={theme.colors.primary} />
            <Text style={styles.dateTimeText}>{time}</Text>
          </View>
        </View>
        <MaterialIcons name="chevron-right" size={24} color={theme.colors.border} />
      </View>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: 20,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    ...shadows.medium,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  serviceName: {
    flex: 1,
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600',
    color: theme.colors.text,
    marginRight: theme.spacing.sm,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  customerName: {
    marginLeft: theme.spacing.xs,
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textSecondary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.background,
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: theme.spacing.lg,
  },
  dateTimeItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateTimeText: {
    marginLeft: 4,
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.text,
    fontWeight: '500',
  }
});
