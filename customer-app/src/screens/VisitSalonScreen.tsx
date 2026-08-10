import React, { useState, useEffect, useCallback } from 'react';
import { useServices, useCart } from '../hooks/';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { MotiView } from 'moti';
import { theme } from '../theme';
import { TopAppBar } from '../components/navigation/TopAppBar';
import { ServiceCard } from '../components/cards/ServiceCard';
import { SearchBar } from '../components/inputs/SearchBar';
import { Button } from '../components/buttons/Button';
import { EmptyState } from '../components/states/EmptyState';
import { ServiceSkeleton } from '../components/states/SkeletonLoader';

type Props = NativeStackScreenProps<RootStackParamList, 'VisitSalon'>;

export default function VisitSalonScreen({ navigation }: Props) {
  const { allServices, refreshServices } = useServices();
  const { addToCart, cartItemCount, cartTotal } = useCart();
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Filter only salon services that are visible
  const salonServices = allServices.filter(s => s.type === 'salon' && s.visible);
  
  const filteredServices = salonServices.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshServices();
    setRefreshing(false);
  }, [refreshServices]);

  return (
    <SafeAreaView style={styles.container}>
      <TopAppBar title="Salon Services" onBackPress={() => navigation.goBack()} />
      
      <View style={styles.header}>
        <SearchBar 
          value={search} 
          onChangeText={setSearch} 
          placeholder="Search haircuts, color, styling..." 
        />
      </View>

      <ScrollView 
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
        }
      >
        {initialLoading || refreshing ? (
          <>
            <ServiceSkeleton />
            <ServiceSkeleton />
            <ServiceSkeleton />
            <ServiceSkeleton />
          </>
        ) : filteredServices.length === 0 ? (
          <EmptyState 
            icon="search-off"
            title="No Services Found"
            description="We couldn't find any services matching your search."
          />
        ) : (
          filteredServices.map((item, index) => (
            <MotiView
              key={item.id}
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'spring', delay: index * 100 }}
            >
              <ServiceCard
                title={item.name}
                duration={item.duration}
                price={item.price}
                imageUrl={item.imageUrl}
                onPress={() => navigation.navigate('ServiceDetails', { service: item })}
                onActionPress={() => addToCart(item)}
              />
            </MotiView>
          ))
        )}
      </ScrollView>

      {cartItemCount > 0 && (
        <MotiView 
          from={{ opacity: 0, translateY: 50 }} 
          animate={{ opacity: 1, translateY: 0 }} 
          style={styles.cartFloatingContainer}
        >
          <Button 
            title={`View Cart (${cartItemCount} items)`}
            onPress={() => navigation.navigate('Cart')}
            style={styles.cartButton}
          />
        </MotiView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  listContent: {
    padding: theme.spacing.md,
    paddingBottom: 100, // Space for floating cart button
  },
  cartFloatingContainer: {
    position: 'absolute',
    bottom: theme.spacing.xl,
    left: theme.spacing.lg,
    right: theme.spacing.lg,
  },
  cartButton: {
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  }
});
