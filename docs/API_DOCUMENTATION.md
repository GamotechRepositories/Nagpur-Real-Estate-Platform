# Nagpur Real Estate Platform — API Documentation

Version: `v1.0.0`  
Base URL: `/api/v1`

---

## 1. Authentication Endpoints

### Request OTP
`POST /api/v1/auth/otp/request`
- **Rate Limit:** 10 requests / 10 minutes
- **Body:**
```json
{
  "phone": "9823012345",
  "name": "Rahul Deshmukh"
}
```
- **Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully to your mobile number.",
  "data": {
    "deliveryMethod": "DEVELOPMENT_SIMULATED_SMS",
    "expiresInMinutes": 5,
    "devOtp": "123456"
  }
}
```

### Verify OTP
`POST /api/v1/auth/otp/verify`
- **Body:**
```json
{
  "phone": "9823012345",
  "otp": "123456",
  "name": "Rahul Deshmukh",
  "role": "USER"
}
```
- **Response:**
```json
{
  "success": true,
  "message": "Authentication successful",
  "data": {
    "user": {
      "id": "673...",
      "phone": "9823012345",
      "name": "Rahul Deshmukh",
      "role": "USER"
    },
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "eyJhbGciOi..."
  }
}
```

### Admin / Staff Password Login
`POST /api/v1/auth/login`
- **Rate Limit:** 15 requests / 15 minutes
- **Body:**
```json
{
  "email": "admin@nagpurestate.com",
  "password": "Nagpur@Admin2026!",
  "twoFactorCode": "123456"
}
```

---

## 2. Properties Endpoints

### Search & Filter Properties
`GET /api/v1/properties`
- **Query Parameters:**
  - `purpose`: `BUY` | `RENT`
  - `category`: `RESIDENTIAL` | `COMMERCIAL` | `PLOT`
  - `subtype`: `FLAT` | `HOUSE_VILLA` | `PLOT` | `COMMERCIAL_SHOP` | `COMMERCIAL_OFFICE`
  - `locality`: string (e.g. `Dharampeth`, `Manish Nagar`)
  - `minPrice`, `maxPrice`: numeric (in INR)
  - `minArea`, `maxArea`: numeric (in Sq.Ft)
  - `bedrooms`: `1` | `2` | `3` | `4` | `5`
  - `bathrooms`: numeric
  - `furnishing`: `UNFURNISHED` | `SEMI_FURNISHED` | `FULLY_FURNISHED`
  - `possessionStatus`: `READY_TO_MOVE` | `UNDER_CONSTRUCTION`
  - `isVerified`: `true`
  - `isFeatured`: `true`
  - `lat`, `lng`, `radiusKm`: Geospatial circle search using MongoDB 2dsphere
  - `sort`: `latest` | `price_asc` | `price_desc` | `area_desc` | `featured`
  - `page`, `limit`: pagination

### Get Property Details
`GET /api/v1/properties/details/:slug`
- Returns populated property document, increments view counter, and checks saved status for authenticated users.

### Create Property
`POST /api/v1/properties?draft=true|false`
- **Auth:** Required (`USER`, `OWNER`, `AGENT`, `SUPER_ADMIN`)
- **Body:** Full property details object. When `draft=false`, auto-creates a moderation ticket with a 24-hour SLA.

---

## 3. CRM & Lead Management

### Submit Property Enquiry
`POST /api/v1/enquiries`
- Routes lead according to active strategy (`ROUND_ROBIN` / `LOCALITY_BASED`), notifies assigned agent, calculates SLA deadline.

### Get CRM Kanban Board
`GET /api/v1/enquiries/admin/leads/kanban`
- **Auth:** Staff or Agent
- Returns grouped leads by `NEW`, `CONTACTED`, `VISIT_SCHEDULED`, `CLOSED_WON`, `CLOSED_LOST`.

### Update Lead Stage & Add Activity
`PATCH /api/v1/enquiries/admin/leads/:id`  
`POST /api/v1/enquiries/admin/leads/:id/activity`

---

## 4. Moderation Queue Endpoints

### Get Moderation Queue
`GET /api/v1/admin/moderation?status=PENDING|APPROVED|REJECTED`
- **Auth:** `SUPER_ADMIN`, `MODERATOR`

### Approve Property
`POST /api/v1/admin/moderation/:id/approve`
- Sets `status: LIVE`, `isVerified: true`, `expiresAt: now + 90 days`, dispatches owner notification, logs audit entry.

### Reject Property
`POST /api/v1/admin/moderation/:id/reject`
- **Body:** `{ "rejectionReason": "...", "reviewNotes": "..." }`
- Sets `status: REJECTED`, dispatches notification with reason, logs audit entry.

---

## 5. Financial & Real Estate Tools

### Calculate EMI
`POST /api/v1/tools/emi-calculate`
- **Formula:** `EMI = P × r × (1+r)^n / ((1+r)^n - 1)`
- Returns monthly EMI, total interest, total payable, and yearly amortization schedule.

### Area Unit Converter
`POST /api/v1/tools/area-convert`
- Converts between `sqft`, `guntha` (1,089 sq.ft), `sqyd` (Gaj), `sqmtr`, `acre`, and `hectare`.
