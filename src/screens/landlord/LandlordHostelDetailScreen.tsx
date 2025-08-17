import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { ImageCarousel, ReviewCard, ReviewStats } from '../../components/hostel';
import { LoadingSpinner } from '../../components/common';
import { localHostelService } from '../../services/localHostelService';
import { reviewsService } from '../../services/reviews';
import { useAuth } from '../../hooks/useAuth';
import { HostelDetail, Review } from '../../types';
import { LandlordStackScreenProps } from '../../types/navigation';

interface LandlordHostelDetailScreenProps {
  navigation: LandlordStackScreenProps<'HostelDetail'>['navigation'];
  route: LandlordStackScreenProps<'HostelDetail'>['route'];
}

export const LandlordHostelDetailScreen: React.FC<LandlordHostelDetailScreenProps> = ({ 
  navigation, 
  route 
}) => {
  const { hostelId } = route.params;
  const { theme } = useTheme();
  const styles = createThemedStyles(theme);
  const { user } = useAuth();
  const [hostel, setHostel] = useState<HostelDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchHostel = useCallback(async () => {
    setLoading(true);
    try {
      const hostelDetail = await localHostelService.getHostelDetail(hostelId);
      setHostel(hostelDetail);
    } catch (error) {
      Alert.alert('Error', 'Failed to load hostel details.');
    } finally {
      setLoading(false);
    }
  }, [hostelId]);

  useEffect(() => { 
    fetchHostel(); 
  }, [fetchHostel]);

  const handleEditHostel = () => {
    if (!hostel) return;
    
    // Navigate to edit form with hostel data
    navigation.navigate('EditHostel', { 
      hostelId: hostelId,
      hostelData: hostel
    });
  };

  const handleDeleteHostel = () => {
    if (!hostel) return;

    Alert.alert(
      'Delete Hostel',
      `Are you sure you want to delete "${hostel.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await localHostelService.deleteHostel(hostelId);
              Alert.alert('Success', 'Hostel deleted successfully');
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete hostel');
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner />
        <Text style={styles.loadingText}>Loading hostel details...</Text>
      </View>
    );
  }

  if (!hostel) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color={theme.error.main} />
        <Text style={styles.errorTitle}>Hostel Not Found</Text>
        <Text style={styles.errorText}>The hostel you're looking for doesn't exist or has been removed.</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchHostel}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={[{ id: 'content' }]}
        renderItem={() => (
          <>
            <ImageCarousel images={hostel.images || []} hostelName={hostel.name} />
            <View style={styles.content}>
              <View style={styles.header}>
                <View style={styles.titleSection}>
                  <Text style={styles.hostelName}>{hostel.name}</Text>
                  <View style={styles.statusBadge}>
                    <Ionicons 
                      name={hostel.isActive ? "checkmark-circle" : "close-circle"} 
                      size={16} 
                      color={hostel.isActive ? theme.success.main : theme.error.main} 
                    />
                    <Text style={[
                      styles.statusText, 
                      { color: hostel.isActive ? theme.success.main : theme.error.main }
                    ]}>
                      {hostel.isActive ? 'Active' : 'Inactive'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.price}>{`GH₵${hostel.price}/month`}</Text>
              </View>
              
              <Text style={styles.address}>{hostel.address}</Text>
              
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Description</Text>
                <Text style={styles.description}>{hostel.description}</Text>
              </View>
              
              <Amenities amenities={hostel.amenities} />
              
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Contact Information</Text>
                <View style={styles.contactInfo}>
                  <View style={styles.contactItem}>
                    <Ionicons name="call-outline" size={20} color={theme.text.secondary} />
                    <Text style={styles.contactText}>{hostel.contactPhone || 'Not provided'}</Text>
                  </View>
                  <View style={styles.contactItem}>
                    <Ionicons name="mail-outline" size={20} color={theme.text.secondary} />
                    <Text style={styles.contactText}>{hostel.contactEmail || 'Not provided'}</Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Listing Details</Text>
                <View style={styles.detailsGrid}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Created</Text>
                    <Text style={styles.detailValue}>
                      {hostel.created_at ? new Date(hostel.created_at).toLocaleDateString() : 'Unknown'}
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Last Updated</Text>
                    <Text style={styles.detailValue}>
                      {hostel.updated_at ? new Date(hostel.updated_at).toLocaleDateString() : 'Unknown'}
                    </Text>
                  </View>
                </View>
              </View>
              
              <Reviews hostelId={hostelId} />
            </View>
          </>
        )}
        keyExtractor={() => 'content'}
        showsVerticalScrollIndicator={false}
      />
      
      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteHostel}>
          <Ionicons name="trash-outline" size={20} color={theme.error.text} />
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.editButton} onPress={handleEditHostel}>
          <Ionicons name="create-outline" size={20} color={theme.primary.contrast} />
          <Text style={styles.editButtonText}>Edit Hostel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const Amenities = ({ amenities }: { amenities: string[] }) => {
  if (!amenities?.length) return null;
  const { theme } = useTheme();
  const styles = createThemedStyles(theme);
  
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Amenities</Text>
      <View style={styles.amenitiesContainer}>
        {amenities.map((item: string, i: number) => (
          <View key={i} style={styles.amenityTag}>
            <Text style={styles.amenityText}>{item}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const Reviews = ({ hostelId }: { hostelId: string }) => {
  const { theme } = useTheme();
  const styles = createThemedStyles(theme);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const hostelReviews = await reviewsService.getHostelReviews(hostelId);
        setReviews(hostelReviews);
      } catch (error) {
        console.error('Failed to load reviews:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [hostelId]);
  
  if (loading) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Reviews</Text>
        <View style={styles.reviewsLoading}>
          <LoadingSpinner />
          <Text style={styles.reviewsLoadingText}>Loading reviews...</Text>
        </View>
      </View>
    );
  }
  
  if (!reviews.length) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Reviews</Text>
        <View style={styles.noReviews}>
          <Ionicons name="chatbubble-outline" size={48} color={theme.text.secondary} />
          <Text style={styles.noReviewsText}>No reviews yet</Text>
          <Text style={styles.noReviewsSubtext}>Be the first to get a review for your hostel!</Text>
        </View>
      </View>
    );
  }
  
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Reviews</Text>
      <ReviewStats reviews={reviews} />
      {reviews.map(review => (
        <ReviewCard key={review.id} review={review} />
      ))}
    </View>
  );
};

const createThemedStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background.primary,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.background.primary,
    padding: theme.spacing.xl,
  },
  errorTitle: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    color: theme.text.primary,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  errorText: {
    fontSize: theme.typography.sizes.md,
    color: theme.text.secondary,
    textAlign: 'center',
    lineHeight: theme.typography.lineHeights.normal,
    marginBottom: theme.spacing.lg,
  },
  retryButton: {
    backgroundColor: theme.primary.main,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  retryButtonText: {
    color: theme.primary.contrast,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
  },
  content: {
    padding: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
    backgroundColor: theme.surface.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    shadowColor: theme.shadow.small.shadowColor,
    shadowOffset: theme.shadow.small.shadowOffset,
    shadowOpacity: theme.shadow.small.shadowOpacity,
    shadowRadius: theme.shadow.small.shadowRadius,
    elevation: theme.shadow.small.elevation,
  },
  titleSection: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  hostelName: {
    fontSize: theme.typography.sizes.xxl,
    fontWeight: theme.typography.weights.bold,
    color: theme.text.primary,
    marginBottom: theme.spacing.sm,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold,
    marginLeft: theme.spacing.xs,
  },
  price: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    color: theme.primary.main,
  },
  address: {
    fontSize: theme.typography.sizes.md,
    color: theme.text.secondary,
    marginBottom: theme.spacing.xl,
    lineHeight: theme.typography.lineHeights.normal,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semibold,
    color: theme.text.primary,
    marginBottom: theme.spacing.md,
  },
  description: {
    fontSize: theme.typography.sizes.md,
    color: theme.text.primary,
    lineHeight: theme.typography.lineHeights.normal,
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  amenityTag: {
    backgroundColor: theme.surface.secondary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.round,
  },
  amenityText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.text.secondary,
    fontWeight: theme.typography.weights.medium,
  },
  contactInfo: {
    gap: theme.spacing.md,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  contactText: {
    fontSize: theme.typography.sizes.md,
    color: theme.text.primary,
    flex: 1,
  },
  detailsGrid: {
    flexDirection: 'row',
    gap: theme.spacing.lg,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: theme.typography.sizes.sm,
    color: theme.text.secondary,
    marginBottom: theme.spacing.xs,
    fontWeight: theme.typography.weights.medium,
  },
  detailValue: {
    fontSize: theme.typography.sizes.md,
    color: theme.text.primary,
    fontWeight: theme.typography.weights.semibold,
  },
  reviewsLoading: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  reviewsLoadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.sizes.md,
    color: theme.text.secondary,
  },
  noReviews: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  noReviewsText: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semibold,
    color: theme.text.primary,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  noReviewsSubtext: {
    fontSize: theme.typography.sizes.md,
    color: theme.text.secondary,
    textAlign: 'center',
    lineHeight: theme.typography.lineHeights.normal,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.surface.primary,
    borderTopWidth: 1,
    borderTopColor: theme.border.separator,
    shadowColor: theme.shadow.small.shadowColor,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: theme.shadow.small.shadowOpacity,
    shadowRadius: theme.shadow.small.shadowRadius,
    elevation: theme.shadow.small.elevation,
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.error.main,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.xs,
  },
  deleteButtonText: {
    color: theme.error.text,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
  },
  editButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.primary.main,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.xs,
    shadowColor: theme.shadow.small.shadowColor,
    shadowOffset: theme.shadow.small.shadowOffset,
    shadowOpacity: theme.shadow.small.shadowOpacity,
    shadowRadius: theme.shadow.small.shadowRadius,
    elevation: theme.shadow.small.elevation,
  },
  editButtonText: {
    color: theme.primary.contrast,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
  },
});

export default LandlordHostelDetailScreen;
