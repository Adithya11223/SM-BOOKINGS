import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/axios';

export default function LoginScreen() {
  const { isLoaded, signIn } = useAuth();
  const navigation = useNavigation<any>();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!isLoaded) return;
    setLoading(true);
    setError('');

    const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
    const phoneDigits = (cleanPhone.length === 12 && cleanPhone.startsWith('91')) ? cleanPhone.substring(2) : cleanPhone;
    const formattedPhoneNumber = `+91${phoneDigits}`;

    try {
      const response = await apiClient.post('/auth/customer/login', {
        phoneNumber: formattedPhoneNumber,
        password: password,
      });

      if (response.data && response.data.success && response.data.data) {
        const { token, id, name, phoneNumber: phone } = response.data.data;
        await signIn(token, id, name, phone || formattedPhoneNumber);
      } else {
        setError('Invalid response from server.');
      }
    } catch (err: any) {
      console.error('Customer Login Error:', err);
      const detail = err.response?.data?.message || err.message || 'Invalid phone number or password.';
      setError(detail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.headerContainer}>
          <Image source={require('../../../assets/logo.png')} style={styles.logo} resizeMode="contain" defaultSource={require('../../../assets/icon.png')} />
          <Text style={styles.shopTitle}>SHREE MATHA BEAUTY PARLOR</Text>
          <Text style={styles.title}>Welcome Back</Text>
        </View>
        <Text style={styles.subtitle}>Login to your account to book an appointment</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.countryCode}>+91</Text>
          <TextInput
            style={styles.input}
            placeholder="Phone Number (e.g. 1234567890)"
            keyboardType="phone-pad"
            value={phoneNumber}
            onChangeText={(text) => setPhoneNumber(text.replace(/[^0-9]/g, ''))}
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity 
          style={styles.forgotPasswordButton} 
          onPress={() => navigation.navigate('ForgotPassword', { phoneNumber })}
        >
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, (!phoneNumber || !password) && styles.buttonDisabled]} 
          onPress={handleLogin}
          disabled={!phoneNumber || !password || loading}
        >
          {loading ? (
            <ActivityIndicator color={theme.colors.background} />
          ) : (
            <Text style={styles.buttonText}>Login</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.linkButton} 
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.linkText}>Don't have an account? Sign Up</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.linkButton, { marginTop: 12 }]} 
          onPress={() => signIn('guest-token', 'guest-id', 'Guest', '')}
        >
          <Text style={[styles.linkText, { color: theme.colors.textSecondary }]}>Continue as Guest →</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    padding: theme.spacing.xl,
    justifyContent: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: theme.spacing.md,
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
    fontSize: theme.typography.h2.fontSize,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xxxl,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.xl,
    backgroundColor: theme.colors.card,
  },
  countryCode: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
    marginRight: 4,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
  },
  button: {
    backgroundColor: theme.colors.primary,
    height: 50,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: theme.colors.background,
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600',
  },
  errorText: {
    color: theme.colors.error,
    marginBottom: theme.spacing.md,
    fontSize: theme.typography.caption.fontSize,
  },
  linkButton: {
    marginTop: theme.spacing.xl,
    alignItems: 'center',
  },
  linkText: {
    color: theme.colors.primary,
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600',
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: theme.spacing.xl,
  },
  forgotPasswordText: {
    color: theme.colors.primary,
    fontSize: theme.typography.caption.fontSize,
    fontWeight: '500',
  }
});
