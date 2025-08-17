import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  ScrollView,
} from 'react-native';
import { Hostel } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';
import { ACCESSIBILITY_LABELS, ACCESSIBILITY_HINTS } from '../../utils/accessibility';

interface HostelCardProps {
  hostel: Hostel;
  onPress: (hostel: Hostel) => void;
  cardWidth?: number;
  cardHeight?: number;
  showManagementIndicator?: boolean;
}

const { width } = Dimensions.get('window');

export const HostelCard: React.FC<HostelCardProps> = ({ 
  hostel, 
  onPress, 
  cardWidth, 
  showManagementIndicator = false
}) => {
  const { theme } = useTheme();
  const styles = createThemedStyles(theme);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const actualCardWidth = cardWidth || width;
  
  const handlePress = () => {
    onPress(hostel);
  };

  const formatLastUpdate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'today';
    if (diffInDays === 1) return '1 day ago';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    const weeks = Math.floor(diffInDays / 7);
    if (weeks === 1) return '1 week ago';
    return `${weeks} weeks ago`;
  };

  const hasImages = hostel.images && hostel.images.length > 0;
  const imageCount = hasImages ? hostel.images.length : 0;

  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const scrollViewWidth = event.nativeEvent.layoutMeasurement.width;
    const index = Math.round(contentOffsetX / scrollViewWidth);
    setCurrentImageIndex(Math.max(0, Math.min(index, imageCount - 1)));
  };

  const renderImagePreview = () => {
    if (!hasImages) {
      return (
        <View style={styles.placeholderContainer}>
          <Text style={styles.placeholderText}>📍</Text>
          <Text style={styles.placeholderLabel}>No Image</Text>
        </View>
      );
    }

    return (
      <>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          style={styles.imageScrollView}
          contentContainerStyle={{ width: actualCardWidth * imageCount }}
          testID="hostel-card-image-carousel"
        >
          {hostel.images.map((imageUrl, index) => (
            <View key={index} style={{ width: actualCardWidth, height: 150 }}>
              <Image
                source={{ uri: imageUrl }}
                style={styles.carouselImage}
                resizeMode="cover"
                accessibilityLabel={`Photo ${index + 1} of ${imageCount} of ${hostel.name}`}
              />
            </View>
          ))}
        </ScrollView>
        
        <View style={styles.imageCounter}>
          <Text style={styles.imageCounterText}>{`${currentImageIndex + 1}/${imageCount}`}</Text>
        </View>
        
        {imageCount > 1 && (
          <View style={styles.paginationContainer}>
            {hostel.images.map((_, index) => (
              <View
                key={index}
                style={[styles.paginationDot, index === currentImageIndex && styles.paginationDotActive]}
              />
            ))}
          </View>
        )}
      </>
    );
  };

  return (
    <TouchableOpacity
      style={[styles.container, cardWidth ? { width: cardWidth } : null]}
      onPress={handlePress}
      activeOpacity={0.8}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`${ACCESSIBILITY_LABELS.hostel.hostelCard}: ${hostel.name}`}
      accessibilityHint={ACCESSIBILITY_HINTS.hostel.hostelCard}
      testID="hostel-card"
    >
      <View style={styles.imageContainer}>
        {renderImagePreview()}
      </View>
      <View style={styles.detailsContainer}>
        <Text style={styles.name} numberOfLines={1}>{hostel.name}</Text>
        <Text style={styles.address} numberOfLines={1}>{hostel.address}</Text>
        <Text style={styles.price}>GH₵{hostel.price}</Text>
        {hostel.amenities && hostel.amenities.length > 0 && (
          <Text style={styles.amenitiesText} numberOfLines={1}>
            {hostel.amenities.join(' • ')}
          </Text>
        )}
      </View>
      
      {showManagementIndicator && (
        <View style={styles.managementIndicator}>
          <View style={[styles.statusBadge, hostel.isActive && styles.statusActive]}>
            <Text style={[styles.statusText, hostel.isActive && styles.statusTextActive]}>
              {hostel.isActive ? 'Active' : 'Inactive'}
            </Text>
          </View>
          <Text style={styles.lastUpdateText} numberOfLines={1}>
            {hostel.updated_at ? `Updated ${formatLastUpdate(hostel.updated_at)}` : 'No date available'}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const createThemedStyles = (theme: any) => StyleSheet.create({
  container: {
    backgroundColor: theme.surface.card,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.border.card,
    ...Platform.select({
      ios: { shadowColor: theme.shadow.medium.shadowColor, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
      android: { elevation: 3 },
    }),
  },
  imageContainer: {
    height: 120,
    borderTopLeftRadius: theme.borderRadius.md,
    borderTopRightRadius: theme.borderRadius.md,
    overflow: 'hidden',
    backgroundColor: theme.background.secondary,
  },
  detailsContainer: {
    padding: theme.spacing.sm,
  },
  name: { fontSize: theme.typography.sizes.md, fontWeight: theme.typography.weights.bold, color: theme.text.primary, marginBottom: theme.spacing.xs },
  address: { fontSize: theme.typography.sizes.xs, color: theme.text.secondary, marginBottom: theme.spacing.xs },
  price: { fontSize: theme.typography.sizes.sm, fontWeight: theme.typography.weights.bold, color: theme.primary.main, marginBottom: theme.spacing.xs },
  amenitiesText: { fontSize: theme.typography.sizes.xxs, color: theme.text.tertiary },
  placeholderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  placeholderText: { fontSize: 32 },
  placeholderLabel: { fontSize: theme.typography.sizes.sm, color: theme.text.secondary },
  imageScrollView: { flex: 1 },
  carouselImage: { width: '100%', height: '100%' },
  imageCounter: { position: 'absolute', top: theme.spacing.xs, right: theme.spacing.xs, backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: theme.spacing.xs, paddingVertical: 2, borderRadius: theme.borderRadius.round },
  imageCounterText: { color: theme.text.inverse, fontSize: theme.typography.sizes.xxs, fontWeight: '600' },
  paginationContainer: { position: 'absolute', bottom: theme.spacing.xs, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center' },
  paginationDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.6)', marginHorizontal: 3 },
  paginationDotActive: { backgroundColor: theme.primary.main, width: 8, height: 8, borderRadius: 4 },
  managementIndicator: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: theme.spacing.sm, borderTopWidth: 1, borderTopColor: theme.border.separator, backgroundColor: theme.background.secondary },
  statusBadge: { paddingHorizontal: theme.spacing.xs, paddingVertical: 2, borderRadius: theme.borderRadius.sm, backgroundColor: theme.surface.secondary },
  statusActive: { backgroundColor: theme.success.main },
  statusText: { fontSize: theme.typography.sizes.xxs, color: theme.text.secondary, fontWeight: '600' },
  statusTextActive: { color: theme.success.text },
  lastUpdateText: { fontSize: theme.typography.sizes.xxs, color: theme.text.tertiary, flexShrink: 1, textAlign: 'right' },
});