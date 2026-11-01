package com.unibook.model;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Value Object returned upon successfully processing a synchronized reservation.
 */
public class BookingConfirmation {
    private int bookingId;
    private String eventName;
    private int venueId;
    private String venueName;
    private String organizerName;
    private String department;
    private LocalDate bookingDate;
    private String status;
    private String confirmationCode;
    private LocalDateTime issuedAt;

    public BookingConfirmation() {
    }

    public BookingConfirmation(int bookingId, String eventName, int venueId, String venueName, 
                               String organizerName, String department, LocalDate bookingDate, 
                               String status, String confirmationCode) {
        this.bookingId = bookingId;
        this.eventName = eventName;
        this.venueId = venueId;
        this.venueName = venueName;
        this.organizerName = organizerName;
        this.department = department;
        this.bookingDate = bookingDate;
        this.status = status;
        this.confirmationCode = confirmationCode;
        this.issuedAt = LocalDateTime.now();
    }

    public int getBookingId() {
        return bookingId;
    }

    public void setBookingId(int bookingId) {
        this.bookingId = bookingId;
    }

    public String getEventName() {
        return eventName;
    }

    public void setEventName(String eventName) {
        this.eventName = eventName;
    }

    public int getVenueId() {
        return venueId;
    }

    public void setVenueId(int venueId) {
        this.venueId = venueId;
    }

    public String getVenueName() {
        return venueName;
    }

    public void setVenueName(String venueName) {
        this.venueName = venueName;
    }

    public String getOrganizerName() {
        return organizerName;
    }

    public void setOrganizerName(String organizerName) {
        this.organizerName = organizerName;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public LocalDate getBookingDate() {
        return bookingDate;
    }

    public void setBookingDate(LocalDate bookingDate) {
        this.bookingDate = bookingDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getConfirmationCode() {
        return confirmationCode;
    }

    public void setConfirmationCode(String confirmationCode) {
        this.confirmationCode = confirmationCode;
    }

    public LocalDateTime getIssuedAt() {
        return issuedAt;
    }

    public void setIssuedAt(LocalDateTime issuedAt) {
        this.issuedAt = issuedAt;
    }
}
