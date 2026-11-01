-- ====================================================================
-- UniBook Database Schema: 01_schema.sql
-- Academic Requirement: RDBMS DDL & Relational Constraints
-- Constraints: PRIMARY KEY, FOREIGN KEY, CHECK, UNIQUE, NOT NULL
-- ====================================================================

CREATE DATABASE IF NOT EXISTS unibook_db;
USE unibook_db;

-- 1. Organizers Table
-- Represents academic departments and campus event organizers
CREATE TABLE IF NOT EXISTS organizers (
    organizer_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    contact_email VARCHAR(120) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Venues Table
-- Represents physical campus facilities with capacity and booking counters
-- Constraints:
--   - UNIQUE(name): Prevents duplicate facility records
--   - CHECK(capacity > 0): Ensures logical physical capacity bounds
CREATE TABLE IF NOT EXISTS venues (
    venue_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    building VARCHAR(100) NOT NULL,
    capacity INT NOT NULL CHECK (capacity > 0),
    total_bookings INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 3. Bookings Table
-- Represents scheduled reservations for campus venues
-- Constraints:
--   - FOREIGN KEY to venues (ON DELETE CASCADE)
--   - FOREIGN KEY to organizers (ON DELETE CASCADE)
--   - UNIQUE (venue_id, booking_date): Guarantees no double-booking at DB level
CREATE TABLE IF NOT EXISTS bookings (
    booking_id INT AUTO_INCREMENT PRIMARY KEY,
    venue_id INT NOT NULL,
    organizer_id INT NOT NULL,
    event_name VARCHAR(150) NOT NULL,
    booking_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'CONFIRMED' CHECK (status IN ('CONFIRMED', 'CANCELLED', 'HOLD')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_booking_venue FOREIGN KEY (venue_id) REFERENCES venues(venue_id) ON DELETE CASCADE,
    CONSTRAINT fk_booking_organizer FOREIGN KEY (organizer_id) REFERENCES organizers(organizer_id) ON DELETE CASCADE,
    CONSTRAINT uq_venue_date UNIQUE (venue_id, booking_date)
) ENGINE=InnoDB;
