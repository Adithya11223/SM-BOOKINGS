import React, { useState } from 'react';
import { useServices } from '../../hooks/';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AdminRootStackParamList } from '../../navigation/admin/AdminTypes';
import { theme, shadows } from '../../theme';
import { TopAppBar } from '../../components/navigation/TopAppBar';
import { SearchBar } from '../../components/inputs/SearchBar';
import { MaterialIcons } from '@expo/vector-icons';
import { MotiView } from 'moti';

type Props = {
  navigation: NativeStackNavigationProp<AdminRootStackParamList, 'AdminMainTabs'>;
};

export default function AdminServicesScreen({ navigation }: Props) {
  const { allServices, toggleServiceVisibility, deleteService } = useServices();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'salon' | 'event'>('salon');

  const filteredServices = allServices.filter(s => 
    s.type === activeTab && s.name.toLowerCase().includes(search.toLowerCase())
  );

  const ServiceRow = ({ service, index }: { service: any; index: number }) => (
    <MotiView 
      from={{ opacity: 0, scale: 0.9, translateX: -20 }}
      animate={{ opacity: 1, scale: 1, translateX: 0 }}
      transition={{ type: 'spring', delay: index * 50 }}
      style={styles.card}
    >
      {service.imageUrl ? (
        <Image source={{ uri: service.imageUrl }} style={styles.image} />
      ) : (
        <View style={styles.imagePlaceholder}>
          <MaterialIcons name="image" size={24} color={theme.colors.border} />
        </View>
      )}
      
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{service.name}</Text>
        <Text style={styles.meta}>
          ₹{service.price} • {service.duration} min • {'type' in service ? 'Event' : 'Salon'}
        </Text>
      </View>
      
      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.iconBtn}
          onPress={() => toggleServiceVisibility(service.id, service.visible || false)}
        >
          <MaterialIcons 
            name={service.visible ? 'visibility' : 'visibility-off'} 
            size={22} 
            color={service.visible ? theme.colors.primary : theme.colors.textSecondary} 
          />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.iconBtn}
          // @ts-ignore
          onPress={() => navigation.getParent()?.navigate('ServiceForm', { service })}
        >
          <MaterialIcons name="edit" size={22} color={theme.colors.textSecondary} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.iconBtn}
          onPress={() => {
            Alert.alert(
              'Delete Service',
              `Are you sure you want to delete "${service.name}"?`,
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => deleteService(service.id) }
              ]
            );
          }}
        >
          <MaterialIcons name="delete-outline" size={22} color={theme.colors.error} />
        </TouchableOpacity>
      </View>
    </MotiView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <TopAppBar title="Manage Services" />
      
      <View style={styles.header}>
        <SearchBar 
          value={search} 
          onChangeText={setSearch} 
          placeholder="Search services..." 
        />
        
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'salon' && styles.tabButtonActive]}
            onPress={() => setActiveTab('salon')}
          >
            <Text style={[styles.tabText, activeTab === 'salon' && styles.tabTextActive]}>Visiting Shop</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'event' && styles.tabButtonActive]}
            onPress={() => setActiveTab('event')}
          >
            <Text style={[styles.tabText, activeTab === 'event' && styles.tabTextActive]}>Home Service</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={filteredServices}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item, index }) => <ServiceRow service={item} index={index} />}
      />

      <TouchableOpacity 
        style={styles.fab}
        // @ts-ignore
        onPress={() => navigation.getParent()?.navigate('ServiceForm', { service: undefined, defaultType: activeTab })}
      >
        <MaterialIcons name="add" size={32} color={theme.colors.background} />
      </TouchableOpacity>
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
  tabContainer: {
    flexDirection: 'row',
    marginTop: theme.spacing.md,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: 4,
    ...shadows.soft,
  },
  tabButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
    borderRadius: theme.borderRadius.sm,
  },
  tabButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  tabText: {
    fontSize: theme.typography.bodySmall.fontSize,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  tabTextActive: {
    color: theme.colors.background,
  },
  list: {
    padding: theme.spacing.md,
    paddingBottom: 100, // For FAB
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    ...shadows.soft,
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: theme.borderRadius.sm,
  },
  imagePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    marginLeft: theme.spacing.sm,
  },
  name: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '500',
    color: theme.colors.text,
  },
  meta: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    padding: 6,
    marginLeft: 4,
  },
  fab: {
    position: 'absolute',
    bottom: theme.spacing.xl,
    right: theme.spacing.xl,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.medium,
  }
});
