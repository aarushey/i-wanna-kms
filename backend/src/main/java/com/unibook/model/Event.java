package com.unibook.model;

import java.time.LocalDate;

/**
 * Academic Requirement: Object-Oriented Composition ("Has-A")
 * An Event is a CampusEntity that "has-a" Venue and "has-a" Organizer,
 * demonstrating strong encapsulation and relational mapping in Java.
 */
public class Event extends CampusEntity {
    // Composition: Event HAS-A Venue
    private Venue venue;

    // Composition: Event HAS-A Organizer
    private Organizer organizer;

    private LocalDate bookingDate;
    private String status; // 'CONFIRMED', 'CANCELLED', 'HOLD'

    public Event() {
        super();
    }

    public Event(int id, String eventName, Venue venue, Organizer organizer, LocalDate bookingDate, String status) {
        super(id, eventName);
        this.venue = venue;
        this.organizer = organizer;
        this.bookingDate = bookingDate;
        this.status = status;
    }

    public Venue getVenue() {
        return venue;
    }

    public void setVenue(Venue venue) {
        this.venue = venue;
    }

    public Organizer getOrganizer() {
        return organizer;
    }

    public void setOrganizer(Organizer organizer) {
        this.organizer = organizer;
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

    @Override
    public String toString() {
        return "Event [id=" + id + ", name='" + name + "', date=" + bookingDate + 
               ", venue=" + (venue != null ? venue.getName() : "None") + 
               ", organizer=" + (organizer != null ? organizer.getName() : "None") + 
               ", status='" + status + "']";
    }
}
