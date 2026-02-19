# RentMoldova Backend - Docker Setup

## Cerințe
- Docker
- Docker Compose

## Pornire Rapidă

### 1. Clonează repository-ul și navighează în directorul backend
```bash
cd backend
```

### 2. Configurează variabilele de mediu
```bash
cp .env.example .env
# Editează .env și setează JWT_SECRET cu o valoare sigură
```

### 3. Pornește serviciile cu Docker Compose
```bash
docker-compose up -d
```

Acest comandă va porni:
- **Backend API** pe portul `8001`
- **MongoDB** pe portul `27017`

### 4. Verifică că serviciile rulează
```bash
docker-compose ps
```

### 5. Vezi log-urile
```bash
# Toate serviciile
docker-compose logs -f

# Doar backend
docker-compose logs -f backend

# Doar MongoDB
docker-compose logs -f mongo
```

## Comenzi Utile

### Oprește serviciile
```bash
docker-compose down
```

### Oprește și șterge datele (inclusiv baza de date)
```bash
docker-compose down -v
```

### Rebuild după modificări în cod
```bash
docker-compose up -d --build
```

### Accesează shell-ul containerului backend
```bash
docker exec -it rentmoldova-backend bash
```

### Accesează MongoDB shell
```bash
docker exec -it rentmoldova-mongo mongosh
```

## Structura Serviciilor

| Serviciu | Port | Descriere |
|----------|------|-----------|
| backend | 8001 | FastAPI Backend API |
| mongo | 27017 | MongoDB Database |

## Endpoints API

- **API Base URL**: `http://localhost:8001/api`
- **Admin Panel**: `http://localhost:8001/api/admin`
- **Health Check**: `http://localhost:8001/api/health`

## Variabile de Mediu

| Variabilă | Descriere | Default |
|-----------|-----------|---------|
| MONGO_URL | URL conexiune MongoDB | mongodb://mongo:27017/rentmoldova |
| DB_NAME | Numele bazei de date | rentmoldova |
| JWT_SECRET | Secret pentru JWT tokens | (trebuie setat) |

## Producție

Pentru producție, recomandăm:

1. Setează un `JWT_SECRET` puternic
2. Configurează MongoDB cu autentificare
3. Folosește un reverse proxy (nginx) pentru HTTPS
4. Configurează backup-uri pentru MongoDB

### Exemplu docker-compose.prod.yml
```yaml
version: '3.8'

services:
  backend:
    build: .
    restart: always
    environment:
      - MONGO_URL=mongodb://user:password@mongo:27017/rentmoldova
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - mongo

  mongo:
    image: mongo:7.0
    restart: always
    environment:
      - MONGO_INITDB_ROOT_USERNAME=user
      - MONGO_INITDB_ROOT_PASSWORD=password
    volumes:
      - mongo-data:/data/db

volumes:
  mongo-data:
```
