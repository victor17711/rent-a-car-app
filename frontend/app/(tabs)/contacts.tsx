import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../src/context/LanguageContext';
import { API_URL } from '../../src/utils/api';

interface ContactInfo {
  phone: string;
  email: string;
  address: string;
  map_embed_url: string;
  whatsapp_link: string;
  viber_link: string;
  telegram_link: string;
}

export default function ContactsScreen() {
  const { t } = useLanguage();
  const [contacts, setContacts] = useState<ContactInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await fetch(`${API_URL}/api/contacts`);
      const data = await response.json();
      setContacts(data);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCall = () => {
    if (contacts?.phone) {
      Linking.openURL(`tel:${contacts.phone}`);
    }
  };

  const handleEmail = () => {
    if (contacts?.email) {
      Linking.openURL(`mailto:${contacts.email}`);
    }
  };

  const handleWhatsApp = () => {
    if (contacts?.whatsapp_link) {
      Linking.openURL(contacts.whatsapp_link);
    }
  };

  const handleViber = () => {
    if (contacts?.viber_link) {
      Linking.openURL(contacts.viber_link);
    }
  };

  const handleTelegram = () => {
    if (contacts?.telegram_link) {
      Linking.openURL(contacts.telegram_link);
    }
  };

  const handleOpenMap = () => {
    if (contacts?.map_embed_url) {
      Linking.openURL(contacts.map_embed_url);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4754eb" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('contactUs')}</Text>
      </View>

      {/* Map Section */}
      {contacts?.map_embed_url && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="location" size={22} color="#4754eb" />
            <Text style={styles.sectionTitle}>{t('ourLocation')}</Text>
          </View>
          <TouchableOpacity 
            style={styles.mapContainer} 
            onPress={handleOpenMap}
            activeOpacity={0.9}
          >
            <View style={styles.mapPlaceholder}>
              <Ionicons name="map" size={48} color="#4754eb" />
              <Text style={styles.mapText}>{contacts.address || t('ourLocation')}</Text>
              <View style={styles.mapButton}>
                <Ionicons name="open-outline" size={16} color="#fff" />
                <Text style={styles.mapButtonText}>{t('openInMaps')}</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* Address */}
      {contacts?.address && (
        <View style={styles.infoCard}>
          <View style={styles.infoIcon}>
            <Ionicons name="business" size={24} color="#4754eb" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>{t('address')}</Text>
            <Text style={styles.infoValue}>{contacts.address}</Text>
          </View>
        </View>
      )}

      {/* Phone */}
      {contacts?.phone && (
        <TouchableOpacity style={styles.infoCard} onPress={handleCall}>
          <View style={[styles.infoIcon, { backgroundColor: '#E8F5E9' }]}>
            <Ionicons name="call" size={24} color="#4CAF50" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>{t('callUs')}</Text>
            <Text style={styles.infoValue}>{contacts.phone}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
      )}

      {/* Email */}
      {contacts?.email && (
        <TouchableOpacity style={styles.infoCard} onPress={handleEmail}>
          <View style={[styles.infoIcon, { backgroundColor: '#E3F2FD' }]}>
            <Ionicons name="mail" size={24} color="#2196F3" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>{t('emailUs')}</Text>
            <Text style={styles.infoValue}>{contacts.email}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
      )}

      {/* Messenger Buttons */}
      <View style={styles.section}>
        {/* <View style={styles.sectionHeader}>
          <Ionicons name="chatbubbles" size={22} color="#4754eb" />
          <Text style={styles.sectionTitle}>{t('messageUs')}</Text>
        </View> */}
        
        <View style={styles.messengerContainer}>
          {contacts?.whatsapp_link && (
            <TouchableOpacity style={[styles.messengerButton, styles.whatsappButton]} onPress={handleWhatsApp}>
              <Ionicons name="logo-whatsapp" size={28} color="#fff" />
              <Text style={styles.messengerText}>WhatsApp</Text>
            </TouchableOpacity>
          )}
          
          {contacts?.viber_link && (
            <TouchableOpacity style={[styles.messengerButton, styles.viberButton]} onPress={handleViber}>
              <Ionicons name="chatbubble-ellipses" size={28} color="#fff" />
              <Text style={styles.messengerText}>Viber</Text>
            </TouchableOpacity>
          )}
          
          {contacts?.telegram_link && (
            <TouchableOpacity style={[styles.messengerButton, styles.telegramButton]} onPress={handleTelegram}>
              <Ionicons name="paper-plane" size={28} color="#fff" />
              <Text style={styles.messengerText}>Telegram</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  mapContainer: {
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#fff',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      },
    }),
  },
  mapPlaceholder: {
    height: 180,
    backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  mapText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4754eb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 12,
    gap: 6,
  },
  mapButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
      },
    }),
  },
  infoIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F0F4FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContent: {
    flex: 1,
    marginLeft: 14,
  },
  infoLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  messengerContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    flexWrap: 'wrap',
  },
  messengerButton: {
    flex: 1,
    minWidth: 100,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    borderRadius: 16,
    gap: 8,
  },
  whatsappButton: {
    backgroundColor: '#25D366',
  },
  viberButton: {
    backgroundColor: '#7360F2',
  },
  telegramButton: {
    backgroundColor: '#0088cc',
  },
  messengerText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});
