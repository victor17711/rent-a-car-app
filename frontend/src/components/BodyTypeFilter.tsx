import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useLanguage } from '../context/LanguageContext';

type BodyType = 'all' | 'sedan' | 'suv' | 'hatchback' | 'minivan' | 'coupe';

interface BodyTypeFilterProps {
  selectedType: BodyType;
  onSelectType: (type: BodyType) => void;
}

const BODY_TYPES: { type: BodyType; image: string }[] = [
  {
    type: 'all',
    image: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=200&h=120&fit=crop',
  },
  {
    type: 'sedan',
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=200&h=120&fit=crop',
  },
  {
    type: 'suv',
    image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=200&h=120&fit=crop',
  },
  {
    type: 'hatchback',
    image: 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=200&h=120&fit=crop',
  },
  {
    type: 'minivan',
    image: 'https://images.unsplash.com/photo-1570294646112-27ce4f174e8a?w=200&h=120&fit=crop',
  },
  {
    type: 'coupe',
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=200&h=120&fit=crop',
  },
];

const LABELS: Record<BodyType, { ro: string; ru: string }> = {
  all: { ro: 'Toate', ru: 'Все' },
  sedan: { ro: 'Sedan', ru: 'Седан' },
  suv: { ro: 'SUV', ru: 'Внедорожник' },
  hatchback: { ro: 'Hatchback', ru: 'Хэтчбек' },
  minivan: { ro: 'Minivan', ru: 'Минивэн' },
  coupe: { ro: 'Coupe', ru: 'Купе' },
};

export default function BodyTypeFilter({ selectedType, onSelectType }: BodyTypeFilterProps) {
  const { language } = useLanguage();

  const getLabel = (type: BodyType) => {
    return language === 'ru' ? LABELS[type].ru : LABELS[type].ro;
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {BODY_TYPES.map((item) => (
          <TouchableOpacity
            key={item.type}
            style={[
              styles.typeCard,
              selectedType === item.type && styles.typeCardSelected,
            ]}
            onPress={() => onSelectType(item.type)}
            activeOpacity={0.7}
          >
            <Image
              source={{ uri: item.image }}
              style={styles.typeImage}
              resizeMode="cover"
            />
            <View style={[
              styles.labelContainer,
              selectedType === item.type && styles.labelContainerSelected,
            ]}>
              <Text style={[
                styles.typeLabel,
                selectedType === item.type && styles.typeLabelSelected,
              ]}>
                {getLabel(item.type)}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  typeCard: {
    width: 100,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  typeCardSelected: {
    borderWidth: 2,
    borderColor: '#4754eb',
  },
  typeImage: {
    width: '100%',
    height: 60,
  },
  labelContainer: {
    paddingVertical: 8,
    paddingHorizontal: 4,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  labelContainerSelected: {
    backgroundColor: '#4754eb',
  },
  typeLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  typeLabelSelected: {
    color: '#fff',
  },
});
