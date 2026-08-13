import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme, shadows } from '../../theme';

export type SortOption = 'date-desc' | 'date-asc' | 'price-desc' | 'price-asc';

interface SortModalProps {
  visible: boolean;
  onClose: () => void;
  selectedOption: SortOption;
  onSelectOption: (option: SortOption) => void;
}

const SORT_OPTIONS: { id: SortOption; label: string; description: string; icon: keyof typeof MaterialIcons.glyphMap }[] = [
  {
    id: 'date-desc',
    label: 'Date: Newest First',
    description: 'Show most recent bookings at the top',
    icon: 'calendar-today',
  },
  {
    id: 'date-asc',
    label: 'Date: Oldest First',
    description: 'Show earliest bookings at the top',
    icon: 'history',
  },
  {
    id: 'price-desc',
    label: 'Price: High to Low',
    description: 'Show highest amount bookings first',
    icon: 'trending-down',
  },
  {
    id: 'price-asc',
    label: 'Price: Low to High',
    description: 'Show lowest amount bookings first',
    icon: 'trending-up',
  },
];

export const SortModal: React.FC<SortModalProps> = ({
  visible,
  onClose,
  selectedOption,
  onSelectOption,
}) => {
  const handleSelect = (option: SortOption) => {
    onSelectOption(option);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.sheetContainer}>
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.headerTitleContainer}>
                  <MaterialIcons name="sort" size={22} color={theme.colors.primary} />
                  <Text style={styles.title}>Sort Bookings</Text>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <MaterialIcons name="close" size={20} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <Text style={styles.subtitle}>Select your preferred sorting order</Text>

              {/* Options */}
              <View style={styles.optionsList}>
                {SORT_OPTIONS.map((option) => {
                  const isSelected = selectedOption === option.id;
                  return (
                    <TouchableOpacity
                      key={option.id}
                      style={[
                        styles.optionCard,
                        isSelected && styles.optionCardSelected,
                      ]}
                      onPress={() => handleSelect(option.id)}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.iconContainer, isSelected && styles.iconContainerSelected]}>
                        <MaterialIcons
                          name={option.icon}
                          size={20}
                          color={isSelected ? theme.colors.primary : theme.colors.textSecondary}
                        />
                      </View>

                      <View style={styles.optionTextContainer}>
                        <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                          {option.label}
                        </Text>
                        <Text style={styles.optionDescription}>{option.description}</Text>
                      </View>

                      <MaterialIcons
                        name={isSelected ? 'radio-button-checked' : 'radio-button-unchecked'}
                        size={22}
                        color={isSelected ? theme.colors.primary : theme.colors.border}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: theme.colors.card,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xl + 10,
    ...shadows.medium,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: '700',
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  closeButton: {
    padding: 6,
    borderRadius: theme.borderRadius.round,
    backgroundColor: theme.colors.background,
  },
  optionsList: {
    gap: theme.spacing.sm,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.background,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
  },
  optionCardSelected: {
    backgroundColor: `${theme.colors.primary}0D`,
    borderColor: theme.colors.primary,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  iconContainerSelected: {
    backgroundColor: `${theme.colors.primary}1A`,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionLabel: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  optionLabelSelected: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  optionDescription: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.textSecondary,
  },
});
