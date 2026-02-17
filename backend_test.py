#!/usr/bin/env python3
"""
Backend API Testing for Car Rental App
Tests the core backend functionality including car listings and price calculations.
"""

import requests
import json
from datetime import datetime, timedelta

# Backend URL from frontend .env
BACKEND_URL = "https://swipe-gesture-qa.preview.emergentagent.com/api"

def test_get_all_cars():
    """Test GET /api/cars endpoint"""
    print("\n=== Testing GET /api/cars ===")
    
    try:
        response = requests.get(f"{BACKEND_URL}/cars")
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            cars = response.json()
            print(f"Number of cars returned: {len(cars)}")
            
            if len(cars) > 0:
                # Check first car structure
                first_car = cars[0]
                required_fields = ['car_id', 'name', 'brand', 'model', 'year', 'transmission', 'fuel', 'seats', 'pricing', 'casco_price', 'available']
                
                missing_fields = [field for field in required_fields if field not in first_car]
                if missing_fields:
                    print(f"❌ Missing required fields: {missing_fields}")
                    return False
                
                # Check pricing structure
                pricing = first_car.get('pricing', {})
                pricing_tiers = ['day_1', 'day_3', 'day_5', 'day_10', 'day_20']
                missing_tiers = [tier for tier in pricing_tiers if tier not in pricing]
                
                if missing_tiers:
                    print(f"❌ Missing pricing tiers: {missing_tiers}")
                    return False
                
                print(f"✅ Cars endpoint working correctly")
                print(f"Sample car: {first_car['name']} ({first_car['brand']} {first_car['model']})")
                print(f"Pricing tiers: {pricing}")
                return True
            else:
                print("❌ No cars returned - database might be empty")
                return False
        else:
            print(f"❌ Failed with status {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error testing cars endpoint: {str(e)}")
        return False

def test_get_car_by_id():
    """Test GET /api/cars/{car_id} endpoint"""
    print("\n=== Testing GET /api/cars/{car_id} ===")
    
    car_id = "car_bmw_seria3"
    
    try:
        response = requests.get(f"{BACKEND_URL}/cars/{car_id}")
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            car = response.json()
            
            # Verify it's the correct car
            if car.get('car_id') != car_id:
                print(f"❌ Wrong car returned. Expected: {car_id}, Got: {car.get('car_id')}")
                return False
            
            # Check required fields
            required_fields = ['car_id', 'name', 'brand', 'model', 'year', 'transmission', 'fuel', 'seats', 'pricing', 'casco_price']
            missing_fields = [field for field in required_fields if field not in car]
            
            if missing_fields:
                print(f"❌ Missing required fields: {missing_fields}")
                return False
            
            print(f"✅ Car by ID endpoint working correctly")
            print(f"Car: {car['name']} - {car['brand']} {car['model']} ({car['year']})")
            print(f"Pricing: {car['pricing']}")
            print(f"CASCO price: {car['casco_price']}€/day")
            return True
            
        elif response.status_code == 404:
            print(f"❌ Car not found - database might not be seeded")
            return False
        else:
            print(f"❌ Failed with status {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error testing car by ID endpoint: {str(e)}")
        return False

def test_price_calculation():
    """Test POST /api/calculate-price endpoint with different scenarios"""
    print("\n=== Testing POST /api/calculate-price ===")
    
    # Test scenario a) Basic 1 day rental at office with RCA
    print("\n--- Scenario A: 1 day rental at office with RCA ---")
    scenario_a = {
        "car_id": "car_bmw_seria3",
        "start_date": "2025-07-15",
        "end_date": "2025-07-15",
        "start_time": "10:00",
        "end_time": "17:00",
        "location": "office",
        "insurance": "rca"
    }
    
    result_a = test_price_scenario(scenario_a, expected_total=55, scenario_name="1 day office RCA")
    
    # Test scenario b) 3 days with CASCO at office
    print("\n--- Scenario B: 3 days with CASCO at office ---")
    scenario_b = {
        "car_id": "car_bmw_seria3",
        "start_date": "2025-07-15",
        "end_date": "2025-07-17",
        "start_time": "10:00",
        "end_time": "17:00",
        "location": "office",
        "insurance": "casco"
    }
    
    result_b = test_price_scenario(scenario_b, expected_total=195, scenario_name="3 days office CASCO")
    
    # Test scenario c) 5 days at Iasi airport with outside hours
    print("\n--- Scenario C: 5 days at Iasi airport with outside hours ---")
    scenario_c = {
        "car_id": "car_bmw_seria3",
        "start_date": "2025-07-15",
        "end_date": "2025-07-19",
        "start_time": "08:00",
        "end_time": "19:00",
        "location": "iasi_airport",
        "insurance": "rca"
    }
    
    result_c = test_price_scenario(scenario_c, expected_total=425, scenario_name="5 days Iasi outside hours")
    
    return result_a and result_b and result_c

def test_price_scenario(scenario_data, expected_total, scenario_name):
    """Test a specific price calculation scenario"""
    
    try:
        response = requests.post(
            f"{BACKEND_URL}/calculate-price",
            json=scenario_data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            
            # Check required fields in response
            required_fields = ['car_id', 'days', 'base_price', 'casco_price', 'location_fee', 'outside_hours_fee', 'total_price', 'breakdown']
            missing_fields = [field for field in required_fields if field not in result]
            
            if missing_fields:
                print(f"❌ Missing response fields: {missing_fields}")
                return False
            
            # Print breakdown
            print(f"Days: {result['days']}")
            print(f"Base price: {result['base_price']}€")
            print(f"CASCO price: {result['casco_price']}€")
            print(f"Location fee: {result['location_fee']}€")
            print(f"Outside hours fee: {result['outside_hours_fee']}€")
            print(f"Total price: {result['total_price']}€")
            print(f"Expected: {expected_total}€")
            
            # Verify total matches expected
            if result['total_price'] == expected_total:
                print(f"✅ {scenario_name} calculation correct")
                return True
            else:
                print(f"❌ {scenario_name} calculation incorrect. Expected: {expected_total}€, Got: {result['total_price']}€")
                return False
                
        elif response.status_code == 404:
            print(f"❌ Car not found - database might not be seeded")
            return False
        else:
            print(f"❌ Failed with status {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error testing price calculation: {str(e)}")
        return False

def test_seed_endpoint():
    """Test if database is seeded, seed if needed"""
    print("\n=== Checking/Seeding Database ===")
    
    try:
        # First check if cars exist
        response = requests.get(f"{BACKEND_URL}/cars")
        if response.status_code == 200:
            cars = response.json()
            if len(cars) > 0:
                print(f"✅ Database already has {len(cars)} cars")
                return True
        
        # Try to seed
        print("Attempting to seed database...")
        seed_response = requests.post(f"{BACKEND_URL}/seed")
        print(f"Seed Status Code: {seed_response.status_code}")
        
        if seed_response.status_code == 200:
            result = seed_response.json()
            print(f"✅ {result.get('message', 'Seeded successfully')}")
            return True
        else:
            print(f"❌ Seed failed: {seed_response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error with seeding: {str(e)}")
        return False

def main():
    """Run all backend tests"""
    print("🚗 Car Rental Backend API Tests")
    print(f"Testing backend at: {BACKEND_URL}")
    
    # Test results
    results = {}
    
    # 1. Check/seed database
    results['seed'] = test_seed_endpoint()
    
    # 2. Test get all cars
    results['get_cars'] = test_get_all_cars()
    
    # 3. Test get car by ID
    results['get_car_by_id'] = test_get_car_by_id()
    
    # 4. Test price calculations
    results['price_calculation'] = test_price_calculation()
    
    # Summary
    print("\n" + "="*50)
    print("TEST SUMMARY")
    print("="*50)
    
    passed = 0
    total = 0
    
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name.replace('_', ' ').title()}: {status}")
        if result:
            passed += 1
        total += 1
    
    print(f"\nOverall: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All backend tests passed!")
        return True
    else:
        print("⚠️  Some tests failed - check logs above")
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)