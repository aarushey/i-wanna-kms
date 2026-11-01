-- ====================================================================
-- UniBook Database Schema: 04_views.sql
-- Academic Requirement: RDBMS Views, Complex Joins & Aggregations
-- Purpose: Calculate utilization statistics across all campus facilities
--          Uses LEFT OUTER JOIN so venues with 0 bookings are included.
-- ====================================================================

USE unibook_db;

CREATE OR REPLACE VIEW vw_venue_utilization AS
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
