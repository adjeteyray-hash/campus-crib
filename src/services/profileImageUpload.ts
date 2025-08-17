import * as ImagePicker from 'expo-image-picker';
import { supabase } from './supabase';
import { Platform } from 'react-native';
import { IS_SUPABASE_CONFIGURED } from '../utils/constants';
import { ImageUploadService, ImageUploadResult, ImageUploadOptions } from './imageUpload';

export class ProfileImageUploadService extends ImageUploadService {
  private static readonly STORAGE_BUCKET = 'profile-pictures';

  /**
   * Upload a profile picture to Supabase Storage
   */
  static async uploadProfilePicture(
    imageUri: string,
    userId: string,
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

      // Generate unique filename for profile picture
      const timestamp = Date.now();
      const extension = this.getFileExtension(imageUri);
      const fileName = `profile_${timestamp}.${extension}`;
      const filePath = `${userId}/${fileName}`;

      // Create upload data (React Native compatible)
      const uploadData = await this.createUploadDataFromUri(imageUri);
      console.log(`Uploading profile picture ${uploadData.name} to ${filePath}`);

      // Upload to Supabase Storage with retry logic
      const uploadResult = await this.uploadWithRetry(filePath, uploadData.data, this.STORAGE_BUCKET);
      
      if (!uploadResult.success) {
        console.error('Profile picture upload failed:', uploadResult.error);
        return uploadResult;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(this.STORAGE_BUCKET)
        .getPublicUrl(filePath);

      console.log(`Generated public URL for profile picture: ${urlData.publicUrl}`);

      return {
        success: true,
        url: urlData.publicUrl,
      };
    } catch (error) {
      console.error('Profile picture upload error:', error);
      
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
   * Delete a profile picture from Supabase Storage
   */
  static async deleteProfilePicture(imageUrl: string, userId: string): Promise<boolean> {
    try {
      if (!IS_SUPABASE_CONFIGURED) {
        console.warn('Cannot delete profile picture: Supabase not configured');
        return false;
      }

      // Extract file path from URL for profile pictures
      const urlParts = imageUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const filePath = `${userId}/${fileName}`;

      const { error } = await supabase.storage
        .from(this.STORAGE_BUCKET)
        .remove([filePath]);

      if (error) {
        console.error('Error deleting profile picture:', error);
        return false;
      }

      console.log(`Successfully deleted profile picture: ${filePath}`);
      return true;
    } catch (error) {
      console.error('Error deleting profile picture:', error);
      return false;
    }
  }

  /**
   * Get file extension from URI
   */
  private static getFileExtension(uri: string): string {
    const extension = uri.split('.').pop()?.toLowerCase();
    return extension && ['jpg', 'jpeg', 'png', 'webp'].includes(extension) ? extension : 'jpg';
  }

  /**
   * Upload with retry logic - overridden for profile pictures bucket
   */
  private static async uploadWithRetry(
    filePath: string, 
    fileData: any, 
    bucket: string,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<ImageUploadResult> {
    let lastError: any;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Profile picture upload attempt ${attempt}/${maxRetries} for ${filePath}`);
        
        const { data, error } = await supabase.storage
          .from(bucket)
          .upload(filePath, fileData, {
            cacheControl: '3600',
            upsert: true, // Allow overwriting existing profile pictures
          });

        if (error) {
          lastError = error;
          console.error(`Profile picture upload attempt ${attempt} failed:`, error);
          
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
            error: `Profile picture upload failed after ${attempt} attempts: ${error.message}`,
          };
        }

        // Success!
        console.log(`Profile picture upload successful on attempt ${attempt}`);
        return { success: true };
        
      } catch (error) {
        lastError = error;
        console.error(`Profile picture upload attempt ${attempt} threw error:`, error);
        
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
      error: `Profile picture upload failed after ${maxRetries} attempts: ${lastError?.message || 'Unknown error'}`,
    };
  }

  /**
   * Pick a single image for profile picture
   */
  static async pickProfileImage(options: ImageUploadOptions = {}): Promise<ImagePicker.ImagePickerAsset | null> {
    const images = await this.pickImages(1, options);
    return images.length > 0 ? images[0] : null;
  }

  /**
   * Take a photo for profile picture
   */
  static async takeProfilePhoto(options: ImageUploadOptions = {}): Promise<ImagePicker.ImagePickerAsset | null> {
    return await this.takePhoto(options);
  }

  /**
   * Compress and optimize image for profile picture
   */
  static async optimizeProfileImage(
    imageUri: string,
    maxSize: number = 400 // Profile pictures don't need to be very large
  ): Promise<string> {
    // For now, return the original URI
    // In a real app, you'd implement image compression/resizing here
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
}

// Export convenience functions
export const pickProfileImage = ProfileImageUploadService.pickProfileImage.bind(ProfileImageUploadService);
export const takeProfilePhoto = ProfileImageUploadService.takeProfilePhoto.bind(ProfileImageUploadService);
export const uploadProfilePicture = ProfileImageUploadService.uploadProfilePicture.bind(ProfileImageUploadService);
export const deleteProfilePicture = ProfileImageUploadService.deleteProfilePicture.bind(ProfileImageUploadService);
export const optimizeProfileImage = ProfileImageUploadService.optimizeProfileImage.bind(ProfileImageUploadService);
