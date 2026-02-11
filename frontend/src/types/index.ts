export interface User {
  user_id: string;
  email: string;
  name: string;
  picture?: string;
  role: string;
  created_at: string;
}

export interface CarPricing {
  day_1: number;
  day_3: number;
  day_5: number;
  day_10: number;
  day_20: number;
}

export interface CarSpecs {
  engine?: string;
  power?: string;
  consumption?: string;
  trunk?: string;
  ac?: boolean;
  gps?: boolean;
  bluetooth?: boolean;
  leather_seats?: boolean;
  cruise_control?: boolean;
  eco_mode?: boolean;
  [key: string]: any;
}

export interface Car {
  car_id: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  transmission: string;
  fuel: string;
  seats: int;
  images: string[];
  pricing: CarPricing;
  casco_price: number;
  specs: CarSpecs;
  available: boolean;
  created_at: string;
}

export interface PriceCalculation {
  car_id: string;
  days: number;
  base_price: number;
  casco_price: number;
  location_fee: number;
  outside_hours_fee: number;
  total_price: number;
  breakdown: {
    daily_rate: number;
    days: number;
    base: number;
    casco: number;
    location: number;
    outside_hours: number;
  };
}

export interface Booking {
  booking_id: string;
  user_id: string;
  car_id: string;
  car_name: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  location: string;
  insurance: string;
  total_price: number;
  status: string;
  created_at: string;
}

export interface RentalFilters {
  startDate: Date;
  endDate: Date;
  startTime: string;
  endTime: string;
  location: 'office' | 'chisinau_airport' | 'iasi_airport';
  insurance: 'rca' | 'casco';
}
