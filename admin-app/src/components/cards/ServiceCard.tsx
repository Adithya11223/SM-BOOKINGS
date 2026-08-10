import React from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import { theme, shadows } from '../../theme';
import { PriceBadge } from '../badges/PriceBadge';

interface ServiceCardProps {
  title: string;
  duration: number;
  price: number;
  imageUrl?: string;
  onPress: () => void;
  onActionPress: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const ServiceCard = ({ 
  title, 
  duration, 
  price, 
  imageUrl,
  onPress,
  onActionPress
}: ServiceCardProps) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return { transform: [{ scale: scale.value }] };
  });

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.98, { damping: 15 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 15 }); }}
      style={[styles.card, animatedStyle]}
      accessibilityRole="button"
    >
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.image} />
      ) : (
        <View style={styles.imagePlaceholder}>
          <MaterialIcons name="image" size={32} color={theme.colors.border} />
        </View>
      )}
      
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>{title}</Text>
        <Text style={styles.duration}>{duration} mins</Text>
        
        <View style={styles.footer}>
          <PriceBadge price={price} />
          
          <AnimatedPressable 
            style={styles.actionBtn}
            onPress={onActionPress}
            onPressIn={() => { /* isolated spring for inner button if needed */ }}
            accessibilityRole="button"
          >
            <MaterialIcons name="add" size={24} color={theme.colors.background} />
          </AnimatedPressable>
        </View>
      </View>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: theme.colors.card,
    borderRadius: 20, // requested rounded corners
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...shadows.medium, // updated soft shadow
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.md,
  },
  imagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  content: {
    flex: 1,
    marginLeft: theme.spacing.md,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  duration: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  }
});
