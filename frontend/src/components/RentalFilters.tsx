import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRental } from '../context/RentalContext';
import { useLanguage } from '../context/LanguageContext';

const LOCATIONS = [
  { id: 'office', labelRo: 'Oficiu', labelRu: 'Офис', sublabelRo: 'Gratuit', sublabelRu: 'Бесплатно', fee: 0 },
  { id: 'chisinau_airport', labelRo: 'Aeroport Chișinău', labelRu: 'Аэропорт Кишинёв', sublabelRo: 'Gratuit', sublabelRu: 'Бесплатно', fee: 0 },
  { id: 'iasi_airport', labelRo: 'Aeroport Iași', labelRu: 'Аэропорт Яссы', sublabelRo: '+150 €', sublabelRu: '+150 €', fee: 150 },
];

const INSURANCE_OPTIONS = [
  { id: 'rca', labelRo: 'RCA', labelRu: 'RCA', sublabelRo: 'Inclus', sublabelRu: 'Включено', price: 0 },
  { id: 'casco', labelRo: 'CASCO', labelRu: 'КАСКО', sublabelRo: 'Extra', sublabelRu: 'Дополнительно', price: 'variabil' },
];

// 24-hour time options
const TIME_OPTIONS = [
  '00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00',
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00',
  '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00',
];

export default function RentalFilters() {
  const { filters, setFilters } = useRental();
  const { language, t } = useLanguage();
  const [showStartDate, setShowStartDate] = useState(false);
  const [showEndDate, setShowEndDate] = useState(false);
  const [showStartTime, setShowStartTime] = useState(false);
  const [showEndTime, setShowEndTime] = useState(false);
  const [showLocation, setShowLocation] = useState(false);
  const [showInsurance, setShowInsurance] = useState(false);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(language === 'ro' ? 'ro-RO' : 'ru-RU', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getLocationLabel = () => {
    const loc = LOCATIONS.find(l => l.id === filters.location);
    if (!loc) return language === 'ro' ? 'Selectează' : 'Выберите';
    return language === 'ro' ? loc.labelRo : loc.labelRu;
  };

  const getInsuranceLabel = () => {
    const ins = INSURANCE_OPTIONS.find(i => i.id === filters.insurance);
    if (!ins) return language === 'ro' ? 'Selectează' : 'Выберите';
    return language === 'ro' ? ins.labelRo : ins.labelRu;
  };

  // Fee applies before 08:00 and after 18:00 (20€)
  const isOutsideHours = (time: string) => {
    const hour = parseInt(time.split(':')[0]);
    return hour < 8 || hour >= 18;
  };

  const renderPickerModal = (
    visible: boolean,
    onClose: () => void,
    title: string,
    children: React.ReactNode
  ) => (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          {children}
        </View>
      </View>
    </Modal>
  );

  // Translations for UI texts
  const texts = {
    title: language === 'ro' ? 'Configurează închirierea' : 'Настроить аренду',
    pickupDate: language === 'ro' ? 'Data preluare' : 'Дата получения',
    returnDate: language === 'ro' ? 'Data returnare' : 'Дата возврата',
    pickupTime: language === 'ro' ? 'Ora preluare' : 'Время получения',
    returnTime: language === 'ro' ? 'Ora returnare' : 'Время возврата',
    pickupLocation: language === 'ro' ? 'Locație preluare' : 'Место получения',
    insurance: language === 'ro' ? 'Asigurare' : 'Страховка',
    infoText: language === 'ro' 
      ? 'Program: 08:00 - 18:00. În afara programului se aplică taxa de 20€.'
      : 'Часы работы: 08:00 - 18:00. Вне рабочих часов применяется сбор 20€.',
    selectPickupTime: language === 'ro' ? 'Selectează ora de preluare' : 'Выберите время получения',
    selectReturnTime: language === 'ro' ? 'Selectează ora de returnare' : 'Выберите время возврата',
    selectLocation: language === 'ro' ? 'Selectează locația' : 'Выберите место',
    selectInsurance: language === 'ro' ? 'Selectează asigurarea' : 'Выберите страховку',
    outsideHours: language === 'ro' ? 'în afara programului' : 'вне рабочих часов',
    includedInPrice: language === 'ro' ? 'Inclus în preț' : 'Включено в стоимость',
    pricePerDay: language === 'ro' ? 'Preț per zi - variază în funcție de mașină' : 'Цена за день - зависит от автомобиля',
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{texts.title}</Text>
      
      {/* Date Selection - Direct calendar open on click */}
      <View style={styles.row}>
        <TouchableOpacity style={styles.field} onPress={() => setShowStartDate(true)}>
          <Ionicons name="calendar-outline" size={20} color="#007AFF" />
          <View style={styles.fieldContent}>
            <Text style={styles.fieldLabel}>{texts.pickupDate}</Text>
            <Text style={styles.fieldValue}>{formatDate(filters.startDate)}</Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.field} onPress={() => setShowEndDate(true)}>
          <Ionicons name="calendar-outline" size={20} color="#007AFF" />
          <View style={styles.fieldContent}>
            <Text style={styles.fieldLabel}>{texts.returnDate}</Text>
            <Text style={styles.fieldValue}>{formatDate(filters.endDate)}</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Time Selection - 24h format with 20€ fee for outside hours */}
      <View style={styles.row}>
        <TouchableOpacity style={styles.field} onPress={() => setShowStartTime(true)}>
          <Ionicons name="time-outline" size={20} color="#007AFF" />
          <View style={styles.fieldContent}>
            <Text style={styles.fieldLabel}>{texts.pickupTime}</Text>
            <Text style={[styles.fieldValue, isOutsideHours(filters.startTime) && styles.warningText]}>
              {filters.startTime}
              {isOutsideHours(filters.startTime) && ' (+20€)'}
            </Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.field} onPress={() => setShowEndTime(true)}>
          <Ionicons name="time-outline" size={20} color="#007AFF" />
          <View style={styles.fieldContent}>
            <Text style={styles.fieldLabel}>{texts.returnTime}</Text>
            <Text style={[styles.fieldValue, isOutsideHours(filters.endTime) && styles.warningText]}>
              {filters.endTime}
              {isOutsideHours(filters.endTime) && ' (+20€)'}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Location & Insurance */}
      <View style={styles.row}>
        <TouchableOpacity style={styles.field} onPress={() => setShowLocation(true)}>
          <Ionicons name="location-outline" size={20} color="#007AFF" />
          <View style={styles.fieldContent}>
            <Text style={styles.fieldLabel}>{texts.pickupLocation}</Text>
            <Text style={styles.fieldValue}>{getLocationLabel()}</Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.field} onPress={() => setShowInsurance(true)}>
          <Ionicons name="shield-checkmark-outline" size={20} color="#007AFF" />
          <View style={styles.fieldContent}>
            <Text style={styles.fieldLabel}>{texts.insurance}</Text>
            <Text style={styles.fieldValue}>{getInsuranceLabel()}</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Info about outside hours - Updated to 20€ */}
      <View style={styles.infoBox}>
        <Ionicons name="information-circle-outline" size={18} color="#666" />
        <Text style={styles.infoText}>
          {texts.infoText}
        </Text>
      </View>

      {/* Date Pickers */}
      {showStartDate && (
        <DateTimePicker
          value={filters.startDate}
          mode="date"
          minimumDate={new Date()}
          onChange={(event, date) => {
            setShowStartDate(Platform.OS === 'ios');
            if (date) {
              setFilters({ startDate: date });
              if (date > filters.endDate) {
                setFilters({ endDate: new Date(date.getTime() + 24 * 60 * 60 * 1000) });
              }
            }
          }}
        />
      )}

      {showEndDate && (
        <DateTimePicker
          value={filters.endDate}
          mode="date"
          minimumDate={filters.startDate}
          onChange={(event, date) => {
            setShowEndDate(Platform.OS === 'ios');
            if (date) setFilters({ endDate: date });
          }}
        />
      )}

      {/* Time Picker Modal */}
      {renderPickerModal(showStartTime, () => setShowStartTime(false), 'Selectează ora de preluare', (
        <ScrollView style={styles.optionsList}>
          {TIME_OPTIONS.map(time => (
            <TouchableOpacity
              key={time}
              style={[styles.optionItem, filters.startTime === time && styles.optionItemSelected]}
              onPress={() => {
                setFilters({ startTime: time });
                setShowStartTime(false);
              }}
            >
              <Text style={[styles.optionText, filters.startTime === time && styles.optionTextSelected]}>
                {time}
              </Text>
              {isOutsideHours(time) && (
                <Text style={styles.optionFee}>+25€ (în afara programului)</Text>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      ))}

      {renderPickerModal(showEndTime, () => setShowEndTime(false), 'Selectează ora de returnare', (
        <ScrollView style={styles.optionsList}>
          {TIME_OPTIONS.map(time => (
            <TouchableOpacity
              key={time}
              style={[styles.optionItem, filters.endTime === time && styles.optionItemSelected]}
              onPress={() => {
                setFilters({ endTime: time });
                setShowEndTime(false);
              }}
            >
              <Text style={[styles.optionText, filters.endTime === time && styles.optionTextSelected]}>
                {time}
              </Text>
              {isOutsideHours(time) && (
                <Text style={styles.optionFee}>+25€ (în afara programului)</Text>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      ))}

      {/* Location Picker Modal */}
      {renderPickerModal(showLocation, () => setShowLocation(false), 'Selectează locația', (
        <View style={styles.optionsList}>
          {LOCATIONS.map(loc => (
            <TouchableOpacity
              key={loc.id}
              style={[styles.optionItem, filters.location === loc.id && styles.optionItemSelected]}
              onPress={() => {
                setFilters({ location: loc.id as any });
                setShowLocation(false);
              }}
            >
              <View>
                <Text style={[styles.optionText, filters.location === loc.id && styles.optionTextSelected]}>
                  {loc.label}
                </Text>
                <Text style={styles.optionFee}>{loc.sublabel}</Text>
              </View>
              {filters.location === loc.id && (
                <Ionicons name="checkmark-circle" size={24} color="#4754eb" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      ))}

      {/* Insurance Picker Modal */}
      {renderPickerModal(showInsurance, () => setShowInsurance(false), 'Selectează asigurarea', (
        <View style={styles.optionsList}>
          {INSURANCE_OPTIONS.map(ins => (
            <TouchableOpacity
              key={ins.id}
              style={[styles.optionItem, filters.insurance === ins.id && styles.optionItemSelected]}
              onPress={() => {
                setFilters({ insurance: ins.id as any });
                setShowInsurance(false);
              }}
            >
              <View>
                <Text style={[styles.optionText, filters.insurance === ins.id && styles.optionTextSelected]}>
                  {ins.label}
                </Text>
                <Text style={styles.optionFee}>
                  {ins.id === 'rca' ? 'Inclus în preț' : 'Preț per zi - variază în funcție de mașină'}
                </Text>
              </View>
              {filters.insurance === ins.id && (
                <Ionicons name="checkmark-circle" size={24} color="#4754eb" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  field: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 10,
  },
  fieldContent: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  fieldValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  warningText: {
    color: '#FF9500',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f0f8ff',
    padding: 12,
    borderRadius: 10,
    marginTop: 4,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  optionsList: {
    padding: 8,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 10,
    marginBottom: 4,
  },
  optionItemSelected: {
    backgroundColor: '#e6f2ff',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  optionTextSelected: {
    color: '#007AFF',
    fontWeight: '600',
  },
  optionFee: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
});
