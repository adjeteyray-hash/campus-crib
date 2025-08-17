import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { LoadingSpinner } from '../../components/common';
import { bookingHistoryService } from '../../services/bookingHistory';
import { useAuth } from '../../hooks/useAuth';
import { BookingHistoryEntry } from '../../types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ... (interfaces and constants are unchanged)

export const HistoryScreen: React.FC<HistoryScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createThemedStyles(theme);
  const { user } = useAuth();
  const [history, setHistory] = useState<BookingHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'viewed' | 'contacted'>('all');

  const fetchHistory = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const historyData = await bookingHistoryService.getStudentBookingHistory(user.id, 100, 0);
      setHistory(historyData);
    } catch (err) {
      Alert.alert('Error', 'Failed to load history.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(useCallback(() => { fetchHistory(); }, [fetchHistory]));

  const filteredHistory = history
    .filter(item => filter === 'all' || item.action === filter)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  if (loading) return <View style={[styles.center, { paddingTop: insets.top }]}><LoadingSpinner message="Loading history..." /></View>;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Booking History</Text>
      </View>
      <View style={styles.filterContainer}>
        <FilterButton label="All" active={filter === 'all'} onPress={() => setFilter('all')} />
        <FilterButton label="Viewed" active={filter === 'viewed'} onPress={() => setFilter('viewed')} />
        <FilterButton label="Contacted" active={filter === 'contacted'} onPress={() => setFilter('contacted')} />
      </View>
      <FlatList
        data={filteredHistory}
        renderItem={({ item }) => <HistoryItem item={item} onPress={() => navigation.navigate('HostelDetail', { hostelId: item.hostelId })} />}
        keyExtractor={item => item.id}
        ListEmptyComponent={<View style={styles.center}><Text style={styles.emptyText}>No history found.</Text></View>}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const FilterButton = ({ label, active, onPress }) => {
  const { theme } = useTheme();
  const styles = createThemedStyles(theme);
  return (
    <TouchableOpacity style={[styles.filterButton, active && styles.activeFilterButton]} onPress={onPress}>
      <Text style={[styles.filterButtonText, active && styles.activeFilterButtonText]}>{label}</Text>
    </TouchableOpacity>
  );
};

const HistoryItem = ({ item, onPress }) => {
  const { theme } = useTheme();
  const styles = createThemedStyles(theme);
  return (
    <TouchableOpacity style={styles.historyItem} onPress={onPress}>
      <View>
        <Text style={styles.hostelName}>{item.hostelName}</Text>
        <Text style={styles.timestamp}>{new Date(item.timestamp).toLocaleString()}</Text>
      </View>
      <Text style={styles.actionText}>{item.action}</Text>
    </TouchableOpacity>
  );
};

const createThemedStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background.primary },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background.primary },
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: theme.border.separator },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: theme.text.primary },
  filterContainer: { flexDirection: 'row', justifyContent: 'space-around', padding: 16, borderBottomWidth: 1, borderBottomColor: theme.border.separator },
  filterButton: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: theme.surface.secondary },
  activeFilterButton: { backgroundColor: theme.primary.main },
  filterButtonText: { color: theme.text.secondary, fontWeight: '500' },
  activeFilterButtonText: { color: theme.primary.contrast },
  listContent: { paddingVertical: 8 },
  historyItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: theme.border.separator },
  hostelName: { fontSize: 16, fontWeight: '600', color: theme.text.primary },
  timestamp: { fontSize: 12, color: theme.text.secondary, marginTop: 4 },
  actionText: { fontSize: 14, color: theme.text.secondary, textTransform: 'capitalize' },
  emptyText: { color: theme.text.secondary, fontSize: 16 },
});