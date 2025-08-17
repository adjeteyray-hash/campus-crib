import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Review } from '../../types/hostel';

// ... (interface is unchanged)

export const ReviewStats: React.FC<ReviewStatsProps> = ({ reviews }) => {
  const { theme } = useTheme();
  const styles = createThemedStyles(theme);

  const stats = React.useMemo(() => {
    if (!reviews || reviews.length === 0) return null;
    const totalReviews = reviews.length;
    const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let sum = 0;
    reviews.forEach(r => { if (r.rating >= 1 && r.rating <= 5) { ratingCounts[r.rating]++; sum += r.rating; } });
    if (sum === 0) return null;
    const averageRating = Math.round((sum / totalReviews) * 10) / 10;
    const percentages = Object.keys(ratingCounts).reduce((acc, key) => ({ ...acc, [key]: (ratingCounts[key] / totalReviews) * 100 }), {});
    return { totalReviews, averageRating, ratingCounts, percentages };
  }, [reviews]);

  if (!stats) return null;

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return theme.success.main;
    if (rating >= 3) return theme.warning.main;
    return theme.error.main;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Rating Distribution</Text>
        <View style={styles.overallRating}>
          <Text style={styles.ratingNumber}>{stats.averageRating}</Text>
          <Text style={styles.ratingLabel}>/5</Text>
        </View>
      </View>
      <Text style={styles.totalReviews}>{`${stats.totalReviews} total reviews`}</Text>
      <View style={styles.progressBars}>
        {[5, 4, 3, 2, 1].map(rating => (
          <View key={rating} style={styles.ratingRow}>
            <Text style={styles.ratingText}>{`${rating} stars`}</Text>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressFill, { width: `${stats.percentages[rating]}%`, backgroundColor: getRatingColor(rating) }]} />
            </View>
            <Text style={styles.percentageText}>{`${Math.round(stats.percentages[rating])}%`}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const createThemedStyles = (theme: any) => StyleSheet.create({
  container: { backgroundColor: theme.surface.card, padding: 16, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: theme.border.card },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  title: { fontSize: 18, fontWeight: '600', color: theme.text.primary },
  overallRating: { flexDirection: 'row', alignItems: 'baseline' },
  ratingNumber: { fontSize: 24, fontWeight: '700', color: theme.primary.main },
  ratingLabel: { fontSize: 16, color: theme.text.secondary, marginLeft: 4 },
  totalReviews: { fontSize: 14, color: theme.text.secondary, marginBottom: 16 },
  progressBars: { gap: 12 },
  ratingRow: { flexDirection: 'row', alignItems: 'center' },
  ratingText: { fontSize: 14, fontWeight: '500', color: theme.text.primary, width: 60 },
  progressBarContainer: { flex: 1, height: 8, backgroundColor: theme.surface.input, borderRadius: 4, overflow: 'hidden', marginHorizontal: 12 },
  progressFill: { height: '100%', borderRadius: 4 },
  percentageText: { fontSize: 12, color: theme.text.secondary, width: 35, textAlign: 'right' },
});
