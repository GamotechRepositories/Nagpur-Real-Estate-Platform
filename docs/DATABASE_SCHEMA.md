# Nagpur Real Estate Platform — MongoDB Atlas Database Design

This document details the MongoDB Atlas collections, Mongoose schemas, and indexes implemented for the Nagpur Real Estate Platform.

---

## 1. Connection Architecture
- **Format:** `mongodb+srv://<db_username>:<db_password>@cluster0.n3m8vyc.mongodb.net/nagpur_real_estate?retryWrites=true&w=majority&appName=Cluster0`
- **Driver:** Mongoose ODM v8+ with connection pooling, automatic index building, and reconnect handlers.

---

## 2. Core Collections (22 Models)

### `User`
- **Fields:** `phone` (unique), `name`, `email` (sparse unique), `password` (hashed, select: false), `role` (enum), `status`, `twoFactorSecret`, `agentProfile` (ref).
- **Indexes:** `{ phone: 1 }`, `{ email: 1 }`, `{ role: 1 }`, `{ status: 1 }`.

### `Property`
- **Fields:** `title`, `slug` (unique), `purpose` (BUY/RENT), `category` (RESIDENTIAL/COMMERCIAL/PLOT), `subtype`, `price`, `areaSqFt`, `bedrooms`, `bathrooms`, `furnishing`, `possessionStatus`, `facing`, `amenities`, `reraNumber`, `location` (GeoJSON Point), `address`, `locality` (ref), `localityName`, `city`, `pincode`, `owner` (ref), `assignedAgent` (ref), `status` (DRAFT, PENDING_REVIEW, LIVE, REJECTED, EXPIRED, SOLD, RENTED, ARCHIVED), `expiresAt`, `viewsCount`.
- **Geospatial Index:** `{ location: "2dsphere" }` (coordinates: `[longitude, latitude]`).
- **Compound Indexes:**
  - `{ status: 1, purpose: 1, price: 1 }`
  - `{ status: 1, localityName: 1, purpose: 1 }`
  - `{ status: 1, subtype: 1, bedrooms: 1 }`
  - `{ status: 1, isFeatured: -1, createdAt: -1 }`

### `Locality` (Nagpur Specific)
- **Fields:** `name`, `nameEn`, `nameHi`, `nameMr`, `slug` (unique), `pincode`, `location` (GeoJSON Point), `description`, `areaGuide` (schools, hospitals, connectivity, avgPricePerSqFt), `isFeatured`.
- **Indexes:** `{ slug: 1 }`, `{ location: "2dsphere" }`.

### `Enquiry` (CRM Leads)
- **Fields:** `customerName`, `phoneNumber`, `email`, `property` (ref), `propertyTitle`, `leadSource`, `leadStatus` (NEW, CONTACTED, VISIT_SCHEDULED, CLOSED_WON, CLOSED_LOST), `assignedAgent` (ref), `slaDeadline`, `isEscalated`, `followUpDate`.
- **Indexes:** `{ leadStatus: 1, assignedAgent: 1, createdAt: -1 }`.

### `SiteVisit`
- **Fields:** `property` (ref), `user` (ref), `customerName`, `phoneNumber`, `preferredDate`, `preferredTimeSlot`, `assignedAgent` (ref), `status` (REQUESTED, CONFIRMED, COMPLETED, CANCELLED).
- **Indexes:** `{ preferredDate: 1, status: 1 }`.

### `Verification` (Moderation Audit Queue)
- **Fields:** `property` (ref), `reviewer` (ref User), `status` (PENDING, APPROVED, REJECTED), `checklist`, `documentsChecked`, `rejectionReason`, `reviewNotes`, `slaDeadline`.

### `SavedProperty`
- **Fields:** `user` (ref), `property` (ref).
- **Compound Unique Index:** `{ user: 1, property: 1 }` (Prevents duplicate wishlist entries).

### `OTP`
- **Fields:** `phone`, `otpHash`, `attempts`, `expiresAt`.
- **TTL Index:** `{ expiresAt: 1 }` with `{ expireAfterSeconds: 0 }` (Automatically removed by MongoDB background worker upon expiry).

### `AuditLog`
- **Fields:** `performedBy` (ref), `action`, `targetType`, `targetId`, `changes`, `ipAddress`, `userAgent`, `notes`.
- **Indexes:** `{ targetType: 1, targetId: 1, createdAt: -1 }`.

### `AppSettings`
- **Fields:** `key`, `leadRouting` (routingMode, defaultSlaHours, autoEscalateAfterSla), `listingConfig` (validityDays: 90, reminderDays: [7, 1]), `contacts`.
