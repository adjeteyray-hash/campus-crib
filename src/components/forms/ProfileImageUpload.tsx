import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  Platform,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { ImageUploadService } from '../../services/imageUpload';
import { ProfileImageUploadService } from '../../services/profileImageUpload';
import { useAuth } from '../../contexts/AuthContext';

// ... (interfaces are unchanged)

export const ProfileImageUpload: React.FC<ProfileImageUploadProps> = ({
  currentImageUrl,
  onImageChange,
  disabled = false,
  size = 120,
  isLoading = false,
}) => {
  const { theme } = useTheme();
  const styles = createThemedStyles(theme, size);
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleImageAction = async (action: 'pick' | 'take') => {
    if (disabled || uploading) return;
    const hasPermission = await ImageUploadService.requestPermissions();
    if (!hasPermission) return;

    try {
      setShowOptionsModal(false);
      const result = action === 'pick'
        ? await ProfileImageUploadService.pickImages(1, { quality: 0.8 })
        : await ProfileImageUploadService.takePhoto({ quality: 0.8 });

      if (result && user?.id) {
        const uri = Array.isArray(result) ? result[0].uri : result.uri;
        setUploading(true);
        const uploadResult = await ProfileImageUploadService.uploadProfilePicture(uri, user.id, { quality: 0.8 });
        if (uploadResult.success && uploadResult.url) {
          onImageChange(uploadResult.url);
        } else {
          Alert.alert('Upload Failed', uploadResult.error || 'Failed to upload profile picture.');
        }
      }
    } catch (error) {
      Alert.alert('Error', `Failed to ${action === 'pick' ? 'pick image' : 'take photo'}.`);
    } finally {
      setUploading(false);
    }
  };

  const removeProfileImage = () => {
    Alert.alert('Remove Profile Picture', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: async () => {
        if (currentImageUrl && user?.id) await ProfileImageUploadService.deleteProfilePicture(currentImageUrl, user.id).catch(console.warn);
        onImageChange(null);
      }},
    ]);
  };

  const renderProfileImage = () => {
    if (uploading || isLoading) return <View style={styles.avatarContainer}><ActivityIndicator size="large" color={theme.primary.main} /></View>;
    if (currentImageUrl && !imageError) return <Image source={{ uri: currentImageUrl }} style={styles.avatar} onError={() => setImageError(true)} />; 
    return <View style={styles.defaultAvatar}><Ionicons name="person" size={size * 0.5} color={theme.text.secondary} /></View>;
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => setShowOptionsModal(true)} disabled={disabled || uploading || isLoading}>
        {renderProfileImage()}
      </TouchableOpacity>

      <Modal visible={showOptionsModal} transparent={true} animationType="slide" onRequestClose={() => setShowOptionsModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Profile Picture</Text>
            <TouchableOpacity style={styles.optionItem} onPress={() => handleImageAction('pick')}><Ionicons name="images-outline" size={24} color={theme.primary.main} /><Text style={styles.optionText}>Choose from Gallery</Text></TouchableOpacity>
            {Platform.OS !== 'web' && <TouchableOpacity style={styles.optionItem} onPress={() => handleImageAction('take')}><Ionicons name="camera-outline" size={24} color={theme.primary.main} /><Text style={styles.optionText}>Take Photo</Text></TouchableOpacity>}
            {currentImageUrl && <TouchableOpacity style={[styles.optionItem, styles.removeOption]} onPress={removeProfileImage}><Ionicons name="trash-outline" size={24} color={theme.error.main} /><Text style={[styles.optionText, styles.removeText]}>Remove Picture</Text></TouchableOpacity>}
            <TouchableOpacity style={styles.cancelButton} onPress={() => setShowOptionsModal(false)}><Text style={styles.cancelButtonText}>Cancel</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const createThemedStyles = (theme: any, size: number) => StyleSheet.create({
  container: { alignItems: 'center', marginVertical: 16 },
  avatarContainer: { width: size, height: size, borderRadius: size / 2, backgroundColor: theme.surface.secondary, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: theme.border.secondary },
  avatar: { width: size, height: size, borderRadius: size / 2 },
  defaultAvatar: { width: size, height: size, borderRadius: size / 2, backgroundColor: theme.surface.secondary, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: theme.border.secondary },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: theme.background.overlay },
  modalContent: { backgroundColor: theme.surface.elevated, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: Platform.select({ ios: 40, default: 20 }) },
  modalTitle: { fontSize: 18, fontWeight: '600', color: theme.text.primary, marginBottom: 20, textAlign: 'center' },
  optionItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, backgroundColor: theme.surface.secondary, marginBottom: 12 },
  optionText: { marginLeft: 16, fontSize: 16, fontWeight: '500', color: theme.text.primary },
  removeOption: { backgroundColor: theme.error.background },
  removeText: { color: theme.error.main },
  cancelButton: { padding: 16, borderRadius: 12, backgroundColor: theme.surface.secondary, alignItems: 'center' },
  cancelButtonText: { fontSize: 16, fontWeight: '600', color: theme.text.secondary },
});

export default ProfileImageUpload;
