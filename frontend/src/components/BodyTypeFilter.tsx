import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useLanguage } from '../context/LanguageContext';

type BodyType = 'all' | 'sedan' | 'suv' | 'hatchback' | 'minivan' | 'coupe' | 'universal';

interface BodyTypeFilterProps {
  selectedType: BodyType;
  onSelectType: (type: BodyType) => void;
}

const BODY_TYPES: { type: BodyType; image: string }[] = [
  {
    type: 'all',
    image: 'https://blacklineauto.md/wp-content/uploads/2026/02/all-cars.png',
  },
  {
    type: 'sedan',
    image: 'https://blacklineauto.md/wp-content/uploads/2026/02/sedan.png',
  },
  {
    type: 'suv',
    image: 'https://blacklineauto.md/wp-content/uploads/2026/02/suv.png',
  },
  {
    type: 'hatchback',
    image: 'https://blacklineauto.md/wp-content/uploads/2026/02/hatchback.png',
  },
  {
    type: 'minivan',
    image: 'https://blacklineauto.md/wp-content/uploads/2026/02/minivan.png',
  },
  {
    type: 'coupe',
    image: 'https://blacklineauto.md/wp-content/uploads/2026/02/coupe.png',
  },
  {
    type: 'universal',
    image: 'https://blacklineauto.md/wp-content/uploads/2025/11/2018-bmw-x3-car-2011-bmw-3-series-bmw-328-side-view-e7281b7611a1bcd5087ae98d0df9b6e0-1.png',
  },
];

const LABELS: Record<BodyType, { ro: string; ru: string }> = {
  all: { ro: 'Toate', ru: 'Все' },
  sedan: { ro: 'Sedan', ru: 'Седан' },
  suv: { ro: 'SUV', ru: 'Внедорожник' },
  hatchback: { ro: 'Hatchback', ru: 'Хэтчбек' },
  minivan: { ro: 'Minivan', ru: 'Минивэн' },
  coupe: { ro: 'Coupe', ru: 'Купе' },
  universal: { ro: 'Universal', ru: 'Универсал' },
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
          <View style={{ padding: 2 }}>
            <Image
              source={{ uri: item.image }}
              style={styles.typeImage}
              resizeMode="cover"
            />
            </View>
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
    width: 100,
  height: 50,
  resizeMode: 'contain',
  alignSelf: 'center',
  paddingHorizontal: 5,
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
