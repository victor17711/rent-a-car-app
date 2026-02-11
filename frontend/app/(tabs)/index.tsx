import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, RefreshControl, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';
import { useRental } from '../../src/context/RentalContext';
import { api } from '../../src/utils/api';
import { Car } from '../../src/types';
import CarCard from '../../src/components/CarCard';
import RentalFilters from '../../src/components/RentalFilters';

export default function HomeScreen() {
  const { user } = useAuth();
  const { filters } = useRental();
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [seeded, setSeeded] = useState(false);

  const fetchCars = async () => {
    try {
      const data = await api.getCars();
      setCars(data);
      
      // Auto-seed if no cars
      if (data.length === 0 && !seeded) {
        await api.seedData();
        setSeeded(true);
        const newData = await api.getCars();
        setCars(newData);
      }
    } catch (error) {
      console.error('Failed to fetch cars:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCars();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCars();
  }, []);

  const getDaysCount = () => {
    const start = new Date(filters.startDate);
    const end = new Date(filters.endDate);
    return Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Bună, {user?.name?.split(' ')[0] || 'Vizitator'}!</Text>
            <Text style={styles.subtitle}>Găsește mașina perfectă</Text>
          </View>
          <View style={styles.logoSmall}>
            <Ionicons name="car-sport" size={28} color="#007AFF" />
          </View>
        </View>

        {/* Promotional Banner */}
        <View style={styles.bannerContainer}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1720907662942-f552fa04eb3b?w=800' }}
            style={styles.bannerImage}
            resizeMode="cover"
          />
          <View style={styles.bannerOverlay}>
            <Text style={styles.bannerTitle}>Ofertă Specială!</Text>
            <Text style={styles.bannerText}>-15% pentru închirieri de 7+ zile</Text>
            <View style={styles.bannerBadge}>
              <Text style={styles.bannerBadgeText}>COD: DRIVE15</Text>
            </View>
          </View>
        </View>

        {/* Rental Filters */}
        <RentalFilters />

        {/* Summary */}
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryText}>
            {getDaysCount()} {getDaysCount() === 1 ? 'zi' : 'zile'} • {' '}
            {filters.location === 'office' ? 'Oficiu' : 
             filters.location === 'chisinau_airport' ? 'Aeroport Chișinău' : 'Aeroport Iași'} • {' '}
            {filters.insurance.toUpperCase()}
          </Text>
        </View>

        {/* Cars List */}
        <View style={styles.carsSection}>
          <Text style={styles.sectionTitle}>Mașini Disponibile</Text>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.loadingText}>Se încarcă mașinile...</Text>
            </View>
          ) : cars.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="car-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>Nicio mașină disponibilă</Text>
            </View>
          ) : (
            cars.map(car => <CarCard key={car.car_id} car={car} />)
          )}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  logoSmall: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e6f2ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerContainer: {
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
    height: 180,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 20,
  },
  bannerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
  },
  bannerText: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 12,
  },
  bannerBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FF9500',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  bannerBadgeText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  summaryContainer: {
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  carsSection: {
    paddingTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#999',
  },
  bottomPadding: {
    height: 20,
  },
});
