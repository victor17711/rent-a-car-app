import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../src/utils/api';
import { useLanguage } from '../src/context/LanguageContext';

export default function PartnerScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: '',
  });

  const handleSubmit = async () => {
    // Validate
    if (!form.name.trim()) {
      Alert.alert(t('error'), t('partnerErrorName'));
      return;
    }
    if (!form.email.trim() || !form.email.includes('@')) {
      Alert.alert(t('error'), t('partnerErrorEmail'));
      return;
    }
    if (!form.phone.trim()) {
      Alert.alert(t('error'), t('partnerErrorPhone'));
      return;
    }
    if (!form.message.trim()) {
      Alert.alert(t('error'), t('partnerErrorMessage'));
      return;
    }

    try {
      setLoading(true);
      await api.submitPartnerRequest({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        company: form.company.trim() || undefined,
        message: form.message.trim(),
      });
      
      Alert.alert(
        t('success'),
        t('partnerSuccess'),
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error: any) {
      Alert.alert(t('error'), error.message || t('partnerErrorGeneral'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen 
        options={{ 
          title: t('partnerTitle'),
          headerBackTitle: t('back'),
        }} 
      />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header Info */}
          <View style={styles.headerInfo}>
            <View style={styles.iconContainer}>
              <Ionicons name="people-outline" size={48} color="#4754eb" />
            </View>
            <Text style={styles.headerTitle}>{t('partnerSubtitle')}</Text>
            <Text style={styles.headerText}>{t('partnerDescription')}</Text>
          </View>

          {/* Form */}
          <View style={styles.formSection}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('partnerFullName')}</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Ion Popescu"
                placeholderTextColor="#999"
                value={form.name}
                onChangeText={(text) => setForm({ ...form, name: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('partnerEmail')}</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: ion@email.com"
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoCapitalize="none"
                value={form.email}
                onChangeText={(text) => setForm({ ...form, email: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('partnerPhone')}</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: +373 69 123 456"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
                value={form.phone}
                onChangeText={(text) => setForm({ ...form, phone: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('partnerCompany')}</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Auto SRL"
                placeholderTextColor="#999"
                value={form.company}
                onChangeText={(text) => setForm({ ...form, company: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('partnerMessage')}</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder={t('partnerMessagePlaceholder')}
                placeholderTextColor="#999"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                value={form.message}
                onChangeText={(text) => setForm({ ...form, message: text })}
              />
            </View>
          </View>

          {/* Benefits */}
          <View style={styles.benefitsSection}>
            <Text style={styles.benefitsTitle}>{t('partnerWhyTitle')}</Text>
            <View style={styles.benefit}>
              <Ionicons name="checkmark-circle" size={24} color="#34C759" />
              <Text style={styles.benefitText}>{t('partnerBenefit1')}</Text>
            </View>
            <View style={styles.benefit}>
              <Ionicons name="checkmark-circle" size={24} color="#34C759" />
              <Text style={styles.benefitText}>{t('partnerBenefit2')}</Text>
            </View>
            <View style={styles.benefit}>
              <Ionicons name="checkmark-circle" size={24} color="#34C759" />
              <Text style={styles.benefitText}>{t('partnerBenefit3')}</Text>
            </View>
            <View style={styles.benefit}>
              <Ionicons name="checkmark-circle" size={24} color="#34C759" />
              <Text style={styles.benefitText}>{t('partnerBenefit4')}</Text>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="send-outline" size={20} color="#fff" />
                <Text style={styles.submitButtonText}>{t('partnerSubmit')}</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  headerInfo: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e6f2ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 12,
    textAlign: 'center',
  },
  headerText: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  formSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1a1a1a',
  },
  textArea: {
    minHeight: 100,
    paddingTop: 14,
  },
  benefitsSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  benefit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  benefitText: {
    fontSize: 15,
    color: '#333',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#4754eb',
    paddingVertical: 18,
    borderRadius: 12,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
