import * as ImagePicker from 'expo-image-picker';
import { supabase } from './supabase';
import { Platform } from 'react-native';
import { IS_SUPABASE_CONFIGURED } from '../utils/constants';

export interface ImageUploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export interface ImageUploadOptions {
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

export class ImageUploadService {
  private static readonly STORAGE_BUCKET = 'hostel-images';
  private static readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  private static readonly ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

  /**
   * Request necessary permissions for image picking
   */
  static async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'web') {
      return true; // Web doesn't need permissions
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      console.warn('Media library permission not granted');
      return false;
    }

    return true;
  }

  /**
   * Pick images from device gallery
   */
  static async pickImages(
    maxCount: number = 6,
    options: ImageUploadOptions = {}
  ): Promise<ImagePicker.ImagePickerAsset[]> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      throw new Error('Media library permission not granted');
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      allowsMultipleSelection: true,
      selectionLimit: maxCount,
      quality: options.quality || 0.8,
      aspect: [4, 3],
    });

    if (result.canceled || !result.assets) {
      return [];
    }

    return result.assets;
  }

  /**
   * Take a photo using the camera
   */
  static async takePhoto(options: ImageUploadOptions = {}): Promise<ImagePicker.ImagePickerAsset | null> {
    if (Platform.OS === 'web') {
      throw new Error('Camera not supported on web');
    }

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Camera permission not granted');
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: options.quality || 0.8,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    return result.assets[0];
  }

  /**
   * Upload a single image to Supabase Storage
   */
  static async uploadImage(
    imageUri: string,
    fileName: string,
    options: ImageUploadOptions = {}
  ): Promise<ImageUploadResult> {
    try {
      // Check if Supabase is configured
      if (!this.isSupabaseConfigured()) {
        return {
          success: false,
          error: 'Supabase storage is not configured. Please check your environment variables.',
        };
      }

      // Basic validation of image URI
      const validationResult = this.validateImageUri(imageUri);
      if (!validationResult.valid) {
        return {
          success: false,
          error: validationResult.error,
        };
      }

      // Generate unique filename
      const uniqueFileName = this.generateUniqueFileName(fileName);
      const filePath = `${Date.now()}_${uniqueFileName}`;

      // Create upload data (React Native compatible)
      const uploadData = await this.createUploadDataFromUri(imageUri);
      console.log(`Uploading ${uploadData.name} (${uploadData.type}) to ${filePath}`);

      // Upload to Supabase Storage with retry logic
      console.log('Upload data being sent to Supabase:', uploadData.data);
      const uploadResult = await this.uploadWithRetry(filePath, uploadData.data);
      
      if (!uploadResult.success) {
        console.error('Upload failed:', uploadResult.error);
        return uploadResult;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(this.STORAGE_BUCKET)
        .getPublicUrl(filePath);

      console.log(`Generated public URL: ${urlData.publicUrl} for path: ${filePath}`);

      return {
        success: true,
        url: urlData.publicUrl,
      };
    } catch (error) {
      console.error('Image upload error:', error);
      
      // Check if it's a network error
      if (this.isNetworkError(error)) {
        return {
          success: false,
          error: 'Network connection failed. Please check your internet connection and try again.',
        };
      }
      
      return {
        success: false,
        error: `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Upload multiple images to Supabase Storage
   */
  static async uploadMultipleImages(
    imageUris: string[],
    options: ImageUploadOptions = {}
  ): Promise<ImageUploadResult[]> {
    const uploadPromises = imageUris.map((uri, index) => {
      const fileName = `hostel_image_${index + 1}.jpg`;
      return this.uploadImage(uri, fileName, options);
    });

    return Promise.all(uploadPromises);
  }

  /**
   * Delete an image from Supabase Storage
   */
  static async deleteImage(imageUrl: string): Promise<boolean> {
    try {
      // Extract file path from URL
      const urlParts = imageUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];

      const { error } = await supabase.storage
        .from(this.STORAGE_BUCKET)
        .remove([fileName]);

      if (error) {
        console.error('Error deleting image:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting image:', error);
      return false;
    }
  }

  /**
   * Basic validation for image URI (file extension and basic checks)
   */
  private static validateImageUri(imageUri: string): { valid: boolean; error?: string } {
    try {
      // Check if URI exists
      if (!imageUri || imageUri.trim() === '') {
        return {
          valid: false,
          error: 'Image URI is empty',
        };
      }

      // For HTTP URLs, just check if they're valid URLs
      if (imageUri.startsWith('http')) {
        try {
          new URL(imageUri);
          console.log(`HTTP URL validation passed: ${imageUri}`);
          return { valid: true };
        } catch {
          return {
            valid: false,
            error: 'Invalid HTTP URL format',
          };
        }
      }

      // For local URIs, check if they have reasonable formats
      // React Native local URIs can have various formats depending on platform
      if (imageUri.includes('file://') || imageUri.includes('content://') || imageUri.includes('assets-library://') || imageUri.includes('ph://')) {
        console.log(`Local URI validation passed: ${imageUri}`);
        return { valid: true };
      }

      // Check file extension for other URIs
      const extension = imageUri.split('.').pop()?.toLowerCase();
      const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
      
      if (!extension || !allowedExtensions.includes(extension)) {
        console.warn(`File extension check failed for: ${imageUri}, extension: ${extension}`);
        // Don't fail validation for extension issues - let the Image component handle it
        console.log(`Allowing URI despite extension check: ${imageUri}`);
        return { valid: true };
      }

      console.log(`Image URI validation passed: ${imageUri}`);
      return { valid: true };
    } catch (error) {
      console.error('Image URI validation error:', error);
      return {
        valid: false,
        error: `Failed to validate image URI: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Generate unique filename
   */
  private static generateUniqueFileName(originalName: string): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = originalName.split('.').pop() || 'jpg';
    return `${timestamp}_${randomString}.${extension}`;
  }

  /**
   * Get image dimensions
   */
  static async getImageDimensions(imageUri: string): Promise<{ width: number; height: number } | null> {
    try {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          resolve({ width: img.width, height: img.height });
        };
        img.onerror = () => {
          reject(new Error('Failed to load image'));
        };
        img.src = imageUri;
      });
    } catch (error) {
      console.error('Error getting image dimensions:', error);
      return null;
    }
  }

  /**
   * Compress image if needed
   */
  static async compressImage(
    imageUri: string,
    maxWidth: number = 1200,
    maxHeight: number = 1200,
    quality: number = 0.8
  ): Promise<string> {
    // For now, return the original URI
    // In a real app, you'd implement image compression here
    // You could use libraries like react-native-image-manipulator
    return imageUri;
  }

  /**
   * Check if Supabase is properly configured
   */
  private static isSupabaseConfigured(): boolean {
    return IS_SUPABASE_CONFIGURED;
  }

  /**
   * Check if an error is a network error
   */
  private static isNetworkError(error: any): boolean {
    const errorMessage = error?.message?.toLowerCase() || '';
    const networkErrors = [
      'network request failed',
      'network error',
      'connection failed',
      'timeout',
      'connection timeout',
      'fetch failed',
      'internet connection',
      'network connection'
    ];
    
    return networkErrors.some(networkError => errorMessage.includes(networkError));
  }

  /**
   * Upload with retry logic
   */
  private static async uploadWithRetry(
    filePath: string, 
    fileData: any, 
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<ImageUploadResult> {
    let lastError: any;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Upload attempt ${attempt}/${maxRetries} for ${filePath}`);
        
        // Supabase storage accepts the file object directly in React Native
        const { data, error } = await supabase.storage
          .from(this.STORAGE_BUCKET)
          .upload(filePath, fileData, {
            cacheControl: '3600',
            upsert: false,
          });

        if (error) {
          lastError = error;
          console.error(`Upload attempt ${attempt} failed:`, error);
          
          // If it's a network error and we have retries left, wait and try again
          if (this.isNetworkError(error) && attempt < maxRetries) {
            console.log(`Waiting ${delay}ms before retry...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            delay *= 2; // Exponential backoff
            continue;
          }
          
          // If it's not a network error or we're out of retries, return the error
          return {
            success: false,
            error: `Upload failed after ${attempt} attempts: ${error.message}`,
          };
        }

        // Success!
        console.log(`Upload successful on attempt ${attempt}`);
        return { success: true };
        
      } catch (error) {
        lastError = error;
        console.error(`Upload attempt ${attempt} threw error:`, error);
        
        // If it's a network error and we have retries left, wait and try again
        if (this.isNetworkError(error) && attempt < maxRetries) {
          console.log(`Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2; // Exponential backoff
          continue;
        }
      }
    }
    
    // All retries failed
    return {
      success: false,
      error: `Upload failed after ${maxRetries} attempts: ${lastError?.message || 'Unknown error'}`,
    };
  }

  /**
   * Create upload data from URI - React Native compatible
   */
  private static async createUploadDataFromUri(uri: string): Promise<{ data: any; type: string; name: string }> {
    try {
      console.log('Creating upload data from URI:', uri);
      
      // For web, use the standard blob approach
      if (Platform.OS === 'web') {
        const response = await fetch(uri);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const blob = await response.blob();
        return {
          data: blob,
          type: blob.type || 'image/jpeg',
          name: 'image.jpg'
        };
      }
      
      // For React Native, we need to read the file as base64 or use fetch
      // Supabase expects ArrayBuffer or blob data, not file URIs
      const fileExtension = uri.split('.').pop()?.toLowerCase() || 'jpg';
      const mimeType = this.getMimeTypeFromExtension(fileExtension);
      
      try {
        // Try to fetch the local file and convert to ArrayBuffer
        const response = await fetch(uri);
        if (response.ok) {
          const arrayBuffer = await response.arrayBuffer();
          return {
            data: arrayBuffer,
            type: mimeType,
            name: `image.${fileExtension}`
          };
        }
      } catch (fetchError) {
        console.warn('Fetch approach failed, trying direct URI approach:', fetchError);
      }
      
      // Fallback: For React Native, create the correct format for @supabase/storage-js
      // This should work with React Native's file URIs
      return {
        data: {
          uri: uri,
          type: mimeType,
          name: `image.${fileExtension}`
        },
        type: mimeType,
        name: `image.${fileExtension}`
      };
    } catch (error) {
      console.error('Error in createUploadDataFromUri:', error);
      throw new Error(`Failed to create upload data from URI: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get MIME type from file extension
   */
  private static getMimeTypeFromExtension(extension: string): string {
    const mimeTypes: { [key: string]: string } = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'webp': 'image/webp',
      'gif': 'image/gif'
    };
    return mimeTypes[extension.toLowerCase()] || 'image/jpeg';
  }

  /**
   * Get local fallback path for image (for development/offline use)
   */
  private static getLocalFallbackPath(imageUri: string): string {
    // In development, we can use the local image URI as fallback
    // This won't work in production, but it's useful for testing
    if (__DEV__) {
      return imageUri;
    }
    
    // In production, you might want to store images locally and sync later
    return imageUri;
  }
}

// Export convenience functions
export const pickImages = ImageUploadService.pickImages.bind(ImageUploadService);
export const takePhoto = ImageUploadService.takePhoto.bind(ImageUploadService);
export const uploadImage = ImageUploadService.uploadImage.bind(ImageUploadService);
export const uploadMultipleImages = ImageUploadService.uploadMultipleImages.bind(ImageUploadService);
export const deleteImage = ImageUploadService.deleteImage.bind(ImageUploadService);
