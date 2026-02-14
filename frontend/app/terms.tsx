import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { api } from '../src/utils/api';
import { useAuth } from '../src/context/AuthContext';

export default function TermsScreen() {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const language = user?.language || 'ro';

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
        <Stack.Screen options={{ title: language === 'ro' ? 'Termeni și Condiții' : 'Условия использования', headerShown: true }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#A31621" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen options={{ title: language === 'ro' ? 'Termeni și Condiții' : 'Условия использования', headerShown: true }} />
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        <View style={styles.content}>
          {content ? (
            <Text style={styles.text}>{content}</Text>
          ) : (
            <Text style={styles.emptyText}>
              {language === 'ro' ? 'Conținutul nu este disponibil momentan.' : 'Содержание недоступно в данный момент.'}
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
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