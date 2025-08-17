import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  Platform,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

interface ImageCarouselProps {
  images?: string[];
  hostelName?: string;
}

// ... (constants are unchanged)

export const ImageCarousel: React.FC<ImageCarouselProps> = ({ images, hostelName }) => {
  const { theme } = useTheme();
  const styles = createThemedStyles(theme);
  const [currentIndex, setCurrentIndex] = useState(0);

  const safeImages = images || [];

  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / width);
    setCurrentIndex(index);
  };

  if (!safeImages || safeImages.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.placeholderContainer}>
          <Text style={styles.placeholderIcon}>📍</Text>
          <Text style={styles.placeholderText}>No Images Available</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {safeImages.map((imageUrl, index) => (
          <View key={index} style={styles.imageContainer}>
            <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
          </View>
        ))}
      </ScrollView>
      
      {safeImages.length > 1 && (
        <View style={styles.paginationContainer}>
          {safeImages.map((_, index) => (
            <View key={index} style={[styles.paginationDot, index === currentIndex && styles.paginationDotActive]} />
          ))}
        </View>
      )}
      
      {safeImages.length > 1 && (
        <View style={styles.imageCounter}>
          <Text style={styles.imageCounterText}>{`${currentIndex + 1} / ${safeImages.length}`}</Text>
        </View>
      )}
    </View>
  );
};

const { width } = Dimensions.get('window');
const IMAGE_HEIGHT = 250;

const createThemedStyles = (theme: any) => StyleSheet.create({
  container: { height: IMAGE_HEIGHT, backgroundColor: theme.background.secondary },
  imageContainer: { width, height: IMAGE_HEIGHT },
  image: { width: '100%', height: '100%' },
  placeholderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  placeholderIcon: { fontSize: 48, marginBottom: 12 },
  placeholderText: { fontSize: 16, color: theme.text.tertiary, fontWeight: '500' },
  paginationContainer: { position: 'absolute', bottom: 16, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center' },
  paginationDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: theme.background.overlay, marginHorizontal: 4 },
  paginationDotActive: { backgroundColor: theme.primary.main, width: 10, height: 10, borderRadius: 5 },
  imageCounter: { position: 'absolute', top: 16, right: 16, backgroundColor: theme.background.overlay, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  imageCounterText: { color: theme.text.inverse, fontSize: 12, fontWeight: '600' },
});