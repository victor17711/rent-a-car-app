import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, RefreshControl, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';
import { useRental } from '../../src/context/RentalContext';
import { api } from '../../src/utils/api';
import { Car } from '../../src/types';
import CarCard from '../../src/components/CarCard';
import RentalFilters from '../../src/components/RentalFilters';

const { width } = Dimensions.get('window');

const BANNERS = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1485291571150-772bcfc10da5?w=800',
    title: 'Ofertă Specială!',
    subtitle: '-15% pentru închirieri de 7+ zile',
    badge: 'COD: DRIVE15',
    bgColor: 'rgba(0,122,255,0.85)',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800',
    title: 'Mașini Premium',
    subtitle: 'BMW, Mercedes, Audi disponibile',
    badge: 'NOUĂ FLOTĂ',
    bgColor: 'rgba(52,199,89,0.85)',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800',
    title: 'Aeroport Transfer',
    subtitle: 'Preluare gratuită Chișinău',
    badge: 'GRATUIT',
    bgColor: 'rgba(255,149,0,0.85)',
  },
];

export default function HomeScreen() {
  const { user } = useAuth();
  const { filters } = useRental();
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [seeded, setSeeded] = useState(false);
  const [currentBanner, setCurrentBanner] = useState(0);
  const bannerScrollRef = useRef<ScrollView>(null);

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

  // Auto-scroll banners
  useEffect(() => {
    const interval = setInterval(() => {
      const nextBanner = (currentBanner + 1) % BANNERS.length;
      setCurrentBanner(nextBanner);
      bannerScrollRef.current?.scrollTo({ x: nextBanner * (width - 32), animated: true });
    }, 4000);
    return () => clearInterval(interval);
  }, [currentBanner]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCars();
  }, []);

  const getDaysCount = () => {
    const start = new Date(filters.startDate);
    const end = new Date(filters.endDate);
    return Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
  };

  const handleBannerScroll = (event: any) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / (width - 32));
    setCurrentBanner(slideIndex);
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

        {/* Banner Slider */}
        <View style={styles.bannerSection}>
          <ScrollView
            ref={bannerScrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleBannerScroll}
            decelerationRate="fast"
            snapToInterval={width - 32}
            contentContainerStyle={styles.bannerScroll}
          >
            {BANNERS.map((banner, index) => (
              <View key={banner.id} style={styles.bannerContainer}>
                <Image
                  source={{ uri: banner.image }}
                  style={styles.bannerImage}
                  resizeMode="cover"
                />
                <View style={[styles.bannerOverlay, { backgroundColor: banner.bgColor }]}>
                  <Text style={styles.bannerTitle}>{banner.title}</Text>
                  <Text style={styles.bannerText}>{banner.subtitle}</Text>
                  <View style={styles.bannerBadge}>
                    <Text style={styles.bannerBadgeText}>{banner.badge}</Text>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
          
          {/* Pagination dots */}
          <View style={styles.pagination}>
            {BANNERS.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  currentBanner === index && styles.paginationDotActive,
                ]}
              />
            ))}
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
  bannerSection: {
    marginBottom: 8,
  },
  bannerScroll: {
    paddingHorizontal: 16,
  },
  bannerContainer: {
    width: width - 32,
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 0,
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
    justifyContent: 'center',
    padding: 24,
  },
  bannerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  bannerText: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 16,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  bannerBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  bannerBadgeText: {
    color: '#1a1a1a',
    fontWeight: '700',
    fontSize: 14,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
    gap: 8,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
  },
  paginationDotActive: {
    backgroundColor: '#007AFF',
    width: 24,
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
