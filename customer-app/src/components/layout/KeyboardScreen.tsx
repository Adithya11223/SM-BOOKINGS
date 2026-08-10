import React, { ReactNode } from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

interface Props {
  children: ReactNode;
  contentContainerStyle?: ViewStyle;
}

export const KeyboardScreen = ({ children, contentContainerStyle }: Props) => {
  return (
    <KeyboardAwareScrollView
      enableOnAndroid={true}
      keyboardOpeningTime={0}
      contentContainerStyle={[styles.content, contentContainerStyle]}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
  },
});
