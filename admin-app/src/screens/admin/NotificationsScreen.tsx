import React from 'react';
import { useNotifications } from '../../hooks/';
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

const NotifCard = ({ 
  item, 
  index, 
  handlePress, 
  deleteNotification 
}: { 
  item: any; 
  index: number; 
  handlePress: (item: any) => void; 
  deleteNotification: (id: string) => void; 
}) => {
  let icon = 'notifications';
  let color = theme.colors.primary;
  if (item.type?.includes('BOOKING')) {
    icon = 'event-note';
  } else if (item.type?.includes('CANCELLED')) {
    icon = 'event-busy';
    color = theme.colors.error;
  }

  return (
    <TouchableOpacity onPress={() => handlePress(item)} activeOpacity={0.8}>
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

export default function NotificationsScreen({ navigation }: Props) {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, clearAllNotifications } = useNotifications();

  const handlePress = (item: any) => {
    if (!item.isRead) {
      markAsRead(item.id);
    }
    if (item.bookingId) {
      navigation.navigate('AdminBookingDetails', { bookingId: item.bookingId });
    }
  };

  const rightActions = [];
  if (unreadCount > 0) {
    rightActions.push({
      icon: 'done-all' as const,
      onPress: markAllAsRead,
      color: theme.colors.primary,
    });
  }
  if (notifications.length > 0) {
    rightActions.push({
      icon: 'delete-sweep' as const,
      onPress: clearAllNotifications,
      color: theme.colors.textSecondary,
    });
  }

  return (
    <SafeAreaView style={styles.container}>
      <TopAppBar 
        title="Notifications" 
        onBackPress={() => navigation.goBack()} 
        rightActions={rightActions.length > 0 ? rightActions : undefined}
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
        renderItem={({ item, index }) => (
          <NotifCard 
            item={item} 
            index={index} 
            handlePress={handlePress} 
            deleteNotification={deleteNotification} 
          />
        )}
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
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  cardUnread: {
    backgroundColor: `${theme.colors.primary}08`,
    borderColor: `${theme.colors.primary}30`,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
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
    marginBottom: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
    flex: 1,
  },
  titleUnread: {
    fontWeight: '700',
    color: theme.colors.primary,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
    marginLeft: 6,
  },
  message: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginBottom: 6,
    lineHeight: 18,
  },
  time: {
    fontSize: 11,
    color: theme.colors.textSecondary,
  },
  deleteBtn: {
    padding: theme.spacing.xs,
    marginLeft: theme.spacing.sm,
  },
});
