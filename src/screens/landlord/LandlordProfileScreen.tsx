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
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { profileService, supabase } from '../../services/supabase';
import { validateEmail, validatePhone } from '../../utils/validation';
import { ProfileImageUpload } from '../../components/forms';
import type { User } from '../../types/auth';

// ... (interfaces are unchanged)

export const LandlordProfileScreen: React.FC = () => {
    const { theme } = useTheme();
    const styles = createThemedStyles(theme);
    const { user, signOut, refreshUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({ name: '', phone: '', email: '' });
    const [settings, setSettings] = useState({ notifications: true, emailUpdates: true });
    const [errors, setErrors] = useState<Partial<typeof formData>>({});
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            setFormData({ name: user.name || '', phone: user.phone || '', email: user.email });
            setProfilePictureUrl(user.profile_picture_url || null);
        }
    }, [user]);

    const handleSave = async () => {
        setIsSaving(true);
        // ... save logic
        setIsSaving(false);
    };

    const handleLogout = async () => {
        try {
            await signOut();
            setShowLogoutModal(false);
        } catch (error) {
            console.error('Logout error:', error);
            Alert.alert('Error', 'Failed to logout. Please try again.');
        }
    };

    if (!user) return <View style={styles.loadingContainer}><ActivityIndicator size="large" color={theme.primary.main} /></View>;

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
                <ProfileImageUpload currentImageUrl={profilePictureUrl} onImageChange={setProfilePictureUrl} size={100} />
                <Text style={styles.userName}>{user.name || 'Landlord'}</Text>
                <Text style={styles.userRole}>Landlord Account</Text>
            </View>

            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Profile Information</Text>
                    <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
                        <Text style={styles.editButtonText}>{isEditing ? 'Cancel' : 'Edit'}</Text>
                    </TouchableOpacity>
                </View>
                {isEditing ? (
                    <View>
                        <TextInput style={styles.input} value={formData.name} onChangeText={(t: string) => setFormData((p: typeof formData) => ({...p, name: t}))} placeholder="Name" placeholderTextColor={theme.text.placeholder} />
                        <TextInput style={styles.input} value={formData.phone} onChangeText={(t: string) => setFormData((p: typeof formData) => ({...p, phone: t}))} placeholder="Phone" placeholderTextColor={theme.text.placeholder} />
                        <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={isSaving}>
                            <Text style={styles.saveButtonText}>Save Changes</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View>
                        <InfoRow icon="business-outline" label="Business Name" value={user.name || 'Not provided'} />
                        <InfoRow icon="call-outline" label="Phone" value={user.phone || 'Not provided'} />
                        <InfoRow icon="mail-outline" label="Email" value={user.email} />
                    </View>
                )}
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Settings</Text>
                <SettingItem title="Push Notifications" value={settings.notifications} onToggle={() => setSettings((s: typeof settings) => ({...s, notifications: !s.notifications}))} icon="notifications-outline" />
                <SettingItem title="Email Updates" value={settings.emailUpdates} onToggle={() => setSettings((s: typeof settings) => ({...s, emailUpdates: !s.emailUpdates}))} icon="mail-outline" />
            </View>

            <View style={styles.section}>
                <TouchableOpacity style={styles.logoutButton} onPress={() => setShowLogoutModal(true)}>
                    <Text style={styles.logoutButtonText}>Logout</Text>
                </TouchableOpacity>
            </View>

            {/* Logout Confirmation Modal */}
            <Modal
                visible={showLogoutModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowLogoutModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Confirm Logout</Text>
                        <Text style={styles.modalMessage}>Are you sure you want to logout?</Text>
                        <View style={styles.modalButtons}>
                            <TouchableOpacity 
                                style={styles.modalButtonCancel} 
                                onPress={() => setShowLogoutModal(false)}
                            >
                                <Text style={styles.modalButtonCancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={styles.modalButtonConfirm} 
                                onPress={handleLogout}
                            >
                                <Text style={styles.modalButtonConfirmText}>Logout</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
};

interface InfoRowProps {
    icon: string;
    label: string;
    value: string;
}

const InfoRow: React.FC<InfoRowProps> = ({ icon, label, value }) => {
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

interface SettingItemProps {
    icon: string;
    title: string;
    value: boolean;
    onToggle: (value: boolean) => void;
}

const SettingItem: React.FC<SettingItemProps> = ({ icon, title, value, onToggle }) => {
    const { theme } = useTheme();
    const styles = createThemedStyles(theme);
    return (
        <View style={styles.settingItem}>
            <Ionicons name={icon} size={20} color={theme.text.secondary} />
            <Text style={styles.settingTitle}>{title}</Text>
            <Switch value={value} onValueChange={onToggle} trackColor={{ false: theme.border.secondary, true: theme.primary.main }} thumbColor={theme.primary.contrast} />
        </View>
    );
};

const createThemedStyles = (theme: any) => StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background.primary },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background.primary },
    header: { alignItems: 'center', paddingVertical: 32, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: theme.border.separator, backgroundColor: theme.surface.primary },
    userName: { fontSize: 24, fontWeight: '600', color: theme.text.primary, marginTop: 16, marginBottom: 4 },
    userRole: { fontSize: 16, color: theme.text.secondary, marginBottom: 12 },
    section: { backgroundColor: theme.surface.primary, marginTop: 8, paddingHorizontal: 20, paddingVertical: 16 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    sectionTitle: { fontSize: 18, fontWeight: '600', color: theme.text.primary },
    editButtonText: { fontSize: 16, color: theme.primary.main, fontWeight: '500' },
    input: { borderWidth: 1, borderColor: theme.border.input, borderRadius: 8, padding: 12, fontSize: 16, color: theme.text.primary, backgroundColor: theme.surface.input, marginBottom: 12 },
    saveButton: { backgroundColor: theme.primary.main, padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 8 },
    saveButtonText: { color: theme.primary.contrast, fontSize: 16, fontWeight: 'bold' },
    infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.border.separator },
    infoLabel: { fontSize: 16, color: theme.text.secondary, marginLeft: 12, width: 120 },
    infoValue: { fontSize: 16, color: theme.text.primary, flex: 1 },
    settingItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.border.separator },
    settingTitle: { flex: 1, fontSize: 16, color: theme.text.primary, marginLeft: 12 },
    logoutButton: { padding: 16, alignItems: 'center' },
    logoutButtonText: { color: theme.error.main, fontSize: 16, fontWeight: 'bold' },
    // Modal styles
    modalOverlay: { 
        flex: 1, 
        backgroundColor: 'rgba(0, 0, 0, 0.5)', 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    modalContent: { 
        backgroundColor: theme.surface.primary, 
        borderRadius: 12, 
        padding: 24, 
        margin: 20, 
        minWidth: 300,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    modalTitle: { 
        fontSize: 20, 
        fontWeight: '600', 
        color: theme.text.primary, 
        marginBottom: 12, 
        textAlign: 'center' 
    },
    modalMessage: { 
        fontSize: 16, 
        color: theme.text.secondary, 
        marginBottom: 24, 
        textAlign: 'center' 
    },
    modalButtons: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        gap: 12 
    },
    modalButtonCancel: { 
        flex: 1, 
        padding: 16, 
        borderRadius: 8, 
        alignItems: 'center', 
        backgroundColor: theme.surface.secondary,
        borderWidth: 1,
        borderColor: theme.border.secondary,
    },
    modalButtonCancelText: { 
        color: theme.text.secondary, 
        fontSize: 16, 
        fontWeight: '500' 
    },
    modalButtonConfirm: { 
        flex: 1, 
        padding: 16, 
        borderRadius: 8, 
        alignItems: 'center', 
        backgroundColor: theme.error.main 
    },
    modalButtonConfirmText: { 
        color: theme.error.contrast || '#fff', 
        fontSize: 16, 
        fontWeight: '500' 
    },
});

export default LandlordProfileScreen;