import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { HostelCard } from '../../components/hostel';
import { LoadingSpinner } from '../../components/common';
import { localHostelService } from '../../services/localHostelService';
import { HostelSearchResult } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';

// ... (interfaces and constants are unchanged)

export const SearchScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { theme } = useTheme();
  const styles = createThemedStyles(theme);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<HostelSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(true);
  const insets = useSafeAreaInsets();

  const debouncedSearch = useMemo(() => {
    let timeoutId: NodeJS.Timeout;
    return (searchQuery: string) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (searchQuery.trim().length > 0) performSearch(searchQuery.trim());
        else { setResults([]); setShowHistory(true); }
      }, 500);
    };
  }, []);

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setError(null);
    setShowHistory(false);
    try {
      const searchResults = await localHostelService.searchHostels(searchQuery);
      setResults(searchResults.hostels);
      await addToSearchHistory(searchQuery);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  }, []);

  const addToSearchHistory = useCallback(async (searchQuery: string) => {
    try {
      const history = [searchQuery, ...searchHistory.filter(item => item !== searchQuery)].slice(0, 10);
      setSearchHistory(history);
      await AsyncStorage.setItem('search_history', JSON.stringify(history));
    } catch (error) { console.warn('Failed to save search history:', error); }
  }, [searchHistory]);

  useEffect(() => {
    (async () => {
      try {
        const history = await AsyncStorage.getItem('search_history');
        if (history) setSearchHistory(JSON.parse(history));
      } catch (error) { console.warn('Failed to load search history:', error); }
    })();
  }, []);

  const clearSearchHistory = useCallback(async () => {
    try {
      await AsyncStorage.removeItem('search_history');
      setSearchHistory([]);
    } catch (error) { console.warn('Failed to clear search history:', error); }
  }, []);

  const handleQueryChange = (text: string) => { setQuery(text); debouncedSearch(text); };
  const handleHistoryItemPress = (historyQuery: string) => { setQuery(historyQuery); performSearch(historyQuery); };
  const handleHostelPress = (hostel: HostelSearchResult) => navigation.navigate('HostelDetail', { hostelId: hostel.id });

  const renderHostelCard = ({ item }: { item: HostelSearchResult }) => <HostelCard hostel={item} onPress={handleHostelPress} />;
  const renderHistoryItem = ({ item }: { item: string }) => (
    <TouchableOpacity style={styles.historyItem} onPress={() => handleHistoryItemPress(item)}>
      <Text style={styles.historyText}>{item}</Text>
    </TouchableOpacity>
  );

  const renderContent = () => {
    if (loading) return <LoadingSpinner />;
    if (showHistory) {
      return searchHistory.length > 0 ? (
        <View style={styles.historyContainer}>
          <View style={styles.historyHeader}>
            <Text style={styles.historyTitle}>Recent Searches</Text>
            <TouchableOpacity onPress={clearSearchHistory}><Text style={styles.clearHistoryText}>Clear</Text></TouchableOpacity>
          </View>
          <FlatList data={searchHistory} renderItem={renderHistoryItem} keyExtractor={(item, index) => `${item}-${index}`} />
        </View>
      ) : null;
    }
    if (error) return <View style={styles.centerMessage}><Text style={styles.errorText}>{error}</Text></View>;
    if (results.length === 0) return <View style={styles.centerMessage}><Text style={styles.emptyMessage}>No results found.</Text></View>;
    return <FlatList data={results} renderItem={renderHostelCard} keyExtractor={item => item.id} contentContainerStyle={{ paddingBottom: insets.bottom + 20 }} />;
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search hostels..."
          placeholderTextColor={theme.text.primary}
          value={query}
          onChangeText={handleQueryChange}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          onSubmitEditing={() => query.trim() && performSearch(query.trim())}
        />
      </View>
      <View style={styles.contentContainer}>{renderContent()}</View>
    </View>
  );
};

const createThemedStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background.primary },
  searchContainer: { padding: 16, borderBottomWidth: 1, borderBottomColor: theme.border.separator, backgroundColor: theme.surface.primary },
  searchInput: { height: 48, backgroundColor: theme.surface.input, borderRadius: 24, paddingHorizontal: 20, fontSize: 16, color: theme.text.primary },
  contentContainer: { flex: 1 },
  historyContainer: { flex: 1, backgroundColor: theme.background.primary },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: theme.border.separator },
  historyTitle: { fontSize: 18, fontWeight: '600', color: theme.text.primary },
  clearHistoryText: { fontSize: 14, color: theme.primary.main, fontWeight: '500' },
  historyItem: { padding: 16, borderBottomWidth: 1, borderBottomColor: theme.border.separator },
  historyText: { fontSize: 16, color: theme.text.secondary },
  centerMessage: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyMessage: { fontSize: 16, color: theme.text.secondary, textAlign: 'center' },
  errorText: { fontSize: 16, color: theme.error.main, textAlign: 'center' },
});