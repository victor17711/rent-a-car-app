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
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen 
              name="car/[id]" 
              options={{ 
                headerShown: true,
                headerBackTitle: 'Înapoi',
              }} 
            />
            <Stack.Screen 
              name="partner" 
              options={{ 
                headerShown: true,
                headerBackTitle: 'Înapoi',
              }} 
            />
            <Stack.Screen 
              name="register" 
              options={{ 
                headerShown: true,
                headerBackTitle: 'Înapoi',
              }} 
            />
            <Stack.Screen 
              name="change-name" 
              options={{ 
                headerShown: true,
                headerBackTitle: 'Înapoi',
              }} 
            />
            <Stack.Screen 
              name="favorites" 
              options={{ 
                headerShown: true,
                headerBackTitle: 'Înapoi',
              }} 
            />
            <Stack.Screen 
              name="faq" 
              options={{ 
                headerShown: true,
                headerBackTitle: 'Înapoi',
              }} 
            />
            <Stack.Screen 
              name="terms" 
              options={{ 
                headerShown: true,
                headerBackTitle: 'Înapoi',
              }} 
            />
            <Stack.Screen 
              name="privacy" 
              options={{ 
                headerShown: true,
                headerBackTitle: 'Înapoi',
              }} 
            />
          </Stack>
        </RentalProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}
