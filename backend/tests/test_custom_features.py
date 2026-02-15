"""
Backend tests for Custom Features (Dotări Personalizate) functionality
Tests: Admin login, Car CRUD with custom_features, car detail API
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://auto-dotari.preview.emergentagent.com')

# Test credentials from requirements
ADMIN_PHONE = "060123456"
ADMIN_PASSWORD = "test123"
TEST_CAR_ID = "car_c213499b9541"


class TestAuthenticationFlow:
    """Test authentication flow for admin panel"""

    def test_admin_login_success(self):
        """Test admin login with valid credentials"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"phone": ADMIN_PHONE, "password": ADMIN_PASSWORD}
        )
        assert response.status_code == 200, f"Login failed: {response.text}"
        
        data = response.json()
        assert "session_token" in data, "Missing session_token in response"
        assert "user" in data, "Missing user in response"
        assert data["user"]["role"] == "admin", f"User role is not admin: {data['user']['role']}"
        print(f"✓ Admin login successful, user role: {data['user']['role']}")
        return data["session_token"]

    def test_admin_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"phone": "wrong_phone", "password": "wrong_pass"}
        )
        assert response.status_code in [400, 401, 404], f"Expected auth error, got {response.status_code}"
        print("✓ Invalid credentials rejected correctly")


class TestCarWithCustomFeatures:
    """Test car API with custom_features field"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get authentication token for admin tests"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"phone": ADMIN_PHONE, "password": ADMIN_PASSWORD}
        )
        if response.status_code == 200:
            return response.json()["session_token"]
        pytest.skip("Authentication failed - skipping authenticated tests")

    @pytest.fixture(scope="class")
    def auth_headers(self, auth_token):
        """Return headers with auth token"""
        return {"Authorization": f"Bearer {auth_token}", "Content-Type": "application/json"}

    def test_get_test_car_with_custom_features(self):
        """Test that test car exists and has custom_features in specs"""
        response = requests.get(f"{BASE_URL}/api/cars/{TEST_CAR_ID}")
        assert response.status_code == 200, f"Failed to get test car: {response.text}"
        
        car = response.json()
        assert car["car_id"] == TEST_CAR_ID, "Car ID mismatch"
        assert car["name"] == "Test Car cu Dotări", f"Car name mismatch: {car['name']}"
        
        # Verify custom_features in specs
        assert "specs" in car, "Missing specs field"
        assert "custom_features" in car["specs"], "Missing custom_features in specs"
        
        custom_features = car["specs"]["custom_features"]
        assert isinstance(custom_features, list), "custom_features should be a list"
        assert len(custom_features) > 0, "custom_features should not be empty"
        
        # Verify expected custom features
        expected_features = ["Cameră marsarier", "Senzori parcare", "Încălzire scaune"]
        for feature in expected_features:
            assert feature in custom_features, f"Missing expected feature: {feature}"
        
        print(f"✓ Test car has custom_features: {custom_features}")

    def test_create_car_with_custom_features(self, auth_headers):
        """Test creating a new car with custom features"""
        car_data = {
            "name": "TEST_Car Custom Features",
            "brand": "TestBrand",
            "model": "TestModel",
            "year": 2024,
            "body_type": "sedan",
            "transmission": "automatic",
            "fuel": "diesel",
            "seats": 5,
            "images": [],
            "main_image_index": 0,
            "pricing": {
                "day_1": 50,
                "day_3": 45,
                "day_5": 40,
                "day_10": 35,
                "day_20": 30
            },
            "casco_price": 10,
            "description": "Test car with custom features",
            "available": True,
            "order": 999,
            "specs": {
                "engine": "2.0 TDI",
                "power": "150 CP",
                "ac": True,
                "gps": True,
                "bluetooth": False,
                "leather_seats": False,
                "cruise_control": False,
                "custom_features": ["Test Feature 1", "Test Feature 2", "Scaune încălzite"]
            }
        }
        
        response = requests.post(
            f"{BASE_URL}/api/admin/cars",
            json=car_data,
            headers=auth_headers
        )
        assert response.status_code == 200, f"Failed to create car: {response.text}"
        
        created_car = response.json()
        assert "car_id" in created_car, "Missing car_id in response"
        
        # Verify custom features in created car
        assert created_car["specs"]["custom_features"] == car_data["specs"]["custom_features"], \
            f"Custom features mismatch"
        
        print(f"✓ Created car with custom_features: {created_car['specs']['custom_features']}")
        
        # Store car_id for cleanup
        return created_car["car_id"]

    def test_update_car_add_custom_feature(self, auth_headers):
        """Test updating a car to add a new custom feature"""
        # First create a test car
        car_data = {
            "name": "TEST_Update Custom Features",
            "brand": "TestBrand",
            "model": "UpdateTest",
            "year": 2024,
            "transmission": "manual",
            "fuel": "petrol",
            "seats": 4,
            "pricing": {"day_1": 40, "day_3": 35, "day_5": 30, "day_10": 25, "day_20": 20},
            "casco_price": 8,
            "specs": {
                "ac": True,
                "custom_features": ["Initial Feature"]
            }
        }
        
        create_response = requests.post(
            f"{BASE_URL}/api/admin/cars",
            json=car_data,
            headers=auth_headers
        )
        assert create_response.status_code == 200, f"Failed to create car: {create_response.text}"
        car_id = create_response.json()["car_id"]
        
        # Update car with additional custom features
        updated_specs = {
            "ac": True,
            "gps": True,
            "custom_features": ["Initial Feature", "New Feature Added", "Another New Feature"]
        }
        update_data = {
            "name": "TEST_Update Custom Features",
            "brand": "TestBrand",
            "model": "UpdateTest",
            "year": 2024,
            "transmission": "manual",
            "fuel": "petrol",
            "seats": 4,
            "pricing": {"day_1": 40, "day_3": 35, "day_5": 30, "day_10": 25, "day_20": 20},
            "casco_price": 8,
            "specs": updated_specs
        }
        
        update_response = requests.put(
            f"{BASE_URL}/api/admin/cars/{car_id}",
            json=update_data,
            headers=auth_headers
        )
        assert update_response.status_code == 200, f"Failed to update car: {update_response.text}"
        
        # Verify update via GET
        get_response = requests.get(f"{BASE_URL}/api/cars/{car_id}")
        assert get_response.status_code == 200
        
        updated_car = get_response.json()
        assert len(updated_car["specs"]["custom_features"]) == 3, \
            f"Expected 3 custom features, got {len(updated_car['specs']['custom_features'])}"
        
        print(f"✓ Updated car custom_features: {updated_car['specs']['custom_features']}")
        
        # Cleanup - delete test car
        requests.delete(f"{BASE_URL}/api/admin/cars/{car_id}", headers=auth_headers)
        return car_id

    def test_update_car_remove_custom_feature(self, auth_headers):
        """Test updating a car to remove a custom feature"""
        # First create a test car with multiple features
        car_data = {
            "name": "TEST_Remove Custom Features",
            "brand": "TestBrand",
            "model": "RemoveTest",
            "year": 2024,
            "transmission": "automatic",
            "fuel": "diesel",
            "seats": 5,
            "pricing": {"day_1": 45, "day_3": 40, "day_5": 35, "day_10": 30, "day_20": 25},
            "casco_price": 12,
            "specs": {
                "custom_features": ["Feature 1", "Feature 2", "Feature 3"]
            }
        }
        
        create_response = requests.post(
            f"{BASE_URL}/api/admin/cars",
            json=car_data,
            headers=auth_headers
        )
        assert create_response.status_code == 200
        car_id = create_response.json()["car_id"]
        
        # Update to remove Feature 2
        update_data = car_data.copy()
        update_data["specs"] = {"custom_features": ["Feature 1", "Feature 3"]}
        
        update_response = requests.put(
            f"{BASE_URL}/api/admin/cars/{car_id}",
            json=update_data,
            headers=auth_headers
        )
        assert update_response.status_code == 200
        
        # Verify via GET
        get_response = requests.get(f"{BASE_URL}/api/cars/{car_id}")
        updated_car = get_response.json()
        
        assert "Feature 2" not in updated_car["specs"]["custom_features"], \
            "Feature 2 should have been removed"
        assert len(updated_car["specs"]["custom_features"]) == 2
        
        print(f"✓ Custom feature removed successfully. Remaining: {updated_car['specs']['custom_features']}")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/admin/cars/{car_id}", headers=auth_headers)

    def test_get_all_cars_includes_custom_features(self):
        """Test that car list endpoint returns custom_features"""
        response = requests.get(f"{BASE_URL}/api/cars")
        assert response.status_code == 200, f"Failed to get cars: {response.text}"
        
        cars = response.json()
        assert isinstance(cars, list), "Expected list of cars"
        
        # Check that at least one car has custom_features
        car_with_features = None
        for car in cars:
            if car.get("specs", {}).get("custom_features"):
                car_with_features = car
                break
        
        assert car_with_features is not None, "No car found with custom_features"
        print(f"✓ Found car with custom_features: {car_with_features['name']}")


class TestAdminEndpoints:
    """Test admin-specific endpoints"""
    
    @pytest.fixture(scope="class")
    def auth_headers(self):
        """Get authentication headers"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"phone": ADMIN_PHONE, "password": ADMIN_PASSWORD}
        )
        if response.status_code == 200:
            token = response.json()["session_token"]
            return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
        pytest.skip("Authentication failed")

    def test_admin_page_accessible(self):
        """Test admin panel HTML page is accessible"""
        response = requests.get(f"{BASE_URL}/api/admin")
        assert response.status_code == 200, f"Admin page not accessible: {response.status_code}"
        assert "RentMoldova Admin" in response.text, "Admin page content mismatch"
        print("✓ Admin panel page is accessible")

    def test_admin_get_all_cars(self, auth_headers):
        """Test admin can get all cars including unavailable"""
        response = requests.get(
            f"{BASE_URL}/api/cars?available_only=false",
            headers=auth_headers
        )
        assert response.status_code == 200
        cars = response.json()
        assert isinstance(cars, list)
        print(f"✓ Admin can access all {len(cars)} cars")


class TestCleanup:
    """Cleanup test data after tests"""
    
    @pytest.fixture(scope="class")
    def auth_headers(self):
        """Get authentication headers"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"phone": ADMIN_PHONE, "password": ADMIN_PASSWORD}
        )
        if response.status_code == 200:
            token = response.json()["session_token"]
            return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
        pytest.skip("Authentication failed")
    
    def test_cleanup_test_cars(self, auth_headers):
        """Clean up TEST_ prefixed cars"""
        response = requests.get(
            f"{BASE_URL}/api/cars?available_only=false",
            headers=auth_headers
        )
        if response.status_code == 200:
            cars = response.json()
            deleted = 0
            for car in cars:
                if car["name"].startswith("TEST_"):
                    delete_response = requests.delete(
                        f"{BASE_URL}/api/admin/cars/{car['car_id']}",
                        headers=auth_headers
                    )
                    if delete_response.status_code == 200:
                        deleted += 1
            print(f"✓ Cleaned up {deleted} test cars")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
