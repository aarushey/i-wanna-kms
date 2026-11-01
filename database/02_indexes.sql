-- ====================================================================
-- UniBook Database Schema: 02_indexes.sql
-- Academic Requirement: RDBMS Explicit B-Tree Indexing
-- Purpose: Optimize date-range range scans and foreign key join lookups
-- ====================================================================

USE unibook_db;

-- 1. Index on booking_date for fast temporal filter lookups and range scans
CREATE INDEX idx_booking_date ON bookings(booking_date);

-- 2. Index on venue_id for rapid relational joins with venues table
CREATE INDEX idx_venue_id ON bookings(venue_id);

-- 3. Composite Index on status and booking_date for dashboard calendar queries
CREATE INDEX idx_status_date ON bookings(status, booking_date);
