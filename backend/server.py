from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, Response
from fastapi.responses import JSONResponse, HTMLResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import httpx
from passlib.context import CryptContext

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'car_rental_db')]

# Create the main app
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ==================== MODELS ====================

class User(BaseModel):
    user_id: str
    phone: str
    email: Optional[str] = None
    name: str
    picture: Optional[str] = None
    role: str = "user"  # user or admin
    language: str = "ro"  # ro or ru
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserSession(BaseModel):
    user_id: str
    session_token: str
    expires_at: datetime
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SessionDataResponse(BaseModel):
    id: str
    email: str
    name: str
    picture: Optional[str] = None
    session_token: str

class CarPricing(BaseModel):
    day_1: float
    day_3: float
    day_5: float
    day_10: float
    day_20: float

class Car(BaseModel):
    car_id: str = Field(default_factory=lambda: f"car_{uuid.uuid4().hex[:12]}")
    name: str
    brand: str
    model: str
    year: int
    body_type: str = "sedan"  # sedan, suv, hatchback, minivan, coupe, universal
    transmission: str  # manual or automatic
    fuel: str  # diesel, petrol, electric, hybrid
    seats: int
    images: List[str] = []  # base64 images
    main_image_index: int = 0  # index of main image
    pricing: CarPricing
    casco_price: float  # daily CASCO price
    description: str = ""  # car description
    specs: dict = {}  # additional specs
    order: int = 0  # display order
    available: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CarCreate(BaseModel):
    name: str
    brand: str
    model: str
    year: int
    body_type: str = "sedan"
    transmission: str
    fuel: str
    seats: int
    images: List[str] = []
    main_image_index: int = 0
    pricing: CarPricing
    casco_price: float
    description: str = ""
    specs: dict = {}
    order: int = 0
    available: bool = True

class CarUpdate(BaseModel):
    name: Optional[str] = None
    brand: Optional[str] = None
    model: Optional[str] = None
    year: Optional[int] = None
    body_type: Optional[str] = None
    transmission: Optional[str] = None
    fuel: Optional[str] = None
    seats: Optional[int] = None
    images: Optional[List[str]] = None
    main_image_index: Optional[int] = None
    pricing: Optional[CarPricing] = None
    casco_price: Optional[float] = None
    description: Optional[str] = None
    specs: Optional[dict] = None
    order: Optional[int] = None
    available: Optional[bool] = None

class PriceCalculationRequest(BaseModel):
    car_id: str
    start_date: str  # ISO date string
    end_date: str
    start_time: str  # HH:MM format
    end_time: str
    location: str  # office, chisinau_airport, iasi_airport
    insurance: str  # rca or casco

class PriceCalculationResponse(BaseModel):
    car_id: str
    days: int
    base_price: float
    casco_price: float
    location_fee: float
    outside_hours_fee: float
    total_price: float
    breakdown: dict

class Booking(BaseModel):
    booking_id: str = Field(default_factory=lambda: f"booking_{uuid.uuid4().hex[:12]}")
    user_id: str
    car_id: str
    car_name: str
    car_image: str = ""  # main car image
    start_date: str
    end_date: str
    start_time: str
    end_time: str
    location: str
    insurance: str
    # Customer info
    customer_name: str
    customer_phone: str
    customer_age: int
    total_price: float
    status: str = "pending"  # pending, confirmed, completed, cancelled
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class BookingCreate(BaseModel):
    car_id: str
    start_date: str
    end_date: str
    start_time: str
    end_time: str
    location: str
    insurance: str
    customer_name: str
    customer_phone: str
    customer_age: int

class PartnerRequest(BaseModel):
    request_id: str = Field(default_factory=lambda: f"req_{uuid.uuid4().hex[:12]}")
    name: str
    email: str
    phone: str
    company: Optional[str] = None
    message: str
    status: str = "pending"  # pending, contacted, approved, rejected
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PartnerRequestCreate(BaseModel):
    name: str
    email: str
    phone: str
    company: Optional[str] = None
    message: str

class UserRegister(BaseModel):
    phone: str
    email: str
    password: str
    name: str

class UserLogin(BaseModel):
    phone: str
    password: str

class NameUpdate(BaseModel):
    name: str

class LanguageUpdate(BaseModel):
    language: str  # ro or ru

class FAQ(BaseModel):
    faq_id: str = Field(default_factory=lambda: f"faq_{uuid.uuid4().hex[:12]}")
    question_ro: str
    answer_ro: str
    question_ru: str
    answer_ru: str
    order: int = 0
    active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class FAQCreate(BaseModel):
    question_ro: str
    answer_ro: str
    question_ru: str
    answer_ru: str
    order: int = 0
    active: bool = True

class FAQUpdate(BaseModel):
    question_ro: Optional[str] = None
    answer_ro: Optional[str] = None
    question_ru: Optional[str] = None
    answer_ru: Optional[str] = None
    order: Optional[int] = None
    active: Optional[bool] = None

class LegalContent(BaseModel):
    content_id: str = Field(default_factory=lambda: f"legal_{uuid.uuid4().hex[:12]}")
    type: str  # "terms" or "privacy"
    content_ro: str
    content_ru: str
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class LegalContentUpdate(BaseModel):
    content_ro: str
    content_ru: str

class Banner(BaseModel):
    banner_id: str = Field(default_factory=lambda: f"banner_{uuid.uuid4().hex[:12]}")
    title: str
    subtitle: str = ""
    badge: str = ""
    image: str  # base64 image
    order: int = 0
    active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class BannerCreate(BaseModel):
    title: str
    subtitle: str = ""
    badge: str = ""
    image: str
    order: int = 0
    active: bool = True

class BannerUpdate(BaseModel):
    title: Optional[str] = None
    subtitle: Optional[str] = None
    badge: Optional[str] = None
    image: Optional[str] = None
    order: Optional[int] = None
    active: Optional[bool] = None

class ProfilePictureUpdate(BaseModel):
    picture: str  # base64 image

class ContactInfo(BaseModel):
    phone: str = ""
    email: str = ""
    address: str = ""
    map_embed_url: str = ""  # Google Maps embed URL
    whatsapp_link: str = ""
    viber_link: str = ""
    telegram_link: str = ""
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ContactInfoUpdate(BaseModel):
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    map_embed_url: Optional[str] = None
    whatsapp_link: Optional[str] = None
    viber_link: Optional[str] = None
    telegram_link: Optional[str] = None

# ==================== AUTH HELPERS ====================

async def get_session_token(request: Request) -> Optional[str]:
    """Extract session token from cookies or Authorization header"""
    # Try cookies first
    session_token = request.cookies.get("session_token")
    if session_token:
        return session_token
    
    # Try Authorization header
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        return auth_header[7:]
    
    return None

async def get_current_user(request: Request) -> Optional[User]:
    """Get current user from session token"""
    session_token = await get_session_token(request)
    if not session_token:
        return None
    
    session = await db.user_sessions.find_one(
        {"session_token": session_token},
        {"_id": 0}
    )
    if not session:
        return None
    
    # Check expiry with timezone awareness
    expires_at = session["expires_at"]
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    
    if expires_at < datetime.now(timezone.utc):
        return None
    
    user_doc = await db.users.find_one(
        {"user_id": session["user_id"]},
        {"_id": 0}
    )
    if user_doc:
        return User(**user_doc)
    return None

async def require_auth(request: Request) -> User:
    """Require authentication - raises 401 if not authenticated"""
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user

async def require_admin(request: Request) -> User:
    """Require admin role"""
    user = await require_auth(request)
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

# ==================== AUTH ENDPOINTS ====================

@api_router.post("/auth/register")
async def register(data: UserRegister, response: Response):
    """Register a new user with phone/email/password"""
    # Check if phone already exists
    existing_user = await db.users.find_one({"phone": data.phone})
    if existing_user:
        raise HTTPException(status_code=400, detail="Numărul de telefon este deja înregistrat")
    
    # Check if email already exists
    if data.email:
        existing_email = await db.users.find_one({"email": data.email})
        if existing_email:
            raise HTTPException(status_code=400, detail="Email-ul este deja înregistrat")
    
    # Hash password
    hashed_password = pwd_context.hash(data.password)
    
    # Create user
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    new_user = {
        "user_id": user_id,
        "phone": data.phone,
        "email": data.email,
        "name": data.name,
        "password": hashed_password,
        "picture": None,
        "role": "user",
        "language": "ro",
        "auth_type": "phone",
        "created_at": datetime.now(timezone.utc)
    }
    await db.users.insert_one(new_user)
    
    # Create session
    session_token = f"sess_{uuid.uuid4().hex}"
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    session = {
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": expires_at,
        "created_at": datetime.now(timezone.utc)
    }
    await db.user_sessions.insert_one(session)
    
    # Get user data (without password)
    user_doc = await db.users.find_one({"user_id": user_id}, {"_id": 0, "password": 0})
    
    # Set cookie
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=7 * 24 * 60 * 60,
        path="/"
    )
    
    return {"user": user_doc, "session_token": session_token}

@api_router.post("/auth/login")
async def login(data: UserLogin, response: Response):
    """Login with phone/password"""
    # Find user
    user = await db.users.find_one({"phone": data.phone})
    if not user:
        raise HTTPException(status_code=401, detail="Număr de telefon sau parolă incorectă")
    
    # Check if user has password (not Google-only user)
    if "password" not in user or not user["password"]:
        raise HTTPException(status_code=401, detail="Acest cont folosește autentificarea Google. Folosiți butonul 'Continuă cu Google'.")
    
    # Verify password
    if not pwd_context.verify(data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Număr de telefon sau parolă incorectă")
    
    # Create session
    session_token = f"sess_{uuid.uuid4().hex}"
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    session = {
        "user_id": user["user_id"],
        "session_token": session_token,
        "expires_at": expires_at,
        "created_at": datetime.now(timezone.utc)
    }
    await db.user_sessions.insert_one(session)
    
    # Get user data (without password)
    user_doc = await db.users.find_one({"user_id": user["user_id"]}, {"_id": 0, "password": 0})
    
    # Set cookie
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=7 * 24 * 60 * 60,
        path="/"
    )
    
    return {"user": user_doc, "session_token": session_token}

@api_router.post("/auth/session")
async def create_session(request: Request, response: Response):
    """Exchange session_id for session_token"""
    body = await request.json()
    session_id = body.get("session_id")
    
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id required")
    
    # Call Emergent Auth API
    async with httpx.AsyncClient() as client:
        try:
            auth_response = await client.get(
                "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
                headers={"X-Session-ID": session_id}
            )
            if auth_response.status_code != 200:
                raise HTTPException(status_code=401, detail="Invalid session_id")
            
            user_data = auth_response.json()
        except Exception as e:
            logger.error(f"Auth API error: {e}")
            raise HTTPException(status_code=500, detail="Authentication failed")
    
    session_data = SessionDataResponse(**user_data)
    
    # Check if user exists
    existing_user = await db.users.find_one(
        {"email": session_data.email},
        {"_id": 0}
    )
    
    if existing_user:
        user_id = existing_user["user_id"]
    else:
        # Create new user
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        new_user = {
            "user_id": user_id,
            "email": session_data.email,
            "name": session_data.name,
            "picture": session_data.picture,
            "role": "user",
            "created_at": datetime.now(timezone.utc)
        }
        await db.users.insert_one(new_user)
    
    # Create session
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    session = {
        "user_id": user_id,
        "session_token": session_data.session_token,
        "expires_at": expires_at,
        "created_at": datetime.now(timezone.utc)
    }
    await db.user_sessions.insert_one(session)
    
    # Get user data
    user_doc = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    
    # Set cookie
    response.set_cookie(
        key="session_token",
        value=session_data.session_token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=7 * 24 * 60 * 60,
        path="/"
    )
    
    return {"user": user_doc, "session_token": session_data.session_token}

@api_router.get("/auth/me")
async def get_me(request: Request):
    """Get current user"""
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user.model_dump()

@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    """Logout user"""
    session_token = await get_session_token(request)
    if session_token:
        await db.user_sessions.delete_many({"session_token": session_token})
    
    response.delete_cookie(key="session_token", path="/")
    return {"message": "Logged out successfully"}

@api_router.delete("/auth/delete-account")
async def delete_account(request: Request, response: Response):
    """Delete user account permanently"""
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Nu ești autentificat")
    
    # Don't allow deleting admin accounts
    if user.is_admin:
        raise HTTPException(status_code=400, detail="Nu poți șterge un cont de administrator")
    
    # Delete user sessions
    await db.user_sessions.delete_many({"user_id": user.user_id})
    
    # Delete user bookings (optional - you might want to keep them)
    # await db.bookings.delete_many({"user_id": user.user_id})
    
    # Delete user account
    await db.users.delete_one({"user_id": user.user_id})
    
    response.delete_cookie(key="session_token", path="/")
    return {"message": "Contul a fost șters cu succes"}

@api_router.put("/users/profile-picture")
async def update_profile_picture(data: ProfilePictureUpdate, request: Request):
    """Update user's profile picture"""
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Nu ești autentificat")
    
    await db.users.update_one(
        {"user_id": user.user_id},
        {"$set": {"picture": data.picture}}
    )
    
    return {"message": "Poza de profil a fost actualizată"}

@api_router.put("/users/name")
async def update_name(data: NameUpdate, request: Request):
    """Update user's name"""
    user = await require_auth(request)
    
    await db.users.update_one(
        {"user_id": user.user_id},
        {"$set": {"name": data.name}}
    )
    
    return {"message": "Numele a fost actualizat"}

@api_router.put("/users/language")
async def update_language(data: LanguageUpdate, request: Request):
    """Update user's language preference"""
    user = await require_auth(request)
    
    if data.language not in ["ro", "ru"]:
        raise HTTPException(status_code=400, detail="Limbă invalidă")
    
    await db.users.update_one(
        {"user_id": user.user_id},
        {"$set": {"language": data.language}}
    )
    
    return {"message": "Limba a fost actualizată"}

@api_router.post("/users/favorites/{car_id}")
async def add_favorite(car_id: str, request: Request):
    """Add car to favorites"""
    user = await require_auth(request)
    
    # Check if car exists
    car = await db.cars.find_one({"car_id": car_id})
    if not car:
        raise HTTPException(status_code=404, detail="Mașina nu a fost găsită")
    
    # Add to favorites (use set to avoid duplicates)
    await db.users.update_one(
        {"user_id": user.user_id},
        {"$addToSet": {"favorites": car_id}}
    )
    
    return {"message": "Mașina a fost adăugată la favorite"}

@api_router.delete("/users/favorites/{car_id}")
async def remove_favorite(car_id: str, request: Request):
    """Remove car from favorites"""
    user = await require_auth(request)
    
    await db.users.update_one(
        {"user_id": user.user_id},
        {"$pull": {"favorites": car_id}}
    )
    
    return {"message": "Mașina a fost ștearsă din favorite"}

@api_router.get("/users/favorites")
async def get_favorites(request: Request):
    """Get user's favorite cars"""
    user = await require_auth(request)
    
    user_doc = await db.users.find_one({"user_id": user.user_id}, {"favorites": 1})
    favorite_ids = user_doc.get("favorites", []) if user_doc else []
    
    if not favorite_ids:
        return []
    
    # Get full car details
    cars = await db.cars.find({"car_id": {"$in": favorite_ids}}, {"_id": 0}).to_list(100)
    return cars

# ==================== ADMIN USERS ENDPOINTS ====================

@api_router.get("/admin/users")
async def get_all_users(request: Request):
    """Get all registered users (admin only)"""
    await require_admin(request)
    users = await db.users.find({}, {"_id": 0, "password": 0}).sort("created_at", -1).to_list(1000)
    return users

@api_router.delete("/admin/users/{user_id}")
async def delete_user(user_id: str, request: Request):
    """Delete a user (admin only)"""
    await require_admin(request)
    
    # Don't allow deleting admin users
    user = await db.users.find_one({"user_id": user_id})
    if user and user.get("is_admin"):
        raise HTTPException(status_code=400, detail="Nu poți șterge un administrator")
    
    result = await db.users.delete_one({"user_id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Utilizatorul nu a fost găsit")
    
    return {"message": "Utilizatorul a fost șters"}

@api_router.get("/admin/stats")
async def get_admin_stats(request: Request):
    """Get dashboard statistics (admin only)"""
    await require_admin(request)
    
    # Get counts
    total_cars = await db.cars.count_documents({})
    total_bookings = await db.bookings.count_documents({})
    total_users = await db.users.count_documents({"is_admin": {"$ne": True}})
    pending_bookings = await db.bookings.count_documents({"status": "pending"})
    confirmed_bookings = await db.bookings.count_documents({"status": "confirmed"})
    completed_bookings = await db.bookings.count_documents({"status": "completed"})
    cancelled_bookings = await db.bookings.count_documents({"status": "cancelled"})
    pending_partners = await db.partner_requests.count_documents({"status": "pending"})
    
    # Get recent bookings
    recent_bookings = await db.bookings.find({}, {"_id": 0}).sort("created_at", -1).limit(5).to_list(5)
    
    # Get booking stats by status for chart
    booking_stats = {
        "pending": pending_bookings,
        "confirmed": confirmed_bookings,
        "completed": completed_bookings,
        "cancelled": cancelled_bookings
    }
    
    return {
        "total_cars": total_cars,
        "total_bookings": total_bookings,
        "total_users": total_users,
        "pending_bookings": pending_bookings,
        "pending_partners": pending_partners,
        "booking_stats": booking_stats,
        "recent_bookings": recent_bookings
    }

# ==================== FAQ ENDPOINTS ====================

@api_router.get("/faqs")
async def get_faqs(active_only: bool = True):
    """Get all FAQs"""
    query = {"active": True} if active_only else {}
    faqs = await db.faqs.find(query, {"_id": 0}).sort("order", 1).to_list(100)
    return faqs

@api_router.post("/admin/faqs")
async def create_faq(data: FAQCreate, request: Request):
    """Create a new FAQ (admin only)"""
    await require_admin(request)
    faq = FAQ(**data.model_dump())
    await db.faqs.insert_one(faq.model_dump())
    return faq.model_dump()

@api_router.put("/admin/faqs/{faq_id}")
async def update_faq(faq_id: str, data: FAQUpdate, request: Request):
    """Update a FAQ (admin only)"""
    await require_admin(request)
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No data to update")
    result = await db.faqs.update_one({"faq_id": faq_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="FAQ not found")
    faq = await db.faqs.find_one({"faq_id": faq_id}, {"_id": 0})
    return faq

@api_router.delete("/admin/faqs/{faq_id}")
async def delete_faq(faq_id: str, request: Request):
    """Delete a FAQ (admin only)"""
    await require_admin(request)
    result = await db.faqs.delete_one({"faq_id": faq_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="FAQ not found")
    return {"message": "FAQ deleted successfully"}

# ==================== LEGAL CONTENT ENDPOINTS ====================

@api_router.get("/legal/{content_type}")
async def get_legal_content(content_type: str):
    """Get legal content (terms or privacy)"""
    if content_type not in ["terms", "privacy"]:
        raise HTTPException(status_code=400, detail="Invalid content type")
    
    content = await db.legal_content.find_one({"type": content_type}, {"_id": 0})
    if not content:
        return {"type": content_type, "content_ro": "", "content_ru": ""}
    return content

@api_router.put("/admin/legal/{content_type}")
async def update_legal_content(content_type: str, data: LegalContentUpdate, request: Request):
    """Update legal content (admin only)"""
    await require_admin(request)
    
    if content_type not in ["terms", "privacy"]:
        raise HTTPException(status_code=400, detail="Invalid content type")
    
    # Upsert legal content
    content = {
        "type": content_type,
        "content_ro": data.content_ro,
        "content_ru": data.content_ru,
        "updated_at": datetime.now(timezone.utc)
    }
    
    result = await db.legal_content.update_one(
        {"type": content_type},
        {"$set": content},
        upsert=True
    )
    
    return {"message": "Legal content updated successfully"}

# ==================== CONTACT ENDPOINTS ====================

@api_router.get("/contacts")
async def get_contacts():
    """Get contact information (public endpoint)"""
    contact = await db.contacts.find_one({}, {"_id": 0})
    if not contact:
        return {
            "phone": "",
            "email": "",
            "address": "",
            "map_embed_url": "",
            "whatsapp_link": "",
            "viber_link": "",
            "telegram_link": ""
        }
    return contact

@api_router.put("/admin/contacts")
async def update_contacts(data: ContactInfoUpdate, request: Request):
    """Update contact information (admin only)"""
    user = await get_current_user(request)
    if not user or user.role != "admin":
        raise HTTPException(status_code=401, detail="Admin access required")
    
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc)
    
    result = await db.contacts.update_one(
        {},
        {"$set": update_data},
        upsert=True
    )
    
    contact = await db.contacts.find_one({}, {"_id": 0})
    return contact

# ==================== CAR ENDPOINTS ====================

@api_router.get("/cars")
async def get_cars(
    brand: Optional[str] = None,
    transmission: Optional[str] = None,
    fuel: Optional[str] = None,
    body_type: Optional[str] = None,
    min_seats: Optional[int] = None,
    available_only: bool = True
):
    """Get all cars with optional filters"""
    query = {}
    
    if brand:
        query["brand"] = {"$regex": brand, "$options": "i"}
    if transmission:
        query["transmission"] = transmission
    if fuel:
        query["fuel"] = fuel
    if body_type:
        query["body_type"] = body_type
    if min_seats:
        query["seats"] = {"$gte": min_seats}
    if available_only:
        query["available"] = True
    
    # Sort by order field (ascending), then by name for items without order
    cars = await db.cars.find(query, {"_id": 0}).to_list(100)
    # Sort: items with order first (by order), then items without order (by name)
    cars.sort(key=lambda x: (x.get('order') is None, x.get('order', 999), x.get('name', '')))
    return cars

@api_router.get("/cars/{car_id}")
async def get_car(car_id: str):
    """Get car by ID"""
    car = await db.cars.find_one({"car_id": car_id}, {"_id": 0})
    if not car:
        raise HTTPException(status_code=404, detail="Car not found")
    return car

@api_router.post("/calculate-price")
async def calculate_price(request: PriceCalculationRequest):
    """Calculate rental price"""
    # Get car
    car = await db.cars.find_one({"car_id": request.car_id}, {"_id": 0})
    if not car:
        raise HTTPException(status_code=404, detail="Car not found")
    
    # Calculate days
    start = datetime.fromisoformat(request.start_date)
    end = datetime.fromisoformat(request.end_date)
    days = (end - start).days + 1
    
    if days < 1:
        raise HTTPException(status_code=400, detail="Invalid date range")
    
    # Get base price based on day tier
    pricing = car["pricing"]
    if days >= 20:
        daily_rate = pricing["day_20"]
    elif days >= 10:
        daily_rate = pricing["day_10"]
    elif days >= 5:
        daily_rate = pricing["day_5"]
    elif days >= 3:
        daily_rate = pricing["day_3"]
    else:
        daily_rate = pricing["day_1"]
    
    base_price = daily_rate * days
    
    # CASCO insurance
    casco_price = 0
    if request.insurance == "casco":
        casco_price = car["casco_price"] * days
    
    # Location fee
    location_fee = 0
    if request.location == "iasi_airport":
        location_fee = 150
    
    # Outside hours fee (before 09:00 or after 18:00)
    outside_hours_fee = 0
    start_hour = int(request.start_time.split(":")[0])
    end_hour = int(request.end_time.split(":")[0])
    
    if start_hour < 9 or start_hour >= 18:
        outside_hours_fee += 25
    if end_hour < 9 or end_hour >= 18:
        outside_hours_fee += 25
    
    total_price = base_price + casco_price + location_fee + outside_hours_fee
    
    return PriceCalculationResponse(
        car_id=request.car_id,
        days=days,
        base_price=base_price,
        casco_price=casco_price,
        location_fee=location_fee,
        outside_hours_fee=outside_hours_fee,
        total_price=total_price,
        breakdown={
            "daily_rate": daily_rate,
            "days": days,
            "base": base_price,
            "casco": casco_price,
            "location": location_fee,
            "outside_hours": outside_hours_fee
        }
    )

# ==================== BOOKING ENDPOINTS ====================

@api_router.post("/bookings")
async def create_booking(booking_data: BookingCreate, request: Request):
    """Create a new booking"""
    user = await require_auth(request)
    
    # Get car
    car = await db.cars.find_one({"car_id": booking_data.car_id}, {"_id": 0})
    if not car:
        raise HTTPException(status_code=404, detail="Car not found")
    
    # Calculate price
    price_request = PriceCalculationRequest(
        car_id=booking_data.car_id,
        start_date=booking_data.start_date,
        end_date=booking_data.end_date,
        start_time=booking_data.start_time,
        end_time=booking_data.end_time,
        location=booking_data.location,
        insurance=booking_data.insurance
    )
    price_result = await calculate_price(price_request)
    
    # Get main car image
    main_image_index = car.get("main_image_index", 0)
    car_image = ""
    if car.get("images") and len(car["images"]) > main_image_index:
        car_image = car["images"][main_image_index]
    elif car.get("images") and len(car["images"]) > 0:
        car_image = car["images"][0]
    
    booking = Booking(
        user_id=user.user_id,
        car_id=booking_data.car_id,
        car_name=car["name"],
        car_image=car_image,
        start_date=booking_data.start_date,
        end_date=booking_data.end_date,
        start_time=booking_data.start_time,
        end_time=booking_data.end_time,
        location=booking_data.location,
        insurance=booking_data.insurance,
        customer_name=booking_data.customer_name,
        customer_phone=booking_data.customer_phone,
        customer_age=booking_data.customer_age,
        total_price=price_result.total_price
    )
    
    await db.bookings.insert_one(booking.model_dump())
    
    return booking.model_dump()

@api_router.get("/bookings")
async def get_user_bookings(request: Request):
    """Get current user's bookings"""
    user = await require_auth(request)
    
    bookings = await db.bookings.find(
        {"user_id": user.user_id},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    return bookings

# ==================== ADMIN ENDPOINTS ====================

@api_router.post("/admin/cars")
async def create_car(car_data: CarCreate, request: Request):
    """Create a new car (admin only)"""
    await require_admin(request)
    
    car = Car(**car_data.model_dump())
    await db.cars.insert_one(car.model_dump())
    
    return car.model_dump()

@api_router.put("/admin/cars/{car_id}")
async def update_car(car_id: str, car_data: CarUpdate, request: Request):
    """Update a car (admin only)"""
    await require_admin(request)
    
    update_data = {k: v for k, v in car_data.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No data to update")
    
    result = await db.cars.update_one(
        {"car_id": car_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Car not found")
    
    car = await db.cars.find_one({"car_id": car_id}, {"_id": 0})
    return car

@api_router.delete("/admin/cars/{car_id}")
async def delete_car(car_id: str, request: Request):
    """Delete a car (admin only)"""
    await require_admin(request)
    
    result = await db.cars.delete_one({"car_id": car_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Car not found")
    
    return {"message": "Car deleted successfully"}

@api_router.get("/admin/bookings")
async def get_all_bookings(request: Request, status: Optional[str] = None):
    """Get all bookings (admin only)"""
    await require_admin(request)
    
    query = {}
    if status:
        query["status"] = status
    
    bookings = await db.bookings.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    
    # Enrich bookings with car images if missing
    enriched_bookings = []
    for booking in bookings:
        if not booking.get("car_image") and booking.get("car_id"):
            car = await db.cars.find_one({"car_id": booking["car_id"]}, {"images": 1, "main_image_index": 1})
            if car and car.get("images"):
                main_idx = car.get("main_image_index", 0)
                if len(car["images"]) > main_idx:
                    booking["car_image"] = car["images"][main_idx]
                elif len(car["images"]) > 0:
                    booking["car_image"] = car["images"][0]
        enriched_bookings.append(booking)
    
    return enriched_bookings

@api_router.put("/admin/bookings/{booking_id}/status")
async def update_booking_status(booking_id: str, request: Request):
    """Update booking status (admin only)"""
    await require_admin(request)
    
    body = await request.json()
    new_status = body.get("status")
    
    if new_status not in ["pending", "confirmed", "completed", "cancelled"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    result = await db.bookings.update_one(
        {"booking_id": booking_id},
        {"$set": {"status": new_status}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    return {"message": "Status updated successfully"}

@api_router.delete("/admin/bookings/{booking_id}")
async def delete_booking(booking_id: str, request: Request):
    """Delete a booking (admin only)"""
    await require_admin(request)
    
    result = await db.bookings.delete_one({"booking_id": booking_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    return {"message": "Booking deleted successfully"}

@api_router.post("/admin/make-admin")
async def make_admin(request: Request):
    """Make current user admin (for testing)"""
    user = await require_auth(request)
    
    await db.users.update_one(
        {"user_id": user.user_id},
        {"$set": {"role": "admin"}}
    )
    
    return {"message": "User is now admin"}

# ==================== PARTNER REQUEST ENDPOINTS ====================

@api_router.post("/partner-request")
async def create_partner_request(data: PartnerRequestCreate):
    """Submit a partner request (public endpoint)"""
    partner_request = PartnerRequest(**data.model_dump())
    await db.partner_requests.insert_one(partner_request.model_dump())
    return {"message": "Cererea a fost trimisă cu succes!", "request_id": partner_request.request_id}

@api_router.get("/admin/partner-requests")
async def get_partner_requests(request: Request, status: Optional[str] = None):
    """Get all partner requests (admin only)"""
    await require_admin(request)
    
    query = {}
    if status:
        query["status"] = status
    
    requests = await db.partner_requests.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return requests

@api_router.put("/admin/partner-requests/{request_id}/status")
async def update_partner_request_status(request_id: str, request: Request):
    """Update partner request status (admin only)"""
    await require_admin(request)
    
    body = await request.json()
    new_status = body.get("status")
    
    if new_status not in ["pending", "contacted", "approved", "rejected"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    result = await db.partner_requests.update_one(
        {"request_id": request_id},
        {"$set": {"status": new_status}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Request not found")
    
    return {"message": "Status updated successfully"}

@api_router.get("/admin/stats")
async def get_admin_stats(request: Request):
    """Get admin dashboard statistics"""
    await require_admin(request)
    
    total_cars = await db.cars.count_documents({})
    available_cars = await db.cars.count_documents({"available": True})
    total_bookings = await db.bookings.count_documents({})
    pending_bookings = await db.bookings.count_documents({"status": "pending"})
    confirmed_bookings = await db.bookings.count_documents({"status": "confirmed"})
    total_partner_requests = await db.partner_requests.count_documents({})
    pending_partner_requests = await db.partner_requests.count_documents({"status": "pending"})
    
    return {
        "cars": {
            "total": total_cars,
            "available": available_cars
        },
        "bookings": {
            "total": total_bookings,
            "pending": pending_bookings,
            "confirmed": confirmed_bookings
        },
        "partner_requests": {
            "total": total_partner_requests,
            "pending": pending_partner_requests
        }
    }

# ==================== BANNER ENDPOINTS ====================

@api_router.get("/banners")
async def get_banners(active_only: bool = False):
    """Get all banners (public endpoint)"""
    query = {"active": True} if active_only else {}
    banners = await db.banners.find(query, {"_id": 0}).sort("order", 1).to_list(100)
    return banners

@api_router.post("/admin/banners")
async def create_banner(data: BannerCreate, request: Request):
    """Create a new banner (admin only)"""
    await require_admin(request)
    banner = Banner(**data.model_dump())
    await db.banners.insert_one(banner.model_dump())
    return banner.model_dump()

@api_router.put("/admin/banners/{banner_id}")
async def update_banner(banner_id: str, data: BannerUpdate, request: Request):
    """Update a banner (admin only)"""
    await require_admin(request)
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No data to update")
    result = await db.banners.update_one({"banner_id": banner_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Banner not found")
    banner = await db.banners.find_one({"banner_id": banner_id}, {"_id": 0})
    return banner

@api_router.delete("/admin/banners/{banner_id}")
async def delete_banner(banner_id: str, request: Request):
    """Delete a banner (admin only)"""
    await require_admin(request)
    result = await db.banners.delete_one({"banner_id": banner_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Banner not found")
    return {"message": "Banner deleted successfully"}

# ==================== SEED DATA ====================

@api_router.post("/seed")
async def seed_data():
    """Seed database with sample cars"""
    # Check if cars exist
    existing = await db.cars.count_documents({})
    if existing > 0:
        return {"message": f"Database already has {existing} cars"}
    
    sample_cars = [
        {
            "car_id": "car_bmw_seria3",
            "name": "BMW Seria 3",
            "brand": "BMW",
            "model": "320d",
            "year": 2023,
            "transmission": "automatic",
            "fuel": "diesel",
            "seats": 5,
            "images": [
                "https://images.unsplash.com/photo-1579317471790-0e30bd51b55e?w=800",
                "https://images.unsplash.com/photo-1717082832138-b8f332d86a2a?w=800"
            ],
            "pricing": {
                "day_1": 55,
                "day_3": 50,
                "day_5": 45,
                "day_10": 40,
                "day_20": 35
            },
            "casco_price": 15,
            "specs": {
                "engine": "2.0L Turbo Diesel",
                "power": "190 CP",
                "consumption": "5.5L/100km",
                "trunk": "480L",
                "ac": True,
                "gps": True,
                "bluetooth": True
            },
            "available": True,
            "created_at": datetime.now(timezone.utc)
        },
        {
            "car_id": "car_mercedes_cclass",
            "name": "Mercedes-Benz C-Class",
            "brand": "Mercedes-Benz",
            "model": "C200",
            "year": 2023,
            "transmission": "automatic",
            "fuel": "petrol",
            "seats": 5,
            "images": [
                "https://images.unsplash.com/photo-1618836436067-3665afbc4ee9?w=800",
                "https://images.unsplash.com/photo-1582733460601-0ae67a942777?w=800"
            ],
            "pricing": {
                "day_1": 65,
                "day_3": 58,
                "day_5": 52,
                "day_10": 45,
                "day_20": 40
            },
            "casco_price": 18,
            "specs": {
                "engine": "2.0L Turbo",
                "power": "204 CP",
                "consumption": "7.0L/100km",
                "trunk": "455L",
                "ac": True,
                "gps": True,
                "bluetooth": True,
                "leather_seats": True
            },
            "available": True,
            "created_at": datetime.now(timezone.utc)
        },
        {
            "car_id": "car_audi_a4",
            "name": "Audi A4",
            "brand": "Audi",
            "model": "A4 35 TDI",
            "year": 2022,
            "transmission": "automatic",
            "fuel": "diesel",
            "seats": 5,
            "images": [
                "https://images.unsplash.com/photo-1603623627643-9742fd3d0349?w=800",
                "https://images.unsplash.com/photo-1558661091-5cc1b64d0dc5?w=800"
            ],
            "pricing": {
                "day_1": 60,
                "day_3": 55,
                "day_5": 48,
                "day_10": 42,
                "day_20": 38
            },
            "casco_price": 16,
            "specs": {
                "engine": "2.0L TDI",
                "power": "163 CP",
                "consumption": "5.2L/100km",
                "trunk": "460L",
                "ac": True,
                "gps": True,
                "bluetooth": True,
                "cruise_control": True
            },
            "available": True,
            "created_at": datetime.now(timezone.utc)
        },
        {
            "car_id": "car_vw_passat",
            "name": "Volkswagen Passat",
            "brand": "Volkswagen",
            "model": "Passat 2.0 TDI",
            "year": 2022,
            "transmission": "automatic",
            "fuel": "diesel",
            "seats": 5,
            "images": [
                "https://images.unsplash.com/photo-1720907662942-f552fa04eb3b?w=800"
            ],
            "pricing": {
                "day_1": 45,
                "day_3": 40,
                "day_5": 35,
                "day_10": 32,
                "day_20": 28
            },
            "casco_price": 12,
            "specs": {
                "engine": "2.0L TDI",
                "power": "150 CP",
                "consumption": "5.0L/100km",
                "trunk": "586L",
                "ac": True,
                "gps": True,
                "bluetooth": True
            },
            "available": True,
            "created_at": datetime.now(timezone.utc)
        },
        {
            "car_id": "car_toyota_corolla",
            "name": "Toyota Corolla",
            "brand": "Toyota",
            "model": "Corolla Hybrid",
            "year": 2023,
            "transmission": "automatic",
            "fuel": "hybrid",
            "seats": 5,
            "images": [
                "https://images.unsplash.com/photo-1720907662945-7a10856cd0d4?w=800"
            ],
            "pricing": {
                "day_1": 40,
                "day_3": 35,
                "day_5": 32,
                "day_10": 28,
                "day_20": 25
            },
            "casco_price": 10,
            "specs": {
                "engine": "1.8L Hybrid",
                "power": "122 CP",
                "consumption": "4.5L/100km",
                "trunk": "361L",
                "ac": True,
                "gps": True,
                "bluetooth": True,
                "eco_mode": True
            },
            "available": True,
            "created_at": datetime.now(timezone.utc)
        },
        {
            "car_id": "car_skoda_octavia",
            "name": "Skoda Octavia",
            "brand": "Skoda",
            "model": "Octavia 1.5 TSI",
            "year": 2023,
            "transmission": "manual",
            "fuel": "petrol",
            "seats": 5,
            "images": [
                "https://images.unsplash.com/photo-1680425210909-d1680d778e76?w=800"
            ],
            "pricing": {
                "day_1": 35,
                "day_3": 32,
                "day_5": 28,
                "day_10": 25,
                "day_20": 22
            },
            "casco_price": 10,
            "specs": {
                "engine": "1.5L TSI",
                "power": "150 CP",
                "consumption": "6.0L/100km",
                "trunk": "600L",
                "ac": True,
                "bluetooth": True
            },
            "available": True,
            "created_at": datetime.now(timezone.utc)
        }
    ]
    
    await db.cars.insert_many(sample_cars)
    return {"message": f"Seeded {len(sample_cars)} cars"}

# Serve admin panel - MUST be before include_router
@api_router.get("/admin/")
@api_router.get("/admin")
async def admin_panel():
    return FileResponse(ROOT_DIR / 'static' / 'admin.html')

# Include the router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
