import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/context/AuthContext';
import { SvgXml } from 'react-native-svg';

// RentMoldova SVG Logo
const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 964.98 187.44"><style>.st0{fill:#4754EB;}</style><g><g><path class="st0" d="M272.75,68.57c0,6-1.46,11.17-4.37,15.5c-2.92,4.33-6.95,7.5-12.09,9.5l22.88,38.71h-20.13l-19.46-36.59 h-10.92v36.59h-17.65V41.5h33.33c5.66,0,10.62,1.13,14.88,3.39c4.26,2.26,7.58,5.43,9.96,9.5 C271.56,58.46,272.75,63.18,272.75,68.57z M255.73,69.09c0-1.62-0.29-3.24-0.88-4.87c-0.59-1.62-1.7-2.98-3.34-4.06 s-4.03-1.63-7.17-1.63h-15.68v21.12h15.68c3.14,0,5.53-0.54,7.17-1.63s2.75-2.45,3.34-4.09 C255.43,72.29,255.73,70.67,255.73,69.09z"/><path class="st0" d="M294.23,105.31c0.69,3.62,2.71,6.75,6.05,9.37c3.35,2.62,8.75,3.93,16.2,3.93c7,0,13.15-1.57,18.43-4.71 v17.49c-5.9,3.24-14.77,4.4-26.6,3.47c-8.8-1.04-16.17-4.95-22.13-11.75c-5.95-6.8-8.93-14.7-8.93-23.7 c0-9.8,3.29-18.17,9.89-25.13c6.59-6.95,14.53-10.43,23.81-10.43c8.04,0,14.1,1.86,18.19,5.56c4.09,3.71,6.87,8.07,8.33,13.09 c1.47,5.02,2.21,9.69,2.23,14c0.02,4.31-0.1,7.25-0.34,8.8H294.23z M323.63,91.13c0-3.86-1.17-6.91-3.52-9.14 c-2.35-2.23-5.83-3.34-10.46-3.34c-4.11,0-7.88,1.62-11.34,4.86c-2.28,2.14-3.79,4.68-4.55,7.61H323.63z"/><path class="st0" d="M383.15,63.75c7.83,0,14.19,2.68,19.07,8.05c4.88,5.37,7.32,13.03,7.32,23.01v37.47h-17.08V94.19 c0-3.86-1.37-7.17-4.12-9.91c-2.74-2.74-6.05-4.11-9.91-4.11c-3.87,0-7.17,1.37-9.91,4.11c-2.74,2.74-4.12,6.05-4.12,9.91v38.09 h-17.03v-66.2h17.03v3.83C368.59,65.81,374.84,63.75,383.15,63.75z"/><path class="st0" d="M438.43,48.49v17.7h11.03v13.77h-11.03v33.12c0,1.1,0.18,2.04,0.54,2.82c0.36,0.78,0.82,1.39,1.37,1.84 c0.76,0.59,1.65,0.93,2.67,1.04c1.02,0.1,2.02,0.07,3-0.1c0.98-0.17,2.13-0.48,3.44-0.93v16.56c-2.73,0.59-5.14,0.92-7.25,1.01 c-2.11,0.09-4.35-0.1-6.73-0.57s-4.63-1.41-6.75-2.82c-2.12-1.41-3.87-3.5-5.23-6.26c-1.36-2.76-2.04-6.43-2.04-11.02V79.95h-7.2 V66.19h7.2V50.56L438.43,48.49z"/><path class="st0" d="M519,122.03l-23.39-39.9l-10.97,50.15h-18.22l20.75-94.87L519,90.46l31.78-53.05l20.75,94.87h-18.27 l-10.97-50.15L519,122.03z"/><path class="st0" d="M608.02,63.86c6.35,0,12.15,1.61,17.42,4.84c5.26,3.23,9.45,7.54,12.55,12.94c3.11,5.4,4.66,11.38,4.66,17.93 c0,6.59-1.55,12.59-4.66,17.99c-3.11,5.4-7.29,9.71-12.55,12.94c-5.26,3.23-11.07,4.84-17.42,4.84c-6.38,0-12.21-1.61-17.47-4.84 c-5.26-3.23-9.45-7.54-12.55-12.94c-3.11-5.4-4.66-11.39-4.66-17.99c0-6.56,1.55-12.53,4.66-17.93c3.11-5.4,7.29-9.71,12.55-12.94 C595.82,65.47,601.64,63.86,608.02,63.86z M626.34,99.83c0-5.45-1.79-10.1-5.38-13.95c-3.59-3.85-7.9-5.77-12.94-5.77 c-5.07,0-9.4,1.92-12.99,5.77c-3.59,3.85-5.38,8.5-5.38,13.95c0,5.42,1.79,10.04,5.38,13.87c3.59,3.83,7.92,5.75,12.99,5.75 c5.04,0,9.35-1.92,12.94-5.75S626.34,105.25,626.34,99.83z"/><path class="st0" d="M666.97,132.28h-17.03V38.81h17.03V132.28z"/><path class="st0" d="M727.68,132.59v-4.24c-4.8,4.62-11.59,6.94-20.39,6.94c-9.56,0-17.45-3.48-23.68-10.43 c-6.23-6.95-9.34-15.36-9.34-25.23c0-9.83,3.11-18.23,9.34-25.18c6.23-6.95,14.12-10.43,23.68-10.43c8.8,0,15.6,2.31,20.39,6.94 V38.81h16.77v93.78H727.68z M728.15,99.83c0-5.45-1.79-10.1-5.36-13.95c-3.57-3.85-7.89-5.77-12.96-5.77s-9.4,1.92-12.99,5.77 c-3.59,3.85-5.38,8.5-5.38,13.95c0,5.42,1.79,10.04,5.38,13.87c3.59,3.83,7.92,5.75,12.99,5.75s9.39-1.92,12.96-5.75 C726.36,109.87,728.15,105.25,728.15,99.83z"/><path class="st0" d="M786.37,63.86c6.35,0,12.15,1.61,17.42,4.84c5.26,3.23,9.45,7.54,12.55,12.94c3.11,5.4,4.66,11.38,4.66,17.93 c0,6.59-1.55,12.59-4.66,17.99c-3.11,5.4-7.29,9.71-12.55,12.94c-5.26,3.23-11.07,4.84-17.42,4.84c-6.38,0-12.21-1.61-17.47-4.84 c-5.26-3.23-9.45-7.54-12.55-12.94c-3.11-5.4-4.66-11.39-4.66-17.99c0-6.56,1.55-12.53,4.66-17.93c3.11-5.4,7.29-9.71,12.55-12.94 C774.17,65.47,779.99,63.86,786.37,63.86z M804.7,99.83c0-5.45-1.79-10.1-5.38-13.95c-3.59-3.85-7.9-5.77-12.94-5.77 c-5.07,0-9.4,1.92-12.99,5.77c-3.59,3.85-5.38,8.5-5.38,13.95c0,5.42,1.79,10.04,5.38,13.87c3.59,3.83,7.92,5.75,12.99,5.75 c5.04,0,9.35-1.92,12.94-5.75S804.7,105.25,804.7,99.83z"/><path class="st0" d="M851.9,97.45l14.54-31.36h19.41l-33.95,68.89l-33.95-68.89h19.36L851.9,97.45z"/><path class="st0" d="M936.21,132.59v-4.24c-4.8,4.62-11.59,6.94-20.39,6.94c-9.56,0-17.45-3.48-23.68-10.43 c-6.23-6.95-9.34-15.36-9.34-25.23c0-9.83,3.11-18.23,9.34-25.18c6.23-6.95,14.12-10.43,23.68-10.43c8.8,0,15.6,2.31,20.39,6.94 v-4.87h16.77v66.51H936.21z M936.16,99.83c0-5.45-1.79-10.1-5.36-13.95c-3.57-3.85-7.89-5.77-12.96-5.77s-9.4,1.92-12.99,5.77 c-3.59,3.85-5.38,8.5-5.38,13.95c0,5.42,1.79,10.04,5.38,13.87c3.59,3.83,7.92,5.75,12.99,5.75s9.39-1.92,12.96-5.75 C934.37,109.87,936.16,105.25,936.16,99.83z"/></g><g id="_x39_V0Bqw_10_"><g><path class="st0" d="M39.89,52.11c22.66-1.44,37.47-17.64,38.7-39.06c2.37,0,4.8,0,7.22,0c2.47,0,4.94,0,7.39,0 c2.28,27.17-23.72,55.21-53.31,53.74C39.89,62.01,39.89,57.21,39.89,52.11z"/><path class="st0" d="M159.12,94.11c-30.35,0.19-54.17-25.73-53.51-53.68c4.88,0,9.77,0,14.85,0 c2.48,23.1,15.28,36.08,38.66,38.75C159.12,84.11,159.12,89.12,159.12,94.11z"/><path class="st0" d="M12.75,93.87c0-4.95,0-9.76,0-14.57c26.31-1.96,54.58,22.58,53.65,53.3c-4.9,0-9.82,0-14.74,0 C49.01,109.31,36.11,96.36,12.75,93.87z"/><path class="st0" d="M144.43,105.98c4.96,0,9.68,0,14.38,0c2.72,24.86-21.96,55.13-53.21,53.56c-0.08-0.56-0.22-1.15-0.23-1.74 c-0.02-4.23-0.01-8.47-0.01-12.85C128.79,142.39,141.8,129.55,144.43,105.98z"/><path class="st0" d="M132.19,106.27c0,4.81,0,9.63,0,14.68c-23.15,2.45-36.14,15.3-38.8,38.74c-4.79,0-9.6,0-14.43,0 C76.28,135.55,100.32,104.86,132.19,106.27z"/><path class="st0" d="M66.52,159.64c-27.48,1.17-54.48-23.29-53.63-53.79c2.42,0,4.87,0,7.33,0c2.47,0,4.93,0,7.42,0 c2.6,23.55,15.51,36.45,38.88,39.06C66.52,149.75,66.52,154.57,66.52,159.64z"/><path class="st0" d="M66.48,13.2c0.1,0.97,0.23,1.69,0.24,2.42c0.02,4.11,0.01,8.22,0.01,12.75 c-10.52,0.54-19.67,3.96-27.09,11.3c-7.45,7.37-11.16,16.4-11.66,27.17c-5.06,0-10.06,0-15.04,0 C11.83,40.97,34.22,13.25,66.48,13.2z"/><path class="st0" d="M159.17,66.99c-5.04,0-9.85,0-14.99,0c-0.55-10.49-4.02-19.63-11.42-27.03 c-7.41-7.41-16.46-11.05-27.12-11.52c0-5.04,0-9.96,0-14.87C132.75,11.73,160.11,37,159.17,66.99z"/></g></g></g></svg>`;

export default function LoginScreen() {
  const { user, isLoading, isAuthenticated, loginWithGoogle, loginWithPhone } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<'options' | 'phone'>('options');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isLoading]);

  const handlePhoneLogin = async () => {
    if (!phone.trim()) {
      Alert.alert('Eroare', 'Introduceți numărul de telefon');
      return;
    }
    if (!password.trim()) {
      Alert.alert('Eroare', 'Introduceți parola');
      return;
    }

    try {
      setSubmitting(true);
      await loginWithPhone(phone, password);
    } catch (error: any) {
      Alert.alert('Eroare', error.message || 'Autentificare eșuată');
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4754EB" />
          <Text style={styles.loadingText}>Se încarcă...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo Section */}
          <View style={styles.logoSection}>
            <View style={styles.logoContainer}>
              <SvgXml xml={logoSvg} width={280} height={60} />
            </View>
            <Text style={styles.tagline}>Închirieri Auto Premium</Text>
          </View>

          {mode === 'options' ? (
            <>
              {/* Login Options */}
              <View style={styles.loginSection}>
                <TouchableOpacity style={styles.emailButton} onPress={() => setMode('phone')}>
                  <Ionicons name="call-outline" size={24} color="#fff" />
                  <Text style={styles.emailButtonText}>Continuă cu Telefon</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.googleButton} onPress={loginWithGoogle}>
                  <Ionicons name="logo-google" size={24} color="#4754EB" />
                  <Text style={styles.googleButtonText}>Continuă cu Google</Text>
                </TouchableOpacity>
                
                <View style={styles.registerRow}>
                  <Text style={styles.registerText}>Nu ai cont? </Text>
                  <TouchableOpacity onPress={() => router.push('/register')}>
                    <Text style={styles.registerLink}>Înregistrează-te</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          ) : (
            <>
              {/* Phone Login Form */}
              <View style={styles.formSection}>
                <TouchableOpacity style={styles.backButton} onPress={() => setMode('options')}>
                  <Ionicons name="arrow-back" size={24} color="#4754EB" />
                  <Text style={styles.backButtonText}>Înapoi</Text>
                </TouchableOpacity>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Număr de telefon</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="call-outline" size={20} color="#666" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="+373 69 123 456"
                      placeholderTextColor="#999"
                      value={phone}
                      onChangeText={setPhone}
                      keyboardType="phone-pad"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Parolă</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Parola ta"
                      placeholderTextColor="#999"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                      <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#666" />
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity 
                  style={[styles.submitButton, submitting && styles.submitButtonDisabled]} 
                  onPress={handlePhoneLogin}
                  disabled={submitting}
                >
                  {submitting ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.submitButtonText}>Autentifică-te</Text>
                  )}
                </TouchableOpacity>

                <View style={styles.registerRow}>
                  <Text style={styles.registerText}>Nu ai cont? </Text>
                  <TouchableOpacity onPress={() => router.push('/register')}>
                    <Text style={styles.registerLink}>Înregistrează-te</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}

          <Text style={styles.termsText}>
            Continuând, ești de acord cu Termenii și Condițiile noastre
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  logoSection: {
    alignItems: 'center',
    marginTop: 60,
  },
  logoContainer: {
    marginBottom: 20,
  },
  tagline: {
    fontSize: 18,
    color: '#666',
    marginTop: 8,
  },
  loginSection: {
    gap: 12,
  },
  emailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#4754EB',
    paddingVertical: 16,
    borderRadius: 12,
  },
  emailButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#4754EB',
  },
  googleButtonText: {
    color: '#4754EB',
    fontSize: 18,
    fontWeight: '600',
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  registerText: {
    fontSize: 14,
    color: '#666',
  },
  registerLink: {
    fontSize: 14,
    color: '#4754EB',
    fontWeight: '600',
  },
  formSection: {
    marginTop: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  backButtonText: {
    fontSize: 16,
    color: '#4754EB',
    fontWeight: '500',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: '#1a1a1a',
  },
  submitButton: {
    backgroundColor: '#4754EB',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  termsText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#888',
    lineHeight: 18,
    marginTop: 20,
  },
});
