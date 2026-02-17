import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthProvider } from '../src/context/AuthContext';
import { RentalProvider } from '../src/context/RentalContext';
import { LanguageProvider } from '../src/context/LanguageContext';

// Custom back button component for consistent behavior
const CustomBackButton = ({ onPress, label }: { onPress: () => void; label?: string }) => (
  <TouchableOpacity 
    onPress={onPress} 
    style={styles.backButton}
    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
  >
    <Ionicons name="chevron-back" size={28} color="#4754eb" />
    {label && <Text style={styles.backLabel}>{label}</Text>}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: Platform.OS === 'ios' ? -8 : 0,
    paddingVertical: 8,
    paddingRight: 16,
  },
  backLabel: {
    fontSize: 17,
    color: '#4754eb',
    marginLeft: -4,
  },
});

export default function RootLayout() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <RentalProvider>
          <StatusBar style="dark" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: '#f5f5f5' },
              gestureEnabled: true,
              headerBackVisible: true,
              headerBackTitleVisible: true,
              headerTintColor: '#4754eb',
              headerStyle: {
                backgroundColor: '#fff',
              },
              headerTitleStyle: {
                fontWeight: '600',
                color: '#1a1a1a',
              },
            }}
          >
            <Stack.Screen 
              name="index" 
              options={{
                gestureEnabled: false,
              }}
            />
            <Stack.Screen 
              name="(tabs)" 
              options={{
                gestureEnabled: false,
              }}
            />
            <Stack.Screen 
              name="car/[id]" 
              options={{ 
                headerShown: true,
                headerBackTitle: 'Înapoi',
                gestureEnabled: true,
              }} 
            />
            <Stack.Screen 
              name="partner" 
              options={{ 
                headerShown: true,
                headerBackTitle: 'Înapoi',
                gestureEnabled: true,
              }} 
            />
            <Stack.Screen 
              name="register" 
              options={{ 
                headerShown: true,
                headerBackTitle: 'Înapoi',
                gestureEnabled: true,
              }} 
            />
            <Stack.Screen 
              name="change-name" 
              options={{ 
                headerShown: true,
                headerBackTitle: 'Înapoi',
                gestureEnabled: true,
              }} 
            />
            <Stack.Screen 
              name="favorites" 
              options={{ 
                headerShown: true,
                headerBackTitle: 'Înapoi',
                gestureEnabled: true,
              }} 
            />
            <Stack.Screen 
              name="faq" 
              options={{ 
                headerShown: true,
                headerBackTitle: 'Înapoi',
                gestureEnabled: true,
              }} 
            />
            <Stack.Screen 
              name="terms" 
              options={{ 
                headerShown: true,
                headerBackTitle: 'Înapoi',
                gestureEnabled: true,
              }} 
            />
            <Stack.Screen 
              name="privacy" 
              options={{ 
                headerShown: true,
                headerBackTitle: 'Înapoi',
                gestureEnabled: true,
              }} 
            />
          </Stack>
        </RentalProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}
