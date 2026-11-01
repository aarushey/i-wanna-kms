package com.unibook;

import com.unibook.db.DatabaseConnection;
import com.unibook.server.RestServer;

import java.util.logging.Logger;

/**
 * Main application entrypoint for UniBook academic backend.
 */
public class Main {

    private static final Logger LOGGER = Logger.getLogger(Main.class.getName());
    public static final int DEFAULT_PORT = 8080;

    public static void main(String[] args) {
        System.out.println("================================================================================");
        System.out.println("  UNIBOOK — CAMPUS EVENT & VENUE BOOKING DASHBOARD                              ");
        System.out.println("  Final Academic Project: Java (OOP) + MySQL (RDBMS)                            ");
        System.out.println("================================================================================");

        int port = DEFAULT_PORT;
        if (System.getenv("PORT") != null) {
            try {
                port = Integer.parseInt(System.getenv("PORT"));
            } catch (NumberFormatException ignored) {}
        }

        try {
            // 1. Initialize Database Connection (MySQL primary with In-Memory fallback)
            DatabaseConnection db = DatabaseConnection.getInstance();
            System.out.println(">> Database Engine: " + (db.isFallbackActive() ? "H2 In-Memory (MySQL Mode)" : "MySQL 8.0 Live"));

            // 2. Start Embedded HTTP REST Server
            RestServer server = new RestServer(port);
            server.start();

            System.out.println(">> Backend REST API Server initialized on: http://localhost:" + port);
            System.out.println(">> Operational Endpoints:");
            System.out.println("   - GET  /api/dashboard/summary");
            System.out.println("   - GET  /api/venues");
            System.out.println("   - GET  /api/bookings");
            System.out.println("   - POST /api/bookings");
            System.out.println("   - GET  /api/organizers");
            System.out.println("   - GET  /api/receipt?id=1");
            System.out.println(">> Evaluator / Viva Endpoints:");
            System.out.println("   - POST /api/viva/stress-test    (10-Thread Concurrency Simulation)");
            System.out.println("   - GET  /api/viva/check-cursor   (sp_check_availability Inspection)");
            System.out.println("   - GET  /api/viva/manifest       (BufferedReader Stream Inspection)");
            System.out.println("================================================================================");

            // Add shutdown hook
            Runtime.getRuntime().addShutdownHook(new Thread(() -> {
                System.out.println("Shutting down UniBook REST server...");
                server.stop();
            }));

        } catch (Exception e) {
            LOGGER.severe("Fatal error during backend startup: " + e.getMessage());
            e.printStackTrace();
            System.exit(1);
        }
    }
}
