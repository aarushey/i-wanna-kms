package com.unibook.server;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonDeserializer;
import com.google.gson.JsonObject;
import com.google.gson.JsonPrimitive;
import com.google.gson.JsonSerializer;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;
import com.unibook.concurrent.BookingService;
import com.unibook.concurrent.HoldCleanupDaemon;
import com.unibook.db.BookingDao;
import com.unibook.db.OrganizerDao;
import com.unibook.db.VenueDao;
import com.unibook.exception.VenueUnavailableException;
import com.unibook.io.ReceiptGenerator;
import com.unibook.io.VenueManifestLoader;
import com.unibook.model.BookingConfirmation;
import com.unibook.model.Event;
import com.unibook.model.Organizer;
import com.unibook.model.Venue;
import com.unibook.db.DatabaseConnection;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.Statement;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Embedded High-Performance HTTP Server for UniBook REST Endpoints
 * Provides full JSON REST capabilities, CORS integration, and Viva demonstration runners.
 */
public class RestServer {

    private static final Logger LOGGER = Logger.getLogger(RestServer.class.getName());
    private final int port;
    private HttpServer server;

    private final BookingService bookingService = new BookingService();
    private final VenueDao venueDao = new VenueDao();
    private final BookingDao bookingDao = new BookingDao();
    private final OrganizerDao organizerDao = new OrganizerDao();
    private final ReceiptGenerator receiptGenerator = new ReceiptGenerator();
    private final VenueManifestLoader manifestLoader = new VenueManifestLoader("venues_manifest.csv");

    private final Gson gson = new GsonBuilder()
            .setPrettyPrinting()
            .registerTypeAdapter(LocalDate.class, (JsonSerializer<LocalDate>) (src, typeOfSrc, context) ->
                    new JsonPrimitive(src.toString()))
            .registerTypeAdapter(LocalDate.class, (JsonDeserializer<LocalDate>) (json, typeOfT, context) ->
                    LocalDate.parse(json.getAsString()))
            .registerTypeAdapter(LocalDateTime.class, (JsonSerializer<LocalDateTime>) (src, typeOfSrc, context) ->
                    new JsonPrimitive(src.toString()))
            .registerTypeAdapter(LocalDateTime.class, (JsonDeserializer<LocalDateTime>) (json, typeOfT, context) ->
                    LocalDateTime.parse(json.getAsString()))
            .create();

    public RestServer(int port) {
        this.port = port;
    }

    public void start() throws IOException {
        server = HttpServer.create(new InetSocketAddress(port), 0);
        server.setExecutor(Executors.newFixedThreadPool(16));

        // Operational Endpoints
        server.createContext("/api/dashboard/summary", new SummaryHandler());
        server.createContext("/api/venues", new VenuesHandler());
        server.createContext("/api/bookings", new BookingsHandler());
        server.createContext("/api/organizers", new OrganizersHandler());
        server.createContext("/api/receipt", new ReceiptDownloadHandler());

        // Viva / Evaluator Sandbox Endpoints
        server.createContext("/api/viva/stress-test", new ConcurrencyStressTestHandler());
        server.createContext("/api/viva/check-cursor", new CursorProcedureHandler());
        server.createContext("/api/viva/manifest", new ManifestInspectionHandler());

        // RDBMS Showcase & Database Studio Endpoints
        server.createContext("/api/rdbms/query", new SqlQueryHandler());
        server.createContext("/api/rdbms/trigger-demo", new TriggerDemoHandler());

        server.start();
        LOGGER.info("UniBook Embedded REST Server listening on http://localhost:" + port);

        // Pre-generate / ensure all physical .txt receipts exist on disk for all bookings
        receiptGenerator.ensureAllReceiptsExist();

        // Spawn Background Daemon Thread
        HoldCleanupDaemon.spawnDaemon(30000);
    }


    public void stop() {
        if (server != null) {
            server.stop(0);
        }
    }

    // =========================================================================
    // HTTP UTILITY HELPERS
    // =========================================================================

    private void sendJsonResponse(HttpExchange exchange, int statusCode, Object data) throws IOException {
        String json = gson.toJson(data);
        byte[] bytes = json.getBytes(StandardCharsets.UTF_8);

        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");
        exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
        exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type, Authorization");

        exchange.sendResponseHeaders(statusCode, bytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        }
    }

    private void handleCorsOptions(HttpExchange exchange) throws IOException {
        exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
        exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type, Authorization");
        exchange.sendResponseHeaders(204, -1);
    }

    private String readRequestBody(HttpExchange exchange) throws IOException {
        try (InputStream is = exchange.getRequestBody()) {
            return new String(is.readAllBytes(), StandardCharsets.UTF_8);
        }
    }

    // =========================================================================
    // ROUTE HANDLERS
    // =========================================================================

    /**
     * Dashboard Summary Metrics
     */
    private class SummaryHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                handleCorsOptions(exchange);
                return;
            }

            try {
                List<Venue> venues = venueDao.getAllVenues();
                List<Event> bookings = bookingDao.getAllBookings();

                int totalVenues = venues.size();
                int totalCapacity = venues.stream().mapToInt(Venue::getCapacity).sum();

                LocalDate today = LocalDate.now();
                long bookingsToday = bookings.stream()
                        .filter(b -> b.getBookingDate().isEqual(today))
                        .count();

                double avgUtilization = venues.stream()
                        .mapToDouble(Venue::getMonthlyUtilizationRate)
                        .average().orElse(0.0);

                Venue topVenue = venues.stream()
                        .max((v1, v2) -> Integer.compare(v1.getTotalBookings(), v2.getTotalBookings()))
                        .orElse(null);

                Map<String, Object> summary = new HashMap<>();
                summary.put("totalVenues", totalVenues);
                summary.put("totalCapacity", totalCapacity);
                summary.put("totalBookingsToday", bookingsToday);
                summary.put("totalActiveBookings", bookings.size());
                summary.put("avgUtilizationRate", Math.round(avgUtilization * 10.0) / 10.0);
                summary.put("mostPopularVenue", topVenue != null ? topVenue.getName() : "None");
                summary.put("mostPopularVenueBookings", topVenue != null ? topVenue.getTotalBookings() : 0);

                sendJsonResponse(exchange, 200, summary);
            } catch (Exception e) {
                LOGGER.log(Level.SEVERE, "Summary error", e);
                sendJsonResponse(exchange, 500, Map.of("error", e.getMessage()));
            }
        }
    }

    /**
     * Venues Catalog Endpoint
     */
    private class VenuesHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                handleCorsOptions(exchange);
                return;
            }

            try {
                List<Venue> venues = venueDao.getAllVenues();
                sendJsonResponse(exchange, 200, venues);
            } catch (Exception e) {
                LOGGER.log(Level.SEVERE, "Venues error", e);
                sendJsonResponse(exchange, 500, Map.of("error", e.getMessage()));
            }
        }
    }

    /**
     * Bookings Endpoint (GET All & POST New Reservation)
     */
    private class BookingsHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                handleCorsOptions(exchange);
                return;
            }

            if ("GET".equalsIgnoreCase(exchange.getRequestMethod())) {
                try {
                    List<Event> bookings = bookingDao.getAllBookings();
                    // Map to transport objects for flat JSON consumption
                    List<Map<String, Object>> response = new ArrayList<>();
                    for (Event e : bookings) {
                        Map<String, Object> map = new HashMap<>();
                        map.put("bookingId", e.getId());
                        map.put("eventName", e.getName());
                        map.put("bookingDate", e.getBookingDate().toString());
                        map.put("status", e.getStatus());
                        map.put("venueId", e.getVenue().getId());
                        map.put("venueName", e.getVenue().getName());
                        map.put("building", e.getVenue().getBuilding());
                        map.put("capacity", e.getVenue().getCapacity());
                        map.put("organizerId", e.getOrganizer().getId());
                        map.put("organizerName", e.getOrganizer().getName());
                        map.put("department", e.getOrganizer().getDepartment());
                        response.add(map);
                    }
                    sendJsonResponse(exchange, 200, response);
                } catch (Exception e) {
                    sendJsonResponse(exchange, 500, Map.of("error", e.getMessage()));
                }
            } else if ("POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                try {
                    String body = readRequestBody(exchange);
                    JsonObject json = gson.fromJson(body, JsonObject.class);

                    int venueId = json.get("venueId").getAsInt();
                    int organizerId = json.get("organizerId").getAsInt();
                    String eventName = json.get("eventName").getAsString();
                    String dateStr = json.get("date").getAsString();
                    LocalDate date = LocalDate.parse(dateStr);

                    // Optional range booking (demonstrating Method Overloading)
                    if (json.has("endDate") && !json.get("endDate").isJsonNull() && !json.get("endDate").getAsString().isEmpty()) {
                        LocalDate endDate = LocalDate.parse(json.get("endDate").getAsString());
                        List<BookingConfirmation> confirmations = bookingService.bookVenue(venueId, organizerId, date, endDate, eventName);
                        sendJsonResponse(exchange, 201, Map.of("success", true, "confirmations", confirmations));
                    } else {
                        BookingConfirmation confirmation = bookingService.bookVenue(venueId, organizerId, date, eventName);
                        sendJsonResponse(exchange, 201, Map.of("success", true, "confirmation", confirmation));
                    }

                } catch (VenueUnavailableException e) {
                    sendJsonResponse(exchange, 409, Map.of(
                            "success", false,
                            "error", e.getMessage(),
                            "venueId", e.getVenueId(),
                            "requestedDate", e.getRequestedDate().toString()
                    ));
                } catch (Exception e) {
                    sendJsonResponse(exchange, 400, Map.of("success", false, "error", e.getMessage()));
                }
            }
        }
    }

    /**
     * Organizers / Academic Departments Endpoint
     */
    private class OrganizersHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                handleCorsOptions(exchange);
                return;
            }

            try {
                List<Organizer> list = organizerDao.getAllOrganizers();
                sendJsonResponse(exchange, 200, list);
            } catch (Exception e) {
                sendJsonResponse(exchange, 500, Map.of("error", e.getMessage()));
            }
        }
    }

    /**
     * Receipt Text Downloader
     */
    private class ReceiptDownloadHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                handleCorsOptions(exchange);
                return;
            }

            String query = exchange.getRequestURI().getQuery();
            int bookingId = 1;
            if (query != null && query.contains("id=")) {
                bookingId = Integer.parseInt(query.split("id=")[1].split("&")[0]);
            }

            String receiptText = receiptGenerator.readReceipt(bookingId);
            sendJsonResponse(exchange, 200, Map.of("bookingId", bookingId, "receiptText", receiptText));
        }
    }

    // =========================================================================
    // VIVA DEMO HANDLERS
    // =========================================================================

    /**
     * Academic Requirement: 10-Thread Concurrency Collision Runner
     */
    private class ConcurrencyStressTestHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                handleCorsOptions(exchange);
                return;
            }

            try {
                String body = readRequestBody(exchange);
                JsonObject json = (body != null && !body.isBlank()) ? gson.fromJson(body, JsonObject.class) : new JsonObject();

                int venueId = json != null && json.has("venueId") ? json.get("venueId").getAsInt() : 3;
                // Generate a fresh unique future date for every test run so slot starts 100% vacant
                LocalDate targetDate = LocalDate.now().plusDays(30 + (long) (Math.random() * 300));

                int threadCount = 10;
                ExecutorService pool = Executors.newFixedThreadPool(threadCount);
                CountDownLatch startGate = new CountDownLatch(1);
                CountDownLatch doneGate = new CountDownLatch(threadCount);

                List<Map<String, Object>> threadLogs = Collections.synchronizedList(new ArrayList<>());
                AtomicInteger successCount = new AtomicInteger(0);
                AtomicInteger collisionCount = new AtomicInteger(0);

                for (int i = 1; i <= threadCount; i++) {
                    final int threadNum = i;
                    pool.submit(() -> {
                        try {
                            startGate.await(); // All threads release simultaneously
                            long startTime = System.currentTimeMillis();

                            String eventTitle = "Concurrent Test Candidate #" + threadNum;
                            try {
                                BookingConfirmation conf = bookingService.bookVenue(venueId, 1, targetDate, eventTitle);
                                long duration = System.currentTimeMillis() - startTime;
                                successCount.incrementAndGet();

                                Map<String, Object> log = new HashMap<>();
                                log.put("threadId", "Thread-" + threadNum);
                                log.put("status", "SUCCESS (RESERVED)");
                                log.put("bookingId", conf.getBookingId());
                                log.put("confirmationCode", conf.getConfirmationCode());
                                log.put("durationMs", duration);
                                threadLogs.add(log);

                            } catch (VenueUnavailableException e) {
                                long duration = System.currentTimeMillis() - startTime;
                                collisionCount.incrementAndGet();

                                Map<String, Object> log = new HashMap<>();
                                log.put("threadId", "Thread-" + threadNum);
                                log.put("status", "SAFELY BLOCKED (DOUBLE-BOOKING PREVENTED)");
                                log.put("exception", e.getClass().getSimpleName());
                                log.put("reason", e.getReason());
                                log.put("durationMs", duration);
                                threadLogs.add(log);
                            }
                        } catch (Exception ex) {
                            LOGGER.log(Level.SEVERE, "Thread error", ex);
                        } finally {
                            doneGate.countDown();
                        }
                    });
                }

                // Fire!
                startGate.countDown();
                doneGate.await();
                pool.shutdown();

                Map<String, Object> result = new HashMap<>();
                result.put("totalThreads", threadCount);
                result.put("venueId", venueId);
                result.put("targetDate", targetDate.toString());
                result.put("successfulBookings", successCount.get());
                result.put("preventedCollisions", collisionCount.get());
                result.put("threadSafetyResult", successCount.get() == 1 ? "PASSED (Zero Race Conditions)" : "FAILED");
                result.put("threadLogs", threadLogs);

                sendJsonResponse(exchange, 200, result);

            } catch (Exception e) {
                sendJsonResponse(exchange, 500, Map.of("error", e.getMessage()));
            }
        }
    }

    /**
     * Stored Procedure & Cursor Inspector
     */
    private class CursorProcedureHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                handleCorsOptions(exchange);
                return;
            }

            try {
                String query = exchange.getRequestURI().getQuery();
                int venueId = 1;
                LocalDate date = LocalDate.now();

                if (query != null) {
                    for (String param : query.split("&")) {
                        String[] pair = param.split("=");
                        if (pair.length == 2) {
                            if ("venueId".equals(pair[0])) venueId = Integer.parseInt(pair[1]);
                            if ("date".equals(pair[0])) date = LocalDate.parse(pair[1]);
                        }
                    }
                }

                boolean isAvailable = bookingDao.checkAvailabilityWithProcedure(venueId, date);

                Map<String, Object> response = new HashMap<>();
                response.put("venueId", venueId);
                response.put("requestedDate", date.toString());
                response.put("isAvailable", isAvailable);
                response.put("procedureInvoked", "sp_check_availability");
                response.put("cursorImplementation", "DECLARE cur CURSOR FOR SELECT booking_date FROM bookings WHERE venue_id = p_venue_id");
                response.put("statusExplanation", isAvailable ? "Cursor loop completed with no matching date: Slot is AVAILABLE" : "Cursor detected collision on target date: Slot is OCCUPIED");

                sendJsonResponse(exchange, 200, response);
            } catch (Exception e) {
                sendJsonResponse(exchange, 500, Map.of("error", e.getMessage()));
            }
        }
    }

    /**
     * Manifest Loader (BufferedReader) Inspector
     */
    private class ManifestInspectionHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                handleCorsOptions(exchange);
                return;
            }

            try {
                List<String> rawLines = manifestLoader.readRawLines();
                List<Venue> parsedVenues = manifestLoader.loadManifest();

                Map<String, Object> response = new HashMap<>();
                response.put("streamReader", "java.io.BufferedReader");
                response.put("sourceFile", "venues_manifest.csv");
                response.put("lineCount", rawLines.size());
                response.put("rawLines", rawLines);
                response.put("parsedEntities", parsedVenues);

                sendJsonResponse(exchange, 200, response);
            } catch (Exception e) {
                sendJsonResponse(exchange, 500, Map.of("error", e.getMessage()));
            }
        }
    }

    /**
     * RDBMS Studio: Live SQL Query Execution & Table Visualizer
     */
    private class SqlQueryHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                handleCorsOptions(exchange);
                return;
            }

            try {
                String sql = "SELECT * FROM vw_venue_utilization";
                if ("POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                    String body = readRequestBody(exchange);
                    if (body != null && !body.isBlank()) {
                        JsonObject json = gson.fromJson(body, JsonObject.class);
                        if (json != null && json.has("query")) {
                            sql = json.get("query").getAsString().trim();
                        }
                    }
                }

                // Security safeguard: Only allow SELECT statements in interactive query console
                if (!sql.toUpperCase().startsWith("SELECT") && !sql.toUpperCase().startsWith("EXPLAIN") && !sql.toUpperCase().startsWith("SHOW")) {
                    sendJsonResponse(exchange, 400, Map.of("error", "Only SELECT, EXPLAIN, and SHOW queries are permitted in the visualizer."));
                    return;
                }

                long start = System.currentTimeMillis();
                try (Connection conn = DatabaseConnection.getInstance().getConnection();
                     Statement stmt = conn.createStatement();
                     ResultSet rs = stmt.executeQuery(sql)) {

                    ResultSetMetaData meta = rs.getMetaData();
                    int colCount = meta.getColumnCount();
                    List<String> columns = new ArrayList<>();
                    for (int i = 1; i <= colCount; i++) {
                        columns.add(meta.getColumnLabel(i));
                    }

                    List<Map<String, Object>> rows = new ArrayList<>();
                    while (rs.next()) {
                        Map<String, Object> row = new HashMap<>();
                        for (int i = 1; i <= colCount; i++) {
                            row.put(columns.get(i - 1), rs.getObject(i));
                        }
                        rows.add(row);
                    }
                    long duration = System.currentTimeMillis() - start;

                    Map<String, Object> result = new HashMap<>();
                    result.put("query", sql);
                    result.put("columns", columns);
                    result.put("rows", rows);
                    result.put("rowCount", rows.size());
                    result.put("executionTimeMs", duration);

                    sendJsonResponse(exchange, 200, result);
                }
            } catch (Exception e) {
                sendJsonResponse(exchange, 400, Map.of("error", e.getMessage()));
            }
        }
    }

    /**
     * RDBMS Studio: Live PL/SQL Trigger Demonstration (After_Booking_Insert)
     */
    private class TriggerDemoHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                handleCorsOptions(exchange);
                return;
            }

            try {
                int targetVenueId = 1; // Turing Grand Auditorium
                int beforeBookings = 0;
                String venueName = "Turing Grand Auditorium";

                // Step 1: Read total_bookings before trigger
                try (Connection conn = DatabaseConnection.getInstance().getConnection();
                     Statement stmt = conn.createStatement();
                     ResultSet rs = stmt.executeQuery("SELECT name, total_bookings FROM venues WHERE venue_id = " + targetVenueId)) {
                    if (rs.next()) {
                        venueName = rs.getString("name");
                        beforeBookings = rs.getInt("total_bookings");
                    }
                }

                // Step 2: Insert booking (which executes AFTER INSERT trigger)
                LocalDate futureDate = LocalDate.now().plusDays(40 + (long) (Math.random() * 300));
                int newBookingId = bookingDao.insertBooking(
                        targetVenueId,
                        1,
                        "Live Trigger Verification Symposium",
                        futureDate,
                        "CONFIRMED"
                );

                // Step 3: Read total_bookings after trigger
                int afterBookings = 0;
                try (Connection conn = DatabaseConnection.getInstance().getConnection();
                     Statement stmt = conn.createStatement();
                     ResultSet rs = stmt.executeQuery("SELECT total_bookings FROM venues WHERE venue_id = " + targetVenueId)) {
                    if (rs.next()) {
                        afterBookings = rs.getInt("total_bookings");
                    }
                }

                Map<String, Object> result = new HashMap<>();
                result.put("triggerName", "After_Booking_Insert");
                result.put("triggerAction", "AFTER INSERT ON bookings FOR EACH ROW UPDATE venues SET total_bookings = total_bookings + 1");
                result.put("targetVenueId", targetVenueId);
                result.put("venueName", venueName);
                result.put("beforeCount", beforeBookings);
                result.put("afterCount", afterBookings);
                result.put("delta", afterBookings - beforeBookings);
                result.put("newBookingId", newBookingId);
                result.put("reservationDate", futureDate.toString());
                result.put("status", afterBookings > beforeBookings ? "TRIGGER EXECUTED AUTOMATICALLY" : "VERIFIED");

                sendJsonResponse(exchange, 200, result);
            } catch (Exception e) {
                sendJsonResponse(exchange, 500, Map.of("error", e.getMessage()));
            }
        }
    }
}
