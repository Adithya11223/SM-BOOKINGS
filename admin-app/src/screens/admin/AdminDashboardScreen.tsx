import React, { useState, useEffect } from 'react';
import { useAppConfig, useBookings } from '../../hooks/';
import { useAuth } from '../../hooks/useAuth';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Platform, StatusBar, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { AdminRootStackParamList } from '../../navigation/admin/AdminTypes';
import { theme, shadows } from '../../theme';
import { SkeletonLoader } from '../../components/states/SkeletonLoader';
import { AnnouncementDialog } from '../../components/overlays/AnnouncementDialog';

type Props = {
  navigation: NativeStackNavigationProp<AdminRootStackParamList, 'AdminMainTabs'>;
};

export default function AdminDashboardScreen({ navigation }: Props) {
  const { businessSettings, isLoading: appConfigLoading, refreshSettings } = useAppConfig();
  const { bookings, isLoading: bookingsLoading, refreshBookings } = useBookings();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [announcementVisible, setAnnouncementVisible] = useState(false);

  const initialLoading = appConfigLoading || bookingsLoading;

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refreshSettings(), refreshBookings()]);
    setRefreshing(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning,';
    if (hour < 18) return 'Good Afternoon,';
    return 'Good Evening,';
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const todaysBookings = bookings.filter(b => b.date.startsWith(todayStr));
  const revenueToday = todaysBookings
    .filter(b => b.status === 'completed' || b.status === 'confirmed')
    .reduce((sum, b) => sum + b.totalPrice, 0);
  const pendingRequests = bookings.filter(b => b.status === 'pending').length;
  const completedToday = todaysBookings.filter(b => b.status === 'completed').length;

  const currentMonthStr = todayStr.substring(0, 7); // e.g., '2023-10'
  const monthlyBookings = bookings.filter(b => b.date.startsWith(currentMonthStr));
  const monthlyRevenue = monthlyBookings
    .filter(b => b.status === 'completed' || b.status === 'confirmed')
    .reduce((sum, b) => sum + b.totalPrice, 0);
  
  const monthlyTotalCount = monthlyBookings.length;
  const monthlyCancelledCount = monthlyBookings.filter(b => b.status === 'cancelled').length;
  const cancellationRate = monthlyTotalCount === 0 ? 0 : Math.round((monthlyCancelledCount / monthlyTotalCount) * 100);
  
  const activeWorkload = bookings.filter(b => b.status === 'pending' || b.status === 'confirmed').length;

  const last7Days = Array.from({length: 7}, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  const revenueData = last7Days.map(dateStr => {
    const dayBookings = bookings.filter(b => b.date.startsWith(dateStr) && (b.status === 'completed' || b.status === 'confirmed'));
    return dayBookings.reduce((sum, b) => sum + b.totalPrice, 0);
  });

  const maxRevenue = Math.max(...revenueData, 1);
  const chartHeights = revenueData.map(r => (r / maxRevenue) * 100);
  const dayLabels = last7Days.map(d => {
    const date = new Date(d);
    return ['S','M','T','W','T','F','S'][date.getDay()];
  });

  const StatCard = ({ title, value, icon, color, delay = 0 }: any) => (
    <MotiView 
      from={{ opacity: 0, scale: 0.9, translateY: 10 }}
      animate={{ opacity: 1, scale: 1, translateY: 0 }}
      transition={{ type: 'spring', delay }}
      style={styles.statCard}
    >
      <View style={[styles.statIconBox, { backgroundColor: `${color}15` }]}>
        <MaterialIcons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </MotiView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <MotiView 
        from={{ opacity: 0, translateY: -20 }}
        animate={{ opacity: 1, translateY: 0 }}
        style={styles.header}
      >
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>{getGreeting()} <Text style={{fontWeight: 'bold', color: theme.colors.text}}>Shalini</Text></Text>
          <View style={styles.businessRow}>
            <View style={styles.logoCircle}>
              {businessSettings?.logoUrl ? (
                <Image 
                  source={{ uri: businessSettings.logoUrl }}
                  style={styles.logoImage}
                  resizeMode="cover"
                />
              ) : (
                <Image 
                  source={require('../../../assets/logo.png')}
                  style={styles.logoImage}
                  resizeMode="cover"
                  defaultSource={require('../../../assets/icon.png')}
                />
              )}
            </View>
            <View style={{ flex: 1, paddingRight: 8 }}>
              <Text style={styles.businessName} numberOfLines={2}>SHREE MATHA BEAUTY PARLOR</Text>
            </View>
          </View>
        </View>
        
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <TouchableOpacity 
            style={styles.notificationBtn}
            onPress={() => setAnnouncementVisible(true)}
          >
            <MaterialIcons name="campaign" size={28} color={theme.colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.notificationBtn}
            onPress={() => navigation.navigate('Notifications' as any)}
          >
            <MaterialIcons name="notifications-none" size={28} color={theme.colors.text} />
            {/* Badge is handled automatically by the system, but we can add a visual dot if needed */}
          </TouchableOpacity>
        </View>
        </MotiView>
        <AnnouncementDialog visible={announcementVisible} onClose={() => setAnnouncementVisible(false)} />

      <ScrollView 
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
        }
      >
        
        {initialLoading ? (
          <View style={styles.statsGrid}>
            <SkeletonLoader width="48%" height={120} radius={20} />
            <SkeletonLoader width="48%" height={120} radius={20} />
            <SkeletonLoader width="48%" height={120} radius={20} />
            <SkeletonLoader width="48%" height={120} radius={20} />
          </View>
        ) : (
          <View style={styles.statsGrid}>
            <StatCard 
              title="Today's Revenue" 
              value={`₹${revenueToday.toFixed(2)}`} 
              icon="attach-money" 
              color={theme.colors.success} 
              delay={0}
            />
            <StatCard 
              title="Today's Bookings" 
              value={todaysBookings.length.toString()} 
              icon="event" 
              color={theme.colors.primary} 
              delay={100}
            />
            <StatCard 
              title="Pending Requests" 
              value={pendingRequests.toString()} 
              icon="pending-actions" 
              color="#FF9800" 
              delay={200}
            />
            <StatCard 
              title="Completed Today" 
              value={completedToday.toString()} 
              icon="check-circle" 
              color={theme.colors.success} 
              delay={300}
            />
          </View>
        )}

        <Text style={styles.sectionTitle}>This Month's Performance</Text>
        {initialLoading ? (
          <View style={styles.statsGrid}>
            {[1, 2, 3, 4].map(i => (
              <View key={i} style={styles.statCard}>
                <SkeletonLoader width={40} height={40} radius={20} />
                <View style={{height: 10}} />
                <SkeletonLoader width={60} height={20} />
                <View style={{height: 5}} />
                <SkeletonLoader width={80} height={14} />
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.statsGrid}>
            <StatCard 
              title="Monthly Revenue" 
              value={`₹${monthlyRevenue.toFixed(2)}`} 
              icon="account-balance-wallet" 
              color={theme.colors.success} 
              delay={0}
            />
            <StatCard 
              title="Total Bookings" 
              value={monthlyTotalCount.toString()} 
              icon="library-books" 
              color={theme.colors.primary} 
              delay={100}
            />
            <StatCard 
              title="Cancellation Rate" 
              value={`${cancellationRate}%`} 
              icon="cancel" 
              color={theme.colors.error} 
              delay={200}
            />
            <StatCard 
              title="Active Workload" 
              value={activeWorkload.toString()} 
              icon="work" 
              color="#FF9800" 
              delay={300}
            />
          </View>
        )}

        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <MotiView 
          from={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ delay: 400 }}
          style={styles.actionsRow}
        >
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('ServiceForm', { service: undefined })}
          >
            <View style={styles.actionIconContainer}>
              <MaterialIcons name="add-circle" size={28} color={theme.colors.primary} />
            </View>
            <Text style={styles.actionText}>Add Service</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('AdminMainTabs', { screen: 'AdminBookings' })}
          >
            <View style={styles.actionIconContainer}>
              <MaterialIcons name="list-alt" size={28} color={theme.colors.primary} />
            </View>
            <Text style={styles.actionText}>View Bookings</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('AdminMainTabs', { screen: 'BusinessSettings' })}
          >
            <View style={styles.actionIconContainer}>
              <MaterialIcons name="settings" size={28} color={theme.colors.primary} />
            </View>
            <Text style={styles.actionText}>Settings</Text>
          </TouchableOpacity>
        </MotiView>

        <View style={styles.headerRow}>
          <Text style={styles.sectionTitle}>Revenue Chart</Text>
          <TouchableOpacity onPress={() => navigation.navigate('BookingHistory')}>
            <Text style={styles.linkText}>View History</Text>
          </TouchableOpacity>
        </View>
        
        {initialLoading ? (
          <SkeletonLoader width="100%" height={200} radius={20} />
        ) : (
          <MotiView 
            from={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 500, type: 'spring' }}
            style={styles.chartCard}
          >
            <View style={styles.dummyChart}>
              {chartHeights.map((h, i) => (
                <View key={i} style={styles.barContainer}>
                  {h > 0 && (
                    <MotiView 
                      from={{ height: 0 }}
                      animate={{ height: `${h}%` as any }}
                      transition={{ type: 'spring', delay: 500 + (i * 50) }}
                      style={styles.bar} 
                    />
                  )}
                  <Text style={styles.barLabel}>{dayLabels[i]}</Text>
                </View>
              ))}
            </View>
          </MotiView>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight! + 10 : 10,
    paddingBottom: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
  headerLeft: {
    flex: 1,
  },
  notificationBtn: {
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: 50,
  },
  greeting: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  businessRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  businessName: {
    fontSize: theme.typography.subtitle.fontSize,
    fontWeight: '800',
    color: theme.colors.text,
  },
  content: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxxl,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: theme.spacing.xl,
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    ...shadows.medium,
  },
  statIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  statValue: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 2,
  },
  statTitle: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.textSecondary,
  },
  sectionTitle: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xl,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
  },
  actionIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
    ...shadows.medium,
  },
  actionText: {
    fontSize: theme.typography.bodySmall.fontSize,
    fontWeight: '500',
    color: theme.colors.text,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  linkText: {
    fontSize: theme.typography.bodySmall.fontSize,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  chartCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    height: 200,
    ...shadows.medium,
  },
  dummyChart: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  barContainer: {
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  bar: {
    width: 24,
    backgroundColor: `${theme.colors.primary}40`,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  barLabel: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    marginTop: 8,
  }
});

