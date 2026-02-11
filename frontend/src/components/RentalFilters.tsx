import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRental } from '../context/RentalContext';

const LOCATIONS = [
  { id: 'office', label: 'Oficiu', sublabel: 'Gratuit', fee: 0 },
  { id: 'chisinau_airport', label: 'Aeroport Chișinău', sublabel: 'Gratuit', fee: 0 },
  { id: 'iasi_airport', label: 'Aeroport Iași', sublabel: '+150 €', fee: 150 },
];

const INSURANCE_OPTIONS = [
  { id: 'rca', label: 'RCA', sublabel: 'Inclus', price: 0 },
  { id: 'casco', label: 'CASCO', sublabel: 'Extra', price: 'variabil' },
];

const TIME_OPTIONS = [
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
  '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00',
];

export default function RentalFilters() {
  const { filters, setFilters } = useRental();
  const [showStartDate, setShowStartDate] = useState(false);
  const [showEndDate, setShowEndDate] = useState(false);
  const [showStartTime, setShowStartTime] = useState(false);
  const [showEndTime, setShowEndTime] = useState(false);
  const [showLocation, setShowLocation] = useState(false);
  const [showInsurance, setShowInsurance] = useState(false);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ro-RO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getLocationLabel = () => {
    return LOCATIONS.find(l => l.id === filters.location)?.label || 'Selectează';
  };

  const getInsuranceLabel = () => {
    return INSURANCE_OPTIONS.find(i => i.id === filters.insurance)?.label || 'Selectează';
  };

  const isOutsideHours = (time: string) => {
    const hour = parseInt(time.split(':')[0]);
    return hour < 9 || hour >= 18;
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Configurează închirierea</Text>
      
      {/* Date Selection */}
      <View style={styles.row}>
        <TouchableOpacity style={styles.field} onPress={() => setShowStartDate(true)}>
          <Ionicons name="calendar-outline" size={20} color="#007AFF" />
          <View style={styles.fieldContent}>
            <Text style={styles.fieldLabel}>Data preluare</Text>
            <Text style={styles.fieldValue}>{formatDate(filters.startDate)}</Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.field} onPress={() => setShowEndDate(true)}>
          <Ionicons name="calendar-outline" size={20} color="#007AFF" />
          <View style={styles.fieldContent}>
            <Text style={styles.fieldLabel}>Data returnare</Text>
            <Text style={styles.fieldValue}>{formatDate(filters.endDate)}</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Time Selection */}
      <View style={styles.row}>
        <TouchableOpacity style={styles.field} onPress={() => setShowStartTime(true)}>
          <Ionicons name="time-outline" size={20} color="#007AFF" />
          <View style={styles.fieldContent}>
            <Text style={styles.fieldLabel}>Ora preluare</Text>
            <Text style={[styles.fieldValue, isOutsideHours(filters.startTime) && styles.warningText]}>
              {filters.startTime}
              {isOutsideHours(filters.startTime) && ' (+25€)'}
            </Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.field} onPress={() => setShowEndTime(true)}>
          <Ionicons name="time-outline" size={20} color="#007AFF" />
          <View style={styles.fieldContent}>
            <Text style={styles.fieldLabel}>Ora returnare</Text>
            <Text style={[styles.fieldValue, isOutsideHours(filters.endTime) && styles.warningText]}>
              {filters.endTime}
              {isOutsideHours(filters.endTime) && ' (+25€)'}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Location & Insurance */}
      <View style={styles.row}>
        <TouchableOpacity style={styles.field} onPress={() => setShowLocation(true)}>
          <Ionicons name="location-outline" size={20} color="#007AFF" />
          <View style={styles.fieldContent}>
            <Text style={styles.fieldLabel}>Locație preluare</Text>
            <Text style={styles.fieldValue}>{getLocationLabel()}</Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.field} onPress={() => setShowInsurance(true)}>
          <Ionicons name="shield-checkmark-outline" size={20} color="#007AFF" />
          <View style={styles.fieldContent}>
            <Text style={styles.fieldLabel}>Asigurare</Text>
            <Text style={styles.fieldValue}>{getInsuranceLabel()}</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Info about outside hours */}
      <View style={styles.infoBox}>
        <Ionicons name="information-circle-outline" size={18} color="#666" />
        <Text style={styles.infoText}>
          Program: 09:00 - 18:00. În afara programului se aplică taxa de 25€.
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
                <Ionicons name="checkmark-circle" size={24} color="#A31621" />
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
                <Ionicons name="checkmark-circle" size={24} color="#007AFF" />
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
