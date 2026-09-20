# ParkHere — Smart Parking for Smarter Cities

Production-ready full-stack web application connecting drivers who need parking (**Parking Needed**) with property owners and facilities providing parking spaces (**Parking Holder**).

This application is built with **zero fake/demo data, zero mock users, zero fake locations, and zero hardcoded bookings or payments**.

---

## 🚀 Key Features

- **True Geospatial Engine**: Real device GPS location (`navigator.geolocation.getCurrentPosition`) + Nominatim OpenStreetMap forward/reverse geocoding + MongoDB `2dsphere` geospatial indexing (`$near` / `$maxDistance`).
- **Interactive Live Map**: Interactive Leaflet map with user location pulse marker and status color-coded markers (🟢 Available, 🟠 Few slots, 🔴 Full/Closed).
- **Strict Role-Based Security**: Role-based access control protecting `/parking-needed/*` and `/parking-holder/*` routes and API endpoints.
- **Compulsory Host Verification**:
  - Section A: Number of vehicles, covered/open preference, CCTV/gated security preference.
  - Section B: Compulsory government ID (Aadhaar / Passport / ID) uploaded to encrypted private storage, minimum 2 parking photos, landmark, and gate/CCTV declarations.
  - Only approved hosts can publish bookable spaces on the live map.
- **100m Arrival Geofence**: Server verifies that the driver's device GPS coordinates are within 100 meters of the parking space entrance before allowing arrival verification.
- **Vehicle Inspection & Damage Evidence**: Drivers take a photo of their parked vehicle upon arrival and declare any pre-existing scratches or damage with photo evidence.
- **Backend Session Monitor & 10-Minute Alert**: Background job running every 30 seconds checks active sessions and dispatches in-app notifications exactly 10 minutes prior to expiration, as well as automatic overtime billing upon session conclusion.
- **Dynamic UPI & Cash Payment Flow**:
  - Dynamic UPI URI (`upi://pay?pa=...&pn=...&am=...&tr=...`) with real-time dynamic QR code generation.
  - Cash handover flow where hosts explicitly confirm "Cash Received" from their dashboard to conclude the session.
- **Private Protected Storage**: Government IDs, vehicle photos, and damage reports are stored in private storage and streamed only to authenticated, authorized users.

---

## 🛠️ Architecture

```
parkhere/
│
├── frontend/                     # React + Vite + TypeScript + Tailwind CSS
│   ├── src/
│   │   ├── components/           # MapView, LocationPicker, ParkingCard, Modals, Navbar, etc.
│   │   ├── context/              # AuthContext, LocationContext, NotificationContext
│   │   ├── layouts/              # PublicLayout, DashboardLayout
│   │   ├── pages/
│   │   │   ├── public/           # Landing, SignIn, SignUp, HowItWorks, Features, About
│   │   │   ├── parking-needed/   # Dashboard, FindParking, LiveMap, MyBookings, Profile, Settings
│   │   │   └── parking-holder/   # Dashboard, MyParking, CreateParking, Bookings, Earnings, Verification
│   │   ├── services/             # api.ts, authService, parkingService, bookingService, upiService
│   │   └── types/                # Strict TypeScript interfaces
│   └── package.json
│
├── backend/                      # Node.js + Express + TypeScript + Mongoose
│   ├── src/
│   │   ├── config/               # db.ts (MongoDB / Atlas / Embedded engine fallback), env.ts
│   │   ├── controllers/          # auth, parking, booking, arrival, payment, notification, verification
│   │   ├── jobs/                 # sessionMonitor.ts (10-min alerts, session end), seedDev.ts
│   │   ├── middleware/           # auth.ts, role.ts, upload.ts (public & private), errorHandler.ts
│   │   ├── models/               # User, ParkingSpace (2dsphere), Booking, Payment, Notification
│   │   ├── routes/               # authRoutes, parkingRoutes, bookingRoutes, paymentRoutes, etc.
│   │   ├── services/             # geoService, upiService, notificationService
│   │   ├── utils/                # distance.ts (Haversine), qrCode.ts
│   │   └── server.ts
│   ├── uploads/                  # private/ (Protected IDs & inspections) & public/
│   └── package.json
│
├── .env.example
└── README.md
```

---

## ⚙️ Environment Configuration

### Backend `.env` (`backend/.env`)
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Database
# Connect to local MongoDB daemon or MongoDB Atlas URI:
MONGODB_URI=mongodb://127.0.0.1:27017/parkhere

# JWT Authentication
JWT_SECRET=super_secret_jwt_key_parkhere_production_2026_secure
JWT_EXPIRES_IN=7d

# Private Storage
STORAGE_PATH=./uploads

# Geofence Distance Setting
ARRIVAL_RADIUS_METERS=100
```

> **Note on Database Connection**: If a local MongoDB daemon or Atlas URI is reachable at `MONGODB_URI`, the server connects to it immediately. If not detected on startup, the server automatically starts an embedded MongoDB instance so development and testing work out-of-the-box on any machine.

### Frontend `.env` (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5000/api
VITE_MAPTILER_API_KEY=
```

---

## 🏃 Quick Start

### 1. Start the Backend API
```bash
cd backend
npm install
npm run dev
```
Backend runs on: `http://localhost:5000`

### 2. Start the Frontend Development Server
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on: `http://localhost:5173`

### 3. Production Build
```bash
# Build backend
cd backend
npm run build
npm start

# Build frontend
cd frontend
npm run build
```

---

## 🧪 End-to-End User Verification Workflow

1. **Sign Up as Parking Holder**:
   - Navigate to `/signup?role=parking_holder`.
   - Provide credentials, Section A preferences (vehicles, covered/open, CCTV/gate), and Section B compulsory fields (Government ID file, minimum 2 parking photos, landmark).
   - Once submitted, the host account is placed in `verificationStatus = "pending"`.
   - Head to `/parking-holder/verification` to inspect submitted documents. Use the verification review panel to approve the host.
2. **Publish Parking Facility**:
   - Go to `/parking-holder/parking/new`.
   - Select the exact entrance location using the interactive map pin, search bar, or "Use My Location".
   - Enter capacity (e.g. 5 slots), rate (e.g. ₹40/hr), landmark, security details, and upload facility photos.
   - Click **Publish Parking Space**.
3. **Driver Search & Live Map**:
   - Sign up a driver at `/signup?role=parking_needed`.
   - Go to **Find Parking** or **Live Map**.
   - The published parking space immediately appears with dynamic slot availability, price, and distance calculated from your device GPS coordinates.
4. **Reserve a Parking Slot**:
   - Click **Book Parking**, choose arrival time and duration (e.g. 2 hours).
   - Complete booking; the space's available slots decrement atomically to prevent overbooking.
5. **Arrival & Vehicle Inspection**:
   - In **My Bookings**, click **I've Arrived**.
   - Check in using high-accuracy GPS (must be within 100m).
   - Upload vehicle photo and declare pre-existing damage evidence.
   - As the host, approve the driver's arrival to start the live parking session.
6. **Live Countdown & 10-Minute Alert**:
   - Live timer counts down according to backend server timestamps.
   - When 10 minutes remain, both driver and host receive an in-app 10-minute warning alert.
7. **Payment & Session Completion**:
   - Conclude session. Choose dynamic UPI QR code or Cash payment.
   - For cash, host clicks **Confirm Cash Received** to conclude the session and restore slot capacity.
