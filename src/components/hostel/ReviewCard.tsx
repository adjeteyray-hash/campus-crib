import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { Review } from '../../types/hostel';

// ... (interface is unchanged)

export const ReviewCard: React.FC<ReviewCardProps> = ({ review, isOwnReview = false }) => {
  const { theme } = useTheme();
  const styles = createThemedStyles(theme);

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(<Ionicons key={i} name={i <= rating ? 'star' : 'star-outline'} size={16} color={i <= rating ? theme.warning.main : theme.text.placeholder} />);
    }
    return stars;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Recently';
    try {
      const date = new Date(dateString);
      const diffDays = (new Date().getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
      if (diffDays < 1) return 'Today';
      if (diffDays < 2) return 'Yesterday';
      if (diffDays < 7) return `${Math.floor(diffDays)} days ago`;
      return date.toLocaleDateString();
    } catch { return 'Recently'; }
  };

  const getInitials = (name: string) => (name || '').split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2) || '??';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          {review.profilePictureUrl ? (
            <Image source={{ uri: review.profilePictureUrl }} style={styles.profileImage} />
          ) : (
            <View style={styles.profileInitials}><Text style={styles.initialText}>{getInitials(review.userName)}</Text></View>
          )}
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{review.userName || 'Anonymous'}{isOwnReview && <Text style={styles.ownReviewBadge}> (You)</Text>}</Text>
            <Text style={styles.date}>{formatDate(review.createdAt)}</Text>
          </View>
        </View>
        <View style={styles.ratingContainer}>{renderStars(review.rating)}</View>
      </View>
      {review.comment && <Text style={styles.comment}>{review.comment}</Text>}
    </View>
  );
};

const createThemedStyles = (theme: any) => StyleSheet.create({
  container: { backgroundColor: theme.surface.card, padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: theme.border.card, ...theme.shadow.small },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  userInfo: { flex: 1, marginRight: 12, flexDirection: 'row', alignItems: 'center' },
  profileImage: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  profileInitials: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.primary.main, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  initialText: { color: theme.primary.contrast, fontSize: 16, fontWeight: '600' },
  userDetails: { flex: 1 },
  userName: { fontSize: 16, fontWeight: '600', color: theme.text.primary, marginBottom: 4 },
  ownReviewBadge: { color: theme.primary.main, fontWeight: '500' },
  date: { fontSize: 12, color: theme.text.secondary },
  ratingContainer: { flexDirection: 'row', alignItems: 'center' },
  comment: { fontSize: 14, color: theme.text.primary, lineHeight: 20 },
});
