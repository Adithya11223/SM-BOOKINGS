import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput, StyleSheet, Animated, TextInputProps, TouchableWithoutFeedback } from 'react-native';
import { theme } from '../../theme';

interface FloatingInputProps extends TextInputProps {
  label: string;
  containerStyle?: any;
}

export const FloatingInput = ({ label, value, containerStyle, ...props }: FloatingInputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const animatedValue = useRef(new Animated.Value(value ? 1 : 0)).current;
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: isFocused || value ? 1 : 0,
      duration: 150,
      useNativeDriver: false, // color/fontSize interpolation doesn't support native driver well in some versions, but we can do transform and opacity. For translateY it's fine.
    }).start();
  }, [isFocused, value]);

  const labelStyle = {
    top: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [18, 4],
    }),
    fontSize: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 12],
    }),
    color: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [theme.colors.textSecondary, theme.colors.primary],
    }),
  };

  return (
    <TouchableWithoutFeedback onPress={() => inputRef.current?.focus()}>
      <View style={[
        styles.container, 
        props.multiline && { height: 'auto', minHeight: 64, paddingTop: 24, paddingBottom: 10 },
        isFocused && styles.focused,
        containerStyle
      ]}>
        <Animated.Text style={[styles.label, labelStyle]}>
          {label}
        </Animated.Text>
        <TextInput
          ref={inputRef}
          style={[styles.input, props.multiline && { height: 'auto', minHeight: 30, textAlignVertical: 'top' }, props.style]}
          value={value}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholderTextColor="transparent"
          {...props}
        />
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    height: 56,
    marginBottom: theme.spacing.md,
    position: 'relative',
    justifyContent: 'flex-end',
    paddingBottom: 6,
  },
  focused: {
    borderColor: theme.colors.primary,
    backgroundColor: `${theme.colors.primary}05`,
  },
  label: {
    position: 'absolute',
    left: theme.spacing.md,
    fontWeight: '500',
  },
  input: {
    height: 30,
    fontSize: 16,
    color: theme.colors.text,
    padding: 0,
    margin: 0,
  }
});
