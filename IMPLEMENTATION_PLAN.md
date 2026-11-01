# Implementation Plan: UniBook Campus Event & Venue Booking Dashboard

This document details the step-by-step execution roadmap for UniBook, strictly dividing responsibilities across the Database, Java Backend, and Next.js Frontend tiers.

---

## Architecture Roadmap Summary

```
   [Phase 1: Database Tier]
         │  • MySQL 8.0 DDL & Constraints
         │  • B-Tree Indexes
         │  • PL/SQL Trigger (After_Booking_Insert)
         │  • Relational View (vw_venue_utilization)
         │  • Stored Procedure with Cursor (sp_check_availability)
         ▼
   [Phase 2: Java Backend Tier]
         │  • OOP Hierarchy: CampusEntity, Venue, Organizer, Event
         │  • Composition ("Has-A" relationships) & Interface (Bookable)
         │  • Method Overloading in BookingService
         │  • Custom Exception: VenueUnavailableException
         │  • Multithreading: synchronized processBooking & HoldCleanupDaemon
         │  • File I/O: BufferedReader (manifest) & FileWriter (receipts)
         │  • Embedded Lightweight HTTP REST Server + JDBC DAO
         ▼
   [Phase 3: Frontend Scaffolding & Design System]
         │  • Next.js 14+ (App Router) + Tailwind CSS + Lucide Icons
         │  • Strict Enterprise Light Theme: #F3F4F6 canvas, #FFFFFF cards, border-gray-200
         │  • Accents: #3B82F6 (Blue), #F97316 (Orange)
         │  • Dense Data Layout & Instant Snappy Transitions (Zero bouncy animations)
         ▼
   [Phase 4: Operational Campus Dashboard] (User Business Domain Only)
         │  • Top Executive Metric Cards (Capacities, Bookings Today, Utilization)
         │  • Interactive Venues Inventory with Capacity Bars
         │  • Bookings Table with Date Filters
         │  • Instant Conflict-Checked Booking Modal
         ▼
   [Phase 5: Academic Viva Demo Sandbox] (/viva-demo for Evaluator)
         │  • Multithreaded Collision Test: 10 concurrent requests to same room
         │  • File I/O Stream Verification: Manifest inspector & receipt downloader
         │  • Database Stored Procedure & Trigger Inspector
         ▼
   [Phase 6: Verification, End-to-End Testing & Documentation]
```

---

## Detailed Steps Breakdown

### Phase 1: Database Tier (MySQL 8.0)
- [ ] **Step 1.1**: Create `database/schema.sql`:
  - `organizers` table with primary key, not null constraints.
  - `venues` table with `CHECK (capacity > 0)` and `UNIQUE (name)`.
  - `bookings` table with foreign keys (`ON DELETE CASCADE`), `UNIQUE (venue_id, booking_date)`.
- [ ] **Step 1.2**: Create `database/indexes.sql`:
  - Explicit B-Tree index on `bookings(booking_date)`.
  - Explicit B-Tree index on `bookings(venue_id)`.
- [ ] **Step 1.3**: Create `database/triggers.sql`:
  - `After_Booking_Insert` trigger incrementing `venues.total_bookings`.
- [ ] **Step 1.4**: Create `database/views.sql`:
  - `vw_venue_utilization` with `LEFT OUTER JOIN` and `GROUP BY` showing all venues with booking metrics.
- [ ] **Step 1.5**: Create `database/procedures.sql`:
  - `sp_check_availability` stored procedure using an explicit cursor (`DECLARE cur CURSOR FOR SELECT booking_date...`) and loop.
- [ ] **Step 1.6**: Create `database/seed.sql`:
  - Pre-populate realistic campus venues (Auditoriums, Computer Labs, Lecture Halls, Seminar Rooms) and university organizers/departments.

---

### Phase 2: Java Backend Tier (OOP & Concurrency Engine)
- [ ] **Step 2.1**: Initialize Maven project structure under `backend/` (`pom.xml` with MySQL Connector/J and lightweight HTTP JSON server).
- [ ] **Step 2.2**: Implement Core OOP Models:
  - `CampusEntity.java` (abstract base class).
  - `Bookable.java` (interface with `isCapacitySufficient(int attendees)`).
  - `Venue.java` (extends `CampusEntity`, implements `Bookable`).
  - `Organizer.java` (extends `CampusEntity`).
  - `Event.java` (extends `CampusEntity`, uses Composition to hold `Venue` and `Organizer`).
- [ ] **Step 2.3**: Implement Custom Exception:
  - `VenueUnavailableException.java` with detailed conflict timestamps and room references.
- [ ] **Step 2.4**: Implement File I/O Processing:
  - `VenueManifestLoader.java`: Uses `BufferedReader` to read initial venue data from `venues_manifest.csv` on the server disk.
  - `ReceiptGenerator.java`: Uses `FileWriter` / `BufferedWriter` to create timestamped audit receipt `.txt` files for every confirmed booking.
- [ ] **Step 2.5**: Implement Concurrency & Daemon Thread:
  - `BookingService.java`:
    - Contains overloaded `bookVenue(...)` methods.
    - Contains `public synchronized BookingConfirmation processBooking(...)` to ensure strict single-thread execution in critical booking sections.
  - `HoldCleanupDaemon.java`:
    - Background `Runnable` configured as `setDaemon(true)` running in an infinite sleep loop to clean stale unconfirmed bookings.
- [ ] **Step 2.6**: Implement JDBC DAO & Database Connection Pool:
  - `DatabaseConnection.java`: Singleton JDBC connection manager with fallback/in-memory mode for standalone testing if local MySQL service is inactive.
  - `VenueDao.java`, `BookingDao.java`, `OrganizerDao.java`.
  - CallableStatement execution for `sp_check_availability`.
- [ ] **Step 2.7**: Implement REST Controller / HTTP API Endpoints:
  - Expose JSON endpoints matching the API contract (`/api/dashboard/summary`, `/api/venues`, `/api/bookings`, `/api/viva/*`).

---

### Phase 3: Frontend Scaffolding & Enterprise Design System
- [ ] **Step 3.1**: Scaffold Next.js application in `frontend/` using App Router, TypeScript, and Tailwind CSS.
- [ ] **Step 3.2**: Configure Enterprise Design System in `tailwind.config.ts` and `globals.css`:
  - Canvas: `#F3F4F6` (light neutral gray).
  - Surfaces: `#FFFFFF` (crisp white).
  - Borders: `#E5E7EB` / `border-gray-200`.
  - Accents: `#3B82F6` (Executive Blue), `#F97316` (Muted Warm Orange).
  - Zero playful bouncing; sub-100ms instant responsive micro-interactions.
- [ ] **Step 3.3**: Create Global Layout:
  - Persistent left sidebar with slim icons (Dashboard, Venues, Bookings, Viva Demo).
  - Sticky top header with global campus search, date display, and "Quick Reserve" trigger.
  - Reusable components: `MetricCard`, `StatusBadge`, `CapacityMeter`.

---

### Phase 4: Operational Campus Dashboard (Pure Business Domain)
- [ ] **Step 4.1**: Executive Metric Cards:
  - Total Campus Venues, Active Bookings Today, Average Utilization Rate, Most Popular Hall.
- [ ] **Step 4.2**: Campus Venues Directory & Utilization Matrix (`/venues` and overview grid):
  - Venue cards with live capacity visualization, department tagging, and status pill (`Available` / `Occupied`).
- [ ] **Step 4.3**: Campus Bookings Ledger (`/bookings` and upcoming table):
  - Structured, dense enterprise table with sortable columns, date filter, status badges, and download receipt button.
- [ ] **Step 4.4**: Instant Conflict-Checked Booking Modal:
  - Clean modal dialog for administrators to book a room. Validates capacity and time conflicts instantly.

---

### Phase 5: Academic Viva / Evaluator Sandbox (`/viva-demo`)
- [ ] **Step 5.1**: Concurrency Stress Test Interactive Panel:
  - "Run 10-Thread Collision Test" button.
  - Fires 10 concurrent threads in Java targeting the exact same venue and date.
  - Live console feed demonstrating that `synchronized` permitted exactly 1 winner, while 9 threads safely caught `VenueUnavailableException`.
- [ ] **Step 5.2**: File I/O Stream Verification Panel:
  - Manifest Inspector: View raw lines parsed by `BufferedReader` from `venues_manifest.csv`.
  - Receipt Generator & Downloader: Select a booking, generate receipt via `FileWriter`, view raw `.txt` content, and download it.
- [ ] **Step 5.3**: Database Procedures & Triggers Inspector Panel:
  - Direct execution of `sp_check_availability` calling MySQL CallableStatement cursor loop.
  - Live validation of the `After_Booking_Insert` trigger incrementing `total_bookings`.
  - Raw query display for `vw_venue_utilization` with `LEFT OUTER JOIN`.

---

### Phase 6: Verification, End-to-End Testing & Deliverables
- [ ] **Step 6.1**: Run backend compilation and tests.
- [ ] **Step 6.2**: Test all frontend routes and responsive states.
- [ ] **Step 6.3**: Verify complete separation of concerns:
  - Operational dashboard shows zero internal technical clutter.
  - `/viva-demo` cleanly showcases all academic evaluation criteria.
- [ ] **Step 6.4**: Final review and documentation walkthrough.
