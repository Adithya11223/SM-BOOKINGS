import React from 'react';
import { View, StyleSheet, DimensionValue } from 'react-native';
import { Skeleton } from 'moti/skeleton';
import { theme } from '../../theme';

interface SkeletonProps {
  width?: DimensionValue;
  height?: DimensionValue;
  radius?: number;
  type?: 'card' | 'text' | 'avatar' | 'button';
  colorMode?: 'light' | 'dark';
  style?: any;
}

export const SkeletonLoader = ({ 
  width, 
  height, 
  radius, 
  type = 'text',
  colorMode = 'light',
  style 
}: SkeletonProps) => {
  let defaultWidth: DimensionValue = width || '100%';
  let defaultHeight: DimensionValue = height || 20;
  let defaultRadius = radius || theme.borderRadius.sm;

  if (type === 'card') {
    defaultHeight = height || 120;
    defaultRadius = radius || theme.borderRadius.md;
  } else if (type === 'avatar') {
    defaultWidth = width || 50;
    defaultHeight = height || 50;
    defaultRadius = radius || 25;
  } else if (type === 'button') {
    defaultHeight = height || 48;
    defaultRadius = radius || theme.borderRadius.lg;
  }

  return (
    <View style={style}>
      <Skeleton 
        colorMode={colorMode} 
        width={defaultWidth} 
        height={defaultHeight} 
        radius={defaultRadius} 
        colors={[theme.colors.border, theme.colors.card, theme.colors.border]}
      />
    </View>
  );
};

export const ServiceSkeleton = () => (
  <View style={styles.serviceRow}>
    <SkeletonLoader type="avatar" width={80} height={80} radius={theme.borderRadius.md} />
    <View style={styles.serviceInfo}>
      <SkeletonLoader type="text" width="70%" style={{ marginBottom: 8 }} />
      <SkeletonLoader type="text" width="40%" height={14} style={{ marginBottom: 8 }} />
      <SkeletonLoader type="text" width="30%" height={14} />
    </View>
  </View>
);

export const BookingCardSkeleton = () => (
  <View style={styles.cardSkeleton}>
    <View style={styles.cardHeader}>
      <SkeletonLoader type="text" width="40%" height={24} />
      <SkeletonLoader type="text" width="20%" height={24} radius={12} />
    </View>
    <View style={{ marginBottom: 12 }}>
      <SkeletonLoader type="text" width="60%" />
    </View>
    <View style={styles.cardHeader}>
      <SkeletonLoader type="text" width="30%" />
      <SkeletonLoader type="text" width="30%" />
    </View>
  </View>
);

const styles = StyleSheet.create({
  serviceRow: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  serviceInfo: {
    flex: 1,
    marginLeft: theme.spacing.md,
    justifyContent: 'center',
  },
  cardSkeleton: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  }
});
