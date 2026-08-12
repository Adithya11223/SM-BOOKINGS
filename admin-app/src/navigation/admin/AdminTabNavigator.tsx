import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AdminTabParamList } from './AdminTypes';
import { BottomNavigation } from '../../components/navigation/BottomNavigation';
import { useBookings } from '../../hooks';

// Screens
import AdminDashboardScreen from '../../screens/admin/AdminDashboardScreen';
import AdminBookingsScreen from '../../screens/admin/AdminBookingsScreen';
import AdminServicesScreen from '../../screens/admin/AdminServicesScreen';
import BusinessSettingsScreen from '../../screens/admin/BusinessSettingsScreen';

const Tab = createBottomTabNavigator<AdminTabParamList>();

export const AdminTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props) => {
        const currentRouteName = props.state.routes[props.state.index].name;
        
        const getTabName = (route: string) => {
          if (route === 'AdminDashboard') return 'dashboard';
          if (route === 'AdminBookings') return 'bookings';
          if (route === 'AdminServices') return 'services';
          if (route === 'BusinessSettings') return 'settings';
          return 'dashboard';
        };

        const handleTabPress = (tabName: string) => {
          if (tabName === 'dashboard') props.navigation.navigate('AdminDashboard');
          if (tabName === 'bookings') props.navigation.navigate('AdminBookings');
          if (tabName === 'services') props.navigation.navigate('AdminServices');
          if (tabName === 'settings') props.navigation.navigate('BusinessSettings');
        };

        const { bookings } = useBookings();
        const unviewedCount = bookings.filter(b => b.status === 'pending' && !b.adminViewed).length;

        return (
          <BottomNavigation
            activeTab={getTabName(currentRouteName)}
            onTabPress={handleTabPress}
            tabs={[
              { name: 'dashboard', icon: 'dashboard', label: 'Dashboard' },
              { name: 'bookings', icon: 'event-note', label: 'Bookings', badgeCount: unviewedCount },
              { name: 'services', icon: 'spa', label: 'Services' },
              { name: 'settings', icon: 'settings', label: 'Settings' },
            ]}
          />
        );
      }}
    >
      <Tab.Screen name="AdminDashboard" component={AdminDashboardScreen} />
      <Tab.Screen name="AdminBookings" component={AdminBookingsScreen} />
      <Tab.Screen name="AdminServices" component={AdminServicesScreen} />
      <Tab.Screen name="BusinessSettings" component={BusinessSettingsScreen} />
    </Tab.Navigator>
  );
};
