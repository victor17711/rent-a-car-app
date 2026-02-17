import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../src/context/AuthContext';
import { RentalProvider } from '../src/context/RentalContext';
import { LanguageProvider } from '../src/context/LanguageContext';

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
