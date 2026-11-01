package com.unibook.model;

/**
 * Academic Requirement: Inheritance & Interface Implementation
 * Venue extends CampusEntity and implements the Bookable contract.
 */
public class Venue extends CampusEntity implements Bookable {
    private String building;
    private int capacity;
    private int totalBookings;
    private int currentActiveBookings;
    private double monthlyUtilizationRate;

    public Venue() {
        super();
    }

    public Venue(int id, String name, String building, int capacity) {
        super(id, name);
        this.building = building;
        this.capacity = capacity;
        this.totalBookings = 0;
    }

    public Venue(int id, String name, String building, int capacity, int totalBookings) {
        super(id, name);
        this.building = building;
        this.capacity = capacity;
        this.totalBookings = totalBookings;
    }

    public String getBuilding() {
        return building;
    }

    public void setBuilding(String building) {
        this.building = building;
    }

    @Override
    public int getCapacity() {
        return capacity;
    }

    public void setCapacity(int capacity) {
        this.capacity = capacity;
    }

    public int getTotalBookings() {
        return totalBookings;
    }

    public void setTotalBookings(int totalBookings) {
        this.totalBookings = totalBookings;
    }

    public int getCurrentActiveBookings() {
        return currentActiveBookings;
    }

    public void setCurrentActiveBookings(int currentActiveBookings) {
        this.currentActiveBookings = currentActiveBookings;
    }

    public double getMonthlyUtilizationRate() {
        return monthlyUtilizationRate;
    }

    public void setMonthlyUtilizationRate(double monthlyUtilizationRate) {
        this.monthlyUtilizationRate = monthlyUtilizationRate;
    }

    @Override
    public boolean isCapacitySufficient(int requestedAttendees) {
        return requestedAttendees <= this.capacity;
    }

    @Override
    public String toString() {
        return "Venue [id=" + id + ", name='" + name + "', building='" + building + 
               "', capacity=" + capacity + ", totalBookings=" + totalBookings + "]";
    }
}
