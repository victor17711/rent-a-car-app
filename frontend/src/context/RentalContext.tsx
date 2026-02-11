import React, { createContext, useContext, useState, ReactNode } from 'react';
import { RentalFilters } from '../types';

interface RentalContextType {
  filters: RentalFilters;
  setFilters: (filters: Partial<RentalFilters>) => void;
  resetFilters: () => void;
}

const defaultFilters: RentalFilters = {
  startDate: new Date(),
  endDate: new Date(), // Same day = 1 day rental
  startTime: '10:00',
  endTime: '10:00',
  location: 'office',
  insurance: 'rca',
};

const RentalContext = createContext<RentalContextType | undefined>(undefined);

export function RentalProvider({ children }: { children: ReactNode }) {
  const [filters, setFiltersState] = useState<RentalFilters>(defaultFilters);

  const setFilters = (newFilters: Partial<RentalFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  };

  const resetFilters = () => {
    setFiltersState(defaultFilters);
  };

  return (
    <RentalContext.Provider value={{ filters, setFilters, resetFilters }}>
      {children}
    </RentalContext.Provider>
  );
}

export function useRental() {
  const context = useContext(RentalContext);
  if (context === undefined) {
    throw new Error('useRental must be used within a RentalProvider');
  }
  return context;
}
