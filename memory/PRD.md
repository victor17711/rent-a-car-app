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
- **Contacts page** - Phone, Email, Address, Map link, WhatsApp, Viber, Telegram

### Admin Panel (Web)
- Dashboard with statistics
- Car management (CRUD with images, specs, pricing)
- Body type selection (sedan, suv, hatchback, minivan, coupe, universal)
- Booking management
- Partner request management
- Banner management
- FAQ management
- Legal content management
- **Contacts management** - Configure phone, email, address, map link, WhatsApp, Viber, Telegram links

## Navigation Tabs (Mobile App)
1. Acasă (Home) - Car listing with filters
2. Programări (Bookings) - User's bookings
3. **Contacte (Contacts)** - Company contact info + messenger buttons
4. Profil (Profile) - User settings

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
- `/api/cars` - Get cars with filters
- `/api/cars/{car_id}` - Get single car
- `/api/calculate-price` - Calculate rental price
- `/api/bookings` - Create/get bookings
- `/api/contacts` - Get contact info (public)
- `/api/admin/cars` - CRUD for cars
- `/api/admin/bookings` - Manage all bookings
- `/api/admin/contacts` - Update contact info
- `/api/admin/banners` - Banner management
- `/api/admin/faqs` - FAQ management
- `/api/legal/{type}` - Legal content

## Recent Updates (2026-02-15)
- Added Contacts tab in mobile app navigation (between Programări and Profil)
- Created Contacts page with:
  - Map section with address and "Open in Maps" button
  - Phone contact card
  - Email contact card
  - Messenger buttons (WhatsApp, Viber, Telegram)
- Added Contacts section in Admin Panel for managing contact info
- Added `/api/contacts` endpoint (public GET)
- Added `/api/admin/contacts` endpoint (admin PUT)

## Files Modified/Created
- `/app/frontend/app/(tabs)/contacts.tsx` - New contacts page
- `/app/frontend/app/(tabs)/_layout.tsx` - Added Contacts tab
- `/app/frontend/src/context/LanguageContext.tsx` - Added contact translations
- `/app/frontend/src/utils/api.ts` - Exported API_URL
- `/app/backend/server.py` - Added contacts endpoints
- `/app/backend/static/admin.html` - Added Contacts section
