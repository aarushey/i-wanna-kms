package com.unibook.io;

import com.unibook.model.Venue;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

/**
 * Academic Requirement: File I/O Stream Processing (BufferedReader)
 * Reads initial facility manifest records line-by-line from the server disk,
 * parsing CSV columns into strongly-typed Venue domain entities.
 */
public class VenueManifestLoader {

    private final String manifestPath;

    public VenueManifestLoader(String manifestPath) {
        this.manifestPath = manifestPath;
    }

    /**
     * Reads and parses the manifest file using BufferedReader.
     *
     * @return List of parsed Venue domain objects
     * @throws Exception if stream reading or CSV parsing encounters errors
     */
    public List<Venue> loadManifest() throws Exception {
        List<Venue> venues = new ArrayList<>();

        BufferedReader reader = getBufferedReader();
        if (reader == null) {
            throw new IllegalStateException("Venue manifest file could not be located at: " + manifestPath);
        }

        try (reader) {
            String line;
            boolean isHeader = true;

            while ((line = reader.readLine()) != null) {
                line = line.trim();
                if (line.isEmpty() || line.startsWith("#")) {
                    continue;
                }

                // Skip CSV header
                if (isHeader) {
                    isHeader = false;
                    continue;
                }

                // CSV: venue_id,name,building,capacity
                String[] parts = line.split(",");
                if (parts.length >= 4) {
                    int id = Integer.parseInt(parts[0].trim());
                    String name = parts[1].trim();
                    String building = parts[2].trim();
                    int capacity = Integer.parseInt(parts[3].trim());

                    Venue venue = new Venue(id, name, building, capacity);
                    venues.add(venue);
                }
            }
        }

        return venues;
    }

    /**
     * Reads raw lines using BufferedReader for direct evaluation display in /viva-demo.
     */
    public List<String> readRawLines() throws Exception {
        List<String> lines = new ArrayList<>();
        BufferedReader reader = getBufferedReader();
        if (reader == null) {
            return lines;
        }

        try (reader) {
            String line;
            while ((line = reader.readLine()) != null) {
                lines.add(line);
            }
        }
        return lines;
    }

    private BufferedReader getBufferedReader() throws Exception {
        File file = new File(manifestPath);
        if (file.exists()) {
            return new BufferedReader(new FileReader(file, StandardCharsets.UTF_8));
        }

        // Fallback to classpath resource
        InputStream is = getClass().getClassLoader().getResourceAsStream(manifestPath);
        if (is != null) {
            return new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8));
        }

        return null;
    }
}
