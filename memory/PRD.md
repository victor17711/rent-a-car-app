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
- Body type selection (sedan, suv, hatchback, minivan, coupe, universals)
- Booking management
- Partner request management
- Banner management
- FAQ management
- Legal content management

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
- Added `body_type` filter to backend `/api/cars` endpoint
- Added `universal` body type option to frontend BodyTypeFilter component
- Fixed admin panel to save `body_type` when creating/editing cars
- Fixed admin panel to load `body_type` when editing existing cars
- Synchronized body types between frontend, backend, and admin panel

## Body Types Available
1. Sedan
2. SUV
3. Hatchback
4. Minivan
5. Coupe
6. Universal

## Files Modified
- `/app/backend/server.py` - Added body_type filter to GET /api/cars
- `/app/frontend/src/components/BodyTypeFilter.tsx` - Added universal type
- `/app/frontend/app/(tabs)/index.tsx` - Updated BodyType type definition
- `/app/backend/static/admin.html` - Fixed body_type save/load in car form
