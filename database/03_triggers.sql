-- ====================================================================
-- UniBook Database Schema: 03_triggers.sql
-- Academic Requirement: RDBMS PL/SQL Triggers
-- Purpose: Maintain denormalized analytics counter without manual application updates
-- ====================================================================

USE unibook_db;

DROP TRIGGER IF EXISTS After_Booking_Insert;

DELIMITER //

-- Trigger: After_Booking_Insert
-- Fires automatically whenever a new reservation row is inserted into `bookings`.
-- Increments the `total_bookings` lifetime counter in the associated `venues` record.
CREATE TRIGGER After_Booking_Insert
AFTER INSERT ON bookings
FOR EACH ROW
BEGIN
    UPDATE venues 
    SET total_bookings = total_bookings + 1 
    WHERE venue_id = NEW.venue_id;
END //

DELIMITER ;
