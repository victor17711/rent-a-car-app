import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator, Alert, Dimensions, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';
import { useRental } from '../../src/context/RentalContext';
import { useLanguage } from '../../src/context/LanguageContext';
import { api } from '../../src/utils/api';
import { Car, PriceCalculation } from '../../src/types';

const { width } = Dimensions.get('window');

export default function CarDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { filters } = useRental();
  const { language } = useLanguage();
  
  const [car, setCar] = useState<Car | null>(null);
  const [price, setPrice] = useState<PriceCalculation | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showBookingModal, setShowBookingModal] = useState(false);
  
  // Booking form
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAge, setCustomerAge] = useState('');

  // Translations
  const texts = {
    back: language === 'ro' ? 'Înapoi' : 'Назад',
    loading: language === 'ro' ? 'Se încarcă...' : 'Загрузка...',
    loadingDetails: language === 'ro' ? 'Se încarcă detaliile...' : 'Загрузка деталей...',
    error: language === 'ro' ? 'Eroare' : 'Ошибка',
    carNotFound: language === 'ro' ? 'Mașina nu a fost găsită' : 'Автомобиль не найден',
    couldNotLoad: language === 'ro' ? 'Nu s-au putut încărca detaliile mașinii.' : 'Не удалось загрузить данные автомобиля.',
    noImage: language === 'ro' ? 'Fără imagine' : 'Нет изображения',
    description: language === 'ro' ? 'Descriere' : 'Описание',
    specifications: language === 'ro' ? 'Specificații' : 'Характеристики',
    engine: language === 'ro' ? 'Motor' : 'Двигатель',
    power: language === 'ro' ? 'Putere' : 'Мощность',
    consumption: language === 'ro' ? 'Consum' : 'Расход',
    trunk: language === 'ro' ? 'Portbagaj' : 'Багажник',
    ac: language === 'ro' ? 'Aer Condiționat' : 'Кондиционер',
    gps: 'GPS',
    bluetooth: 'Bluetooth',
    leatherSeats: language === 'ro' ? 'Scaune piele' : 'Кожаные сиденья',
    cruiseControl: language === 'ro' ? 'Cruise Control' : 'Круиз-контроль',
    keylessEntry: language === 'ro' ? 'Keyless Entry' : 'Бесключевой доступ',
    cameraSpate: language === 'ro' ? 'Cameră Spate' : 'Камера заднего вида',
    senzoriParcare: language === 'ro' ? 'Senzori Parcare' : 'Датчики парковки',
    faruriLed: language === 'ro' ? 'Faruri LED' : 'Светодиодные фары',
    trapaPanoramica: language === 'ro' ? 'Trapă Panoramică' : 'Панорамная крыша',
    volanIncalzit: language === 'ro' ? 'Volan Încălzit' : 'Подогрев руля',
    scauneIncalzite: language === 'ro' ? 'Scaune Încălzite' : 'Подогрев сидений',
    laneAssist: 'Lane Assist',
    prices: language === 'ro' ? 'Prețuri' : 'Цены',
    day: language === 'ro' ? 'zi' : 'день',
    days: language === 'ro' ? 'zile' : 'дней',
    priceCalculation: language === 'ro' ? 'Calculul Prețului' : 'Расчёт цены',
    period: language === 'ro' ? 'Perioadă' : 'Период',
    dailyRate: language === 'ro' ? 'Tarif zilnic' : 'Дневной тариф',
    casco: 'КАСКО',
    fee: language === 'ro' ? 'Taxă' : 'Сбор',
    outsideHours: language === 'ro' ? 'În afara programului' : 'Вне рабочих часов',
    total: language === 'ro' ? 'TOTAL' : 'ИТОГО',
    bookNow: language === 'ro' ? 'Rezervă Acum' : 'Забронировать',
    authRequired: language === 'ro' ? 'Autentificare necesară' : 'Требуется авторизация',
    authMessage: language === 'ro' ? 'Trebuie să fiți autentificat pentru a face o rezervare.' : 'Для бронирования необходимо авторизоваться.',
    cancel: language === 'ro' ? 'Anulează' : 'Отмена',
    authenticate: language === 'ro' ? 'Autentifică-te' : 'Войти',
    contactData: language === 'ro' ? 'Date Contact' : 'Контактные данные',
    fillData: language === 'ro' ? 'Completați datele pentru rezervare' : 'Заполните данные для бронирования',
    fullName: language === 'ro' ? 'Nume complet *' : 'Полное имя *',
    phone: language === 'ro' ? 'Telefon *' : 'Телефон *',
    age: language === 'ro' ? 'Vârsta *' : 'Возраст *',
    sendBooking: language === 'ro' ? 'Trimite Rezervarea' : 'Отправить бронирование',
    success: language === 'ro' ? 'Succes!' : 'Успешно!',
    bookingCreated: language === 'ro' ? 'Rezervarea a fost creată cu succes. Veți fi contactat în curând pentru confirmare.' : 'Бронирование успешно создано. Мы свяжемся с вами в ближайшее время.',
    ok: 'OK',
    enterFullName: language === 'ro' ? 'Introduceți numele complet' : 'Введите полное имя',
    enterPhone: language === 'ro' ? 'Introduceți numărul de telefon' : 'Введите номер телефона',
    enterValidAge: language === 'ro' ? 'Introduceți o vârstă validă (18-99)' : 'Введите корректный возраст (18-99)',
    couldNotCreate: language === 'ro' ? 'Nu s-a putut crea rezervarea.' : 'Не удалось создать бронирование.',
  };

  const getTransmissionLabel = (t: string) => {
    if (language === 'ru') {
      return t === 'automatic' ? 'Автомат' : 'Механика';
    }
    return t === 'automatic' ? 'Automat' : 'Manual';
  };

  const getFuelLabel = (f: string) => {
    if (language === 'ru') {
      const labels: Record<string, string> = {
        diesel: 'Дизель',
        petrol: 'Бензин',
        electric: 'Электро',
        hybrid: 'Гибрид',
      };
      return labels[f] || f;
    }
    const labels: Record<string, string> = {
      diesel: 'Diesel',
      petrol: 'Benzină',
      electric: 'Electric',
      hybrid: 'Hybrid',
    };
    return labels[f] || f;
  };

  const getSeatsLabel = (seats: number) => {
    if (language === 'ru') {
      return `${seats} мест`;
    }
    return `${seats} locuri`;
  };

  const getDaysLabel = (d: number) => {
    if (language === 'ru') {
      return d === 1 ? 'день' : 'дней';
    }
    return d === 1 ? 'zi' : 'zile';
  };

  const getLocationLabel = (loc: string) => {
    if (language === 'ru') {
      const labels: Record<string, string> = {
        office: 'Офис',
        chisinau_airport: 'Аэропорт Кишинёв',
        iasi_airport: 'Аэропорт Яссы',
      };
      return labels[loc] || loc;
    }
    const labels: Record<string, string> = {
      office: 'Oficiu',
      chisinau_airport: 'Aeroport Chișinău',
      iasi_airport: 'Aeroport Iași',
    };
    return labels[loc] || loc;
  };

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
      Alert.alert(texts.error, texts.couldNotLoad);
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

  const handleReservePress = () => {
    if (!isAuthenticated) {
      Alert.alert(
        texts.authRequired,
        texts.authMessage,
        [
          { text: texts.cancel, style: 'cancel' },
          { text: texts.authenticate, onPress: () => router.push('/') },
        ]
      );
      return;
    }
    setShowBookingModal(true);
  };

  const handleBookingSubmit = async () => {
    if (!customerName.trim()) {
      Alert.alert(texts.error, texts.enterFullName);
      return;
    }
    if (!customerPhone.trim()) {
      Alert.alert(texts.error, texts.enterPhone);
      return;
    }
    if (!customerAge.trim() || parseInt(customerAge) < 18 || parseInt(customerAge) > 99) {
      Alert.alert(texts.error, texts.enterValidAge);
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
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        customer_age: parseInt(customerAge),
      });
      
      setShowBookingModal(false);
      Alert.alert(
        texts.success,
        texts.bookingCreated,
        [{ text: texts.ok, onPress: () => router.push('/(tabs)/bookings') }]
      );
    } catch (error: any) {
      Alert.alert(texts.error, error.message || texts.couldNotCreate);
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: texts.loading, headerBackTitle: texts.back }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>{texts.loadingDetails}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!car) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: texts.error, headerBackTitle: texts.back }} />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#FF3B30" />
          <Text style={styles.errorText}>{texts.carNotFound}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen options={{ title: car.name, headerBackTitle: texts.back }} />
      
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
                <Text style={styles.noImageText}>{texts.noImage}</Text>
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
              <Ionicons name="cog-outline" size={24} color="#4754eb" />
              <Text style={styles.quickSpecText}>{getTransmissionLabel(car.transmission)}</Text>
            </View>
            <View style={styles.quickSpec}>
              <Ionicons name="water-outline" size={24} color="#4754eb" />
              <Text style={styles.quickSpecText}>{getFuelLabel(car.fuel)}</Text>
            </View>
            <View style={styles.quickSpec}>
              <Ionicons name="people-outline" size={24} color="#4754eb" />
              <Text style={styles.quickSpecText}>{getSeatsLabel(car.seats)}</Text>
            </View>
          </View>
        </View>

        {/* Description */}
        {car.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{texts.description}</Text>
            <Text style={styles.descriptionText}>{car.description}</Text>
          </View>
        )}

        {/* Detailed Specs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{texts.specifications}</Text>
          <View style={styles.specsGrid}>
            {car.specs.engine && (
              <View style={styles.specItem}>
                <Text style={styles.specLabel}>{texts.engine}</Text>
                <Text style={styles.specValue}>{car.specs.engine}</Text>
              </View>
            )}
            {car.specs.power && (
              <View style={styles.specItem}>
                <Text style={styles.specLabel}>{texts.power}</Text>
                <Text style={styles.specValue}>{car.specs.power}</Text>
              </View>
            )}
            {car.specs.consumption && (
              <View style={styles.specItem}>
                <Text style={styles.specLabel}>{texts.consumption}</Text>
                <Text style={styles.specValue}>{car.specs.consumption}</Text>
              </View>
            )}
            {car.specs.trunk && (
              <View style={styles.specItem}>
                <Text style={styles.specLabel}>{texts.trunk}</Text>
                <Text style={styles.specValue}>{car.specs.trunk}</Text>
              </View>
            )}
          </View>
          
          {/* Features */}
          <View style={styles.features}>
            {car.specs.ac && (
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color="#34C759" />
                <Text style={styles.featureText}>{texts.ac}</Text>
              </View>
            )}
            {car.specs.gps && (
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color="#34C759" />
                <Text style={styles.featureText}>{texts.gps}</Text>
              </View>
            )}
            {car.specs.bluetooth && (
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color="#34C759" />
                <Text style={styles.featureText}>{texts.bluetooth}</Text>
              </View>
            )}
            {car.specs.leather_seats && (
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color="#34C759" />
                <Text style={styles.featureText}>{texts.leatherSeats}</Text>
              </View>
            )}
            {car.specs.cruise_control && (
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color="#34C759" />
                <Text style={styles.featureText}>{texts.cruiseControl}</Text>
              </View>
            )}
            {car.specs.keyless_entry && (
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color="#34C759" />
                <Text style={styles.featureText}>{texts.keylessEntry}</Text>
              </View>
            )}
            {car.specs.camera_spate && (
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color="#34C759" />
                <Text style={styles.featureText}>{texts.cameraSpate}</Text>
              </View>
            )}
            {car.specs.senzori_parcare && (
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color="#34C759" />
                <Text style={styles.featureText}>{texts.senzoriParcare}</Text>
              </View>
            )}
            {car.specs.faruri_led && (
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color="#34C759" />
                <Text style={styles.featureText}>{texts.faruriLed}</Text>
              </View>
            )}
            {car.specs.trapa_panoramica && (
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color="#34C759" />
                <Text style={styles.featureText}>{texts.trapaPanoramica}</Text>
              </View>
            )}
            {car.specs.volan_incalzit && (
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color="#34C759" />
                <Text style={styles.featureText}>{texts.volanIncalzit}</Text>
              </View>
            )}
            {car.specs.scaune_incalzite && (
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color="#34C759" />
                <Text style={styles.featureText}>{texts.scauneIncalzite}</Text>
              </View>
            )}
            {car.specs.lane_assist && (
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color="#34C759" />
                <Text style={styles.featureText}>{texts.laneAssist}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Pricing Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{texts.prices}</Text>
          <View style={styles.pricingTable}>
            <View style={styles.pricingRow}>
              <Text style={styles.pricingLabel}>1 {texts.day}</Text>
              <Text style={styles.pricingValue}>{car.pricing.day_1} €/{texts.day}</Text>
            </View>
            <View style={styles.pricingRow}>
              <Text style={styles.pricingLabel}>3 {texts.days}</Text>
              <Text style={styles.pricingValue}>{car.pricing.day_3} €/{texts.day}</Text>
            </View>
            <View style={styles.pricingRow}>
              <Text style={styles.pricingLabel}>5 {texts.days}</Text>
              <Text style={styles.pricingValue}>{car.pricing.day_5} €/{texts.day}</Text>
            </View>
            <View style={styles.pricingRow}>
              <Text style={styles.pricingLabel}>10 {texts.days}</Text>
              <Text style={styles.pricingValue}>{car.pricing.day_10} €/{texts.day}</Text>
            </View>
            <View style={styles.pricingRow}>
              <Text style={styles.pricingLabel}>20+ {texts.days}</Text>
              <Text style={styles.pricingValue}>{car.pricing.day_20} €/{texts.day}</Text>
            </View>
          </View>
        </View>

        {/* Price Calculation */}
        {price && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{texts.priceCalculation}</Text>
            <View style={styles.calculationCard}>
              <View style={styles.calculationRow}>
                <Text style={styles.calculationLabel}>{texts.period}</Text>
                <Text style={styles.calculationValue}>{price.days} {getDaysLabel(price.days)}</Text>
              </View>
              <View style={styles.calculationRow}>
                <Text style={styles.calculationLabel}>{texts.dailyRate} ({price.breakdown.daily_rate} €)</Text>
                <Text style={styles.calculationValue}>{price.base_price} €</Text>
              </View>
              {price.casco_price > 0 && (
                <View style={styles.calculationRow}>
                  <Text style={styles.calculationLabel}>{texts.casco}</Text>
                  <Text style={styles.calculationValue}>+{price.casco_price} €</Text>
                </View>
              )}
              {price.location_fee > 0 && (
                <View style={styles.calculationRow}>
                  <Text style={styles.calculationLabel}>{texts.fee} {getLocationLabel(filters.location)}</Text>
                  <Text style={styles.calculationValue}>+{price.location_fee} €</Text>
                </View>
              )}
              {price.outside_hours_fee > 0 && (
                <View style={styles.calculationRow}>
                  <Text style={styles.calculationLabel}>{texts.outsideHours}</Text>
                  <Text style={styles.calculationValue}>+{price.outside_hours_fee} €</Text>
                </View>
              )}
              <View style={[styles.calculationRow, styles.calculationTotal]}>
                <Text style={styles.totalLabel}>{texts.total}</Text>
                <Text style={styles.totalValue}>{price.total_price} €</Text>
              </View>
            </View>
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Booking Footer */}
      <View style={styles.footer}>
        <View style={styles.footerPrice}>
          <Text style={styles.footerPriceLabel}>{texts.total}</Text>
          <Text style={styles.footerPriceValue}>{price?.total_price || '...'} €</Text>
        </View>
        <TouchableOpacity
          style={styles.bookButton}
          onPress={handleReservePress}
        >
          <Ionicons name="calendar-outline" size={20} color="#fff" />
          <Text style={styles.bookButtonText}>{texts.bookNow}</Text>
        </TouchableOpacity>
      </View>

      {/* Booking Modal */}
      <Modal visible={showBookingModal} animationType="slide" transparent>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{texts.contactData}</Text>
              <TouchableOpacity onPress={() => setShowBookingModal(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.modalSubtitle}>{texts.fillData}</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{texts.fullName}</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: Ion Popescu"
                  placeholderTextColor="#999"
                  value={customerName}
                  onChangeText={setCustomerName}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{texts.phone}</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: +373 69 123 456"
                  placeholderTextColor="#999"
                  keyboardType="phone-pad"
                  value={customerPhone}
                  onChangeText={setCustomerPhone}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{texts.age}</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: 25"
                  placeholderTextColor="#999"
                  keyboardType="number-pad"
                  maxLength={2}
                  value={customerAge}
                  onChangeText={setCustomerAge}
                />
              </View>

              <View style={styles.bookingSummary}>
                <Text style={styles.summaryTitle}>{car?.name}</Text>
                <Text style={styles.summaryText}>
                  {filters.startDate.toLocaleDateString(language === 'ro' ? 'ro-RO' : 'ru-RU')} - {filters.endDate.toLocaleDateString(language === 'ro' ? 'ro-RO' : 'ru-RU')}
                </Text>
                <Text style={styles.summaryText}>
                  {filters.startTime} - {filters.endTime}
                </Text>
                <Text style={styles.summaryText}>
                  {getLocationLabel(filters.location)} • {filters.insurance.toUpperCase()}
                </Text>
                <Text style={styles.summaryPrice}>{texts.total}: {price?.total_price} €</Text>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.submitButton, booking && styles.submitButtonDisabled]}
                onPress={handleBookingSubmit}
                disabled={booking}
              >
                {booking ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>{texts.sendBooking}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
    height: 300,
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
  descriptionText: {
    fontSize: 15,
    color: '#444',
    lineHeight: 24,
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
    color: '#4754eb',
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
    paddingBottom: 24,
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
    color: '#4754eb',
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#4754eb',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  modalBody: {
    padding: 20,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1a1a1a',
  },
  bookingSummary: {
    backgroundColor: '#e6f2ff',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4754eb',
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  summaryPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4754eb',
    marginTop: 8,
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  submitButton: {
    backgroundColor: '#4754eb',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
