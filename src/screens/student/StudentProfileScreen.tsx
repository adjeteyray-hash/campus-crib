import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Switch,
  ActivityIndicator,
  Modal,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { profileService } from '../../services/supabase';
import { validateEmail, validatePhone } from '../../utils/validation';
import type { User } from '../../types/auth';
import type { ProfileUpdate } from '../../types/database';

// ... (interfaces are unchanged)

interface InfoRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}

interface SettingItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  value: boolean;
  onToggle: () => void;
}

interface ActionItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
}

export const StudentProfileScreen: React.FC = () => {
  const { user, signOut, refreshUser } = useAuth();
  const { theme, isLight } = useTheme();
  const styles = createThemedStyles(theme);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const insets = useSafeAreaInsets();
  
  const [formData, setFormData] = useState({ name: '', phone: '', email: '' });
  const [settings, setSettings] = useState({ notifications: true, emailUpdates: false, privacyMode: false });
  const [errors, setErrors] = useState<Partial<typeof formData>>({});
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({ name: user.name || '', phone: user.phone || '', email: user.email });
    }
  }, [user]);

  const validateForm = () => {
    const newErrors: Partial<typeof formData> = {};
    if (!formData.email.trim() || validateEmail(formData.email)) newErrors.email = 'A valid email is required';
    if (formData.phone.trim() && validatePhone(formData.phone)) newErrors.phone = 'A valid phone number is required';
    if (formData.name.trim().length > 0 && formData.name.trim().length < 2) newErrors.name = 'Name must be at least 2 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveProfile = async () => {
    if (!user || !validateForm()) return;
    setIsSaving(true);
    try {
      const updates: ProfileUpdate = { name: formData.name.trim(), phone: formData.phone.trim() };
      await profileService.updateProfile(user.id, updates);
      await refreshUser();
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (user) setFormData({ name: user.name || '', phone: user.phone || '', email: user.email });
    setErrors({});
    setIsEditing(false);
  };

  const handleLogout = () => setShowLogoutModal(true);

  const performLogout = async () => {
    setIsLoading(true);
    try {
      await signOut();
    } catch (error) {
      Alert.alert('Error', 'Failed to logout.');
    } finally {
      setIsLoading(false);
      setShowLogoutModal(false);
    }
  };

  const handleSettingToggle = (setting: keyof typeof settings) => setSettings(p => ({ ...p, [setting]: !p[setting] }));

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.primary.main} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={40} color={theme.primary.main} />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user.name || 'Student'}</Text>
            <Text style={styles.userRole}>Student Account</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Profile Information</Text>
            {!isEditing ? (
              <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
                <Ionicons name="pencil" size={16} color={theme.primary.main} />
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.editActions}>
                <TouchableOpacity style={styles.cancelButton} onPress={handleCancelEdit} disabled={isSaving}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.saveButton, isSaving && styles.saveButtonDisabled]} onPress={handleSaveProfile} disabled={isSaving}>
                  {isSaving ? <ActivityIndicator size="small" color={theme.primary.contrast} /> : <Text style={styles.saveButtonText}>Save</Text>}
                </TouchableOpacity>
              </View>
            )}
          </View>

          {isEditing ? (
            <View style={styles.form}>
              <TextInput style={styles.input} value={formData.name} onChangeText={t => setFormData(p => ({...p, name: t}))} placeholder="Name" placeholderTextColor={theme.text.placeholder} />
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
              <TextInput style={styles.input} value={formData.phone} onChangeText={t => setFormData(p => ({...p, phone: t}))} placeholder="Phone" placeholderTextColor={theme.text.placeholder} keyboardType="phone-pad" />
              {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
              <TextInput style={[styles.input, styles.inputDisabled]} value={formData.email} placeholder="Email" placeholderTextColor={theme.text.placeholder} editable={false} />
            </View>
          ) : (
            <View style={styles.profileInfo}>
              <InfoRow icon="person-outline" label="Name" value={user.name || 'Not provided'} />
              <InfoRow icon="call-outline" label="Phone" value={user.phone || 'Not provided'} />
              <InfoRow icon="mail-outline" label="Email" value={user.email} />
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <SettingItem title="Push Notifications" description="Receive notifications about new hostels" value={settings.notifications} onToggle={() => handleSettingToggle('notifications')} icon="notifications-outline" />
          <SettingItem title="Email Updates" description="Receive emails about important updates" value={settings.emailUpdates} onToggle={() => handleSettingToggle('emailUpdates')} icon="mail-outline" />
          <SettingItem title="Privacy Mode" description="Hide contact info from landlords" value={settings.privacyMode} onToggle={() => handleSettingToggle('privacyMode')} icon="shield-outline" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <ActionItem text="Help & Support" icon="help-circle-outline" />
          <ActionItem text="Terms & Privacy" icon="document-text-outline" />
          <TouchableOpacity style={[styles.actionItem, styles.logoutItem]} onPress={handleLogout} disabled={isLoading}>
            <Ionicons name="log-out-outline" size={20} color={theme.error.main} />
            <Text style={styles.logoutText}>{isLoading ? 'Logging out...' : 'Logout'}</Text>
            {isLoading && <ActivityIndicator size="small" color={theme.error.main} />}
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal visible={showLogoutModal} transparent={true} animationType="fade" onRequestClose={() => setShowLogoutModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Logout</Text>
            <Text style={styles.modalMessage}>Are you sure you want to logout?</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalButtonCancel} onPress={() => setShowLogoutModal(false)} disabled={isLoading}>
                <Text style={styles.modalButtonCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButtonLogout, isLoading && styles.modalButtonDisabled]} onPress={performLogout} disabled={isLoading}>
                {isLoading ? <ActivityIndicator size="small" color={theme.primary.contrast} /> : <Text style={styles.modalButtonLogoutText}>Logout</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const InfoRow = ({ icon, label, value }: InfoRowProps) => {
  const { theme } = useTheme();
  const styles = createThemedStyles(theme);
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={20} color={theme.text.secondary} />
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
};

const SettingItem = ({ icon, title, description, value, onToggle }: SettingItemProps) => {
  const { theme } = useTheme();
  const styles = createThemedStyles(theme);
  return (
    <View style={styles.settingItem}>
      <Ionicons name={icon} size={20} color={theme.text.secondary} />
      <View style={styles.settingText}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      <Switch value={value} onValueChange={onToggle} trackColor={{ false: theme.border.secondary, true: theme.primary.main }} thumbColor={theme.primary.contrast} />
    </View>
  );
};

const ActionItem = ({ icon, text }: ActionItemProps) => {
  const { theme } = useTheme();
  const styles = createThemedStyles(theme);
  return (
    <TouchableOpacity style={styles.actionItem}>
      <Ionicons name={icon} size={20} color={theme.text.secondary} />
      <Text style={styles.actionText}>{text}</Text>
      <Ionicons name="chevron-forward" size={16} color={theme.text.placeholder} />
    </TouchableOpacity>
  );
};

const createThemedStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background.primary },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background.primary },
  loadingText: { marginTop: 12, fontSize: 16, color: theme.text.secondary },
  header: { 
    padding: 20, 
    borderBottomWidth: 1, 
    borderBottomColor: theme.border.separator, 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: theme.background.primary,
  },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: theme.surface.secondary, justifyContent: 'center', alignItems: 'center' },
  userInfo: { marginLeft: 16 },
  userName: { fontSize: 22, fontWeight: 'bold', color: theme.text.primary },
  userRole: { fontSize: 14, color: theme.text.secondary },
  section: { marginTop: 16, paddingHorizontal: 20, paddingVertical: 12 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: theme.text.primary },
  editButton: { flexDirection: 'row', alignItems: 'center', padding: 8, borderRadius: 8, backgroundColor: theme.surface.secondary },
  editButtonText: { marginLeft: 6, fontSize: 14, fontWeight: '500', color: theme.primary.main },
  editActions: { flexDirection: 'row', gap: 8 },
  cancelButton: { padding: 8, borderRadius: 8 },
  cancelButtonText: { fontSize: 14, fontWeight: '500', color: theme.text.secondary },
  saveButton: { padding: 8, borderRadius: 8, backgroundColor: theme.primary.main, minWidth: 60, alignItems: 'center' },
  saveButtonDisabled: { opacity: 0.6 },
  saveButtonText: { fontSize: 14, fontWeight: '500', color: theme.primary.contrast },
  form: { gap: 16 },
  input: { borderWidth: 1, borderColor: theme.border.input, borderRadius: 8, padding: 12, fontSize: 16, color: theme.text.primary, backgroundColor: theme.surface.input },
  inputDisabled: { backgroundColor: theme.background.secondary },
  errorText: { marginTop: 4, fontSize: 12, color: theme.error.main },
  profileInfo: { marginTop: 8 },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.border.separator },
  infoLabel: { fontSize: 16, marginLeft: 12, color: theme.text.secondary, width: 80 },
  infoValue: { fontSize: 16, color: theme.text.primary, flex: 1 },
  settingItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.border.separator },
  settingText: { marginLeft: 12, flex: 1 },
  settingTitle: { fontSize: 16, color: theme.text.primary },
  settingDescription: { fontSize: 12, color: theme.text.secondary, marginTop: 2 },
  actionItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: theme.border.separator },
  actionText: { marginLeft: 12, fontSize: 16, color: theme.text.primary, flex: 1 },
  logoutItem: { borderBottomWidth: 0 },
  logoutText: { marginLeft: 12, fontSize: 16, color: theme.error.main, flex: 1 },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background.overlay },
  modalContent: { backgroundColor: theme.surface.elevated, borderRadius: 12, padding: 24, width: '85%', alignItems: 'center', ...theme.shadow.large },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: theme.text.primary, marginBottom: 12 },
  modalMessage: { fontSize: 16, color: theme.text.secondary, textAlign: 'center', marginBottom: 24 },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  modalButtonCancel: { padding: 12, borderRadius: 8, borderWidth: 1, borderColor: theme.border.secondary, flex: 1, marginRight: 8, alignItems: 'center' },
  modalButtonCancelText: { fontSize: 16, fontWeight: '500', color: theme.text.secondary },
  modalButtonLogout: { padding: 12, borderRadius: 8, backgroundColor: theme.error.main, flex: 1, marginLeft: 8, alignItems: 'center' },
  modalButtonLogoutText: { fontSize: 16, fontWeight: '500', color: theme.primary.contrast },
  modalButtonDisabled: { opacity: 0.6 },
});

export default StudentProfileScreen;