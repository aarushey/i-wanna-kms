/**
 * UniBook API Client
 * Typed communication layer between Next.js frontend and Java backend REST API.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export interface Venue {
  id: number;
  name: string;
  building: string;
  capacity: number;
  totalBookings: number;
  currentActiveBookings: number;
  monthlyUtilizationRate: number;
}

export interface Organizer {
  id: number;
  name: string;
  department: string;
  contactEmail: string;
}

export interface Booking {
  bookingId: number;
  eventName: string;
  bookingDate: string;
  status: string;
  venueId: number;
  venueName: string;
  building: string;
  capacity: number;
  organizerId: number;
  organizerName: string;
  department: string;
}

export interface DashboardSummary {
  totalVenues: number;
  totalCapacity: number;
  totalBookingsToday: number;
  totalActiveBookings: number;
  avgUtilizationRate: number;
  mostPopularVenue: string;
  mostPopularVenueBookings: number;
}

export interface ConcurrencyTestResult {
  totalThreads: number;
  venueId: number;
  targetDate: string;
  successfulBookings: number;
  preventedCollisions: number;
  threadSafetyResult: string;
  threadLogs: {
    threadId: string;
    status: string;
    bookingId?: number;
    confirmationCode?: string;
    exception?: string;
    reason?: string;
    durationMs: number;
  }[];
}

export interface CursorCheckResult {
  venueId: number;
  requestedDate: string;
  isAvailable: boolean;
  procedureInvoked: string;
  cursorImplementation: string;
  statusExplanation: string;
}

export interface ManifestResult {
  streamReader: string;
  sourceFile: string;
  lineCount: number;
  rawLines: string[];
  parsedEntities: Venue[];
}

export const api = {
  async getSummary(): Promise<DashboardSummary> {
    const res = await fetch(`${API_BASE}/dashboard/summary`, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load dashboard summary");
    return res.json();
  },

  async getVenues(): Promise<Venue[]> {
    const res = await fetch(`${API_BASE}/venues`, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch venues");
    return res.json();
  },

  async getBookings(): Promise<Booking[]> {
    const res = await fetch(`${API_BASE}/bookings`, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch bookings");
    return res.json();
  },

  async getOrganizers(): Promise<Organizer[]> {
    const res = await fetch(`${API_BASE}/organizers`, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch organizers");
    return res.json();
  },

  async createBooking(payload: {
    venueId: number;
    organizerId: number;
    eventName: string;
    date: string;
    endDate?: string;
  }) {
    const res = await fetch(`${API_BASE}/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Reservation failed.");
    }
    return data;
  },

  async getReceipt(bookingId: number): Promise<{ bookingId: number; receiptText: string }> {
    const res = await fetch(`${API_BASE}/receipt?id=${bookingId}`, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch receipt");
    return res.json();
  },

  // Evaluator / Viva Endpoints
  async runStressTest(venueId: number = 3): Promise<ConcurrencyTestResult> {
    const res = await fetch(`${API_BASE}/viva/stress-test`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ venueId }),
    });
    if (!res.ok) throw new Error("Failed to execute concurrency stress test");
    return res.json();
  },

  async checkCursorProcedure(venueId: number, date: string): Promise<CursorCheckResult> {
    const res = await fetch(`${API_BASE}/viva/check-cursor?venueId=${venueId}&date=${date}`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Failed to call cursor procedure");
    return res.json();
  },

  async getManifest(): Promise<ManifestResult> {
    const res = await fetch(`${API_BASE}/viva/manifest`, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to inspect manifest");
    return res.json();
  },

  // RDBMS Showcase Endpoints
  async executeSqlQuery(query: string): Promise<SqlQueryResult> {
    const res = await fetch(`${API_BASE}/rdbms/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Query execution failed");
    return data;
  },

  async runTriggerDemo(): Promise<TriggerDemoResult> {
    const res = await fetch(`${API_BASE}/rdbms/trigger-demo`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error("Failed to run trigger demo");
    return res.json();
  },
};

export interface SqlQueryResult {
  query: string;
  columns: string[];
  rows: Record<string, any>[];
  rowCount: number;
  executionTimeMs: number;
}

export interface TriggerDemoResult {
  triggerName: string;
  triggerAction: string;
  targetVenueId: number;
  venueName: string;
  beforeCount: number;
  afterCount: number;
  delta: number;
  newBookingId: number;
  reservationDate: string;
  status: string;
}
