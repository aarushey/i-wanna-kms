package com.unibook.concurrent;

import com.unibook.db.BookingDao;

import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Academic Requirement: Background Daemon Thread
 * A lightweight background thread (`thread.setDaemon(true)`) running an
 * infinite polling loop to automatically inspect and purge unconfirmed
 * booking holds without blocking main user execution.
 */
public class HoldCleanupDaemon implements Runnable {

    private static final Logger LOGGER = Logger.getLogger(HoldCleanupDaemon.class.getName());
    private final BookingDao bookingDao = new BookingDao();
    private final long sleepIntervalMillis;
    private volatile boolean running = true;

    public HoldCleanupDaemon() {
        this(60000); // 60 seconds interval by default
    }

    public HoldCleanupDaemon(long sleepIntervalMillis) {
        this.sleepIntervalMillis = sleepIntervalMillis;
    }

    @Override
    public void run() {
        LOGGER.info("[DaemonThread] HoldCleanupDaemon started in background (interval: " + sleepIntervalMillis + "ms)");

        while (running) {
            try {
                Thread.sleep(sleepIntervalMillis);
                int purgedCount = bookingDao.deleteExpiredHolds();
                if (purgedCount > 0) {
                    LOGGER.info("[DaemonThread] Successfully purged " + purgedCount + " expired booking hold(s).");
                }
            } catch (InterruptedException e) {
                LOGGER.info("[DaemonThread] Daemon thread received interrupt signal. Terminating cleanly.");
                Thread.currentThread().interrupt();
                break;
            } catch (Exception e) {
                LOGGER.log(Level.WARNING, "[DaemonThread] Error during hold cleanup cycle: " + e.getMessage(), e);
            }
        }
    }

    public void stopDaemon() {
        this.running = false;
    }

    /**
     * Factory method to spawn and launch this daemon thread.
     */
    public static Thread spawnDaemon(long intervalMillis) {
        HoldCleanupDaemon daemonRunnable = new HoldCleanupDaemon(intervalMillis);
        Thread daemonThread = new Thread(daemonRunnable, "UniBook-HoldCleanupDaemon");
        daemonThread.setDaemon(true); // Explicit daemon designation
        daemonThread.start();
        return daemonThread;
    }
}
