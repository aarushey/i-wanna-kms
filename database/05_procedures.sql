-- ====================================================================
-- UniBook Database Schema: 05_procedures.sql
-- Academic Requirement: RDBMS Stored Procedures & Explicit Cursors
-- Purpose: Iterate through existing bookings with a CURSOR to check
--          whether a venue is vacant on a specific date.
-- ====================================================================

USE unibook_db;

DROP PROCEDURE IF EXISTS sp_check_availability;

DELIMITER //

CREATE PROCEDURE sp_check_availability(
    IN p_venue_id INT, 
    IN p_date DATE, 
    OUT p_is_available BOOLEAN
)
BEGIN
    -- Declare local state variables
    DECLARE done INT DEFAULT FALSE;
    DECLARE b_date DATE;
    
    -- 1. Explicit CURSOR declaration to iterate through venue's active bookings
    DECLARE cur CURSOR FOR 
        SELECT booking_date 
        FROM bookings 
        WHERE venue_id = p_venue_id 
          AND status = 'CONFIRMED';
          
    -- 2. Continue Handler for NOT FOUND (EOF) condition
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    -- Default presumption: Room is available unless a conflict is found
    SET p_is_available = TRUE;

    -- 3. Open Cursor
    OPEN cur;

    -- 4. Cursor iteration loop
    read_loop: LOOP
        FETCH cur INTO b_date;
        
        -- Break when cursor reaches end of result set
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        -- Conflict detected: date matches requested date
        IF b_date = p_date THEN
            SET p_is_available = FALSE;
            LEAVE read_loop;
        END IF;
    END LOOP;

    -- 5. Close Cursor
    CLOSE cur;
END //

DELIMITER ;
