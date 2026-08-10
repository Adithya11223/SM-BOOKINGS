import { createNavigationContainerRef } from '@react-navigation/native';
import { AdminRootStackParamList } from './admin/AdminTypes';

export const navigationRef = createNavigationContainerRef<AdminRootStackParamList>();

export function navigate(name: keyof AdminRootStackParamList, params?: any) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params as any);
  }
}
