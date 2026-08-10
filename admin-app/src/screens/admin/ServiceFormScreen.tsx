import React, { useState } from 'react';
import { useServices } from '../../hooks/';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AdminRootStackParamList } from '../../navigation/admin/AdminTypes';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { theme } from '../../theme';
import { TopAppBar } from '../../components/navigation/TopAppBar';
import { Button } from '../../components/buttons/Button';
import { SectionHeader } from '../../components/typography/SectionHeader';
import { FloatingInput } from '../../components/inputs/FloatingInput';
import { MaterialIcons } from '@expo/vector-icons';
import { CATEGORIES } from '../../constants/data';
import { API_URL } from '../../api/axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Props = NativeStackScreenProps<AdminRootStackParamList, 'ServiceForm'>;

export default function ServiceFormScreen({ route, navigation }: Props) {
  const { service, defaultType } = route.params || {};
  const isEditing = !!service;
  const { addService, updateService } = useServices();

  const [name, setName] = useState(service?.name || '');
  const [description, setDescription] = useState(service?.description || '');
  const [price, setPrice] = useState(service?.price?.toString() || '');
  const [duration, setDuration] = useState(service?.duration?.toString() || '');
  const [imageUrl, setImageUrl] = useState(service?.imageUrl || '');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // Just simplified for mock form
  const [categoryId, setCategoryId] = useState(service?.categoryId || CATEGORIES[0].id);
  const [type, setType] = useState<'salon' | 'event'>('type' in (service || {}) ? ((service as any)?.type === 'party' || (service as any)?.type === 'event' ? 'event' : 'salon') : defaultType || 'salon');
  const [inclusionsStr, setInclusionsStr] = useState(service?.inclusions?.join(', ') || '');

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        setImageUrl(`data:image/jpeg;base64,${result.assets[0].base64}`);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image.');
    }
  };

  const handleSave = () => {
    if (!name || !price || !duration) return;

    setIsLoading(true);

    setTimeout(() => {
      const baseServiceData = {
        name,
        description,
        price: parseFloat(price),
        duration: parseInt(duration, 10),
        imageUrl,
        categoryId,
        inclusions: inclusionsStr.split(',').map(i => i.trim()).filter(i => i),
        visible: true,
      };

      if (isEditing) {
        if (type === 'event') {
          updateService({ ...baseServiceData, id: service.id, type: 'party' } as any);
        } else {
          updateService({ ...baseServiceData, id: service.id } as any);
        }
      } else {
        const newId = (type === 'event' ? 'm-' : 's-') + Math.floor(Math.random() * 10000);
        if (type === 'event') {
          addService({ ...baseServiceData, id: newId, type: 'party' } as any);
        } else {
          addService({ ...baseServiceData, id: newId } as any);
        }
      }

      setIsLoading(false);
      navigation.goBack();
    }, 800);
  };

  return (
    <SafeAreaView style={styles.container}>
      <TopAppBar 
        title={isEditing ? 'Edit Service' : 'Add Service'} 
        onBackPress={() => navigation.goBack()} 
      />
      
      <KeyboardAwareScrollView 
        contentContainerStyle={styles.content}
        enableOnAndroid={true}
        keyboardOpeningTime={0}
      >
        <FloatingInput 
          label="Service Name *"
          value={name} 
          onChangeText={setName} 
        />

        <FloatingInput 
          label="Description"
          value={description} 
          onChangeText={setDescription}
          multiline 
          style={{ height: 80 }}
        />

        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: theme.spacing.sm }}>
            <FloatingInput 
              label="Price (₹) *"
              value={price} 
              onChangeText={setPrice} 
              keyboardType="numeric" 
            />
          </View>
          <View style={{ flex: 1, marginLeft: theme.spacing.sm }}>
            <FloatingInput 
              label="Duration (mins) *"
              value={duration} 
              onChangeText={setDuration} 
              keyboardType="numeric" 
            />
          </View>
        </View>

        <View style={styles.imageUploadContainer}>
          <Text style={styles.imageUploadLabel}>Service Image</Text>
          <TouchableOpacity 
            style={styles.imageUploadBox} 
            onPress={pickImage}
            disabled={isUploading}
          >
            {isUploading ? (
              <Text style={styles.uploadingText}>Uploading...</Text>
            ) : imageUrl ? (
              <Image source={{ uri: imageUrl }} style={styles.uploadedImage} resizeMode="cover" />
            ) : (
              <View style={styles.imagePlaceholder}>
                <MaterialIcons name="add-photo-alternate" size={32} color={theme.colors.primary} />
                <Text style={styles.imagePlaceholderText}>Tap to upload</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <FloatingInput 
          label="Inclusions (comma separated)"
          value={inclusionsStr} 
          onChangeText={setInclusionsStr}
          multiline 
          style={{ height: 60 }}
        />

        {!defaultType && !isEditing && (
          <>
            <SectionHeader title="Classification" style={styles.sectionHeader} />
            <View style={styles.toggleRow}>
              <Button 
                title="Visiting Shop" 
                variant={type === 'salon' ? 'primary' : 'outline'}
                onPress={() => setType('salon')}
                style={{ flex: 1, marginRight: theme.spacing.sm }}
              />
              <Button 
                title="Home Service" 
                variant={type === 'event' ? 'primary' : 'outline'}
                onPress={() => setType('event')}
                style={{ flex: 1, marginLeft: theme.spacing.sm }}
              />
            </View>
          </>
        )}

      </KeyboardAwareScrollView>
      <View style={styles.footer}>
        <Button 
          title="Save Service" 
          onPress={handleSave} 
          disabled={!name || !price || !duration}
          isLoading={isLoading}
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
  content: {
    padding: theme.spacing.lg,
  },
  inputContainer: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: theme.typography.bodySmall.fontSize,
    color: theme.colors.textSecondary,
    marginBottom: 4,
    fontWeight: '500',
  },
  input: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    height: 48,
    color: theme.colors.text,
  },
  textArea: {
    height: 80,
    paddingTop: theme.spacing.md,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
  },
  sectionHeader: {
    paddingHorizontal: 0,
    marginTop: theme.spacing.md,
  },
  toggleRow: {
    flexDirection: 'row',
    marginBottom: theme.spacing.xl,
  },
  footer: {
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.background,
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
  }
});
