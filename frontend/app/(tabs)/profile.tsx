import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../src/context/AuthContext';
import { api } from '../../src/utils/api';
import { useLanguage } from '../../src/context/LanguageContext';

export default function ProfileScreen() {
  const { user, isAuthenticated, logout, updateUser, refreshUser } = useAuth();
  const router = useRouter();
  const { t, language, setLanguage } = useLanguage();
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [localLanguage, setLocalLanguage] = useState(user?.language || 'ro');

  useEffect(() => {
    if (user?.language) {
      setLocalLanguage(user.language);
    }
  }, [user?.language]);

  const handleLogout = () => {
    Alert.alert(
      t('logout'),
      t('logoutConfirm'),
      [
        { text: t('cancel'), style: 'cancel' },
        { 
          text: t('logoutButton'), 
          style: 'destructive', 
          onPress: async () => {
            await logout();
            router.replace('/');
          }
        },
      ]
    );
  };

  const handleLanguageChange = async (newLang: 'ro' | 'ru') => {
    try {
      setLocalLanguage(newLang);
      setLanguage(newLang);
      await api.updateLanguage(newLang);
      await refreshUser();
      Alert.alert(t('success'), `${t('languageChanged')} ${newLang === 'ro' ? 'Română' : 'Русский'}`);
    } catch (error: any) {
      setLocalLanguage(user?.language || 'ro');
      setLanguage(user?.language as 'ro' | 'ru' || 'ro');
      Alert.alert(t('error'), error.message || 'Nu s-a putut schimba limba');
    }
  };

  const handleBecomePartner = () => {
    router.push('/partner');
  };

  const handleChangeProfilePicture = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permisiune necesară', 'Te rugăm să permiți accesul la galerie pentru a schimba poza de profil.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets[0] && result.assets[0].base64) {
        setUploadingPhoto(true);
        try {
          const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
          await api.updateProfilePicture(base64Image);
          if (updateUser && user) {
            updateUser({ ...user, picture: base64Image });
          }
          Alert.alert('Succes', 'Poza de profil a fost actualizată!');
        } catch (error: any) {
          console.error('Upload error:', error);
          Alert.alert('Eroare', error?.message || 'Nu s-a putut actualiza poza de profil.');
        } finally {
          setUploadingPhoto(false);
        }
      }
    } catch (error: any) {
      console.error('Image picker error:', error);
      Alert.alert('Eroare', 'A apărut o eroare la selectarea imaginii.');
    }
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container} edges={[]}>
        <View style={styles.emptyContainer}>
          <Ionicons name="person-outline" size={64} color="#ccc" />
          <Text style={styles.emptyTitle}>{t('notAuthenticated')}</Text>
          <Text style={styles.emptyText}>
            {t('loginToSeeProfile')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <TouchableOpacity onPress={handleChangeProfilePicture} style={styles.avatarContainer}>
            {uploadingPhoto ? (
              <View style={styles.avatarPlaceholder}>
                <ActivityIndicator size="large" color="#fff" />
              </View>
            ) : user?.picture ? (
              <Image source={{ uri: user.picture }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={40} color="#fff" />
              </View>
            )}
            <View style={styles.editBadge}>
              <Ionicons name="camera" size={16} color="#fff" />
            </View>
          </TouchableOpacity>
          <Text style={styles.userName}>{user?.name}</Text>
          {user?.email && <Text style={styles.userEmail}>{user.email}</Text>}
          {user?.phone && <Text style={styles.userPhone}>{user.phone}</Text>}
          <TouchableOpacity style={styles.changePhotoButton} onPress={handleChangeProfilePicture}>
            <Text style={styles.changePhotoText}>Schimbă poza</Text>
          </TouchableOpacity>
          {user?.role === 'admin' && (
            <View style={styles.adminBadge}>
              <Ionicons name="shield-checkmark" size={14} color="#fff" />
              <Text style={styles.adminBadgeText}>Administrator</Text>
            </View>
          )}
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          <Text style={styles.menuTitle}>Cont</Text>
          
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/change-name')}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="create-outline" size={22} color="#007AFF" />
              <Text style={styles.menuItemText}>Schimbă numele</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(tabs)/bookings')}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="calendar-outline" size={22} color="#A31621" />
              <Text style={styles.menuItemText}>Rezervările mele</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/favorites')}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="heart-outline" size={22} color="#FF2D55" />
              <Text style={styles.menuItemText}>Favorite</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
        </View>

        {/* Language Section */}
        <View style={styles.menuSection}>
          <Text style={styles.menuTitle}>Limbă / Язык</Text>
          <View style={styles.languageContainer}>
            <TouchableOpacity
              style={[styles.languageButton, language === 'ro' && styles.languageButtonActive]}
              onPress={() => handleLanguageChange('ro')}
            >
              <Text style={[styles.languageText, language === 'ro' && styles.languageTextActive]}>
                Română
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.languageButton, language === 'ru' && styles.languageButtonActive]}
              onPress={() => handleLanguageChange('ru')}
            >
              <Text style={[styles.languageText, language === 'ru' && styles.languageTextActive]}>
                Русский
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Partner Section */}
        <View style={styles.menuSection}>
          <Text style={styles.menuTitle}>Colaborare</Text>
          <TouchableOpacity style={styles.menuItem} onPress={handleBecomePartner}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="people-outline" size={22} color="#34C759" />
              <Text style={styles.menuItemText}>Devino Partener</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.menuTitle}>Suport</Text>
          
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/faq')}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="help-circle-outline" size={22} color="#5856D6" />
              <Text style={styles.menuItemText}>Ajutor</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/terms')}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="document-text-outline" size={22} color="#666" />
              <Text style={styles.menuItemText}>Termeni și Condiții</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/privacy')}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="lock-closed-outline" size={22} color="#666" />
              <Text style={styles.menuItemText}>Politică de Confidențialitate</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color="#FF3B30" />
          <Text style={styles.logoutText}>Deconectează-te</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>DriveMate v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  profileHeader: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  editBadge: {
    position: 'absolute',
    bottom: 16,
    right: 0,
    backgroundColor: '#A31621',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  changePhotoButton: {
    marginBottom: 12,
  },
  changePhotoText: {
    color: '#A31621',
    fontSize: 14,
    fontWeight: '600',
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#A31621',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  userPhone: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#34C759',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  adminBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  languageContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  languageButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  languageButtonActive: {
    backgroundColor: '#A31621',
  },
  languageText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  languageTextActive: {
    color: '#fff',
  },
  menuSection: {
    backgroundColor: '#fff',
    marginTop: 16,
    paddingVertical: 8,
  },
  menuTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuItemText: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
    marginHorizontal: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#999',
    marginTop: 24,
    marginBottom: 40,
  },
});
