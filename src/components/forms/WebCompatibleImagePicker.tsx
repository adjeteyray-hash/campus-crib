import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { isWeb } from '../../utils/platform';
import * as ImagePicker from 'expo-image-picker';

interface WebCompatibleImagePickerProps {
  onImageSelected?: (uri: string) => void;
  onImageError?: (error: string) => void;
  style?: any;
  buttonText?: string;
  buttonStyle?: any;
  textStyle?: any;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  allowsEditing?: boolean;
  aspect?: [number, number];
  mediaTypes?: 'All' | 'Videos' | 'Images';
  allowsMultipleSelection?: boolean;
  disabled?: boolean;
  testID?: string;
}

export const WebCompatibleImagePicker: React.FC<WebCompatibleImagePickerProps> = ({
  onImageSelected,
  onImageError,
  style,
  buttonText = 'Select Image',
  buttonStyle,
  textStyle,
  maxWidth = 1920,
  maxHeight = 1080,
  quality = 0.8,
  allowsEditing = false,
  aspect = [4, 3],
  mediaTypes = 'Images',
  allowsMultipleSelection = false,
  disabled = false,
  testID,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const requestPermissions = async () => {
    if (Platform.OS === 'web') return true;
    
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera roll permissions to select images.');
      return false;
    }
    return true;
  };

  const handleWebImagePick = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.type.startsWith('image/')) {
      onImageError?.('Please select a valid image file.');
      return;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      onImageError?.('Image size should be less than 10MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        onImageSelected?.(result);
      }
    };
    reader.onerror = () => {
      onImageError?.('Failed to read image file.');
    };
    reader.readAsDataURL(file);
  };

  const handleNativeImagePick = async () => {
    if (!(await requestPermissions())) return;

    try {
      setIsLoading(true);
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: mediaTypes === 'Images' ? ImagePicker.MediaTypeOptions.Images : 
                   mediaTypes === 'Videos' ? ImagePicker.MediaTypeOptions.Videos : 
                   ImagePicker.MediaTypeOptions.All,
        allowsEditing,
        aspect,
        quality,
        allowsMultipleSelection,
        maxWidth,
        maxHeight,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        onImageSelected?.(asset.uri);
      }
    } catch (error) {
      onImageError?.(error instanceof Error ? error.message : 'Failed to pick image');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePress = () => {
    if (disabled || isLoading) return;

    if (isWeb) {
      fileInputRef.current?.click();
    } else {
      handleNativeImagePick();
    }
  };

  // Web-specific image picker
  if (isWeb) {
    return (
      <View style={[styles.container, style]}>
        <TouchableOpacity
          style={[styles.button, buttonStyle, disabled && styles.disabled]}
          onPress={handlePress}
          disabled={disabled || isLoading}
          accessibilityLabel={buttonText}
          accessibilityRole="button"
          testID={testID}
        >
          <Text style={[styles.buttonText, textStyle]}>
            {isLoading ? 'Loading...' : buttonText}
          </Text>
        </TouchableOpacity>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleWebImagePick}
          style={styles.hiddenInput}
          multiple={allowsMultipleSelection}
        />
      </View>
    );
  }

  // Native image picker
  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={[styles.button, buttonStyle, disabled && styles.disabled]}
        onPress={handlePress}
        disabled={disabled || isLoading}
        accessibilityLabel={buttonText}
        accessibilityRole="button"
        testID={testID}
      >
        <Text style={[styles.buttonText, textStyle]}>
          {isLoading ? 'Loading...' : buttonText}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#667eea',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabled: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },
  hiddenInput: {
    display: 'none',
  },
});

export default WebCompatibleImagePicker;
