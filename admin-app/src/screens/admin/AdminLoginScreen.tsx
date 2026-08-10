import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, Image } from 'react-native';
import { FloatingInput } from '../../components/inputs/FloatingInput';
import { Button } from '../../components/buttons/Button';
import { theme } from '../../theme';
import { useAuth } from '../../hooks/useAuth';
import { useAppConfig } from '../../hooks/useAppConfig';
import { MaterialIcons } from '@expo/vector-icons';

export default function AdminLoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading } = useAuth();
  const { setAppMode } = useAppConfig();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }
    const success = await login(email, password);
    if (!success) {
      // AuthContext handles alert
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => setAppMode('customer')}
      >
        <MaterialIcons name="arrow-back" size={24} color={theme.colors.text} />
        <Text style={styles.backText}>Back to Customer</Text>
      </TouchableOpacity>

      <View style={styles.formContainer}>
        <View style={styles.headerContainer}>
          <Image source={require('../../../assets/logo.png')} style={styles.logo} resizeMode="contain" defaultSource={require('../../../assets/icon.png')} />
          <Text style={styles.shopTitle}>SHREE MATHA BEAUTY PARLOR</Text>
          <Text style={styles.title}>Admin Access</Text>
        </View>
        <Text style={styles.subtitle}>Sign in to manage the salon</Text>
        
        <FloatingInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <View style={{ height: 16 }} />
        <FloatingInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <View style={{ height: 32 }} />
        
        <Button 
          title="Login" 
          onPress={handleLogin} 
          isLoading={isLoading}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  backText: {
    marginLeft: 8,
    fontSize: 16,
    color: theme.colors.text,
    fontFamily: theme.typography.fonts?.medium || 'System',
  },
  formContainer: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: theme.spacing.lg,
  },
  shopTitle: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: '800',
    color: theme.colors.primary,
    marginTop: theme.spacing.md,
    marginBottom: 4,
    textTransform: 'uppercase',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: theme.typography.h3.fontSize,
    fontFamily: theme.typography.fonts?.bold || 'System',
    color: theme.colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: theme.typography.fonts?.regular || 'System',
    color: theme.colors.textSecondary,
    marginBottom: 40,
    textAlign: 'center',
  },
});
