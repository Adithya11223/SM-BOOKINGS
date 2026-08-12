import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../theme';

interface TopAppBarProps {
  title: string;
  onBackPress?: () => void;
  rightActionIcon?: keyof typeof MaterialIcons.glyphMap;
  rightActionBadgeCount?: number;
  onRightActionPress?: () => void;
  style?: ViewStyle;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({
  title,
  onBackPress,
  rightActionIcon,
  rightActionBadgeCount = 0,
  onRightActionPress,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      {onBackPress ? (
        <TouchableOpacity style={styles.iconButton} onPress={onBackPress}>
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      ) : (
        <View style={styles.placeholder} />
      )}

      <Text style={styles.title} numberOfLines={1}>{title}</Text>

      {rightActionIcon && onRightActionPress ? (
        <TouchableOpacity style={styles.iconButton} onPress={onRightActionPress}>
          <MaterialIcons name={rightActionIcon} size={24} color={theme.colors.text} />
          {rightActionBadgeCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {rightActionBadgeCount > 99 ? '99+' : rightActionBadgeCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      ) : (
        <View style={styles.placeholder} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    paddingHorizontal: theme.spacing.sm,
    backgroundColor: theme.colors.background,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: theme.typography.h3.fontSize,
    fontWeight: theme.typography.h3.fontWeight,
    color: theme.colors.text,
  },
  iconButton: {
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.round,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: theme.colors.error || '#F44336',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: theme.colors.background,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40, // Match typical iconButton width to keep title centered
  },
});
