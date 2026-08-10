import React, { createContext, useState, ReactNode, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import { CartItem, Service, MakeupService } from '../types';

interface CartContextType {
  cart: CartItem[];
  addToCart: (service: Service | MakeupService) => void;
  removeFromCart: (serviceId: string) => void;
  updateQuantity: (serviceId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartDuration: number;
  cartItemCount: number;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = useCallback((service: Service | MakeupService) => {
    setCart(prevCart => {
      if (prevCart.length > 0) {
        const incomingType = (service as any).type || '';
        const existingType = (prevCart[0].service as any).type || '';
        
        const isIncomingHomeService = incomingType === 'event' || incomingType === 'party';
        const isExistingHomeService = existingType === 'event' || existingType === 'party';
        
        if (isIncomingHomeService !== isExistingHomeService) {
          Alert.alert(
            "Cannot Mix Services",
            "You cannot mix Visiting Shop and Home Service items in the same booking. Please book them separately.",
            [{ text: "OK", style: "cancel" }]
          );
          return prevCart;
        }
      }

      const existing = prevCart.find(item => item.service.id === service.id);
      if (existing) {
        return prevCart.map(item => 
          item.service.id === service.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prevCart, { service, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((serviceId: string) => {
    setCart(prevCart => prevCart.filter(item => item.service.id !== serviceId));
  }, []);

  const updateQuantity = useCallback((serviceId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(prevCart => prevCart.filter(item => item.service.id !== serviceId));
      return;
    }
    setCart(prevCart => 
      prevCart.map(item => 
        item.service.id === serviceId ? { ...item, quantity } : item
      )
    );
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + (item.service.price * item.quantity), 0), [cart]);
  const cartDuration = useMemo(() => cart.reduce((sum, item) => sum + (item.service.duration * item.quantity), 0), [cart]);
  const cartItemCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);

  const value = useMemo(() => ({
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartTotal,
    cartDuration,
    cartItemCount
  }), [cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartDuration, cartItemCount]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
