import React, { useState } from 'react';
import { useAppConfig, useNotifications } from '../hooks/';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, RefreshControl, Platform, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../navigation/types';
import { useAuth } from '../context/AuthContext';
import { theme, shadows } from '../theme';
import { SearchBar } from '../components/inputs/SearchBar';
import { MotiView } from 'moti';

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'MainTabs'>;
};

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const { businessSettings, refreshSettings } = useAppConfig();
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Dynamic greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning,';
    if (hour < 18) return 'Good Afternoon,';
    return 'Good Evening,';
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshSettings();
    setRefreshing(false);
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return '';
    // timeString comes as "09:00:00"
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    // hide minutes if it's 00 for a cleaner look
    if (minutes === '00') {
      return `${formattedHour} ${ampm}`;
    }
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
        }
      >
        
        <MotiView 
          from={{ opacity: 0, translateY: -10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400 }}
          style={styles.header}
        >
          <View style={styles.headerLeft}>
            <View style={styles.logoCircle}>
              {businessSettings?.logoUrl ? (
                <Image 
                  source={{ uri: businessSettings.logoUrl }}
                  style={styles.logoImage}
                  resizeMode="cover"
                />
              ) : (
                <Image 
                  source={require('../../assets/logo.png')}
                  style={styles.logoImage}
                  resizeMode="cover"
                  defaultSource={require('../../assets/icon.png')} // fallback if logo.png doesn't exist
                />
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.shopName} numberOfLines={2}>SHREE MATHA BEAUTY PARLOR</Text>
              <Text style={styles.greeting} numberOfLines={1}>{getGreeting()} <Text style={styles.userName}>{user?.name || 'Guest'}</Text></Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.notificationButton} 
            onPress={() => navigation.navigate('Notifications' as any)}
          >
            <MaterialIcons name="notifications-none" size={28} color={theme.colors.text} />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </MotiView>
        
        {businessSettings && (
          <MotiView 
            from={{ opacity: 0, translateY: -5 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 100 }}
            style={styles.operatingHoursCard}
          >
            <MaterialIcons name="storefront" size={18} color={theme.colors.primary} style={{ marginRight: 6 }} />
            <View style={{ flexShrink: 1 }}>
              <Text style={styles.operatingHoursText}>
                Shop: {businessSettings.isShopOpen ? 'Open' : 'Closed'} • Services: {businessSettings.isServiceOpen ? 'Available' : 'Unavailable'}
              </Text>
              {businessSettings.openingTime && businessSettings.closingTime && (
                <Text style={[styles.operatingHoursText, { fontSize: 10, marginTop: 2, color: theme.colors.textSecondary }]}>
                  {formatTime(businessSettings.openingTime)} - {formatTime(businessSettings.closingTime)}
                </Text>
              )}
            </View>
          </MotiView>
        )}

        <MotiView 
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 150 }}
        >
          <SearchBar 
            value={search} 
            onChangeText={setSearch} 
            placeholder="Search services..." 
          />
        </MotiView>
        
        <MotiView 
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 200, type: 'spring' }}
        >
          <Text style={styles.sectionTitle}>Our Services</Text>

          {/* Card 1 */}
          <TouchableOpacity 
            style={styles.card}
            onPress={() => navigation.navigate('VisitSalon')}
            activeOpacity={0.8}
          >
            <View style={styles.cardImagePlaceholder}>
              <MaterialIcons name="storefront" size={40} color={theme.colors.primary} />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Visit Salon</Text>
              <Text style={styles.cardSubtitle}>Book salon services and visit our shop.</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
        </MotiView>

        <MotiView 
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 300, type: 'spring' }}
        >
          {/* Card 2 */}
          <TouchableOpacity 
            style={styles.card}
            onPress={() => navigation.navigate('HomeMakeup')}
            activeOpacity={0.8}
          >
            <View style={[styles.cardImagePlaceholder, { backgroundColor: `${theme.colors.secondary}30` }]}>
              <MaterialIcons name="directions-car" size={40} color={theme.colors.secondary} />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Home Service</Text>
              <Text style={styles.cardSubtitle}>Book bridal and event makeup at your location.</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={theme.colors.secondary} />
          </TouchableOpacity>
        </MotiView>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  logoCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: `${theme.colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    overflow: 'hidden',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  shopName: {
    fontSize: theme.typography.subtitle.fontSize,
    fontWeight: '800',
    color: theme.colors.primary,
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  greeting: {
    fontSize: theme.typography.bodySmall.fontSize,
    color: theme.colors.textSecondary,
    marginBottom: 2,
    fontWeight: '500',
  },
  userName: {
    fontSize: theme.typography.bodySmall.fontSize,
    fontWeight: '700',
    color: theme.colors.text,
  },
  notificationButton: {
    padding: 8,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 8,
    backgroundColor: theme.colors.error,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: theme.colors.background,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  operatingHoursCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${theme.colors.primary}10`,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  operatingHoursText: {
    color: theme.colors.primary,
    fontSize: theme.typography.caption.fontSize,
    fontWeight: '600',
    flexShrink: 1,
  },
  sectionTitle: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: '700',
    color: theme.colors.text,
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: 20,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    ...shadows.medium,
  },
  cardImagePlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 16,
    backgroundColor: `${theme.colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    flex: 1,
    marginLeft: theme.spacing.md,
    marginRight: theme.spacing.sm,
  },
  cardTitle: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: theme.typography.bodySmall.fontSize,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  }
});
