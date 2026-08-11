import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppConfig } from '../../hooks/useAppConfig';
import { AdvertisementModal } from './AdvertisementModal';

const AD_COOLDOWN_MS = 10 * 60 * 1000; // 10 minutes

export const AdManager: React.FC = () => {
  const { businessSettings } = useAppConfig();
  const [showAd, setShowAd] = useState(false);

  useEffect(() => {
    const checkAd = async () => {
      // If there's no ad, don't show anything
      if (!businessSettings?.adImageUrl) {
        return;
      }

      try {
        const lastClosedStr = await AsyncStorage.getItem('lastAdClosedTime');
        const lastClosedTime = lastClosedStr ? parseInt(lastClosedStr, 10) : 0;
        const now = Date.now();

        if (now - lastClosedTime > AD_COOLDOWN_MS) {
          setShowAd(true);
        }
      } catch (error) {
        console.error('Error checking ad cooldown:', error);
      }
    };

    checkAd();
  }, [businessSettings?.adImageUrl]);

  const handleClose = async () => {
    setShowAd(false);
    try {
      await AsyncStorage.setItem('lastAdClosedTime', Date.now().toString());
    } catch (error) {
      console.error('Error saving ad cooldown:', error);
    }
  };

  if (!businessSettings?.adImageUrl) return null;

  return (
    <AdvertisementModal
      visible={showAd}
      imageUrl={businessSettings.adImageUrl}
      onClose={handleClose}
    />
  );
};
