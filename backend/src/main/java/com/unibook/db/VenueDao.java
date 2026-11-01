package com.unibook.db;

import com.unibook.model.Venue;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

/**
 * Data Access Object for Venues
 * Interacts with MySQL table `venues` and view `vw_venue_utilization`.
 */
public class VenueDao {

    private final DatabaseConnection db = DatabaseConnection.getInstance();

    /**
     * Academic Requirement: Views and Complex Joins
     * Queries `vw_venue_utilization` which performs a LEFT OUTER JOIN
     * between venues and bookings to calculate live utilization rates.
     */
    public List<Venue> getAllVenues() throws SQLException {
        List<Venue> venues = new ArrayList<>();
        String sql = "SELECT venue_id, venue_name, building, capacity, lifetime_bookings, " +
                     "current_active_bookings, monthly_utilization_rate FROM vw_venue_utilization " +
                     "ORDER BY venue_id ASC";

        try (Connection conn = db.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            while (rs.next()) {
                Venue v = new Venue();
                v.setId(rs.getInt("venue_id"));
                v.setName(rs.getString("venue_name"));
                v.setBuilding(rs.getString("building"));
                v.setCapacity(rs.getInt("capacity"));
                v.setTotalBookings(rs.getInt("lifetime_bookings"));
                v.setCurrentActiveBookings(rs.getInt("current_active_bookings"));
                v.setMonthlyUtilizationRate(rs.getDouble("monthly_utilization_rate"));
                venues.add(v);
            }
        }
        return venues;
    }

    public Venue getVenueById(int venueId) throws SQLException {
        String sql = "SELECT venue_id, name, building, capacity, total_bookings FROM venues WHERE venue_id = ?";
        try (Connection conn = db.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, venueId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    Venue v = new Venue();
                    v.setId(rs.getInt("venue_id"));
                    v.setName(rs.getString("name"));
                    v.setBuilding(rs.getString("building"));
                    v.setCapacity(rs.getInt("capacity"));
                    v.setTotalBookings(rs.getInt("total_bookings"));
                    return v;
                }
            }
        }
        return null;
    }

    public void incrementTotalBookings(int venueId) throws SQLException {
        String sql = "UPDATE venues SET total_bookings = total_bookings + 1 WHERE venue_id = ?";
        try (Connection conn = db.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, venueId);
            ps.executeUpdate();
        }
    }
}
