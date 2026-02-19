# RentMoldova - Car Rental App PRD

## Overview
React Native (Expo) car rental application for Moldova with multi-language support (Romanian/Russian).

## Core Features Implemented
- User authentication (Phone + Google OAuth)
- Car listing and filtering by body type
- Car detail pages with pricing calculator
- Booking system with customer form
- Profile management
- Favorites system
- FAQ, Terms & Conditions, Privacy Policy pages
- Contact information
- Admin panel for car/booking management

## Recent Changes (Feb 2025)

### Navigation Fixes
- Fixed "Înapoi" (Back) button duplication issue
- Configured `gestureEnabled: false` for login and tabs screens
- Configured `gestureEnabled: true` for detail pages
- Swipe back gesture from home screen no longer navigates to login
- Using native Expo Router header with `headerBackTitle` instead of custom buttons

## Architecture
- **Frontend**: Expo/React Native with expo-router
- **Backend**: FastAPI with MongoDB
- **State Management**: React Context (Auth, Language, Rental)

## Key Files
- `/app/frontend/app/_layout.tsx` - Main navigation configuration
- `/app/frontend/app/(tabs)/_layout.tsx` - Tab navigation
- `/app/frontend/src/context/` - Auth, Language, Rental contexts

## Backlog
- Additional language support
- Payment integration
- Push notifications
- Offline support
