package com.unibook.model;

/**
 * Academic Requirement: Java Interface
 * Establishes the contract for any physical or virtual campus facility
 * that can host attendees and be reserved.
 */
public interface Bookable {
    /**
     * Evaluates whether the facility has adequate physical capacity
     * to host the requested number of event attendees.
     *
     * @param requestedAttendees Number of expected participants
     * @return true if venue capacity is greater than or equal to attendees
     */
    boolean isCapacitySufficient(int requestedAttendees);

    /**
     * Retrieves the maximum seating or physical capacity of the facility.
     */
    int getCapacity();
}
