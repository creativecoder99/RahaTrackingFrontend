# Raha Track - Frontend Application

Raha Track is a structured, high-contrast, accessible location tracking and fuel reimbursement portal designed for insurance field operations. It empowers sales associates to log audits with exact geo-coordinates, tracks actual-road travel distance using OSRM, and lets Branch Heads download monthly CSV ledgers (reimbursed at ₹12/km).

---

## 🛠️ Required Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Frontend library**: React 19
- **Styling**: Tailwind CSS v4 (incorporating the custom brand design tokens)
- **Mapping**: OpenStreetMap (Leaflet JS)
- **Execution Port**: `3000` (by default)

---

## ⚙️ Setup & Run Instructions

### Prerequisites
- Node.js (v18.0.0 or higher)
- Running Backend API service (typically on port `3001`)

### Installation & Execution

1. **Navigate to the frontend directory**:
   ```bash
   cd Frontend
   ```

2. **Install package dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env.local` file inside the `Frontend` root directory:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```

4. **Run the Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 💾 How to Seed the Data

To populate MongoDB with sales associates, managers, pre-configured leads, and historical timelines:

1. **Ensure MongoDB is running locally** (`mongodb://localhost:27017/raha-assignment`).
2. **Navigate to the Backend directory**:
   ```bash
   cd Backend
   ```
3. **Execute the seed script**:
   ```bash
   npm run seed
   ```
   This cleans existing tables and populates baseline users (passwords default to `password123`).

---

## 📊 Data Models

The system architecture utilizes three primary MongoDB database collections defined on the Backend:

### 1. User
Represents organization profiles:
- `name` (String): Full name of the user.
- `email` (String, unique): Corporate login email.
- `passwordHash` (String): Salted password credentials.
- `role` (Enum): `'associate'` (Sales Associate) or `'branch_head'` (Branch Manager).
- `managerId` (ObjectId, ref: 'User'): Points to the supervisor (null for Branch Heads).

### 2. Lead
Represents target meeting/audit accounts:
- `name` (String): Corporate lead name.
- `contact` (String): Direct contact number.
- `location` (Object): `{ lat: Number, lng: Number }` GPS coordinates.

### 3. DaySession
Represents a daily field trip session:
- `associateId` (ObjectId, ref: 'User'): The field associate.
- `dateStr` (String): Trip date formatted as `YYYY-MM-DD`.
- `status` (Enum): `'started'` or `'ended'`.
- `startTime` (Date): Check-in start time.
- `endTime` (Date, optional): End-of-day closure time.
- `startLocation` / `endLocation` (Object): lat/lng coordinates and precision radius.
- `activities` (Array): Logged visit sub-documents containing:
  - `leadId` (ObjectId, ref: 'Lead')
  - `leadName` (String)
  - `notes` (String)
  - `timestamp` (Date)
  - `location` (lat/lng/accuracy)
  - `distanceFromPrevKm` (Number): Distance driven from previous node.
- `totalDistanceKm` (Number): Cumulative daily road mileage.

---

## 💡 Assumptions Made

1. **OSRM Server Availability**: Calculated distances utilize the public Open Source Routing Machine (OSRM) API to determine real driving route coordinates. A mathematical straight-line (Haversine) calculator functions as a fallback if OSRM limits or networking failures occur.
2. **Indian Fuel Rate**: Payout is hardcoded to **₹12 per km** for standard reimbursement sheets.
3. **Office Location**: The starting center coordinate is set to Madhapur Center (`lat: 17.4483, lng: 78.3915`) for baseline validation checks.
4. **Geolocation Block Fallbacks**: If GPS permissions are blocked in the browser, the associate checks in manually at the target lead's coordinates to prevent breaking check-in workflows.

---

## 🚀 Future Improvements

If given more time, the following features would be implemented:
1. **Background GPS Tracking**: Shift from point-to-point check-ins to continuous background polling (Service Workers) to draw absolute path lines instead of segment estimates.
2. **Offline-First Capabilities**: Use IndexedDB to queue check-ins and log notes locally, syncing when connectivity resumes.
3. **Denser UI Components**: Create comprehensive dashboard widgets showing fuel cost trends, top active associates, and route overlays.
4. **Scale Hierarchy**: Expand the structure from simple Manager-Associate relationships to regional multi-branch operations.
