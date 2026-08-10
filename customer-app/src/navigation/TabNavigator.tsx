import React from 'react';
import { createBottomTabNavigator as createTabs } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from './types';
import { BottomNavigation } from '../components/navigation/BottomNavigation';

// Screens
import HomeScreen from '../screens/HomeScreen';
import MyBookingsScreen from '../screens/MyBookingsScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createTabs<MainTabParamList>();

export const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props) => {
        // Map react-navigation props to our custom BottomNavigation component
        const currentRouteName = props.state.routes[props.state.index].name;
        
        // Map our route names to the tab names expected by our component
        const getTabName = (route: string) => {
          if (route === 'Home') return 'home';
          if (route === 'MyBookings') return 'bookings';
          if (route === 'Profile') return 'profile';
          return 'home';
        };

        const handleTabPress = (tabName: string) => {
          if (tabName === 'home') props.navigation.navigate('Home');
          if (tabName === 'bookings') props.navigation.navigate('MyBookings');
          if (tabName === 'profile') props.navigation.navigate('Profile');
        };

        return (
          <BottomNavigation
            activeTab={getTabName(currentRouteName)}
            onTabPress={handleTabPress}
            tabs={[
              { name: 'home', icon: 'home', label: 'Home' },
              { name: 'bookings', icon: 'calendar-today', label: 'Bookings' },
              { name: 'profile', icon: 'person', label: 'Profile' },
            ]}
          />
        );
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="MyBookings" component={MyBookingsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};
