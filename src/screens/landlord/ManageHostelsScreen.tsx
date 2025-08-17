import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  FlatList,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { localHostelService } from '../../services/localHostelService';
import { HostelForm } from '../../components/forms';
import { HostelCard } from '../../components/hostel';
import { Hostel } from '../../types';
import { LandlordStackScreenProps } from '../../types/navigation';

const { width: screenWidth } = Dimensions.get('window');
const CARD_SPACING = 20;
const CARD_WIDTH = (screenWidth - (CARD_SPACING * 3)) / 2; // 2 columns with generous spacing
const CARD_HEIGHT = 240; // Increased height for better text visibility and spacing

export const ManageHostelsScreen: React.FC<LandlordStackScreenProps<'MyHostelsMain'>> = ({ navigation, route }) => {
  const { theme } = useTheme();
  const styles = createThemedStyles(theme);
  const { user } = useAuth();
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingHostel, setEditingHostel] = useState<Hostel | null>(null);

  const loadHostels = useCallback(async () => {
    if (!user?.id) return;
    try {
      const landlordHostels = await localHostelService.getHostelsByLandlord(user.id);
      setHostels(landlordHostels);
    } catch (error) {
      Alert.alert('Error', 'Failed to load hostels.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => { loadHostels(); }, [loadHostels]);

  useFocusEffect(useCallback(() => {
    if (route?.params?.action === 'edit' && route?.params?.hostelData) {
      setEditingHostel(route.params.hostelData);
      setShowAddForm(true);
      navigation.setParams({ action: undefined, hostelData: undefined });
    }
  }, [route?.params, navigation]));

  const handleFormSuccess = () => { setShowAddForm(false); setEditingHostel(null); loadHostels(); };
  const handleFormCancel = () => { setShowAddForm(false); setEditingHostel(null); };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="home-outline" size={80} color={theme.text.secondary} />
      <Text style={styles.emptyTitle}>No hostels yet</Text>
      <Text style={styles.emptyText}>Add your first hostel to get started.</Text>
      <TouchableOpacity style={styles.addButton} onPress={() => setShowAddForm(true)}>
        <Text style={styles.addButtonText}>Add Hostel</Text>
      </TouchableOpacity>
    </View>
  );

  const renderHostelItem = ({ item }: { item: Hostel }) => (
    <View style={styles.cardContainer}>
      <HostelCard 
        hostel={item} 
        onPress={() => navigation.navigate('HostelDetail', { hostelId: item.id })} 
        showManagementIndicator 
        cardWidth={CARD_WIDTH}
        cardHeight={CARD_HEIGHT}
      />
    </View>
  );

  if (showAddForm) return <HostelForm mode={editingHostel ? 'edit' : 'create'} initialData={editingHostel || undefined} onSuccess={handleFormSuccess} onCancel={handleFormCancel} />;
  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={theme.primary.main} /></View>;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Hostels</Text>
          <Text style={styles.headerSubtitle}>Manage your hostel listings</Text>
        </View>
        
        <FlatList
          data={hostels}
          renderItem={renderHostelItem}
          keyExtractor={item => item.id}
          numColumns={2}
          columnWrapperStyle={styles.rowContainer}
          contentContainerStyle={[
            styles.gridContainer,
            hostels.length === 0 && styles.emptyContentContainer
          ]}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={loadHostels} 
              tintColor={theme.primary.main} 
            />
          }
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
        />
      </View>
    </SafeAreaView>
  );
};

const createThemedStyles = (theme: any) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.background.primary,
  },
  container: { 
    flex: 1, 
    backgroundColor: theme.background.primary 
  },
  header: {
    backgroundColor: theme.surface.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.border.separator,
    shadowColor: theme.shadow.small.shadowColor,
    shadowOffset: theme.shadow.small.shadowOffset,
    shadowOpacity: theme.shadow.small.shadowOpacity,
    shadowRadius: theme.shadow.small.shadowRadius,
    elevation: theme.shadow.small.elevation,
  },
  headerTitle: {
    fontSize: theme.typography.sizes.xxl,
    fontWeight: theme.typography.weights.bold,
    color: theme.text.primary,
    marginBottom: theme.spacing.xs,
  },
  headerSubtitle: {
    fontSize: theme.typography.sizes.md,
    color: theme.text.secondary,
    fontWeight: theme.typography.weights.regular,
  },
  center: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: theme.background.primary 
  },
  emptyContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: theme.spacing.xl,
    minHeight: 400 
  },
  emptyContentContainer: { 
    flexGrow: 1, 
    justifyContent: 'center' 
  },
  emptyTitle: { 
    fontSize: theme.typography.sizes.xxl, 
    fontWeight: theme.typography.weights.bold, 
    color: theme.text.primary, 
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  emptyText: { 
    fontSize: theme.typography.sizes.md, 
    color: theme.text.secondary, 
    textAlign: 'center', 
    marginBottom: theme.spacing.lg,
    lineHeight: theme.typography.lineHeights.normal,
  },
  addButton: { 
    backgroundColor: theme.primary.main, 
    paddingVertical: theme.spacing.md, 
    paddingHorizontal: theme.spacing.lg, 
    borderRadius: theme.borderRadius.md,
    shadowColor: theme.shadow.small.shadowColor,
    shadowOffset: theme.shadow.small.shadowOffset,
    shadowOpacity: theme.shadow.small.shadowOpacity,
    shadowRadius: theme.shadow.small.shadowRadius,
    elevation: theme.shadow.small.elevation,
  },
  addButtonText: { 
    color: theme.primary.contrast, 
    fontSize: theme.typography.sizes.md, 
    fontWeight: theme.typography.weights.semibold 
  },
  gridContainer: { 
    padding: theme.spacing.lg 
  },
  rowContainer: {
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  cardContainer: {
    width: CARD_WIDTH,
    marginBottom: theme.spacing.md,
  },
  itemSeparator: {
    height: theme.spacing.md,
  },
});

export default ManageHostelsScreen;
