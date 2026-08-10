import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../../theme';

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

interface StatusBadgeProps {
  status: BookingStatus;
  style?: ViewStyle;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, style }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'confirmed':
      case 'completed':
        return {
          bg: `${theme.colors.success}20`, // 20% opacity
          text: theme.colors.success,
        };
      case 'cancelled':
        return {
          bg: `${theme.colors.error}20`,
          text: theme.colors.error,
        };
      case 'pending':
      default:
        return {
          bg: theme.colors.border,
          text: theme.colors.textSecondary,
        };
    }
  };

  const colors = getStatusColor();
  const label = status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }, style]}>
      <Text style={[styles.text, { color: colors.text }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: theme.typography.caption.fontSize,
    fontWeight: theme.typography.caption.fontWeight,
    textTransform: 'uppercase',
  },
});
