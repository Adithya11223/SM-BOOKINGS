import React, { useEffect, useRef } from 'react';
import { useAppConfig } from '../hooks/';
import { View, Text, StyleSheet, Image } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { MaterialIcons } from '@expo/vector-icons';
import { MotiView, MotiText } from 'moti';
import { theme } from '../theme';
import * as Notifications from 'expo-notifications';

type SplashScreenProps = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export default function SplashScreen({ navigation }: SplashScreenProps) {
  const { businessSettings } = useAppConfig();

  useEffect(() => {
    // Proactively request notification permissions on first launch
    Notifications.requestPermissionsAsync().catch(() => {});

    const timer = setTimeout(() => {
      navigation.replace('MainTabs', { screen: 'Home' });
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <MotiView
          from={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 10, mass: 0.9, stiffness: 100 }}
        >
          <Image 
            source={require('../../assets/logo.png')} 
            style={styles.logoImage} 
            resizeMode="contain" 
          />
        </MotiView>
        <MotiText 
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 800, delay: 300 }}
          style={styles.title}
        >
          {businessSettings?.businessName || 'Shree Matha'}
        </MotiText>
        <MotiText 
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', duration: 1000, delay: 600 }}
          style={styles.tagline}
        >
          {businessSettings?.tagline || 'Your beauty, our passion'}
        </MotiText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logoImage: {
    width: 150,
    height: 150,
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontSize: theme.typography.h1.fontSize,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  tagline: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textSecondary,
    letterSpacing: 0.5,
  },
});
