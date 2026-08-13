import React, { useState, useEffect } from 'react';
import { useAppConfig, useBookings, useNotifications } from '../../hooks/';
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
import { AnalyticsService, AdminAnalyticsOverview } from '../../api/AnalyticsService';

type Props = {
  navigation: NativeStackNavigationProp<AdminRootStackParamList, 'AdminMainTabs'>;
};

export default function AdminDashboardScreen({ navigation }: Props) {
  const { businessSettings, isLoading: appConfigLoading, refreshSettings } = useAppConfig();
  const { bookings, isLoading: bookingsLoading, refreshBookings } = useBookings();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [announcementVisible, setAnnouncementVisible] = useState(false);
  const { unreadCount } = useNotifications();

  const [analytics, setAnalytics] = useState<AdminAnalyticsOverview | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState(false);

  const fetchAnalytics = async () => {
    try {
      setAnalyticsLoading(true);
      setAnalyticsError(false);
      const data = await AnalyticsService.getOverview();
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to fetch analytics from backend:', err);
      setAnalyticsError(true);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const initialLoading = appConfigLoading || bookingsLoading || analyticsLoading;

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refreshSettings(), refreshBookings(), fetchAnalytics()]);
    setRefreshing(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning,';
    if (hour < 18) return 'Good Afternoon,';
    return 'Good Evening,';
  };

  const getLocalFormattedDate = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const todayStr = getLocalFormattedDate(new Date());
  const todaysBookings = bookings.filter(b => b.date.startsWith(todayStr));
  const fallbackRevenueToday = todaysBookings
    .filter(b => b.status === 'completed' || b.status === 'confirmed')
    .reduce((sum, b) => sum + b.totalPrice, 0);

  const displayTodayRevenue = analytics ? analytics.todayRevenue : fallbackRevenueToday;
  const displayPendingRequests = analytics ? analytics.pendingBookings : bookings.filter(b => b.status === 'pending').length;
  const displayCompletedToday = analytics ? analytics.completedBookings : todaysBookings.filter(b => b.status === 'completed').length;
  const displayMonthlyRevenue = analytics ? analytics.currentMonthRevenue : bookings.filter(b => b.status === 'completed' || b.status === 'confirmed').reduce((sum, b) => sum + b.totalPrice, 0);
  const displayTotalBookings = analytics ? analytics.totalBookings : bookings.length;
  const displayCancellationRate = analytics ? analytics.cancellationRate : (bookings.length === 0 ? 0 : Math.round((bookings.filter(b => b.status === 'cancelled').length / bookings.length) * 100));
  const displayCompletionRate = analytics ? analytics.completionRate : (bookings.length === 0 ? 0 : Math.round((bookings.filter(b => b.status === 'completed').length / bookings.length) * 100));
  const activeWorkload = analytics ? (analytics.pendingBookings + analytics.confirmedBookings) : bookings.filter(b => b.status === 'pending' || b.status === 'confirmed').length;

  const last7Days = Array.from({length: 7}, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return getLocalFormattedDate(d);
  });

  const revenueData = analytics && analytics.revenueTrend && analytics.revenueTrend.length === 7
    ? analytics.revenueTrend.map(t => t.revenue)
    : last7Days.map(dateStr => {
        const dayBookings = bookings.filter(b => b.date.startsWith(dateStr) && (b.status === 'completed' || b.status === 'confirmed'));
        return dayBookings.reduce((sum, b) => sum + b.totalPrice, 0);
      });

  const maxRevenue = Math.max(...revenueData, 1);
  const chartHeights = revenueData.map(r => (r / maxRevenue) * 100);
  const dayLabels = analytics && analytics.revenueTrend && analytics.revenueTrend.length === 7
    ? analytics.revenueTrend.map(t => t.dayLabel)
    : last7Days.map(d => {
        const date = new Date(d);
        return ['S','M','T','W','T','F','S'][date.getDay()];
      });

  const StatCard = ({ title, value, icon, color, delay = 0, onPress }: any) => (
    <MotiView 
      from={{ opacity: 0, scale: 0.9, translateY: 10 }}
      animate={{ opacity: 1, scale: 1, translateY: 0 }}
      transition={{ type: 'spring', delay }}
      style={[styles.statCard, { padding: 0, overflow: 'hidden' }]}
    >
      <TouchableOpacity 
        onPress={onPress} 
        activeOpacity={0.7} 
        style={{ padding: theme.spacing.lg, flex: 1 }}
      >
        <View style={[styles.statIconBox, { backgroundColor: `${color}15` }]}>
          <MaterialIcons name={icon} size={24} color={color} />
        </View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </TouchableOpacity>
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
                  key={businessSettings.logoUrl}
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
            <View style={styles.businessNameContainer}>
              <Text style={styles.businessName}>
                {businessSettings?.businessName || 'SHREE MATHA BEAUTY PARLOR'}
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.headerRightActions}>
          <TouchableOpacity 
            style={styles.notificationBtn}
            onPress={() => setAnnouncementVisible(true)}
          >
            <MaterialIcons name="campaign" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.notificationBtn, { position: 'relative' }]}
            onPress={() => navigation.navigate('Notifications' as any)}
          >
            <MaterialIcons name="notifications-none" size={24} color={theme.colors.text} />
            {unreadCount > 0 && (
              <View style={styles.unreadDot} />
            )}
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
              value={`₹${Number(displayTodayRevenue).toFixed(2)}`} 
              icon="attach-money" 
              color={theme.colors.success} 
              delay={0}
              onPress={() => navigation.navigate('BookingHistory', { initialStatus: 'completed', initialFromDate: todayStr, initialToDate: todayStr })}
            />
            <StatCard 
              title="Completion Rate" 
              value={`${displayCompletionRate}%`} 
              icon="check-circle-outline" 
              color={theme.colors.primary} 
              delay={100}
              onPress={() => navigation.navigate('BookingHistory', { initialStatus: 'completed' })}
            />
            <StatCard 
              title="Pending Requests" 
              value={displayPendingRequests.toString()} 
              icon="pending-actions" 
              color="#FF9800" 
              delay={200}
              onPress={() => navigation.navigate('BookingHistory', { initialStatus: 'pending' })}
            />
            <StatCard 
              title="Completed Bookings" 
              value={displayCompletedToday.toString()} 
              icon="check-circle" 
              color={theme.colors.success} 
              delay={300}
              onPress={() => navigation.navigate('BookingHistory', { initialStatus: 'completed' })}
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
              value={`₹${Number(displayMonthlyRevenue).toFixed(2)}`} 
              icon="account-balance-wallet" 
              color={theme.colors.success} 
              delay={0}
              onPress={() => navigation.navigate('BookingHistory', { initialStatus: 'completed' })}
            />
            <StatCard 
              title="Total Bookings" 
              value={displayTotalBookings.toString()} 
              icon="library-books" 
              color={theme.colors.primary} 
              delay={100}
              onPress={() => navigation.navigate('BookingHistory')}
            />
            <StatCard 
              title="Cancellation Rate" 
              value={`${displayCancellationRate}%`} 
              icon="cancel" 
              color={theme.colors.error} 
              delay={200}
              onPress={() => navigation.navigate('BookingHistory', { initialStatus: 'cancelled' })}
            />
            <StatCard 
              title="Active Workload" 
              value={activeWorkload.toString()} 
              icon="work" 
              color="#FF9800" 
              delay={300}
              onPress={() => navigation.navigate('BookingHistory', { initialStatus: 'active' })}
            />
          </View>
        )}

        {/* Customer Metrics Section */}
        {analytics && (
          <>
            <Text style={styles.sectionTitle}>Customer Insights</Text>
            <View style={styles.statsGrid}>
              <StatCard 
                title="Total Customers" 
                value={analytics.totalCustomers.toString()} 
                icon="people" 
                color={theme.colors.primary} 
                delay={0}
              />
              <StatCard 
                title="Repeat Customers" 
                value={analytics.repeatCustomers.toString()} 
                icon="repeat" 
                color={theme.colors.success} 
                delay={100}
              />
            </View>
          </>
        )}

        {/* Popular Services Section */}
        {analytics && analytics.popularServices && analytics.popularServices.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Top Popular Services</Text>
            <View style={styles.popularServicesContainer}>
              {analytics.popularServices.map((service, index) => (
                <View key={service.serviceId || index} style={styles.popularServiceRow}>
                  <View style={styles.popularServiceRank}>
                    <Text style={styles.popularServiceRankText}>#{index + 1}</Text>
                  </View>
                  <View style={styles.popularServiceInfo}>
                    <Text style={styles.popularServiceName} numberOfLines={1}>{service.serviceName}</Text>
                    <Text style={styles.popularServiceSubtext}>{service.bookingCount} bookings</Text>
                  </View>
                  <Text style={styles.popularServiceRevenue}>₹{Number(service.revenueGenerated).toFixed(2)}</Text>
                </View>
              ))}
            </View>
          </>
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
          <Text style={styles.sectionTitle}>Revenue Chart (Last 7 Days)</Text>
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
                <TouchableOpacity 
                  key={i} 
                  style={styles.barContainer}
                  activeOpacity={0.6}
                  onPress={() => navigation.navigate('BookingHistory', { initialStatus: 'completed', initialFromDate: last7Days[i], initialToDate: last7Days[i] })}
                >
                  {h > 0 && (
                    <MotiView 
                      from={{ height: 0 }}
                      animate={{ height: `${h}%` as any }}
                      transition={{ type: 'spring', delay: 500 + (i * 50) }}
                      style={styles.bar} 
                    />
                  )}
                  <Text style={styles.barLabel}>{dayLabels[i]}</Text>
                </TouchableOpacity>
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
    marginRight: theme.spacing.sm,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  notificationBtn: {
    padding: 7,
    backgroundColor: theme.colors.surface,
    borderRadius: 50,
  },
  greeting: {
    fontSize: theme.typography.bodySmall.fontSize,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  businessRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: `${theme.colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    overflow: 'hidden',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  businessNameContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  businessName: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.colors.text,
    lineHeight: 18,
    letterSpacing: 0.3,
  },
  unreadDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#FF3B30',
    borderWidth: 1.5,
    borderColor: theme.colors.background,
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
  },
  popularServicesContainer: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    ...shadows.medium,
  },
  popularServiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: `${theme.colors.border}50`,
  },
  popularServiceRank: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: `${theme.colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.sm,
  },
  popularServiceRankText: {
    fontSize: theme.typography.caption.fontSize,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  popularServiceInfo: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  popularServiceName: {
    fontSize: theme.typography.bodySmall.fontSize,
    fontWeight: '600',
    color: theme.colors.text,
  },
  popularServiceSubtext: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.textSecondary,
  },
  popularServiceRevenue: {
    fontSize: theme.typography.bodySmall.fontSize,
    fontWeight: '700',
    color: theme.colors.success,
  },
});

