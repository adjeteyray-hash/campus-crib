import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { localHostelService } from '../../services/localHostelService';
import { useAuth } from '../../hooks/useAuth';
import { Hostel } from '../../types';
import { ImageUpload } from './ImageUpload';
import { IS_SUPABASE_CONFIGURED, AMENITIES_OPTIONS } from '../../utils/constants';

interface HostelFormProps {
  onSuccess?: (hostel: Hostel) => void;
  onCancel?: () => void;
  initialData?: Partial<Hostel>;
  mode?: 'create' | 'edit';
  showTitle?: boolean;
  showHeader?: boolean;
}

export const HostelForm: React.FC<HostelFormProps> = ({
  onSuccess,
  onCancel,
  initialData,
  mode = 'create',
  showTitle = true,
  showHeader = true,
}) => {
  const { theme } = useTheme();
  const styles = createThemedStyles(theme);
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    address: initialData?.address || '',
    price: initialData?.price?.toString() || '',
    contactPhone: initialData?.contactPhone || '',
    contactEmail: initialData?.contactEmail || '',
    amenities: initialData?.amenities || [],
    images: initialData?.images || [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Hostel name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.price.trim() || isNaN(Number(formData.price)) || Number(formData.price) <= 0) newErrors.price = 'Price must be a positive number';
    if (!formData.contactPhone.trim()) newErrors.contactPhone = 'Contact phone is required';
    if (!formData.contactEmail.trim() || !/\S+@\S+\.\S+/.test(formData.contactEmail)) newErrors.contactEmail = 'Valid email is required';
    if (IS_SUPABASE_CONFIGURED && formData.images.length === 0) newErrors.images = 'At least one image is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !user?.id) {
      if (!user?.id) Alert.alert('Error', 'You must be logged in');
      return;
    }
    setLoading(true);
    try {
      const hostelData = { ...formData, landlordId: user.id, price: parseFloat(formData.price), isActive: true };
      const result = mode === 'edit' && initialData?.id
        ? await localHostelService.updateHostel(initialData.id, hostelData)
        : await localHostelService.createHostel(hostelData);
      Alert.alert('Success', `Hostel ${mode === 'edit' ? 'updated' : 'created'} successfully!`);
      onSuccess?.(result);
    } catch (error) {
      Alert.alert('Error', 'Failed to save hostel.');
    } finally {
      setLoading(false);
    }
  };

  const toggleAmenity = (amenity: string) => {
    const { amenities } = formData;
    const newAmenities = amenities.includes(amenity) ? amenities.filter(a => a !== amenity) : [...amenities, amenity];
    setFormData(prev => ({ ...prev, amenities: newAmenities }));
  };

  const handleImagesChange = (images: any[]) => {
    const stringImages = images.map(img => (typeof img === 'string' ? img : img?.uri) || '').filter(Boolean);
    setFormData(prev => ({ ...prev, images: stringImages }));
    if (errors.images) setErrors(prev => ({ ...prev, images: '' }));
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary.main} />
          <Text style={styles.loadingText}>{`${mode === 'edit' ? 'Updating' : 'Creating'} hostel...`}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Header */}
      {showHeader && (
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onCancel}>
            <Ionicons name="arrow-back" size={24} color={theme.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{`${mode === 'edit' ? 'Edit' : 'Add New'} Hostel`}</Text>
          <View style={styles.headerSpacer} />
        </View>
      )}

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {showTitle && (
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{`${mode === 'edit' ? 'Edit' : 'Add New'} Hostel`}</Text>
            <Text style={styles.subtitle}>Fill in the details below to {mode === 'edit' ? 'update your hostel' : 'create your hostel listing'}</Text>
          </View>
        )}
        
        <FormInput 
          label="Hostel Name *" 
          value={formData.name} 
          onChangeText={t => setFormData(p => ({...p, name: t}))} 
          error={errors.name}
          placeholder="Enter hostel name"
        />
        <FormInput 
          label="Description *" 
          value={formData.description} 
          onChangeText={t => setFormData(p => ({...p, description: t}))} 
          error={errors.description} 
          multiline
          placeholder="Describe your hostel (facilities, atmosphere, etc.)"
        />
        <FormInput 
          label="Address *" 
          value={formData.address} 
          onChangeText={t => setFormData(p => ({...p, address: t}))} 
          error={errors.address}
          placeholder="Enter full address"
        />
        <FormInput 
          label="Monthly Rent (GHS) *" 
          value={formData.price} 
          onChangeText={t => setFormData(p => ({...p, price: t}))} 
          error={errors.price} 
          keyboardType="numeric"
          placeholder="Enter monthly rent amount"
        />
        <FormInput 
          label="Contact Phone *" 
          value={formData.contactPhone} 
          onChangeText={t => setFormData(p => ({...p, contactPhone: t}))} 
          error={errors.contactPhone} 
          keyboardType="phone-pad"
          placeholder="Enter contact phone number"
        />
        <FormInput 
          label="Contact Email *" 
          value={formData.contactEmail} 
          onChangeText={t => setFormData(p => ({...p, contactEmail: t}))} 
          error={errors.contactEmail} 
          keyboardType="email-address"
          placeholder="Enter contact email address"
        />

        <View style={styles.formGroup}>
          <Text style={styles.label}>Images</Text>
          {!IS_SUPABASE_CONFIGURED && (
            <View style={styles.warningContainer}>
              <Ionicons name="warning-outline" size={20} color={theme.warning.main} />
              <View style={styles.warningContent}>
                <Text style={styles.warningTitle}>Image Upload Disabled</Text>
                <Text style={styles.warningText}>Supabase is not configured. You can still create hostels without images.</Text>
              </View>
            </View>
          )}
          <ImageUpload 
            images={formData.images} 
            onImagesChange={handleImagesChange} 
            maxImages={6} 
            disabled={loading || !IS_SUPABASE_CONFIGURED} 
          />
          {errors.images && <Text style={styles.errorText}>{errors.images}</Text>}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Amenities</Text>
          <Text style={styles.amenitiesSubtitle}>Select the amenities available at your hostel</Text>
          <View style={styles.amenitiesContainer}>
            {AMENITIES_OPTIONS.map(amenity => (
              <TouchableOpacity 
                key={amenity} 
                style={[
                  styles.amenityChip, 
                  formData.amenities.includes(amenity) && styles.amenityChipSelected
                ]} 
                onPress={() => toggleAmenity(amenity)}
              >
                <Text style={[
                  styles.amenityChipText, 
                  formData.amenities.includes(amenity) && styles.amenityChipTextSelected
                ]}>
                  {amenity}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>{`${mode === 'edit' ? 'Update' : 'Create'} Hostel`}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

interface FormInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  multiline?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  placeholder: string;
}

const FormInput: React.FC<FormInputProps> = ({ 
  label, 
  value, 
  onChangeText, 
  error, 
  multiline = false, 
  keyboardType = 'default',
  placeholder 
}) => {
  const { theme } = useTheme();
  const styles = createThemedStyles(theme);
  
  return (
    <View style={styles.formGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[
          multiline ? styles.textArea : styles.input, 
          error && styles.inputError
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.text.placeholder}
        multiline={multiline}
        keyboardType={keyboardType}
        numberOfLines={multiline ? 4 : 1}
        textAlignVertical={multiline ? 'top' : 'center'}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const createThemedStyles = (theme: any) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.surface.primary,
    borderBottomWidth: 1,
    borderBottomColor: theme.border.separator,
    shadowColor: theme.shadow.small.shadowColor,
    shadowOffset: theme.shadow.small.shadowOffset,
    shadowOpacity: theme.shadow.small.shadowOpacity,
    shadowRadius: theme.shadow.small.shadowRadius,
    elevation: theme.shadow.small.elevation,
  },
  backButton: {
    padding: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  headerTitle: {
    flex: 1,
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semibold,
    color: theme.text.primary,
    textAlign: 'center',
    marginHorizontal: theme.spacing.md,
  },
  headerSpacer: {
    width: 40,
  },
  container: {
    flex: 1,
    padding: theme.spacing.md,
    backgroundColor: theme.background.primary,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.sizes.xxl,
    fontWeight: theme.typography.weights.bold,
    color: theme.text.primary,
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: theme.typography.sizes.md,
    color: theme.text.secondary,
    textAlign: 'center',
    lineHeight: theme.typography.lineHeights.normal,
  },
  formGroup: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
    marginBottom: theme.spacing.sm,
    color: theme.text.primary,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.border.input,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.typography.sizes.md,
    backgroundColor: theme.surface.input,
    color: theme.text.primary,
    minHeight: 48,
  },
  textArea: {
    borderWidth: 1,
    borderColor: theme.border.input,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.typography.sizes.md,
    backgroundColor: theme.surface.input,
    color: theme.text.primary,
    height: 100,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: theme.error.main,
    backgroundColor: theme.error.background,
  },
  errorText: {
    color: theme.error.main,
    fontSize: theme.typography.sizes.sm,
    marginTop: theme.spacing.xs,
    fontWeight: theme.typography.weights.medium,
  },
  amenitiesSubtitle: {
    fontSize: theme.typography.sizes.sm,
    color: theme.text.secondary,
    marginBottom: theme.spacing.md,
    lineHeight: theme.typography.lineHeights.normal,
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  amenityChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.round,
    borderWidth: 1,
    borderColor: theme.border.secondary,
    backgroundColor: theme.surface.secondary,
  },
  amenityChipSelected: {
    backgroundColor: theme.primary.main,
    borderColor: theme.primary.main,
  },
  amenityChipText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.text.secondary,
    fontWeight: theme.typography.weights.medium,
  },
  amenityChipTextSelected: {
    color: theme.primary.contrast,
    fontWeight: theme.typography.weights.semibold,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
  },
  cancelButton: {
    flex: 1,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.border.secondary,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  cancelButtonText: {
    fontSize: theme.typography.sizes.md,
    color: theme.text.secondary,
    fontWeight: theme.typography.weights.semibold,
  },
  submitButton: {
    flex: 2,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    shadowColor: theme.shadow.small.shadowColor,
    shadowOffset: theme.shadow.small.shadowOffset,
    shadowOpacity: theme.shadow.small.shadowOpacity,
    shadowRadius: theme.shadow.small.shadowRadius,
    elevation: theme.shadow.small.elevation,
  },
  submitButtonText: {
    fontSize: theme.typography.sizes.md,
    color: theme.primary.contrast,
    fontWeight: theme.typography.weights.semibold,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.background.primary,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.sizes.md,
    color: theme.text.secondary,
    fontWeight: theme.typography.weights.medium,
  },
  warningContainer: {
    backgroundColor: theme.warning.background,
    borderColor: theme.warning.main,
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  warningContent: {
    flex: 1,
    marginLeft: theme.spacing.sm,
  },
  warningTitle: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
    color: theme.warning.text,
    marginBottom: theme.spacing.xs,
  },
  warningText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.warning.text,
    lineHeight: theme.typography.lineHeights.normal,
  },
});
