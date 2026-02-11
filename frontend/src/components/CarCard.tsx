import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Car, PriceCalculation } from '../types';
import { useRental } from '../context/RentalContext';
import { api } from '../utils/api';

interface CarCardProps {
  car: Car;
}

export default function CarCard({ car }: CarCardProps) {
  const router = useRouter();
  const { filters } = useRental();
  const [price, setPrice] = useState<PriceCalculation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    calculatePrice();
  }, [filters, car.car_id]);

  const calculatePrice = async () => {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const handlePress = () => {
    router.push(`/car/${car.car_id}`);
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

  // Get main image
  const mainImageIndex = car.main_image_index || 0;
  const mainImage = car.images && car.images.length > mainImageIndex 
    ? car.images[mainImageIndex] 
    : car.images?.[0] || 'https://via.placeholder.com/300x200';

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress} activeOpacity={0.8}>
      <Image
        source={{ uri: mainImage }}
        style={styles.image}
        resizeMode="cover"
      />
      
      <View style={styles.content}>
        <Text style={styles.name}>{car.name}</Text>
        <Text style={styles.model}>{car.brand} {car.model} • {car.year}</Text>
        
        <View style={styles.specs}>
          <View style={styles.spec}>
            <Ionicons name="cog-outline" size={16} color="#666" />
            <Text style={styles.specText}>{getTransmissionLabel(car.transmission)}</Text>
          </View>
          <View style={styles.spec}>
            <Ionicons name="water-outline" size={16} color="#666" />
            <Text style={styles.specText}>{getFuelLabel(car.fuel)}</Text>
          </View>
          <View style={styles.spec}>
            <Ionicons name="people-outline" size={16} color="#666" />
            <Text style={styles.specText}>{car.seats} locuri</Text>
          </View>
        </View>
        
        <View style={styles.priceRow}>
          {loading ? (
            <ActivityIndicator size="small" color="#007AFF" />
          ) : price ? (
            <View style={styles.priceContainer}>
              <Text style={styles.price}>{price.total_price} €</Text>
              <Text style={styles.priceLabel}>/ {price.days} {price.days === 1 ? 'zi' : 'zile'}</Text>
            </View>
          ) : (
            <Text style={styles.price}>de la {car.pricing.day_1} €/zi</Text>
          )}
          
          <TouchableOpacity style={styles.button} onPress={handlePress}>
            <Text style={styles.buttonText}>Detalii</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 220,
    backgroundColor: '#f0f0f0',
  },
  content: {
    padding: 16,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  model: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  specs: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  spec: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  specText: {
    fontSize: 13,
    color: '#666',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  price: {
    fontSize: 24,
    fontWeight: '700',
    color: '#007AFF',
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
  },
  button: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
