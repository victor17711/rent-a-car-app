import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';
import { useRental } from '../../src/context/RentalContext';
import { api } from '../../src/utils/api';
import { Car, PriceCalculation } from '../../src/types';

const { width } = Dimensions.get('window');

export default function CarDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { filters } = useRental();
  
  const [car, setCar] = useState<Car | null>(null);
  const [price, setPrice] = useState<PriceCalculation | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    fetchCarDetails();
  }, [id]);

  useEffect(() => {
    if (car) {
      calculatePrice();
    }
  }, [filters, car]);

  const fetchCarDetails = async () => {
    try {
      const data = await api.getCar(id as string);
      setCar(data);
    } catch (error) {
      console.error('Failed to fetch car:', error);
      Alert.alert('Eroare', 'Nu s-au putut încărca detaliile mașinii.');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const calculatePrice = async () => {
    if (!car) return;
    
    try {
      const result = await api.calculatePrice({
        car_id: car.car_id,
        start_date: filters.startDate.toISOString().split('T')[0],
        end_date: filters.endDate.toISOString().split('T')[0],
        start_time: filters.startTime,
        end_time: filters.endTime,
        location: filters.location,
        insurance: filters.insurance,
      });
      setPrice(result);
    } catch (error) {
      console.error('Price calculation error:', error);
    }
  };

  const handleBooking = async () => {
    if (!isAuthenticated) {
      Alert.alert(
        'Autentificare necesară',
        'Trebuie să fiți autentificat pentru a face o rezervare.',
        [
          { text: 'Anulează', style: 'cancel' },
          { text: 'Autentifică-te', onPress: () => router.push('/') },
        ]
      );
      return;
    }

    try {
      setBooking(true);
      await api.createBooking({
        car_id: car!.car_id,
        start_date: filters.startDate.toISOString().split('T')[0],
        end_date: filters.endDate.toISOString().split('T')[0],
        start_time: filters.startTime,
        end_time: filters.endTime,
        location: filters.location,
        insurance: filters.insurance,
      });
      
      Alert.alert(
        'Succes!',
        'Rezervarea a fost creată cu succes. Veți primi o confirmare în curând.',
        [{ text: 'OK', onPress: () => router.push('/(tabs)/bookings') }]
      );
    } catch (error: any) {
      Alert.alert('Eroare', error.message || 'Nu s-a putut crea rezervarea.');
    } finally {
      setBooking(false);
    }
  };

  const getTransmissionLabel = (t: string) => t === 'automatic' ? 'Automat' : 'Manual';
  const getFuelLabel = (f: string) => {
    const labels: Record<string, string> = {
      diesel: 'Diesel',
      petrol: 'Benzină',
      electric: 'Electric',
      hybrid: 'Hybrid',
    };
    return labels[f] || f;
  };

  const getLocationLabel = (loc: string) => {
    const labels: Record<string, string> = {
      office: 'Oficiu',
      chisinau_airport: 'Aeroport Chișinău',
      iasi_airport: 'Aeroport Iași',
    };
    return labels[loc] || loc;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: 'Se încarcă...' }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Se încarcă detaliile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!car) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: 'Eroare' }} />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#FF3B30" />
          <Text style={styles.errorText}>Mașina nu a fost găsită</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen options={{ title: car.name }} />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        <View style={styles.galleryContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / width);
              setCurrentImageIndex(index);
            }}
          >
            {car.images.length > 0 ? (
              car.images.map((image, index) => (
                <Image
                  key={index}
                  source={{ uri: image }}
                  style={styles.galleryImage}
                  resizeMode="cover"
                />
              ))
            ) : (
              <View style={[styles.galleryImage, styles.noImage]}>
                <Ionicons name="car-outline" size={64} color="#ccc" />
                <Text style={styles.noImageText}>Fără imagine</Text>
              </View>
            )}
          </ScrollView>
          
          {car.images.length > 1 && (
            <View style={styles.pagination}>
              {car.images.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.paginationDot,
                    currentImageIndex === index && styles.paginationDotActive,
                  ]}
                />
              ))}
            </View>
          )}
        </View>

        {/* Car Info */}
        <View style={styles.infoSection}>
          <Text style={styles.carName}>{car.name}</Text>
          <Text style={styles.carModel}>{car.brand} {car.model} • {car.year}</Text>
          
          {/* Quick Specs */}
          <View style={styles.quickSpecs}>
            <View style={styles.quickSpec}>
              <Ionicons name="cog-outline" size={24} color="#007AFF" />
              <Text style={styles.quickSpecText}>{getTransmissionLabel(car.transmission)}</Text>
            </View>
            <View style={styles.quickSpec}>
              <Ionicons name="water-outline" size={24} color="#007AFF" />
              <Text style={styles.quickSpecText}>{getFuelLabel(car.fuel)}</Text>
            </View>
            <View style={styles.quickSpec}>
              <Ionicons name="people-outline" size={24} color="#007AFF" />
              <Text style={styles.quickSpecText}>{car.seats} locuri</Text>
            </View>
          </View>
        </View>

        {/* Detailed Specs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Specificații</Text>
          <View style={styles.specsGrid}>
            {car.specs.engine && (
              <View style={styles.specItem}>
                <Text style={styles.specLabel}>Motor</Text>
                <Text style={styles.specValue}>{car.specs.engine}</Text>
              </View>
            )}
            {car.specs.power && (
              <View style={styles.specItem}>
                <Text style={styles.specLabel}>Putere</Text>
                <Text style={styles.specValue}>{car.specs.power}</Text>
              </View>
            )}
            {car.specs.consumption && (
              <View style={styles.specItem}>
                <Text style={styles.specLabel}>Consum</Text>
                <Text style={styles.specValue}>{car.specs.consumption}</Text>
              </View>
            )}
            {car.specs.trunk && (
              <View style={styles.specItem}>
                <Text style={styles.specLabel}>Portbagaj</Text>
                <Text style={styles.specValue}>{car.specs.trunk}</Text>
              </View>
            )}
          </View>
          
          {/* Features */}
          <View style={styles.features}>
            {car.specs.ac && (
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color="#34C759" />
                <Text style={styles.featureText}>Aer Condiționat</Text>
              </View>
            )}
            {car.specs.gps && (
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color="#34C759" />
                <Text style={styles.featureText}>GPS</Text>
              </View>
            )}
            {car.specs.bluetooth && (
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color="#34C759" />
                <Text style={styles.featureText}>Bluetooth</Text>
              </View>
            )}
            {car.specs.leather_seats && (
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color="#34C759" />
                <Text style={styles.featureText}>Scaune piele</Text>
              </View>
            )}
            {car.specs.cruise_control && (
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color="#34C759" />
                <Text style={styles.featureText}>Cruise Control</Text>
              </View>
            )}
          </View>
        </View>

        {/* Pricing Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Prețuri</Text>
          <View style={styles.pricingTable}>
            <View style={styles.pricingRow}>
              <Text style={styles.pricingLabel}>1 zi</Text>
              <Text style={styles.pricingValue}>{car.pricing.day_1} €/zi</Text>
            </View>
            <View style={styles.pricingRow}>
              <Text style={styles.pricingLabel}>3 zile</Text>
              <Text style={styles.pricingValue}>{car.pricing.day_3} €/zi</Text>
            </View>
            <View style={styles.pricingRow}>
              <Text style={styles.pricingLabel}>5 zile</Text>
              <Text style={styles.pricingValue}>{car.pricing.day_5} €/zi</Text>
            </View>
            <View style={styles.pricingRow}>
              <Text style={styles.pricingLabel}>10 zile</Text>
              <Text style={styles.pricingValue}>{car.pricing.day_10} €/zi</Text>
            </View>
            <View style={styles.pricingRow}>
              <Text style={styles.pricingLabel}>20+ zile</Text>
              <Text style={styles.pricingValue}>{car.pricing.day_20} €/zi</Text>
            </View>
            <View style={[styles.pricingRow, styles.pricingRowHighlight]}>
              <Text style={styles.pricingLabel}>CASCO/zi</Text>
              <Text style={styles.pricingValue}>{car.casco_price} €/zi</Text>
            </View>
          </View>
        </View>

        {/* Price Calculation */}
        {price && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Calculul Prețului</Text>
            <View style={styles.calculationCard}>
              <View style={styles.calculationRow}>
                <Text style={styles.calculationLabel}>Perioadă</Text>
                <Text style={styles.calculationValue}>{price.days} {price.days === 1 ? 'zi' : 'zile'}</Text>
              </View>
              <View style={styles.calculationRow}>
                <Text style={styles.calculationLabel}>Tarif zilnic ({price.breakdown.daily_rate} €)</Text>
                <Text style={styles.calculationValue}>{price.base_price} €</Text>
              </View>
              {price.casco_price > 0 && (
                <View style={styles.calculationRow}>
                  <Text style={styles.calculationLabel}>CASCO</Text>
                  <Text style={styles.calculationValue}>+{price.casco_price} €</Text>
                </View>
              )}
              {price.location_fee > 0 && (
                <View style={styles.calculationRow}>
                  <Text style={styles.calculationLabel}>Taxă {getLocationLabel(filters.location)}</Text>
                  <Text style={styles.calculationValue}>+{price.location_fee} €</Text>
                </View>
              )}
              {price.outside_hours_fee > 0 && (
                <View style={styles.calculationRow}>
                  <Text style={styles.calculationLabel}>În afara programului</Text>
                  <Text style={styles.calculationValue}>+{price.outside_hours_fee} €</Text>
                </View>
              )}
              <View style={[styles.calculationRow, styles.calculationTotal]}>
                <Text style={styles.totalLabel}>TOTAL</Text>
                <Text style={styles.totalValue}>{price.total_price} €</Text>
              </View>
            </View>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Booking Footer */}
      <View style={styles.footer}>
        <View style={styles.footerPrice}>
          <Text style={styles.footerPriceLabel}>Total</Text>
          <Text style={styles.footerPriceValue}>{price?.total_price || '...'} €</Text>
        </View>
        <TouchableOpacity
          style={[styles.bookButton, booking && styles.bookButtonDisabled]}
          onPress={handleBooking}
          disabled={booking}
        >
          {booking ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="calendar-outline" size={20} color="#fff" />
              <Text style={styles.bookButtonText}>Rezervă Acum</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
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
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    marginTop: 16,
    fontSize: 18,
    color: '#FF3B30',
  },
  galleryContainer: {
    position: 'relative',
  },
  galleryImage: {
    width: width,
    height: 280,
    backgroundColor: '#e0e0e0',
  },
  noImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    marginTop: 8,
    color: '#999',
  },
  pagination: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  paginationDotActive: {
    backgroundColor: '#fff',
    width: 24,
  },
  infoSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 12,
  },
  carName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  carModel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  quickSpecs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickSpec: {
    alignItems: 'center',
    gap: 8,
  },
  quickSpecText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  specsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 16,
  },
  specItem: {
    width: '45%',
  },
  specLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  specValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  features: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  featureText: {
    fontSize: 14,
    color: '#333',
  },
  pricingTable: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  pricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f9f9f9',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  pricingRowHighlight: {
    backgroundColor: '#e6f2ff',
  },
  pricingLabel: {
    fontSize: 15,
    color: '#333',
  },
  pricingValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#007AFF',
  },
  calculationCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
  },
  calculationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  calculationLabel: {
    fontSize: 14,
    color: '#666',
  },
  calculationValue: {
    fontSize: 14,
    color: '#333',
  },
  calculationTotal: {
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    marginTop: 8,
    paddingTop: 16,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#007AFF',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  footerPrice: {},
  footerPriceLabel: {
    fontSize: 12,
    color: '#666',
  },
  footerPriceValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#007AFF',
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
  },
  bookButtonDisabled: {
    opacity: 0.7,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
