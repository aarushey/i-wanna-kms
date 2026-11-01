package com.unibook.concurrent;

import com.unibook.db.BookingDao;
import com.unibook.db.OrganizerDao;
import com.unibook.db.VenueDao;
import com.unibook.exception.VenueUnavailableException;
import com.unibook.io.ReceiptGenerator;
import com.unibook.model.BookingConfirmation;
import com.unibook.model.Event;
import com.unibook.model.Organizer;
import com.unibook.model.Venue;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.logging.Logger;

/**
 * Academic Requirement: Method Overloading & Multithreaded Synchronization
 * Provides overloaded business methods for reserving campus facilities
 * and enforces strict single-thread isolation during slot reservation.
 */
public class BookingService {

    private static final Logger LOGGER = Logger.getLogger(BookingService.class.getName());

    private final BookingDao bookingDao = new BookingDao();
    private final VenueDao venueDao = new VenueDao();
    private final OrganizerDao organizerDao = new OrganizerDao();
    private final ReceiptGenerator receiptGenerator = new ReceiptGenerator();

    // =========================================================================
    // ACADEMIC REQUIREMENT: METHOD OVERLOADING
    // =========================================================================

    /**
     * Overload 1: Single-day venue reservation
     */
    public BookingConfirmation bookVenue(int venueId, int organizerId, LocalDate date, String eventName)
            throws VenueUnavailableException {
        try {
            Venue venue = venueDao.getVenueById(venueId);
            if (venue == null) {
                throw new VenueUnavailableException(venueId, date, "Venue ID " + venueId + " does not exist.");
            }

            Organizer organizer = organizerDao.getOrganizerById(organizerId);
            if (organizer == null) {
                throw new VenueUnavailableException(venueId, date, "Organizer ID " + organizerId + " does not exist.");
            }

            Event event = new Event(0, eventName, venue, organizer, date, "CONFIRMED");
            return processBooking(event);

        } catch (VenueUnavailableException e) {
            throw e;
        } catch (Exception e) {
            throw new VenueUnavailableException(venueId, date, "Failed to complete reservation: " + e.getMessage(), e);
        }
    }

    /**
     * Overload 2: Multi-day range venue reservation
     */
    public List<BookingConfirmation> bookVenue(int venueId, int organizerId, LocalDate startDate, LocalDate endDate, String eventName)
            throws VenueUnavailableException {
        if (endDate.isBefore(startDate)) {
            throw new IllegalArgumentException("End date cannot precede start date.");
        }

        List<BookingConfirmation> confirmations = new ArrayList<>();
        LocalDate current = startDate;

        while (!current.isAfter(endDate)) {
            BookingConfirmation confirmation = bookVenue(venueId, organizerId, current, eventName + " [Day " + current + "]");
            confirmations.add(confirmation);
            current = current.plusDays(1);
        }

        return confirmations;
    }

    // =========================================================================
    // ACADEMIC REQUIREMENT: SYNCHRONIZED MULTITHREADING
    // =========================================================================

    /**
     * Synchronized critical section.
     * Prevents race conditions and guarantees that concurrent requests
     * targeting the exact same venue on the exact same date cannot double-book.
     *
     * @param event The populated Event object
     * @return BookingConfirmation with cryptographic code and timestamp
     * @throws VenueUnavailableException if slot is occupied or conflicts arise
     */
    public synchronized BookingConfirmation processBooking(Event event) throws VenueUnavailableException {
        int venueId = event.getVenue().getId();
        LocalDate date = event.getBookingDate();

        LOGGER.info(String.format("[Thread: %s] Entering synchronized processBooking for Venue %d on %s",
                Thread.currentThread().getName(), venueId, date));

        try {
            // Step 1: Execute Stored Procedure / B-Tree Index Availability Check
            boolean isAvailable = bookingDao.checkAvailabilityWithProcedure(venueId, date);
            if (!isAvailable) {
                LOGGER.warning(String.format("[Thread: %s] CONFLICT: Venue %d is already booked on %s",
                        Thread.currentThread().getName(), venueId, date));
                throw new VenueUnavailableException(venueId, date, "Venue is already booked for this date.");
            }

            // Step 2: Persist booking to Database (Triggers PL/SQL After_Booking_Insert)
            int bookingId = bookingDao.insertBooking(
                    venueId,
                    event.getOrganizer().getId(),
                    event.getName(),
                    date,
                    event.getStatus()
            );

            if (bookingId <= 0) {
                throw new VenueUnavailableException(venueId, date, "Database insertion failed.");
            }

            event.setId(bookingId);

            // Step 3: Generate confirmation metadata
            String confirmationCode = "UBK-" + date.getYear() + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
            BookingConfirmation confirmation = new BookingConfirmation(
                    bookingId,
                    event.getName(),
                    venueId,
                    event.getVenue().getName(),
                    event.getOrganizer().getName(),
                    event.getOrganizer().getDepartment(),
                    date,
                    "CONFIRMED",
                    confirmationCode
            );

            // Step 4: Academic Requirement: File I/O Receipt Generation (FileWriter)
            try {
                receiptGenerator.generateReceipt(event, confirmation);
                LOGGER.info("File I/O: Audit receipt generated successfully for booking #" + bookingId);
            } catch (Exception ioEx) {
                LOGGER.warning("File I/O receipt write warning: " + ioEx.getMessage());
            }

            LOGGER.info(String.format("[Thread: %s] Successfully secured booking #%d for Venue %d",
                    Thread.currentThread().getName(), bookingId, venueId));

            return confirmation;

        } catch (VenueUnavailableException e) {
            throw e;
        } catch (Exception ex) {
            throw new VenueUnavailableException(venueId, date, "Database error: " + ex.getMessage(), ex);
        }
    }
}
