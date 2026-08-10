import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../../theme';

interface PriceBadgeProps {
  price: number;
  currency?: string;
  style?: ViewStyle;
}

export const PriceBadge: React.FC<PriceBadgeProps> = ({
  price,
  currency = '$',
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.text}>{`${currency}${price.toFixed(2)}`}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.secondary,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
    alignSelf: 'flex-start',
  },
  text: {
    color: theme.colors.primary,
    fontSize: theme.typography.bodySmall.fontSize,
    fontWeight: theme.typography.bodySmall.fontWeight,
  },
});
