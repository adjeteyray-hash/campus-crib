import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { Review } from '../../types/hostel';
import { reviewsService, CreateReviewData } from '../../services/reviews';

// ... (interfaces are unchanged)

export const ReviewForm: React.FC<ReviewFormProps> = ({
  visible,
  onClose,
  onSubmit,
  hostelId,
  existingReview,
  userId,
  userName,
  profilePictureUrl,
}) => {
  const { theme } = useTheme();
  const styles = createThemedStyles(theme);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating);
      setComment(existingReview.comment || '');
    } else {
      setRating(5);
      setComment('');
    }
  }, [existingReview, visible]);

  const handleSubmit = async () => {
    if (!comment.trim() || rating < 1) {
      Alert.alert('Invalid Input', 'Please provide a rating and a comment.');
      return;
    }
    setSubmitting(true);
    try {
      if (existingReview) {
        await reviewsService.updateReview(existingReview.id, { rating, comment: comment.trim() });
      } else {
        const reviewData: CreateReviewData = { hostelId, rating, comment: comment.trim(), profilePictureUrl };
        await reviewsService.createReview(reviewData, userId, userName, profilePictureUrl);
      }
      Alert.alert('Success', `Review ${existingReview ? 'updated' : 'submitted'} successfully!`);
      onSubmit();
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = () => {
    if (!existingReview) return;
    Alert.alert('Delete Review', 'Are you sure you want to delete this review?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await reviewsService.deleteReview(existingReview.id);
          Alert.alert('Success', 'Review deleted successfully!');
          onSubmit();
          onClose();
        } catch (error) {
          Alert.alert('Error', 'Failed to delete review.');
        }
      }},
    ]);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{existingReview ? 'Edit' : 'Write a'} Review</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}><Ionicons name="close" size={24} color={theme.text.secondary} /></TouchableOpacity>
        </View>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.ratingSection}>
            <Text style={styles.sectionTitle}>Your Rating</Text>
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map(i => (
                <TouchableOpacity key={i} onPress={() => setRating(i)} style={styles.starButton}>
                  <Ionicons name={i <= rating ? 'star' : 'star-outline'} size={32} color={i <= rating ? theme.warning.main : theme.text.placeholder} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={styles.commentSection}>
            <Text style={styles.sectionTitle}>Your Comment</Text>
            <TextInput style={styles.commentInput} value={comment} onChangeText={setComment} placeholder="Share your experience..." multiline numberOfLines={6} placeholderTextColor={theme.text.placeholder} />
            <Text style={styles.characterCount}>{`${comment.length}/500`}</Text>
          </View>
          <View style={styles.buttonsContainer}>
            <TouchableOpacity style={[styles.submitButton, submitting && styles.disabledButton]} onPress={handleSubmit} disabled={submitting}>
              <Text style={styles.buttonText}>{submitting ? 'Submitting...' : (existingReview ? 'Update' : 'Submit')}</Text>
            </TouchableOpacity>
            {existingReview && <TouchableOpacity style={[styles.deleteButton, submitting && styles.disabledButton]} onPress={handleDelete} disabled={submitting}><Text style={styles.buttonText}>Delete</Text></TouchableOpacity>}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const createThemedStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background.primary },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: theme.border.separator, backgroundColor: theme.surface.primary },
  title: { fontSize: 20, fontWeight: '600', color: theme.text.primary },
  closeButton: { padding: 4 },
  content: { flex: 1, padding: 16 },
  ratingSection: { backgroundColor: theme.surface.card, padding: 16, borderRadius: 12, marginBottom: 16, alignItems: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: theme.text.primary, marginBottom: 16 },
  starsContainer: { flexDirection: 'row', marginBottom: 8 },
  starButton: { padding: 4, marginHorizontal: 2 },
  commentSection: { backgroundColor: theme.surface.card, padding: 16, borderRadius: 12, marginBottom: 16 },
  commentInput: { borderWidth: 1, borderColor: theme.border.input, borderRadius: 8, padding: 12, fontSize: 16, color: theme.text.primary, minHeight: 120, backgroundColor: theme.surface.input, textAlignVertical: 'top' },
  characterCount: { fontSize: 12, color: theme.text.secondary, textAlign: 'right', marginTop: 4 },
  buttonsContainer: { gap: 12 },
  submitButton: { backgroundColor: theme.primary.main, paddingVertical: 16, borderRadius: 8, alignItems: 'center' },
  deleteButton: { backgroundColor: theme.error.main, paddingVertical: 16, borderRadius: 8, alignItems: 'center' },
  disabledButton: { opacity: 0.6 },
  buttonText: { color: theme.primary.contrast, fontSize: 16, fontWeight: '600' },
});
