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
  style?: ViewStyle;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({
  title,
  onBackPress,
  rightActionIcon,
  onRightActionPress,
  rightActions,
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
        <TouchableOpacity style={styles.iconButton} onPress={onRightActionPress}>
          <MaterialIcons name={rightActionIcon} size={24} color={theme.colors.text} />
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
});
