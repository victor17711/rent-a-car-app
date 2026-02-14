import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';
import { useLanguage } from '../../src/context/LanguageContext';
import { api } from '../../src/utils/api';
import { Booking } from '../../src/types';

export default function BookingsScreen() {
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBookings = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    
    try {
      const data = await api.getMyBookings();
      setBookings(data);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [isAuthenticated]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchBookings();
  }, [isAuthenticated]);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: '#FF9500',
      confirmed: '#34C759',
      completed: '#4754eb',
      cancelled: '#FF3B30',
    };
    return colors[status] || '#666';
  };

  const getStatusLabel = (status: string) => {
    const labelsRo: Record<string, string> = {
      pending: 'În așteptare',
      confirmed: 'Confirmată',
      completed: 'Finalizată',
      cancelled: 'Anulată',
    };
    const labelsRu: Record<string, string> = {
      pending: 'В ожидании',
      confirmed: 'Подтверждено',
      completed: 'Завершено',
      cancelled: 'Отменено',
    };
    const labels = t('pending') === 'В ожидании' ? labelsRu : labelsRo;
    return labels[status] || status;
  };

  const getLocationLabel = (loc: string) => {
    const labels: Record<string, string> = {
      office: t('office'),
      chisinau_airport: t('chisinauAirport'),
      iasi_airport: t('iasiAirport'),
    };
    return labels[loc] || loc;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ro-RO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container} edges={[]}>
        <View style={styles.emptyContainer}>
          <Ionicons name="lock-closed-outline" size={64} color="#ccc" />
          <Text style={styles.emptyTitle}>{t('notAuthenticated')}</Text>
          <Text style={styles.emptyText}>
            {t('loginToSeeProfile')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={[]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4754eb" />
          <Text style={styles.loadingText}>{t('loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={bookings.length === 0 ? styles.emptyScroll : undefined}
      >
        {bookings.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>{t('noBookings')}</Text>
            <Text style={styles.emptyText}>
              {t('makeFirstBooking')}
            </Text>
          </View>
        ) : (
          <View style={styles.bookingsList}>
            {bookings.map(booking => (
              <View key={booking.booking_id} style={styles.bookingCard}>
                <View style={styles.bookingHeader}>
                  <Text style={styles.carName}>{booking.car_name}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) }]}>
                    <Text style={styles.statusText}>{getStatusLabel(booking.status)}</Text>
                  </View>
                </View>
                
                <View style={styles.bookingDetails}>
                  <View style={styles.detailRow}>
                    <Ionicons name="calendar-outline" size={18} color="#666" />
                    <Text style={styles.detailText}>
                      {formatDate(booking.start_date)} - {formatDate(booking.end_date)}
                    </Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Ionicons name="time-outline" size={18} color="#666" />
                    <Text style={styles.detailText}>
                      {booking.start_time} - {booking.end_time}
                    </Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Ionicons name="location-outline" size={18} color="#666" />
                    <Text style={styles.detailText}>{getLocationLabel(booking.location)}</Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Ionicons name="shield-checkmark-outline" size={18} color="#666" />
                    <Text style={styles.detailText}>{booking.insurance.toUpperCase()}</Text>
                  </View>
                </View>
                
                <View style={styles.bookingFooter}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalPrice}>{booking.total_price} €</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
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
  emptyScroll: {
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
    lineHeight: 22,
  },
  bookingsList: {
    padding: 16,
  },
  bookingCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#4754eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  carName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  bookingDetails: {
    gap: 10,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
  },
  bookingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  totalLabel: {
    fontSize: 14,
    color: '#666',
  },
  totalPrice: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4754eb',
  },
});
