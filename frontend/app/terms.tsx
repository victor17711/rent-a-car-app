import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../src/utils/api';
import { useAuth } from '../src/context/AuthContext';
import { useLanguage } from '../src/context/LanguageContext';

export default function TermsScreen() {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const router = useRouter();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/profile');
    }
  };

  const BackButton = () => (
    <TouchableOpacity 
      onPress={handleGoBack}
      style={backStyles.button}
      hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
    >
      <Ionicons name="chevron-back" size={28} color="#4754eb" />
      <Text style={backStyles.label}>{t('back')}</Text>
    </TouchableOpacity>
  );

  useEffect(() => {
    loadContent();
  }, [language]);

  const loadContent = async () => {
    try {
      const data = await api.getLegalContent('terms');
      setContent(language === 'ro' ? data.content_ro : data.content_ru);
    } catch (error) {
      console.error('Failed to load terms:', error);
      setContent('');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen 
          options={{ 
            title: t('termsAndConditions'), 
            headerShown: true, 
            headerBackTitle: t('back'),
            headerLeft: () => <BackButton />,
          }} 
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4754eb" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen 
        options={{ 
          title: t('termsAndConditions'), 
          headerShown: true, 
          headerBackTitle: t('back'),
          headerLeft: () => <BackButton />,
        }} 
      />
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        <View style={styles.content}>
          {content ? (
            <Text style={styles.text}>{content}</Text>
          ) : (
            <Text style={styles.emptyText}>
              {t('contentNotAvailable')}
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const backStyles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: Platform.OS === 'ios' ? -8 : 0,
    paddingVertical: 8,
    paddingRight: 16,
  },
  label: {
    fontSize: 17,
    color: '#4754eb',
    marginLeft: -4,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    backgroundColor: '#fff',
    padding: 20,
    margin: 16,
    borderRadius: 12,
  },
  text: {
    fontSize: 14,
    lineHeight: 22,
    color: '#333',
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    padding: 40,
  },
});