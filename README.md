# Nagpur Real Estate Platform (MERN Stack)

A production-ready real estate marketplace website, REST API backend, and admin dashboard designed specifically for Nagpur, Maharashtra, India.

---

## 🚀 Key Highlights & Features

- **Nagpur Centric Architecture:** Tailored for Nagpur localities (Dharampeth, Manish Nagar, Wardha Road, Besa, Civil Lines, Ramdaspeth, Sitabuldi, etc.) with MahaRERA registration and NMRDA sanction tracking.
- **Full MERN Stack:** React.js + Vite + Tailwind CSS + Node.js + Express.js + MongoDB Atlas + Mongoose.
- **Geospatial 2dsphere Search:** Radius and circle property searches powered by MongoDB GeoJSON coordinates `[longitude, latitude]`.
- **Listing Lifecycle Management:** 8-stage lifecycle (`DRAFT`, `PENDING_REVIEW`, `LIVE`, `REJECTED`, `EXPIRED`, `SOLD`, `RENTED`, `ARCHIVED`) with 90-day auto-expiry and reminders.
- **Moderation Queue:** Dedicated administrative verification queue with document checklist, review notes, and reason-based rejections.
- **Real Estate CRM:** Complete lead management system with Kanban board, automatic Round-Robin / Locality-based routing, SLA tracking, call logs, and CSV export.
- **Multilingual Support:** English, हिन्दी (Hindi), and मराठी (Marathi) translations via `i18next`.
- **Financial & Land Tools:**
  - Home Loan EMI Calculator with monthly amortization schedules.
  - Indian Real Estate Area Converter (Sq.Ft, Guntha, Gaj, Sq.Mtr, Acre, Hectare).
  - Bank loan pre-approval request engine.
- **Enterprise Security:** JWT access + refresh tokens, phone OTP verification (MSG91 & Dev mode), bcryptjs password hashing, TOTP 2FA, Helmet, rate-limiting, and audit logging.

---

## 📂 Project Structure

```
nagpur-real-estate/
├── backend/
│   ├── src/
│   │   ├── config/             # MongoDB connection & status
│   │   ├── constants/          # Roles, statuses, purpose constants
│   │   ├── controllers/        # Modular API controllers
│   │   ├── middleware/         # Auth, RBAC, Rate-limit, Multer upload, Errors
│   │   ├── models/             # 22 Mongoose Models with indexes & GeoJSON
│   │   ├── routes/             # Modular REST API routes (/api/v1)
│   │   ├── services/           # OTP, Lead routing, Notifications, Audit
│   │   ├── utils/              # Seed data, JWT, Response helpers
│   │   ├── validators/         # Zod schemas for all requests
│   │   ├── app.js              # Express app setup
│   │   └── server.js           # Server entry & background scheduled jobs
│   ├── test/                   # Unit & API test suite
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── public/                 # Static assets & favicons
│   ├── src/
│   │   ├── admin/              # Admin layout, dashboard, moderation, CRM
│   │   ├── api/                # Axios client with interceptors
│   │   ├── components/         # Header, Footer, PropertyCard, Modals
│   │   ├── locales/            # en, hi, mr translation dictionaries
│   │   ├── pages/              # Home, Search, Details, Post Property, Tools
│   │   ├── store/              # Zustand auth & wishlist store
│   │   ├── utils/              # Currency (Lakh/Crore) & date formatters
│   │   ├── App.jsx             # React Router routing
│   │   ├── index.css           # Tailwind CSS
│   │   └── main.jsx            # QueryClient & Helmet providers
│   ├── .env.example
│   └── package.json
│
├── docs/
│   ├── API_DOCUMENTATION.md    # Complete REST API reference
│   ├── DATABASE_SCHEMA.md      # 22 Mongoose models & indexes
│   ├── SETUP_GUIDE.md          # Local developer setup
│   └── DEPLOYMENT_GUIDE.md     # Production deployment instructions
│
├── package.json                # Monorepo workspaces configuration
└── README.md
```

---

## ⚡ Quickstart

### 1. Configure MongoDB Atlas
Edit `backend/.env` with your MongoDB Atlas connection string:
```env
MONGODB_URI=mongodb+srv://<db_username>:<db_password>@cluster0.n3m8vyc.mongodb.net/nagpur_real_estate?retryWrites=true&w=majority&appName=Cluster0
```

### 2. Install & Start Development Servers
From root workspace:
```bash
# Run both Backend (:5000) & Frontend (:5173) simultaneously
npm run dev
```

### 3. Seed Initial Nagpur Data
Populate Nagpur localities, amenities, demo agents, and sample properties:
```bash
npm run seed
```

**Staff Demo Login:**
- Portal: `http://localhost:5173/admin/login`
- Email: `admin@nagpurestate.com`
- Password: `Nagpur@Admin2026!`

**User Demo OTP:**
- Mobile: Any 10-digit number (e.g. `9823012345`)
- OTP: `123456` (In development mode)

---

## 🧪 Testing

Run backend test suite:
```bash
npm test
```

---

## 🛡️ License
ISC &middot; Nagpur Real Estate Team
