# Nagpur Real Estate Platform — Setup Guide

## Prerequisites
- Node.js `v18+` or `v20+` or `v24+`
- npm `v9+`
- MongoDB Atlas cluster account (or connection URI)

---

## 1. Environment Configuration

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Copy `.env.example` to `.env`:
   ```bash
   copy .env.example .env
   ```
3. Edit `backend/.env` with your MongoDB Atlas database credentials:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.n3m8vyc.mongodb.net/nagpur_real_estate?retryWrites=true&w=majority&appName=Cluster0
   PORT=5000
   NODE_ENV=development
   JWT_ACCESS_SECRET=your_secure_access_secret_key_32_chars
   JWT_REFRESH_SECRET=your_secure_refresh_secret_key_32_chars
   CLIENT_URL=http://localhost:5173
   OTP_MODE=development
   DEVELOPMENT_DEFAULT_OTP=123456
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Copy `.env.example` to `.env`:
   ```bash
   copy .env.example .env
   ```

---

## 2. Installation & Running

### Option A: Running from Monorepo Root
From `d:\Real Estate Platform`:
```bash
# Run both Backend & Frontend simultaneously
npm run dev
```

### Option B: Running Separately

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```
Backend runs at: `http://localhost:5000/api/v1`

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```
Frontend runs at: `http://localhost:5173`

---

## 3. Database Seeding
To populate initial Nagpur localities (Dharampeth, Manish Nagar, Wardha Road, Besa, etc.), standard amenities, Super Admin staff account, sample agents, and verified listings:
```bash
cd backend
npm run seed
```

**Default Admin Credentials:**
- Email: `admin@nagpurestate.com`
- Password: `Nagpur@Admin2026!`

**Default Dev Mode OTP:**
- Mobile: Any 10-digit Indian mobile number (e.g. `9823012345`)
- OTP: `123456`

