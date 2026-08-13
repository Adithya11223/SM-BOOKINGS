import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../theme';

export interface TopBarAction {
  icon: keyof typeof MaterialIcons.glyphMap;
  onPress: () => void;
  color?: string;
}

interface TopAppBarProps {
  title: string;
  onBackPress?: () => void;
  rightActionIcon?: keyof typeof MaterialIcons.glyphMap;
  onRightActionPress?: () => void;
  rightActions?: TopBarAction[];
  unreadCount?: number;
  style?: ViewStyle;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({
  title,
  onBackPress,
  rightActionIcon,
  onRightActionPress,
  rightActions,
  unreadCount,
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

      {rightActions && rightActions.length > 0 ? (
        <View style={styles.actionsRow}>
          {rightActions.map((action, idx) => (
            <TouchableOpacity key={idx} style={styles.iconButton} onPress={action.onPress}>
              <MaterialIcons name={action.icon} size={24} color={action.color || theme.colors.text} />
            </TouchableOpacity>
          ))}
        </View>
      ) : rightActionIcon && onRightActionPress ? (
        <TouchableOpacity style={[styles.iconButton, { position: 'relative' }]} onPress={onRightActionPress}>
          <MaterialIcons name={rightActionIcon} size={24} color={theme.colors.text} />
          {unreadCount && unreadCount > 0 ? (
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
            </View>
          ) : null}
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
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.round,
  },
  placeholder: {
    width: 40,
  },
  badgeContainer: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
});
