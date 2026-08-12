import React, { useState, useEffect } from 'react';
import { useAppConfig } from '../../hooks/';
import { useAuth } from '../../hooks/useAuth';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { AdminTabParamList } from '../../navigation/admin/AdminTypes';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import * as ImagePicker from 'expo-image-picker';
import { theme } from '../../theme';
import { TopAppBar } from '../../components/navigation/TopAppBar';
import { Button } from '../../components/buttons/Button';
import { SectionHeader } from '../../components/typography/SectionHeader';
import { FloatingInput } from '../../components/inputs/FloatingInput';
import { MaterialIcons } from '@expo/vector-icons';
import axiosInstance from '../../api/axios';

type Props = BottomTabScreenProps<AdminTabParamList, 'BusinessSettings'>;

export default function BusinessSettingsScreen({ navigation }: Props) {
  const { businessSettings, updateBusinessSettings, setAppMode, isLoading: isUpdating } = useAppConfig();
  const { logout } = useAuth();
  const [settings, setSettings] = useState(businessSettings || {
    businessName: '',
    tagline: '',
    phoneNumber: '',
    whatsappNumber: '',
    address: '',
    openingTime: '',
    closingTime: '',
    instagram: '',
    facebook: '',
    description: '',
    logoUrl: '',
    ownerTitle: '',
    youtube: '',
    threads: '',
    isShopOpen: true,
    isServiceOpen: true
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdatingCredentials, setIsUpdatingCredentials] = useState(false);
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);

  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');

  useEffect(() => {
    if (businessSettings) {
      setSettings(prev => ({
        ...prev,
        ...businessSettings
      }));
    }
  }, [businessSettings]);

  const handleUpdate = (field: keyof typeof settings, value: string) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      updateBusinessSettings(settings);
    }, 800);
  };

  const handleUpdateCredentials = async () => {
    if (!currentPassword) {
      Alert.alert('Notice', 'Please provide your current password to verify your identity.');
      return;
    }

    if (!newEmail && !newPassword) {
      Alert.alert('Notice', 'Please provide a new email or password to update.');
      return;
    }

    setIsUpdatingCredentials(true);
    try {
      await axiosInstance.put('/auth/credentials', {
        newEmail,
        newPassword,
        currentPassword
      });
      Alert.alert(
        'Success',
        'Credentials updated successfully. You will now be logged out to apply changes.',
        [{ text: 'OK', onPress: () => logout() }]
      );
    } catch (error: any) {
      console.error('Update credentials error:', error);
      Alert.alert('Update Failed', error.response?.data?.message || 'Failed to update credentials.');
    } finally {
      setIsUpdatingCredentials(false);
    }
  };


  const pickImage = async (field: 'logoUrl' | 'adImageUrl') => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: field === 'adImageUrl' ? [9, 16] : [1, 1], // Different aspect ratios
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        handleUpdate(field, `data:image/jpeg;base64,${result.assets[0].base64}`);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image.');
    }
  };

  const renderSettingInput = (label: string, field: keyof typeof settings, multiline = false, style?: any) => (
    <FloatingInput
      label={label}
      value={(settings[field] as string) || ''}
      onChangeText={(val) => handleUpdate(field, val)}
      multiline={multiline}
      style={style}
    />
  );

  const ImageUploadButton = ({ label, field, url }: { label: string, field: 'logoUrl' | 'adImageUrl', url: string }) => (
    <View style={styles.imageUploadContainer}>
      <Text style={styles.imageUploadLabel}>{label}</Text>
      <TouchableOpacity 
        style={styles.imageUploadBox} 
        onPress={() => pickImage(field)}
        disabled={uploadingImage === field}
      >
        {uploadingImage === field ? (
          <Text style={styles.uploadingText}>Uploading...</Text>
        ) : url ? (
          <Image source={{ uri: url }} style={styles.uploadedImage} resizeMode="cover" />
        ) : (
          <View style={styles.imagePlaceholder}>
            <MaterialIcons name="add-photo-alternate" size={32} color={theme.colors.primary} />
            <Text style={styles.imagePlaceholderText}>Tap to upload</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <TopAppBar title="Business Settings" />
      
      <KeyboardAwareScrollView 
        contentContainerStyle={styles.content}
        enableOnAndroid={true}
        keyboardOpeningTime={0}
      >

        <SectionHeader title="Brand Information" style={styles.sectionHeader} />
        {renderSettingInput("Business Name", "businessName")}
        {renderSettingInput("Tagline", "tagline")}
        {renderSettingInput("Owner Name", "ownerName")}
        {renderSettingInput("Owner Title", "ownerTitle")}
        
        <ImageUploadButton label="Logo Image" field="logoUrl" url={settings.logoUrl as string} />
        
        {renderSettingInput("Description", "description", true, { height: 80 })}

        <SectionHeader title="Advertisement Popup" style={styles.sectionHeader} />
        <View style={{ marginBottom: theme.spacing.lg }}>
          <Text style={{ color: theme.colors.textSecondary, marginBottom: theme.spacing.md }}>
            Upload an image to show as a popup to customers. It will automatically expire after 7 days, and won't be shown to the same customer more than once every 10 minutes.
          </Text>
          <ImageUploadButton label="Ad Image" field="adImageUrl" url={settings.adImageUrl as string} />
          {settings.adImageUrl ? (
            <TouchableOpacity 
              style={{ marginTop: theme.spacing.sm, padding: theme.spacing.sm, backgroundColor: theme.colors.error + '20', borderRadius: theme.borderRadius.md, alignItems: 'center' }}
              onPress={() => handleUpdate('adImageUrl', '')}
            >
              <Text style={{ color: theme.colors.error, fontWeight: 'bold' }}>Remove Ad</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <SectionHeader title="Contact & Location" style={styles.sectionHeader} />
        {renderSettingInput("Phone Number", "phoneNumber")}
        {renderSettingInput("WhatsApp Number", "whatsappNumber")}
        {renderSettingInput("Address", "address", true, { height: 60 })}

        <SectionHeader title="Operating Hours" style={styles.sectionHeader} />
        
        <View style={styles.switchRow}>
          <View>
            <Text style={styles.switchLabel}>Shop is Open</Text>
            <Text style={styles.switchSubLabel}>Physical salon visits available</Text>
          </View>
          <TouchableOpacity 
            style={[styles.toggleBtn, settings.isShopOpen ? styles.toggleActive : null]}
            onPress={() => handleUpdate('isShopOpen', !settings.isShopOpen as any)}
          >
            <View style={[styles.toggleThumb, settings.isShopOpen ? styles.thumbActive : null]} />
          </TouchableOpacity>
        </View>

        <View style={styles.switchRow}>
          <View>
            <Text style={styles.switchLabel}>Services are Open</Text>
            <Text style={styles.switchSubLabel}>Home & Event services available</Text>
          </View>
          <TouchableOpacity 
            style={[styles.toggleBtn, settings.isServiceOpen ? styles.toggleActive : null]}
            onPress={() => handleUpdate('isServiceOpen', !settings.isServiceOpen as any)}
          >
            <View style={[styles.toggleThumb, settings.isServiceOpen ? styles.thumbActive : null]} />
          </TouchableOpacity>
        </View>

        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: theme.spacing.sm }}>
            {renderSettingInput("Opening Time", "openingTime")}
          </View>
          <View style={{ flex: 1, marginLeft: theme.spacing.sm }}>
            {renderSettingInput("Closing Time", "closingTime")}
          </View>
        </View>

        <SectionHeader title="Social Media" style={styles.sectionHeader} />
        {renderSettingInput("Instagram", "instagram")}
        {renderSettingInput("Facebook", "facebook")}
        {renderSettingInput("YouTube", "youtube")}
        {renderSettingInput("Threads", "threads")}

        <Button 
          title="Save Changes" 
          onPress={handleSave} 
          style={styles.saveBtn} 
          isLoading={isUpdating || isLoading}
        />

        <SectionHeader title="Admin Credentials" style={{ ...styles.sectionHeader, marginTop: theme.spacing.xl }} />
        <View style={{ marginBottom: theme.spacing.lg }}>
          <Text style={{ color: theme.colors.textSecondary, marginBottom: theme.spacing.md, fontSize: theme.typography.caption.fontSize }}>
            To update your email or password, please verify your current password first.
          </Text>
          <FloatingInput
            label="Current Password"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry
          />
          <FloatingInput
            label="New Admin Email"
            value={newEmail}
            onChangeText={setNewEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <FloatingInput
            label="New Password"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
          />
          <Button 
            title="Update Credentials" 
            onPress={handleUpdateCredentials} 
            isLoading={isUpdatingCredentials}
            style={{ marginTop: theme.spacing.sm }}
          />
        </View>

        <TouchableOpacity 
          style={styles.logoutBtn}
          onPress={() => {
            Alert.alert(
              'Sign Out',
              'Are you sure you want to sign out?',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Sign Out', style: 'destructive', onPress: () => logout() }
              ]
            );
          }}
        >
          <MaterialIcons name="logout" size={24} color={theme.colors.error} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
        
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxxl,
  },

  sectionHeader: {
    paddingHorizontal: 0,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },

  textArea: {
    height: 80,
    paddingTop: theme.spacing.md,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.card,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  switchLabel: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600',
    color: theme.colors.text,
  },
  switchSubLabel: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  toggleBtn: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.border,
    padding: 2,
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: theme.colors.primary,
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  thumbActive: {
    transform: [{ translateX: 22 }],
  },
  saveBtn: {
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.xxxl,
  },
  imageUploadContainer: {
    marginBottom: theme.spacing.md,
  },
  imageUploadLabel: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
    marginLeft: 4,
  },
  imageUploadBox: {
    height: 120,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholderText: {
    marginTop: 8,
    color: theme.colors.textSecondary,
    fontSize: theme.typography.caption.fontSize,
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
  },
  uploadingText: {
    color: theme.colors.primary,
    fontWeight: '500',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.md,
    marginTop: theme.spacing.xl,
    backgroundColor: theme.colors.error + '10',
    borderRadius: theme.borderRadius.md,
  },
  logoutText: {
    marginLeft: theme.spacing.sm,
    color: theme.colors.error,
    fontWeight: 'bold',
    fontSize: theme.typography.body.fontSize,
  }
});
