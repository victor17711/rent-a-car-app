# RentMoldova - Car Rental Application PRD

## Overview
RentMoldova is a car rental platform for Moldova with a mobile-first Expo/React Native frontend and FastAPI backend.

## Core Features

### User-Facing (Mobile App)
- User registration/login with phone + password
- Browse available cars with filters
- Body type filtering (sedan, suv, hatchback, minivan, coupe, universal)
- Rental configuration (dates, times, location, insurance)
- Price calculation based on rental duration
- Booking creation and management
- Favorites system
- Multi-language support (Romanian/Russian)
- FAQ section
- Legal content (Terms & Privacy)

### Admin Panel (Web)
- Dashboard with statistics
- Car management (CRUD with images, specs, pricing)
- Body type selection (sedan, suv, hatchback, minivan, coupe, universal)
- Booking management
- Partner request management
- Banner management
- FAQ management
- Legal content management

## Dotări Standard (13 opțiuni fixe)
1. Aer Condiționat (ac)
2. GPS (gps)
3. Bluetooth (bluetooth)
4. Scaune Piele (leather_seats)
5. Cruise Control (cruise_control)
6. Keyless Entry (keyless_entry)
7. Cameră Spate (camera_spate)
8. Senzori Parcare (senzori_parcare)
9. Faruri LED (faruri_led)
10. Trapă Panoramică (trapa_panoramica)
11. Volan Încălzit (volan_incalzit)
12. Scaune Încălzite (scaune_incalzite)
13. Lane Assist (lane_assist)

## Technical Stack
- Frontend: Expo/React Native (TypeScript)
- Backend: FastAPI (Python)
- Database: MongoDB
- Admin: HTML/Bootstrap/JavaScript

## API Endpoints
- `/api/cars` - Get cars with filters (brand, transmission, fuel, body_type, seats)
- `/api/cars/{car_id}` - Get single car
- `/api/calculate-price` - Calculate rental price
- `/api/bookings` - Create/get bookings
- `/api/admin/cars` - CRUD for cars
- `/api/admin/bookings` - Manage all bookings
- `/api/admin/banners` - Banner management
- `/api/admin/faqs` - FAQ management
- `/api/legal/{type}` - Legal content

## Recent Updates (2026-02-15)
- Removed custom features functionality (Adaugă Dotare Nouă)
- Added 8 new standard features to Dotări Standard section:
  - Keyless Entry
  - Cameră Spate
  - Senzori Parcare
  - Faruri LED
  - Trapă Panoramică
  - Volan Încălzit
  - Scaune Încălzite
  - Lane Assist
- Updated frontend to display all 13 standard features
- Updated TypeScript types for CarSpecs

## Body Types Available
1. Sedan
2. SUV
3. Hatchback
4. Minivan
5. Coupe
6. Universal

## Files Modified
- `/app/backend/static/admin.html` - Updated Dotări Standard with 13 options, removed custom features
- `/app/frontend/app/car/[id].tsx` - Added display for all 13 features
- `/app/frontend/src/types/index.ts` - Updated CarSpecs interface
