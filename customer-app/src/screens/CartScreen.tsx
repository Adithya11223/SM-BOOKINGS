import React, { useState } from 'react';
import { useCart } from '../hooks/';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { theme, shadows } from '../theme';
import { TopAppBar } from '../components/navigation/TopAppBar';
import { Button } from '../components/buttons/Button';
import { EmptyState } from '../components/states/EmptyState';
import { MaterialIcons } from '@expo/vector-icons';
import { MotiView } from 'moti';

type CartScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Cart'>;
};

export default function CartScreen({ navigation }: CartScreenProps) {
  const { cart, updateQuantity, removeFromCart, cartTotal, cartDuration } = useCart();

  const handleContinue = () => {
    // If the cart has makeup services, we should theoretically go to Event Makeup booking
    // For simplicity, we check if any item is a makeup service
    const hasMakeup = cart.some(item => {
      const type = (item.service as any).type;
      return type === 'event' || type === 'party';
    });
    if (hasMakeup) {
      navigation.navigate('EventMakeupBookingForm');
    } else {
      navigation.navigate('SalonBookingForm');
    }
  };

  if (cart.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <TopAppBar title="Your Cart" onBackPress={() => navigation.goBack()} />
        <EmptyState 
          icon="shopping-cart"
          title="Cart is Empty"
          description="Looks like you haven't added any services yet."
          actionTitle="Browse Services"
          onAction={() => navigation.navigate('MainTabs', { screen: 'Home' })}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <TopAppBar title="Your Cart" onBackPress={() => navigation.goBack()} />
      
      <FlatList
        data={cart}
        keyExtractor={item => item.service.id}
        contentContainerStyle={styles.list}
        renderItem={({ item, index }) => (
          <MotiView 
            from={{ opacity: 0, scale: 0.9, translateX: -20 }}
            animate={{ opacity: 1, scale: 1, translateX: 0 }}
            transition={{ type: 'spring', delay: index * 100 }}
            style={styles.cartItem}
          >
            <View style={styles.itemInfo}>
              <Text style={styles.itemName} numberOfLines={2}>{item.service.name}</Text>
              <Text style={styles.itemPrice}>₹{item.service.price.toFixed(2)}</Text>
            </View>
            
            <View style={styles.quantityControls}>
              <TouchableOpacity 
                style={styles.iconButton}
                onPress={() => updateQuantity(item.service.id, item.quantity - 1)}
              >
                <MaterialIcons name="remove" size={20} color={theme.colors.primary} />
              </TouchableOpacity>
              
              <Text style={styles.quantityText}>{item.quantity}</Text>
              
              <TouchableOpacity 
                style={styles.iconButton}
                onPress={() => updateQuantity(item.service.id, item.quantity + 1)}
              >
                <MaterialIcons name="add" size={20} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={styles.removeButton}
              onPress={() => removeFromCart(item.service.id)}
            >
              <MaterialIcons name="delete-outline" size={24} color={theme.colors.error} />
            </TouchableOpacity>
          </MotiView>
        )}
      />

      <View style={styles.summaryContainer}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Estimated Duration</Text>
          <Text style={styles.summaryValue}>{cartDuration} mins</Text>
        </View>
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>₹{cartTotal.toFixed(2)}</Text>
        </View>
        
        <Button 
          title="Continue Booking" 
          onPress={handleContinue}
          style={styles.checkoutButton}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  list: {
    padding: theme.spacing.md,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    ...shadows.soft,
  },
  itemInfo: {
    flex: 1,
    paddingRight: theme.spacing.sm,
  },
  itemName: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: theme.typography.bodySmall.fontSize,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.round,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 2,
    marginRight: theme.spacing.md,
  },
  iconButton: {
    padding: 4,
  },
  quantityText: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600',
    marginHorizontal: theme.spacing.sm,
    minWidth: 20,
    textAlign: 'center',
  },
  removeButton: {
    padding: 8,
  },
  summaryContainer: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.card,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  summaryLabel: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textSecondary,
  },
  summaryValue: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '500',
    color: theme.colors.text,
  },
  totalRow: {
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    marginBottom: theme.spacing.lg,
  },
  totalLabel: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: '700',
    color: theme.colors.text,
  },
  totalValue: {
    fontSize: theme.typography.h2.fontSize,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  checkoutButton: {
    width: '100%',
  },
});
