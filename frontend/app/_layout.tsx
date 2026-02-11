import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../src/context/AuthContext';
import { RentalProvider } from '../src/context/RentalContext';

export default function RootLayout() {
  return (
    <AuthProvider>
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
              headerTitle: 'Detalii Mașină',
              headerBackTitle: 'Înapoi',
            }} 
          />
          <Stack.Screen 
            name="partner" 
            options={{ 
              headerShown: true,
              headerTitle: 'Devino Partener',
              headerBackTitle: 'Înapoi',
            }} 
          />
          <Stack.Screen 
            name="register" 
            options={{ 
              headerShown: true,
              headerTitle: 'Înregistrare',
              headerBackTitle: 'Înapoi',
            }} 
          />
        </Stack>
      </RentalProvider>
    </AuthProvider>
  );
}
