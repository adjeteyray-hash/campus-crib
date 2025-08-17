import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  Alert,
  Platform,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { ImageUploadService } from '../../services/imageUpload';

// ... (interfaces and constants are unchanged)

export const ImageUpload: React.FC<ImageUploadProps> = ({
  images,
  onImagesChange,
  maxImages = 6,
  disabled = false,
  enableCamera = true,
}) => {
  const { theme } = useTheme();
  const styles = createThemedStyles(theme);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});

  const handleImageAction = async (action: 'pick' | 'take') => {
    if (disabled || uploading || images.length >= maxImages) {
      if (images.length >= maxImages) Alert.alert('Maximum Images', `You can only upload up to ${maxImages} images.`);
      return;
    }
    const hasPermission = await ImageUploadService.requestPermissions();
    if (!hasPermission) return;

    try {
      const result = action === 'pick'
        ? await ImageUploadService.pickImages(maxImages - images.length, { quality: 0.8 })
        : await ImageUploadService.takePhoto({ quality: 0.8 });
      
      if (result) {
        const newUris = Array.isArray(result) ? result.map(r => r.uri) : [result.uri];
        onImagesChange([...images, ...newUris]);
        uploadImages(newUris);
      }
    } catch (error) {
      Alert.alert('Error', `Failed to ${action === 'pick' ? 'pick images' : 'take photo'}.`);
    }
  };

  const uploadImages = async (imageUris: string[]) => {
    setUploading(true);
    const progress = imageUris.reduce((acc, uri) => ({ ...acc, [uri]: 0 }), {});
    setUploadProgress(progress);

    try {
      const results = await ImageUploadService.uploadMultipleImages(imageUris);
      const updatedImages = [...images];
      results.forEach((result, index) => {
        const localUri = imageUris[index];
        const localIndex = updatedImages.indexOf(localUri);
        if (result.success && result.url) {
          if (localIndex !== -1) updatedImages[localIndex] = result.url;
          else updatedImages.push(result.url);
        } else {
          if (localIndex !== -1) updatedImages.splice(localIndex, 1);
        }
      });
      onImagesChange(updatedImages);
    } catch (error) {
      Alert.alert('Upload Error', 'An unexpected error occurred during upload.');
    } finally {
      setUploading(false);
      setUploadProgress({});
    }
  };

  const removeImage = (index: number) => {
    Alert.alert('Remove Image', 'Are you sure you want to remove this image?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: async () => {
        const imageUrl = images[index];
        if (imageUrl.startsWith('http')) await ImageUploadService.deleteImage(imageUrl).catch(e => console.warn('Failed to delete image from storage:', e));
        onImagesChange(images.filter((_, i) => i !== index));
      }},
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Hostel Images</Text>
        <Text style={styles.subtitle}>{`Add up to ${maxImages} images`}</Text>
      </View>

      {!disabled && (
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton} onPress={() => handleImageAction('pick')} disabled={uploading}><Ionicons name="images-outline" size={20} color={theme.primary.main} /><Text style={styles.actionButtonText}>Gallery</Text></TouchableOpacity>
          {enableCamera && <TouchableOpacity style={styles.actionButton} onPress={() => handleImageAction('take')} disabled={uploading}><Ionicons name="camera-outline" size={20} color={theme.primary.main} /><Text style={styles.actionButtonText}>Camera</Text></TouchableOpacity>}
        </View>
      )}

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.imagesContainer}>
          {images.map((uri, index) => <ImageItem key={index} uri={uri} onRemove={() => removeImage(index)} isUploading={uploading && uri.startsWith('file')} />)}
          {images.length < maxImages && !disabled && <AddButton onPress={() => handleImageAction('pick')} remaining={maxImages - images.length} />} 
        </View>
      </ScrollView>
    </View>
  );
};

const ImageItem = ({ uri, onRemove, isUploading }) => {
  const { theme } = useTheme();
  const styles = createThemedStyles(theme);
  return (
    <View style={styles.imageContainer}>
      <Image source={{ uri }} style={styles.image} resizeMode="cover" />
      {isUploading && <View style={styles.uploadOverlay}><ActivityIndicator size="small" color={theme.primary.contrast} /></View>}
      <TouchableOpacity style={styles.removeButton} onPress={onRemove}><Ionicons name="close-circle" size={24} color={theme.error.main} /></TouchableOpacity>
    </View>
  );
};

const AddButton = ({ onPress, remaining }) => {
  const { theme } = useTheme();
  const styles = createThemedStyles(theme);
  return (
    <TouchableOpacity style={styles.addButton} onPress={onPress}>
      <Ionicons name="camera" size={32} color={theme.primary.main} />
      <Text style={styles.addButtonText}>Add Image</Text>
      <Text style={styles.addButtonSubtext}>{`${remaining} left`}</Text>
    </TouchableOpacity>
  );
};

const IMAGE_SIZE = (Dimensions.get('window').width - 60) / 3;
const createThemedStyles = (theme: any) => StyleSheet.create({
  container: { marginVertical: 16 },
  header: { marginBottom: 16, paddingHorizontal: 16 },
  title: { fontSize: 18, fontWeight: '600', color: theme.text.primary, marginBottom: 4 },
  subtitle: { fontSize: 14, color: theme.text.secondary },
  actionButtons: { flexDirection: 'row', justifyContent: 'flex-start', gap: 12, marginBottom: 16, paddingHorizontal: 16 },
  actionButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, borderWidth: 1, borderColor: theme.primary.main, backgroundColor: theme.surface.secondary },
  actionButtonText: { marginLeft: 8, fontSize: 14, fontWeight: '600', color: theme.primary.main },
  imagesContainer: { flexDirection: 'row', gap: 12, paddingHorizontal: 16 },
  imageContainer: { width: IMAGE_SIZE, height: IMAGE_SIZE, borderRadius: 8, overflow: 'hidden', backgroundColor: theme.surface.secondary },
  image: { width: '100%', height: '100%' },
  uploadOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  removeButton: { position: 'absolute', top: 4, right: 4, backgroundColor: theme.background.primary, borderRadius: 12 },
  addButton: { width: IMAGE_SIZE, height: IMAGE_SIZE, borderRadius: 8, borderWidth: 2, borderColor: theme.primary.main, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', backgroundColor: theme.surface.input },
  addButtonText: { fontSize: 14, fontWeight: '600', color: theme.primary.main, marginTop: 4 },
  addButtonSubtext: { fontSize: 12, color: theme.text.secondary, marginTop: 2 },
});
