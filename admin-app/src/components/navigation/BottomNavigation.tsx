import React from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { MotiView, MotiText } from 'moti';
import { theme, shadows } from '../../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface TabItem {
  name: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  badgeCount?: number;
}

interface BottomNavigationProps {
  tabs: TabItem[];
  activeTab: string;
  onTabPress: (tabName: string) => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  tabs,
  activeTab,
  onTabPress,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, theme.spacing.md) }]}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.name;
        return (
          <Pressable
            key={tab.name}
            style={styles.tab}
            onPress={() => onTabPress(tab.name)}
            accessibilityRole="button"
          >
            <MotiView 
              animate={{ 
                scale: isActive ? 1.1 : 1,
                translateY: isActive ? -4 : 0,
              }}
              transition={{ type: 'spring', damping: 12, stiffness: 200 }}
              style={[styles.iconContainer, isActive && styles.iconContainerActive]}
            >
              <MaterialIcons
                name={tab.icon}
                size={24}
                color={isActive ? theme.colors.primary : theme.colors.textSecondary}
              />
            </MotiView>
            <MotiText 
              animate={{
                opacity: isActive ? 1 : 0.7,
                scale: isActive ? 1 : 0.9,
              }}
              style={[styles.label, isActive && styles.labelActive]}
            >
              {tab.label}
            </MotiText>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background,
    paddingTop: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    ...shadows.medium, // More pronounced shadow for premium feel
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    padding: 8,
    borderRadius: 20,
    marginBottom: 4,
  },
  iconContainerActive: {
    backgroundColor: `${theme.colors.primary}15`,
  },
  label: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  labelActive: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: theme.colors.error,
    borderRadius: 6,
    width: 12,
    height: 12,
    borderWidth: 2,
    borderColor: theme.colors.background,
  },
});

