# System Design Document (SDD)
## Project Name: UniBook — Campus Event & Venue Booking Dashboard
**Dual Academic Focus**: Object-Oriented Programming (Java) & Relational Database Management Systems (MySQL)

---

## 1. Architecture Overview

UniBook is structured as a decoupled multi-tier enterprise web application:
- **Presentation Tier**: Next.js 14+ (App Router) with React, TypeScript, and Tailwind CSS. Provides a dense, crisp, light-mode enterprise analytics dashboard.
- **Application & Service Tier**: Java (JDK 17+) RESTful Service built on pure Object-Oriented principles, JDBC connection management, multithreading synchronizers, background daemon tasks, and native file streaming.
- **Data Tier**: MySQL 8.0 database engine strictly configured with normalization, foreign key constraints, B-Tree indices, triggers, views, and cursor-driven stored procedures.

```
+-------------------------------------------------------------+
|             Next.js Frontend (Enterprise UI)                |
|  - Operational Dashboard (Overview, Venues, Bookings)       |
|  - Dedicated Viva Sandbox (/viva-demo for Evaluator)        |
+------------------------------+------------------------------+
                               | REST / JSON
+------------------------------v------------------------------+
|                     Java Application Tier                   |
|  +-------------------------------------------------------+  |
|  | OOP Models: CampusEntity, Venue, Organizer, Event     |  |
|  | Interface: Bookable | Exception: VenueUnavailableExc  |  |
|  +-------------------------------------------------------+  |
|  | Services: BookingService (Method Overloading)         |  |
|  | Concurrency: synchronized processBooking()            |  |
|  | Daemon: HoldCleanupDaemon (Background thread)         |  |
|  | File I/O: BufferedReader (Manifest), FileWriter (.txt)|  |
|  +-------------------------------------------------------+  |
|  | Data Access: JDBC Connector & DAO Layer               |  |
+------------------------------+------------------------------+
                               | JDBC Driver (MySQL 8.0)
+------------------------------v------------------------------+
|                    MySQL 8.0 Database Tier                  |
|  - Tables: organizers, venues, bookings                     |
|  - B-Tree Indexes: idx_booking_date, idx_venue_id           |
|  - Trigger: After_Booking_Insert (total_bookings counter)   |
|  - Stored Procedure: sp_check_availability (with Cursor)   |
|  - View: vw_venue_utilization (LEFT OUTER JOIN & Aggregation)|
+-------------------------------------------------------------+
```

---

## 2. Object-Oriented Programming (Java) Architecture

### 2.1 Class Diagram & Composition ("Has-A")
- **Abstract Base Class**: `CampusEntity`
  - Attributes: `protected int id`, `protected String name`
  - Defines the foundational contract for any physical or administrative university entity.
- **Derived Classes (Inheritance)**:
  - `Organizer extends CampusEntity`: Adds `String department`.
  - `Venue extends CampusEntity implements Bookable`: Adds `int capacity`, `int totalBookings`, and provides the implementation of `isCapacitySufficient(int attendees)`.
- **Composition (Event has-a Venue & has-a Organizer)**:
  - `Event extends CampusEntity`:
    - Contains `private Venue venue` (Composition)
    - Contains `private Organizer organizer` (Composition)
    - Contains `private LocalDate bookingDate`
    - Contains `private String status`

```java
// Conceptual Structure
public abstract class CampusEntity {
    protected int id;
    protected String name;
    // Getters & Setters
}

public interface Bookable {
    boolean isCapacitySufficient(int requestedAttendees);
}

public class Venue extends CampusEntity implements Bookable {
    private int capacity;
    private int totalBookings;

    @Override
    public boolean isCapacitySufficient(int attendees) {
        return attendees <= this.capacity;
    }
}

public class Organizer extends CampusEntity {
    private String department;
}

public class Event extends CampusEntity {
    private Venue venue;        // Composition
    private Organizer organizer; // Composition
    private LocalDate bookingDate;
    private String status;
}
```

### 2.2 Method Overloading
The `BookingService` provides polymorphic call signatures for varied reservation scenarios:
```java
public class BookingService {
    // Overload 1: Single-day booking
    public BookingConfirmation bookVenue(int venueId, int organizerId, LocalDate date) 
        throws VenueUnavailableException { ... }

    // Overload 2: Multi-day range booking
    public List<BookingConfirmation> bookVenue(int venueId, int organizerId, LocalDate startDate, LocalDate endDate) 
        throws VenueUnavailableException { ... }
}
```

### 2.3 Custom Exception Handling
- `VenueUnavailableException extends Exception`:
  - Thrown whenever a booking conflicts with an existing reservation or if the stored procedure reports zero availability.
  - Returns structured error information including venue ID, requested date, and timestamp.

### 2.4 Multithreading & Concurrency
1. **Critical Section Synchronization**:
   - `public synchronized BookingConfirmation processBooking(Event event)`
   - Guarantees that concurrent booking requests for the same room and slot cannot cause a double-booking race condition.
2. **Background Daemon Thread (`HoldCleanupDaemon`)**:
   - Implements `Runnable` and is initialized with `thread.setDaemon(true)`.
   - Wakes every 60 seconds to inspect and expire pending/stale booking holds, freeing resources without blocking main user execution.

### 2.5 File I/O Stream Processing
1. **`BufferedReader` (Input Stream Processing)**:
   - On server startup, `VenueManifestLoader` reads `venues_manifest.csv` or `venues_seed.txt` line by line using `BufferedReader` and seeds initial physical venue inventory into memory/database.
2. **`FileWriter` / `BufferedWriter` (Output Stream Processing)**:
   - On successful booking, `ReceiptGenerator` outputs an immutable audit receipt `receipt_<bookingId>.txt` detailing the reservation timestamp, organizer department, venue capacity, and cryptographic confirmation code.
   - Endpoint exposes this receipt for instant user download.

---

## 3. Relational Database Management Systems (MySQL) Architecture

### 3.1 Schema DDL & Constraints
```sql
-- Organizers Table
CREATE TABLE IF NOT EXISTS organizers (
    organizer_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL
) ENGINE=InnoDB;

-- Venues Table with CHECK and UNIQUE constraints
CREATE TABLE IF NOT EXISTS venues (
    venue_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    capacity INT NOT NULL CHECK (capacity > 0),
    total_bookings INT DEFAULT 0
) ENGINE=InnoDB;

-- Bookings Table with Foreign Key Constraints
CREATE TABLE IF NOT EXISTS bookings (
    booking_id INT AUTO_INCREMENT PRIMARY KEY,
    venue_id INT NOT NULL,
    organizer_id INT NOT NULL,
    booking_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'CONFIRMED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_booking_venue FOREIGN KEY (venue_id) REFERENCES venues(venue_id) ON DELETE CASCADE,
    CONSTRAINT fk_booking_organizer FOREIGN KEY (organizer_id) REFERENCES organizers(organizer_id) ON DELETE CASCADE,
    CONSTRAINT uq_venue_date UNIQUE (venue_id, booking_date)
) ENGINE=InnoDB;
```

### 3.2 B-Tree Indexing
Explicit indices optimize frequent search and join predicates:
```sql
CREATE INDEX idx_booking_date ON bookings(booking_date);
CREATE INDEX idx_venue_id ON bookings(venue_id);
```

### 3.3 PL/SQL Trigger (Automated Counter)
An `AFTER INSERT` trigger maintains venue popularity statistics automatically:
```sql
DELIMITER //
CREATE TRIGGER After_Booking_Insert
AFTER INSERT ON bookings
FOR EACH ROW
BEGIN
    UPDATE venues 
    SET total_bookings = total_bookings + 1 
    WHERE venue_id = NEW.venue_id;
END; //
DELIMITER ;
```

### 3.4 Relational View with Complex Left Outer Join
Calculates live utilization metrics for all campus spaces, including unused ones:
```sql
CREATE OR REPLACE VIEW vw_venue_utilization AS
SELECT 
    v.venue_id, 
    v.name AS venue_name, 
    v.capacity, 
    v.total_bookings AS lifetime_bookings,
    COUNT(b.booking_id) AS current_active_bookings,
    ROUND((COUNT(b.booking_id) / 30.0) * 100, 1) AS monthly_utilization_rate
FROM venues v
LEFT OUTER JOIN bookings b ON v.venue_id = b.venue_id AND b.status = 'CONFIRMED'
GROUP BY v.venue_id, v.name, v.capacity, v.total_bookings;
```

### 3.5 Stored Procedure with Explicit Cursor
Validates slot availability by declaring, opening, fetching, and closing a cursor:
```sql
DELIMITER //
CREATE PROCEDURE sp_check_availability(
    IN p_venue_id INT, 
    IN p_date DATE, 
    OUT p_is_available BOOLEAN
)
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE b_date DATE;
    DECLARE cur CURSOR FOR SELECT booking_date FROM bookings WHERE venue_id = p_venue_id;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    SET p_is_available = TRUE;

    OPEN cur;
    read_loop: LOOP
        FETCH cur INTO b_date;
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        IF b_date = p_date THEN
            SET p_is_available = FALSE;
            LEAVE read_loop;
        END IF;
    END LOOP;
    CLOSE cur;
END; //
DELIMITER ;
```

---

## 4. REST API Contract (Java Backend to Next.js Frontend)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/dashboard/summary` | Returns high-level metrics (total venues, total bookings today, peak rate, top venue) |
| `GET` | `/api/venues` | Fetches venue catalog using `vw_venue_utilization` |
| `GET` | `/api/bookings` | Fetches active and historical bookings with organizer names |
| `POST` | `/api/bookings` | Processes a new booking through the `synchronized` booking service |
| `GET` | `/api/bookings/:id/receipt` | Streams the `.txt` receipt created via `FileWriter` |
| `GET` | `/api/organizers` | Fetches all university departments/organizers |
| `POST` | `/api/viva/stress-test` | Triggers 10 parallel threads attempting to book the same room |
| `GET` | `/api/viva/check-cursor` | Calls `sp_check_availability` with cursor for a given venue and date |
| `GET` | `/api/viva/manifest` | Returns raw contents read by `BufferedReader` from server disk |

---

## 5. UI Layout & Component Hierarchy

```
frontend/
└── src/
    ├── app/
    │   ├── layout.tsx         # Global Light Theme shell (#F3F4F6) with Sidebar & Header
    │   ├── page.tsx           # Operational Overview Dashboard (Metrics, Venues, Upcoming Table)
    │   ├── venues/
    │   │   └── page.tsx       # Venue Directory & Capacity Matrix
    │   ├── bookings/
    │   │   └── page.tsx       # Full Bookings Ledger & Receipt Download
    │   └── viva-demo/
    │       └── page.tsx       # Academic Viva Sandbox (Evaluator Test Suite)
    ├── components/
    │   ├── Sidebar.tsx        # Persistent slim icon sidebar
    │   ├── Header.tsx         # Sticky top header (Title, Date, Search, Quick Reserve button)
    │   ├── MetricCard.tsx     # Crisp enterprise metric card
    │   ├── VenueCard.tsx      # Venue card with capacity meter & status chip
    │   ├── BookingModal.tsx   # Instant conflict-checked reservation dialog
    │   └── viva/
    │       ├── ConcurrencyTestCard.tsx # 10-thread simulation visualizer
    │       ├── FileIoCard.tsx          # Manifest reader & receipt generator preview
    │       └── ProcedureCursorCard.tsx # Stored procedure cursor tester
    └── lib/
        └── api.ts             # Typed fetch client connecting to Java backend
```
