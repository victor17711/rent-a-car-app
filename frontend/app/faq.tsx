import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../src/utils/api';
import { useAuth } from '../src/context/AuthContext';
import { useLanguage } from '../src/context/LanguageContext';

interface FAQ {
  faq_id: string;
  question_ro: string;
  answer_ro: string;
  question_ru: string;
  answer_ru: string;
  order: number;
}

export default function FAQScreen() {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    loadFaqs();
  }, []);

  const loadFaqs = async () => {
    try {
      const data = await api.getFaqs();
      setFaqs(data);
    } catch (error) {
      console.error('Failed to load FAQs:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: t('help'), headerShown: true, headerBackTitle: t('back') }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4754eb" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen options={{ title: t('help'), headerShown: true, headerBackTitle: t('back') }} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {t('faqTitle')}
          </Text>
          <Text style={styles.subtitle}>
            {t('findAnswers')}
          </Text>
        </View>

        <View style={styles.faqList}>
          {faqs.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="help-circle-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>
                {t('noFaqs')}
              </Text>
            </View>
          ) : (
            faqs.map((faq) => (
              <TouchableOpacity
                key={faq.faq_id}
                style={styles.faqItem}
                onPress={() => toggleExpand(faq.faq_id)}
              >
                <View style={styles.faqHeader}>
                  <Text style={styles.question}>
                    {language === 'ro' ? faq.question_ro : faq.question_ru}
                  </Text>
                  <Ionicons
                    name={expandedId === faq.faq_id ? 'chevron-up' : 'chevron-down'}
                    size={24}
                    color="#666"
                  />
                </View>
                {expandedId === faq.faq_id && (
                  <Text style={styles.answer}>
                    {language === 'ro' ? faq.answer_ro : faq.answer_ru}
                  </Text>
                )}
              </TouchableOpacity>
            ))
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
  header: {
    backgroundColor: '#fff',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  faqList: {
    padding: 16,
  },
  faqItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  question: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
    marginRight: 12,
  },
  answer: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
  },
});
