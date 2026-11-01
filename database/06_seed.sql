-- ====================================================================
-- UniBook Database Schema: 06_seed.sql
-- Seed Data: Campus Departments, Facilities, and Initial Bookings
-- ====================================================================

USE unibook_db;

-- 1. Insert Campus Departments / Organizers
INSERT INTO organizers (organizer_id, name, department, contact_email) VALUES
(1, 'Dr. Aris Thorne', 'Computer Science & AI', 'thorne.cs@campus.edu'),
(2, 'Prof. Sarah Jenkins', 'Electrical & Electronics', 'jenkins.ee@campus.edu'),
(3, 'Elena Rostova', 'Student Affairs & Cultural Council', 'affairs@campus.edu'),
(4, 'Marcus Vance', 'Mechanical Engineering Society', 'vance.mech@campus.edu'),
(5, 'Dr. Priya Nair', 'Bioinformatics & Genetics', 'nair.bio@campus.edu')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- 2. Insert Campus Venues
INSERT INTO venues (venue_id, name, building, capacity, total_bookings) VALUES
(1, 'Turing Grand Auditorium', 'Alan Turing Hall - Block A', 450, 0),
(2, 'Von Neumann Computing Lab', 'Information Sciences - Block C', 80, 0),
(3, 'Ramanujan Lecture Theatre', 'Mathematics Complex - Block B', 180, 0),
(4, 'Ada Lovelace Seminar Hall', 'Software Engineering Wing - Block C', 60, 0),
(5, 'Newton Physics Amphitheatre', 'Basic Sciences - Block D', 220, 0),
(6, 'Curie Innovation Hub', 'Research & Incubation Center', 120, 0)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- 3. Insert Initial Bookings
-- Notice: When these rows are inserted, trigger `After_Booking_Insert` will
-- automatically increment `total_bookings` on the respective venues!
INSERT INTO bookings (booking_id, venue_id, organizer_id, event_name, booking_date, status) VALUES
(1, 1, 1, 'Annual AI & Machine Learning Symposium', CURDATE(), 'CONFIRMED'),
(2, 2, 1, 'Competitive Programming Hackathon', DATE_ADD(CURDATE(), INTERVAL 1 DAY), 'CONFIRMED'),
(3, 3, 2, 'Robotics & Microcontroller Workshop', DATE_ADD(CURDATE(), INTERVAL 2 DAY), 'CONFIRMED'),
(4, 4, 3, 'Campus Cultural Orientation 2026', DATE_ADD(CURDATE(), INTERVAL 3 DAY), 'CONFIRMED'),
(5, 1, 3, 'Spring Convocation Rehearsal', DATE_ADD(CURDATE(), INTERVAL 5 DAY), 'CONFIRMED'),
(6, 5, 4, 'Aerodynamics Guest Keynote', DATE_ADD(CURDATE(), INTERVAL 6 DAY), 'CONFIRMED')
ON DUPLICATE KEY UPDATE event_name = VALUES(event_name);
