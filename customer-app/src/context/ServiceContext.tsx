import React, { createContext, useState, ReactNode, useCallback, useMemo, useEffect } from 'react';
import { Service, MakeupService } from '../types';
import { ServiceService } from '../api/ServiceService';
import { webSocketService } from '../api/WebSocketService';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHED_SERVICES_KEY = '@cached_services';

interface ServiceContextType {
  allServices: (Service | MakeupService)[];
  addService: (service: Partial<Service | MakeupService>) => Promise<void>;
  updateService: (service: Partial<Service | MakeupService> & { id: string }) => Promise<void>;
  deleteService: (serviceId: string) => Promise<void>;
  toggleServiceVisibility: (serviceId: string, currentVisibility: boolean) => Promise<void>;
  isLoading: boolean;
  refreshServices: () => Promise<void>;
}

export const ServiceContext = createContext<ServiceContextType | undefined>(undefined);

export const ServiceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [allServices, setAllServices] = useState<(Service | MakeupService)[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load from cache on startup for instant rendering
  useEffect(() => {
    AsyncStorage.getItem(CACHED_SERVICES_KEY).then(cached => {
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setAllServices(parsed);
            setIsLoading(false);
          }
        } catch (e) {}
      }
    });
  }, []);

  const fetchServices = useCallback(async () => {
    try {
      setIsLoading(true);
      const services = await ServiceService.getAllServices();
      setAllServices(services as (Service | MakeupService)[]);
      AsyncStorage.setItem(CACHED_SERVICES_KEY, JSON.stringify(services)).catch(console.error);
    } catch (error) {
      console.warn('Failed to fetch services (using cached if available):', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();

    const handleServiceUpdate = (payload: any) => {
      const { action, data } = payload;
      if (action === 'CREATED') {
        setAllServices(prev => {
          if (!prev.find(s => s.id === data.id)) {
            const updated = [...prev, ServiceService.mapToFrontend(data)];
            AsyncStorage.setItem(CACHED_SERVICES_KEY, JSON.stringify(updated)).catch(console.error);
            return updated;
          }
          return prev;
        });
      } else if (action === 'UPDATED') {
        setAllServices(prev => {
          const updated = prev.map(s => s.id === data.id ? ServiceService.mapToFrontend(data) : s);
          AsyncStorage.setItem(CACHED_SERVICES_KEY, JSON.stringify(updated)).catch(console.error);
          return updated;
        });
      } else if (action === 'DELETED') {
        setAllServices(prev => {
          const updated = prev.filter(s => s.id !== data.id);
          AsyncStorage.setItem(CACHED_SERVICES_KEY, JSON.stringify(updated)).catch(console.error);
          return updated;
        });
      }
    };

    webSocketService.subscribe('/topic/services', handleServiceUpdate);

    return () => {
      webSocketService.unsubscribe('/topic/services', handleServiceUpdate);
    };
  }, [fetchServices]);

  const addService = useCallback(async (service: Partial<Service | MakeupService>) => {
    try {
      setIsLoading(true);
      const newService = await ServiceService.createService(service);
      setAllServices(prev => [...prev, newService as (Service | MakeupService)]);
      Alert.alert('Success', 'Service created successfully.');
    } catch (error) {
      console.error('Failed to create service:', error);
      Alert.alert('Error', 'Failed to create service.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateService = useCallback(async (service: Partial<Service | MakeupService> & { id: string }) => {
    try {
      setIsLoading(true);
      const updated = await ServiceService.updateService(service.id, service);
      setAllServices(prev => prev.map(s => s.id === updated.id ? (updated as Service | MakeupService) : s));
      Alert.alert('Success', 'Service updated successfully.');
    } catch (error) {
      console.error('Failed to update service:', error);
      Alert.alert('Error', 'Failed to update service.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteService = useCallback(async (serviceId: string) => {
    try {
      setIsLoading(true);
      await ServiceService.deleteService(serviceId);
      setAllServices(prev => prev.filter(s => s.id !== serviceId));
      Alert.alert('Success', 'Service deleted successfully.');
    } catch (error) {
      console.error('Failed to delete service:', error);
      Alert.alert('Error', 'Failed to delete service.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const toggleServiceVisibility = useCallback(async (serviceId: string, currentVisibility: boolean) => {
    try {
      // Optimistic UI update
      setAllServices(prev => prev.map(s => s.id === serviceId ? { ...s, visible: !currentVisibility } : s));
      await ServiceService.toggleVisibility(serviceId, !currentVisibility);
    } catch (error) {
      console.error('Failed to toggle visibility:', error);
      // Revert on failure
      setAllServices(prev => prev.map(s => s.id === serviceId ? { ...s, visible: currentVisibility } : s));
      Alert.alert('Error', 'Failed to change visibility.');
    }
  }, []);

  const value = useMemo(() => ({
    allServices,
    addService,
    updateService,
    deleteService,
    toggleServiceVisibility,
    isLoading,
    refreshServices: fetchServices
  }), [allServices, addService, updateService, deleteService, toggleServiceVisibility, isLoading, fetchServices]);

  return (
    <ServiceContext.Provider value={value}>
      {children}
    </ServiceContext.Provider>
  );
};
