import React from 'react';
import { useAppConfig } from '../hooks/';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../theme';
import { TopAppBar } from '../components/navigation/TopAppBar';

export default function ProfileScreen() {
  const { businessSettings } = useAppConfig();
  const { user, signOut } = useAuth();
  
  console.log('ProfileScreen businessSettings:', JSON.stringify(businessSettings, null, 2));
  
  const [address, setAddress] = React.useState('');
  const [isEditingAddress, setIsEditingAddress] = React.useState(false);

  React.useEffect(() => {
    AsyncStorage.getItem('customer_address').then((savedAddress) => {
      if (savedAddress) setAddress(savedAddress);
    });
  }, []);

  const saveAddress = async () => {
    await AsyncStorage.setItem('customer_address', address);
    setIsEditingAddress(false);
  };

  const ActionRow = ({ icon, title, subtitle, onPress, rightIcon }: any) => (
    <TouchableOpacity style={styles.actionRow} onPress={onPress} disabled={!onPress}>
      <View style={styles.actionIcon}>
        <MaterialIcons name={icon} size={24} color={theme.colors.primary} />
      </View>
      <View style={styles.actionContent}>
        <Text style={styles.actionTitle}>{title}</Text>
        {subtitle && <Text style={styles.actionSubtitle}>{subtitle}</Text>}
      </View>
      {rightIcon && <MaterialIcons name={rightIcon} size={24} color={theme.colors.textSecondary} />}
    </TouchableOpacity>
  );

  const openLink = (url: string) => Linking.openURL(url);
  return (
    <SafeAreaView style={styles.container}>
      <TopAppBar title="Profile" />
      
      <ScrollView contentContainerStyle={styles.content}>
        
        <View style={styles.profileHeader}>
          <Text style={styles.userName}>{user?.name || 'Customer'}</Text>
          <Text style={styles.userPhone}>{user?.phone || 'Not available'}</Text>
        </View>

        <Text style={styles.sectionTitle}>My Details</Text>
        <View style={styles.card}>
          <ActionRow icon="person" title="Full Name" subtitle={user?.name || 'Customer'} />
          <View style={styles.divider} />
          <ActionRow icon="phone" title="Mobile Number" subtitle={user?.phone || 'Not available'} />
          <View style={styles.divider} />
          
          <View style={styles.actionRow}>
            <View style={styles.actionIcon}>
              <MaterialIcons name="location-on" size={24} color={theme.colors.primary} />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Address</Text>
              {isEditingAddress ? (
                <TextInput
                  style={styles.addressInput}
                  value={address}
                  onChangeText={setAddress}
                  placeholder="Enter your address"
                  autoFocus
                  onSubmitEditing={saveAddress}
                  onBlur={saveAddress}
                />
              ) : (
                <Text style={styles.actionSubtitle}>{address || 'Tap to add address'}</Text>
              )}
            </View>
            <TouchableOpacity onPress={() => isEditingAddress ? saveAddress() : setIsEditingAddress(true)}>
              <MaterialIcons name={isEditingAddress ? "check" : "edit"} size={24} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.sectionTitle}>About Us</Text>
        <View style={styles.card}>
          {[
            {
              condition: businessSettings?.ownerName,
              icon: "face",
              title: businessSettings?.ownerName,
              subtitle: businessSettings?.ownerTitle || "Salon Owner",
            },
            {
              condition: businessSettings?.address,
              icon: "location-city",
              title: "Location",
              subtitle: businessSettings?.address,
            },
            {
              condition: businessSettings?.instagram,
              icon: "photo-camera",
              title: "Instagram",
              subtitle: businessSettings?.instagram?.includes('@') ? businessSettings.instagram : `@${businessSettings?.instagram?.replace('https://instagram.com/', '').replace('/', '')}`,
              onPress: () => openLink(businessSettings?.instagram?.startsWith('http') ? businessSettings.instagram : `https://instagram.com/${businessSettings?.instagram}`)
            },
            {
              condition: businessSettings?.youtube,
              icon: "play-circle-filled",
              title: "YouTube",
              subtitle: businessSettings?.youtube?.includes('@') ? businessSettings.youtube : `@${businessSettings?.youtube?.replace('https://youtube.com/@', '')}`,
              onPress: () => openLink(businessSettings?.youtube?.startsWith('http') ? businessSettings.youtube : `https://youtube.com/@${businessSettings?.youtube?.replace('@', '')}`)
            },
            {
              condition: businessSettings?.threads,
              icon: "chat-bubble",
              title: "Threads",
              subtitle: businessSettings?.threads?.includes('@') ? businessSettings.threads : `@${businessSettings?.threads?.replace('https://threads.net/@', '')}`,
              onPress: () => openLink(businessSettings?.threads?.startsWith('http') ? businessSettings.threads : `https://threads.net/@${businessSettings?.threads?.replace('@', '')}`)
            },
            {
              condition: businessSettings?.whatsappNumber,
              icon: "message",
              title: "WhatsApp / Contact",
              subtitle: businessSettings?.whatsappNumber,
              onPress: () => openLink(`whatsapp://send?phone=${businessSettings?.whatsappNumber?.replace(/[^0-9]/g, '')}`)
            }
          ].filter(item => Boolean(item.condition)).map((link, index, arr) => (
            <React.Fragment key={index}>
              <ActionRow 
                icon={link.icon} 
                title={link.title} 
                subtitle={link.subtitle} 
                onPress={link.onPress}
                rightIcon={link.onPress ? "open-in-new" : undefined}
              />
              {index < arr.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))}
        </View>
        
        <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
          <MaterialIcons name="logout" size={24} color={theme.colors.error} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>App Version 1.0.0</Text>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.lg,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: theme.colors.background,
  },
  userName: {
    fontSize: theme.typography.h2.fontSize,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
  },
  userPhone: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textSecondary,
  },
  sectionTitle: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.xl,
    overflow: 'hidden',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${theme.colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '500',
    color: theme.colors.text,
  },
  actionSubtitle: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginLeft: 72, // Aligns with text
  },
  adminToggle: {
    alignItems: 'center',
    marginVertical: theme.spacing.xl,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.primary + '15',
    borderRadius: theme.borderRadius.md,
  },
  adminToggleText: {
    color: theme.colors.primary,
    fontWeight: '600',
    fontSize: theme.typography.body.fontSize,
  },
  version: {
    textAlign: 'center',
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xxxl,
  },
  addressInput: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.text,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.primary,
    paddingVertical: 2,
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${theme.colors.error}15`,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.xl,
  },
  logoutText: {
    color: theme.colors.error,
    fontWeight: '600',
    fontSize: theme.typography.body.fontSize,
    marginLeft: theme.spacing.sm,
  }
});
