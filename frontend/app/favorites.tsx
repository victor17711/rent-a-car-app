import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../src/utils/api';
import { useAuth } from '../src/context/AuthContext';
import { useLanguage } from '../src/context/LanguageContext';

interface Car {
  car_id: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  transmission: string;
  fuel: string;
  seats: number;
  pricing: {
    day_1: number;
  };
  images: string[];
}

export default function FavoritesScreen() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const { t } = useLanguage();
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadFavorites();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const loadFavorites = async () => {
    try {
      const data = await api.getFavorites();
      setCars(data);
    } catch (error) {
      console.error('Failed to load favorites:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadFavorites();
  }, []);

  const handleRemoveFavorite = async (carId: string) => {
    try {
      await api.removeFavorite(carId);
      setCars(cars.filter(car => car.car_id !== carId));
    } catch (error) {
      console.error('Failed to remove favorite:', error);
    }
  };

  const renderCarCard = ({ item }: { item: Car }) => (
    <TouchableOpacity
      style={styles.carCard}
      onPress={() => router.push(`/car/${item.car_id}`)}
    >
      <View style={styles.carInfo}>
        <Text style={styles.carName}>{item.name}</Text>
        <Text style={styles.carDetails}>{item.brand} • {item.year}</Text>
        <View style={styles.carSpecs}>
          <View style={styles.specItem}>
            <Ionicons name="settings-outline" size={16} color="#666" />
            <Text style={styles.specText}>{item.transmission === 'automatic' ? 'Automat' : 'Manual'}</Text>
          </View>
          <View style={styles.specItem}>
            <Ionicons name="flame-outline" size={16} color="#666" />
            <Text style={styles.specText}>{item.fuel}</Text>
          </View>
        </View>
        <Text style={styles.price}>de la {item.pricing.day_1}€/zi</Text>
      </View>
      <TouchableOpacity
        style={styles.favoriteButton}
        onPress={() => handleRemoveFavorite(item.car_id)}
      >
        <Ionicons name="heart" size={24} color="#FF2D55" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: t('favoritesTitle'), headerShown: true, headerBackTitle: t('back') }} />
        <View style={styles.emptyContainer}>
          <Ionicons name="lock-closed-outline" size={64} color="#ccc" />
          <Text style={styles.emptyTitle}>{t('notAuthenticated')}</Text>
          <Text style={styles.emptyText}>{t('loginToSeeProfile')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: t('favoritesTitle'), headerShown: true, headerBackTitle: t('back') }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#A31621" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen options={{ title: t('favoritesTitle'), headerShown: true, headerBackTitle: t('back') }} />
      <FlatList
        data={cars}
        renderItem={renderCarCard}
        keyExtractor={(item) => item.car_id}
        contentContainerStyle={cars.length === 0 ? styles.emptyList : styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="heart-outline" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>{t('noFavorites')}</Text>
            <Text style={styles.emptyText}>{t('addFavoritesHint')}</Text>
          </View>
        }
      />
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
  list: {
    padding: 16,
  },
  emptyList: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  carCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  carInfo: {
    flex: 1,
  },
  carName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  carDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  carSpecs: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  specText: {
    fontSize: 12,
    color: '#666',
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#A31621',
  },
  favoriteButton: {
    padding: 8,
  },
});