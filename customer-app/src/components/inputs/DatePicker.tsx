import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, ViewStyle } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../theme';

interface DatePickerProps {
  date: Date;
  onChange: (date: Date) => void;
  label?: string;
  minimumDate?: Date;
  style?: ViewStyle;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  date,
  onChange,
  label = 'Select Date',
  minimumDate,
  style,
}) => {
  const [show, setShow] = useState(false);

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShow(Platform.OS === 'ios'); // Keep picker open on iOS, close on Android
    if (selectedDate) {
      onChange(selectedDate);
    }
  };

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <TouchableOpacity 
        style={styles.inputContainer} 
        onPress={() => setShow(true)}
        activeOpacity={0.7}
      >
        <Text style={styles.dateText}>
          {date.toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' })}
        </Text>
        <MaterialIcons name="event" size={24} color={theme.colors.primary} />
      </TouchableOpacity>

      {show && (
        <DateTimePicker
          testID="dateTimePicker"
          value={date}
          mode="date"
          is24Hour={true}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          minimumDate={minimumDate}
          themeVariant="light"
        />
      )}
      
      {/* On iOS, we might want a "Done" button for the inline/spinner picker, but keeping it simple for the foundation */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: theme.typography.bodySmall.fontSize,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    height: 48,
  },
  dateText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
  },
});
