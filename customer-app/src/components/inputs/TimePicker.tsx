import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, ViewStyle } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../theme';

interface TimePickerProps {
  time: Date;
  onChange: (time: Date) => void;
  label?: string;
  style?: ViewStyle;
}

export const TimePicker: React.FC<TimePickerProps> = ({
  time,
  onChange,
  label = 'Select Time',
  style,
}) => {
  const [show, setShow] = useState(false);

  const handleTimeChange = (event: DateTimePickerEvent, selectedTime?: Date) => {
    setShow(Platform.OS === 'ios');
    if (selectedTime) {
      onChange(selectedTime);
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
        <Text style={styles.timeText}>
          {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
        </Text>
        <MaterialIcons name="schedule" size={24} color={theme.colors.primary} />
      </TouchableOpacity>

      {show && (
        <DateTimePicker
          testID="timePicker"
          value={time}
          mode="time"
          is24Hour={false} // True for 24h format, false for AM/PM
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleTimeChange}
          themeVariant="light"
        />
      )}
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
  timeText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
  },
});
