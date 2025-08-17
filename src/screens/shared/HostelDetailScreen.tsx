import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Linking,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { ImageCarousel, ReviewCard, ReviewStats } from '../../components/hostel';
import { LoadingSpinner } from '../../components/common';
import { ReviewForm } from '../../components/forms';
import { localHostelService } from '../../services/localHostelService';
import { reviewsService } from '../../services/reviews';
import { useAuth } from '../../hooks/useAuth';
import { HostelDetail, Review } from '../../types';

interface HostelDetailScreenProps {
  navigation: any;
  route: {
    params: {
      hostelId: string;
    };
  };
}

export const HostelDetailScreen: React.FC<HostelDetailScreenProps> = ({ navigation, route }) => {
  const { hostelId } = route.params;
  const { theme } = useTheme();
  const styles = createThemedStyles(theme);
  const { user } = useAuth();
  const [hostel, setHostel] = useState<HostelDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);

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

  useEffect(() => { fetchHostel(); }, [fetchHostel]);

  const handleContact = (type: 'phone' | 'email') => {
    const contact = type === 'phone' ? hostel?.contactPhone : hostel?.contactEmail;
    if (!contact) return Alert.alert('Not Available', `This hostel has not provided a ${type} number.`);
    const url = type === 'phone' ? `tel:${contact}` : `mailto:${contact}`;
    Linking.canOpenURL(url).then(supported => {
      if (supported) Linking.openURL(url);
      else Alert.alert('Error', 'Cannot handle this action.');
    });
  };

  if (loading) return <View style={styles.center}><LoadingSpinner /></View>;
  if (!hostel) return <View style={styles.center}><Text style={styles.errorText}>Hostel not found.</Text></View>;

  return (
    <View style={styles.container}>
      <FlatList
        data={[{ id: 'content' }]}
        renderItem={() => (
          <>
            <ImageCarousel images={hostel.images || []} hostelName={hostel.name} />
            <View style={styles.content}>
              <View style={styles.header}>
                <Text style={styles.hostelName}>{hostel.name}</Text>
                <Text style={styles.price}>{`GH₵${hostel.price}/month`}</Text>
              </View>
              <Text style={styles.address}>{hostel.address}</Text>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Description</Text>
                <Text style={styles.description}>{hostel.description}</Text>
              </View>
              <Amenities amenities={hostel.amenities} />
              <ContactButtons onContact={handleContact} />
              <Reviews hostelId={hostelId} />
            </View>
          </>
        )}
        keyExtractor={() => 'content'}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          user?.role === 'student' ? (
            <TouchableOpacity style={styles.reviewButton} onPress={() => setShowReviewForm(true)}>
              <Text style={styles.reviewButtonText}>Write a Review</Text>
            </TouchableOpacity>
          ) : null
        }
      />
      <ReviewForm visible={showReviewForm} onClose={() => setShowReviewForm(false)} onSubmit={fetchHostel} hostelId={hostelId} userId={user?.id} userName={user?.name} />
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
        {amenities.map((item: string, i: number) => <View key={i} style={styles.amenityTag}><Text style={styles.amenityText}>{item}</Text></View>)}
      </View>
    </View>
  );
};

const ContactButtons = ({ onContact }: { onContact: (type: 'phone' | 'email') => void }) => {
  const { theme } = useTheme();
  const styles = createThemedStyles(theme);
  return (
    <View style={styles.contactContainer}>
      <TouchableOpacity style={[styles.contactButton, styles.phoneButton]} onPress={() => onContact('phone')}><Text style={styles.contactButtonText}>Call</Text></TouchableOpacity>
      <TouchableOpacity style={[styles.contactButton, styles.emailButton]} onPress={() => onContact('email')}><Text style={styles.contactButtonText}>Email</Text></TouchableOpacity>
    </View>
  );
};

const Reviews = ({ hostelId }: { hostelId: string }) => {
  const { theme } = useTheme();
  const styles = createThemedStyles(theme);
  const [reviews, setReviews] = useState<Review[]>([]);
  
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const hostelReviews = await reviewsService.getHostelReviews(hostelId);
        setReviews(hostelReviews);
      } catch (error) {
        Alert.alert('Error', 'Failed to load hostel reviews.');
      }
    };
    fetchReviews();
  }, [hostelId]);
  
  if (!reviews.length) return null;
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Reviews</Text>
      <ReviewStats reviews={reviews} />
      {reviews.map(r => <ReviewCard key={r.id} review={r} />)}
    </View>
  );
};

const createThemedStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background.primary },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background.primary },
  errorText: { color: theme.error.main, fontSize: 16 },
  content: { padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, backgroundColor: theme.background.primary, padding: 16, borderRadius: 8 },
  hostelName: { flex: 1, fontSize: 24, fontWeight: 'bold', color: theme.text.primary, marginRight: 16 },
  price: { fontSize: 20, fontWeight: '600', color: theme.primary.main },
  address: { fontSize: 16, color: theme.text.secondary, marginBottom: 24 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: theme.text.primary, marginBottom: 12 },
  description: { fontSize: 16, color: theme.text.primary, lineHeight: 24 },
  amenitiesContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  amenityTag: { backgroundColor: theme.surface.secondary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  amenityText: { fontSize: 14, color: theme.text.secondary, fontWeight: '500' },
  contactContainer: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 16 },
  contactButton: { flex: 1, padding: 16, borderRadius: 8, alignItems: 'center', marginHorizontal: 8 },
  phoneButton: { backgroundColor: theme.success.main },
  emailButton: { backgroundColor: theme.info.main },
  contactButtonText: { color: theme.primary.contrast, fontSize: 16, fontWeight: 'bold' },
  reviewButton: { backgroundColor: theme.primary.main, padding: 16, margin: 16, borderRadius: 8, alignItems: 'center' },
  reviewButtonText: { color: theme.primary.contrast, fontSize: 16, fontWeight: 'bold' },
});