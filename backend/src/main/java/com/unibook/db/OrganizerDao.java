package com.unibook.db;

import com.unibook.model.Organizer;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

/**
 * Data Access Object for Organizers / Academic Departments
 */
public class OrganizerDao {

    private final DatabaseConnection db = DatabaseConnection.getInstance();

    public List<Organizer> getAllOrganizers() throws SQLException {
        List<Organizer> list = new ArrayList<>();
        String sql = "SELECT organizer_id, name, department, contact_email FROM organizers ORDER BY organizer_id ASC";

        try (Connection conn = db.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            while (rs.next()) {
                Organizer o = new Organizer(
                        rs.getInt("organizer_id"),
                        rs.getString("name"),
                        rs.getString("department"),
                        rs.getString("contact_email")
                );
                list.add(o);
            }
        }
        return list;
    }

    public Organizer getOrganizerById(int organizerId) throws SQLException {
        String sql = "SELECT organizer_id, name, department, contact_email FROM organizers WHERE organizer_id = ?";
        try (Connection conn = db.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, organizerId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return new Organizer(
                            rs.getInt("organizer_id"),
                            rs.getString("name"),
                            rs.getString("department"),
                            rs.getString("contact_email")
                    );
                }
            }
        }
        return null;
    }
}
