package com.unibook.exception;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Academic Requirement: Custom Exception Handling
 * Thrown whenever a requested campus venue is already reserved,
 * exceeds physical capacity, or fails database availability validation.
 */
public class VenueUnavailableException extends Exception {
    private final int venueId;
    private final LocalDate requestedDate;
    private final LocalDateTime timestamp;
    private final String reason;

    public VenueUnavailableException(int venueId, LocalDate requestedDate, String message) {
        super(message);
        this.venueId = venueId;
        this.requestedDate = requestedDate;
        this.timestamp = LocalDateTime.now();
        this.reason = message;
    }

    public VenueUnavailableException(int venueId, LocalDate requestedDate, String message, Throwable cause) {
        super(message, cause);
        this.venueId = venueId;
        this.requestedDate = requestedDate;
        this.timestamp = LocalDateTime.now();
        this.reason = message;
    }

    public int getVenueId() {
        return venueId;
    }

    public LocalDate getRequestedDate() {
        return requestedDate;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public String getReason() {
        return reason;
    }

    @Override
    public String getMessage() {
        return String.format("[CONCURRENCY_CONFLICT @ %s] Venue ID %d is unavailable on %s: %s",
                timestamp, venueId, requestedDate, super.getMessage());
    }
}
