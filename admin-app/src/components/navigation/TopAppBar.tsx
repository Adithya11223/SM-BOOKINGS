import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../theme';

interface TopAppBarProps {
  title: string;
  onBackPress?: () => void;
  rightActionIcon?: keyof typeof MaterialIcons.glyphMap;
  onRightActionPress?: () => void;
  style?: ViewStyle;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({
  title,
  onBackPress,
  rightActionIcon,
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
  },
  placeholder: {
    width: 40, // Match typical iconButton width to keep title centered
  },
});
