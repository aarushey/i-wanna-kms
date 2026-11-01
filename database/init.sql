-- ====================================================================
-- UniBook Master Database Initialization Script: init.sql
-- Run this single file in MySQL CLI or MySQL Workbench to reset
-- and provision the full UniBook database schema, triggers, views,
-- stored procedures, and seed data.
--
-- Usage:
--   mysql -u root -p < database/init.sql
-- ====================================================================

DROP DATABASE IF EXISTS unibook_db;
CREATE DATABASE unibook_db;
USE unibook_db;

-- --------------------------------------------------------------------
-- 1. DDL & RELATIONAL CONSTRAINTS
-- --------------------------------------------------------------------
CREATE TABLE organizers (
    organizer_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    contact_email VARCHAR(120) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE venues (
    venue_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    building VARCHAR(100) NOT NULL,
    capacity INT NOT NULL CHECK (capacity > 0),
    total_bookings INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE bookings (
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

-- --------------------------------------------------------------------
-- 2. B-TREE INDEXING
-- --------------------------------------------------------------------
CREATE INDEX idx_booking_date ON bookings(booking_date);
CREATE INDEX idx_venue_id ON bookings(venue_id);
CREATE INDEX idx_status_date ON bookings(status, booking_date);

-- --------------------------------------------------------------------
-- 3. PL/SQL TRIGGER (Popularity Counter)
-- --------------------------------------------------------------------
DELIMITER //
CREATE TRIGGER After_Booking_Insert
AFTER INSERT ON bookings
FOR EACH ROW
BEGIN
    UPDATE venues 
    SET total_bookings = total_bookings + 1 
    WHERE venue_id = NEW.venue_id;
END //
DELIMITER ;

-- --------------------------------------------------------------------
-- 4. ANALYTICAL VIEW WITH LEFT OUTER JOIN & AGGREGATION
-- --------------------------------------------------------------------
CREATE VIEW vw_venue_utilization AS
SELECT 
    v.venue_id, 
    v.name AS venue_name, 
    v.building,
    v.capacity, 
    v.total_bookings AS lifetime_bookings,
    COUNT(b.booking_id) AS current_active_bookings,
    ROUND((COUNT(b.booking_id) / 30.0) * 100, 1) AS monthly_utilization_rate
FROM venues v
LEFT OUTER JOIN bookings b 
    ON v.venue_id = b.venue_id 
    AND b.status = 'CONFIRMED'
GROUP BY 
    v.venue_id, 
    v.name, 
    v.building,
    v.capacity, 
    v.total_bookings;

-- --------------------------------------------------------------------
-- 5. STORED PROCEDURE WITH EXPLICIT CURSOR
-- --------------------------------------------------------------------
DELIMITER //
CREATE PROCEDURE sp_check_availability(
    IN p_venue_id INT, 
    IN p_date DATE, 
    OUT p_is_available BOOLEAN
)
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE b_date DATE;
    DECLARE cur CURSOR FOR 
        SELECT booking_date 
        FROM bookings 
        WHERE venue_id = p_venue_id 
          AND status = 'CONFIRMED';
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
END //
DELIMITER ;

-- --------------------------------------------------------------------
-- 6. CAMPUS SEED DATA
-- --------------------------------------------------------------------
INSERT INTO organizers (organizer_id, name, department, contact_email) VALUES
(1, 'Dr. Aris Thorne', 'Computer Science & AI', 'thorne.cs@campus.edu'),
(2, 'Prof. Sarah Jenkins', 'Electrical & Electronics', 'jenkins.ee@campus.edu'),
(3, 'Elena Rostova', 'Student Affairs & Cultural Council', 'affairs@campus.edu'),
(4, 'Marcus Vance', 'Mechanical Engineering Society', 'vance.mech@campus.edu'),
(5, 'Dr. Priya Nair', 'Bioinformatics & Genetics', 'nair.bio@campus.edu');

INSERT INTO venues (venue_id, name, building, capacity, total_bookings) VALUES
(1, 'Turing Grand Auditorium', 'Alan Turing Hall - Block A', 450, 0),
(2, 'Von Neumann Computing Lab', 'Information Sciences - Block C', 80, 0),
(3, 'Ramanujan Lecture Theatre', 'Mathematics Complex - Block B', 180, 0),
(4, 'Ada Lovelace Seminar Hall', 'Software Engineering Wing - Block C', 60, 0),
(5, 'Newton Physics Amphitheatre', 'Basic Sciences - Block D', 220, 0),
(6, 'Curie Innovation Hub', 'Research & Incubation Center', 120, 0);

-- Trigger will automatically increment total_bookings for these venues
INSERT INTO bookings (booking_id, venue_id, organizer_id, event_name, booking_date, status) VALUES
(1, 1, 1, 'Annual AI & Machine Learning Symposium', CURDATE(), 'CONFIRMED'),
(2, 2, 1, 'Competitive Programming Hackathon', DATE_ADD(CURDATE(), INTERVAL 1 DAY), 'CONFIRMED'),
(3, 3, 2, 'Robotics & Microcontroller Workshop', DATE_ADD(CURDATE(), INTERVAL 2 DAY), 'CONFIRMED'),
(4, 4, 3, 'Campus Cultural Orientation 2026', DATE_ADD(CURDATE(), INTERVAL 3 DAY), 'CONFIRMED'),
(5, 1, 3, 'Spring Convocation Rehearsal', DATE_ADD(CURDATE(), INTERVAL 5 DAY), 'CONFIRMED'),
(6, 5, 4, 'Aerodynamics Guest Keynote', DATE_ADD(CURDATE(), INTERVAL 6 DAY), 'CONFIRMED');
