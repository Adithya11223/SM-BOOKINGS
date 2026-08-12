import React, { useEffect } from 'react';
import { useBookings, useNotifications } from '../../hooks/';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AdminRootStackParamList } from '../../navigation/admin/AdminTypes';
import { theme } from '../../theme';
import { TopAppBar } from '../../components/navigation/TopAppBar';
import { MaterialIcons } from '@expo/vector-icons';
import { EmptyState } from '../../components/states/EmptyState';
import { MotiView } from 'moti';

type Props = NativeStackScreenProps<AdminRootStackParamList, 'Notifications'>;

export default function NotificationsScreen({ navigation }: Props) {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, clearAllNotifications } = useNotifications();

  useEffect(() => {
    if (unreadCount > 0) {
      markAllAsRead();
    }
  }, [unreadCount]);

  const handlePress = (item: any) => {
    if (!item.isRead) {
      markAsRead(item.id);
    }
    if (item.bookingId) {
      navigation.navigate('AdminBookingDetails', { bookingId: item.bookingId });
    }
  };

const NotifCard = ({ item, index, handlePress, deleteNotification }: { item: any, index: number, handlePress: (item: any) => void, deleteNotification: (id: string) => void }) => {
  let icon = 'notifications';
  let color = theme.colors.primary;
  if (item.type?.includes('BOOKING')) {
    icon = 'event-note';
  } else if (item.type?.includes('CANCELLED')) {
    icon = 'event-busy';
    color = theme.colors.error;
  }

  return (
    <TouchableOpacity onPress={() => handlePress(item)}>
      <MotiView 
        from={{ opacity: 0, translateX: -20 }}
        animate={{ opacity: 1, translateX: 0 }}
        transition={{ type: 'spring', delay: index * 50 }}
        style={[styles.card, !item.isRead && styles.cardUnread]}
      >
        <View style={[styles.iconBox, { backgroundColor: `${color}15` }]}>
          <MaterialIcons name={icon as any} size={24} color={color} />
        </View>
        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, !item.isRead && styles.titleUnread]}>{item.title}</Text>
            {!item.isRead && <View style={styles.unreadDot} />}
          </View>
          <Text style={styles.message}>{item.message}</Text>
          <Text style={styles.time}>{new Date(item.createdAt).toLocaleString()}</Text>
        </View>
        <TouchableOpacity onPress={() => deleteNotification(item.id)} style={styles.deleteBtn}>
          <MaterialIcons name="delete-outline" size={22} color={theme.colors.error} />
        </TouchableOpacity>
      </MotiView>
    </TouchableOpacity>
  );
};

  return (
    <SafeAreaView style={styles.container}>
      <TopAppBar 
        title="Notifications" 
        onBackPress={() => navigation.goBack()} 
        rightActionIcon={notifications.length > 0 ? "delete-sweep" : undefined}
        onRightActionPress={notifications.length > 0 ? clearAllNotifications : undefined}
      />
      <FlatList
        data={notifications}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState 
            icon="notifications-off"
            title="No Notifications"
            description="You're all caught up! No new notifications at the moment."
          />
        }
        renderItem={({ item, index }) => <NotifCard item={item} index={index} handlePress={handlePress} deleteNotification={deleteNotification} />}
      />
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
    flexGrow: 1,
  },
  card: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  cardUnread: {
    backgroundColor: `${theme.colors.primary}08`,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  content: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
  },
  titleUnread: {
    fontWeight: '700',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
  },
  message: {
    fontSize: theme.typography.bodySmall.fontSize,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  time: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
  },
  deleteBtn: {
    padding: theme.spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
