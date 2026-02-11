import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, RefreshControl, TouchableOpacity, ActivityIndicator, Dimensions, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';
import { useRental } from '../../src/context/RentalContext';
import { api } from '../../src/utils/api';
import { Car } from '../../src/types';
import CarCard from '../../src/components/CarCard';
import RentalFilters from '../../src/components/RentalFilters';

const { width } = Dimensions.get('window');

interface Banner {
  banner_id: string;
  title: string;
  subtitle: string;
  badge: string;
  image: string;
  order: number;
  active: boolean;
}

// Default banners if no banners from admin
const DEFAULT_BANNERS: Banner[] = [
  {
    banner_id: 'default_1',
    image: 'https://images.unsplash.com/photo-1485291571150-772bcfc10da5?w=800',
    title: 'Ofertă Specială!',
    subtitle: '-15% pentru închirieri de 7+ zile',
    badge: 'COD: DRIVE15',
    order: 0,
    active: true,
  },
  {
    banner_id: 'default_2',
    image: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800',
    title: 'Mașini Premium',
    subtitle: 'BMW, Mercedes, Audi disponibile',
    badge: 'NOUĂ FLOTĂ',
    order: 1,
    active: true,
  },
  {
    banner_id: 'default_3',
    image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800',
    title: 'Aeroport Transfer',
    subtitle: 'Preluare gratuită Chișinău',
    badge: 'GRATUIT',
    order: 2,
    active: true,
  },
];

export default function HomeScreen() {
  const { user } = useAuth();
  const { filters } = useRental();
  const [cars, setCars] = useState<Car[]>([]);
  const [banners, setBanners] = useState<Banner[]>(DEFAULT_BANNERS);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [seeded, setSeeded] = useState(false);
  const [currentBanner, setCurrentBanner] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const fetchData = async () => {
    try {
      const [carsData, bannersData] = await Promise.all([
        api.getCars(),
        api.getBanners().catch(() => [])
      ]);
      
      setCars(carsData);
      
      // Use admin banners if available, otherwise use defaults
      if (bannersData && bannersData.length > 0) {
        const activeBanners = bannersData.filter((b: Banner) => b.active);
        if (activeBanners.length > 0) {
          setBanners(activeBanners);
        }
      }
      
      // Auto-seed if no cars
      if (carsData.length === 0 && !seeded) {
        await api.seedData();
        setSeeded(true);
        const newData = await api.getCars();
        setCars(newData);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Auto-change banner with fade animation - only show one at a time
  useEffect(() => {
    if (banners.length <= 1) return;
    
    const interval = setInterval(() => {
      // Fade out
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        // Change banner
        setCurrentBanner((prev) => (prev + 1) % banners.length);
        // Fade in
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
    }, 5000);
    
    return () => clearInterval(interval);
  }, [banners.length]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, []);

  const getDaysCount = () => {
    const start = new Date(filters.startDate);
    const end = new Date(filters.endDate);
    return Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
  };

  const currentBannerData = banners[currentBanner] || banners[0];

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
            <Ionicons name="car-sport" size={28} color="#A31621" />
          </View>
        </View>

        {/* Single Banner with Fade Animation - No Overlay */}
        {currentBannerData && (
          <View style={styles.bannerSection}>
            <Animated.View style={[styles.bannerContainer, { opacity: fadeAnim }]}>
              <Image
                source={{ uri: currentBannerData.image }}
                style={styles.bannerImage}
                resizeMode="cover"
              />
            </Animated.View>
            
            {/* Pagination dots */}
            {banners.length > 1 && (
              <View style={styles.pagination}>
                {banners.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.paginationDot,
                      currentBanner === index && styles.paginationDotActive,
                    ]}
                  />
                ))}
              </View>
            )}
          </View>
        )}

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
    marginHorizontal: 16,
    marginBottom: 8,
  },
  bannerContainer: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
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
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    padding: 24,
  },
  bannerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  bannerText: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 16,
    textShadowColor: 'rgba(0,0,0,0.5)',
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
