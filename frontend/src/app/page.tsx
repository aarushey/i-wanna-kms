"use client";

import { useEffect, useState, useTransition } from "react";
import Header from "@/components/Header";
import MetricCard from "@/components/MetricCard";
import BookingModal from "@/components/BookingModal";
import {
  Building2,
  CalendarDays,
  Activity,
  Flame,
  Search,
  Download,
  Users,
  CheckCircle,
  FileText
} from "lucide-react";
import { api, DashboardSummary, Venue, Booking, Organizer } from "@/lib/api";

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);
  const [selectedReceiptId, setSelectedReceiptId] = useState<number | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [sumData, venuesData, bookingsData, orgData] = await Promise.all([
        api.getSummary(),
        api.getVenues(),
        api.getBookings(),
        api.getOrganizers(),
      ]);
      setSummary(sumData);
      setVenues(venuesData);
      setBookings(bookingsData);
      setOrganizers(orgData);
    } catch (err: any) {
      setError(err.message || "Failed to load campus telemetry.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDownloadReceipt = async (bookingId: number) => {
    try {
      const res = await api.getReceipt(bookingId);
      setSelectedReceipt(res.receiptText);
      setSelectedReceiptId(bookingId);
    } catch (e: any) {
      alert("Receipt not yet generated on server disk for this record.");
    }
  };


  const filteredBookings = bookings.filter((b) => {
    const q = searchQuery.toLowerCase();
    return (
      b.eventName.toLowerCase().includes(q) ||
      b.venueName.toLowerCase().includes(q) ||
      b.department.toLowerCase().includes(q) ||
      b.bookingDate.includes(q)
    );
  });

  return (
    <div className="flex-1 flex flex-col">
      <Header
        onOpenBookingModal={() => setIsModalOpen(true)}
        title="Campus Facility & Event Operations"
      />

      <main className="p-6 space-y-6 max-w-7xl w-full mx-auto">
        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-700 flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={loadData}
              className="text-xs font-semibold text-red-800 underline hover:no-underline cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* 1. Executive Analytics Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Total Campus Venues"
            value={summary ? summary.totalVenues : "—"}
            subValue={summary ? `${summary.totalCapacity.toLocaleString()} Cumulative Seats` : "Loading..."}
            icon={Building2}
            accentColor="blue"
          />
          <MetricCard
            label="Scheduled Today"
            value={summary ? summary.totalBookingsToday : "—"}
            subValue={summary ? `${summary.totalActiveBookings} Active Reservations` : "Loading..."}
            icon={CalendarDays}
            accentColor="emerald"
          />
          <MetricCard
            label="Monthly Space Utilization"
            value={summary ? `${summary.avgUtilizationRate}%` : "—"}
            subValue="Capacity Density Load"
            icon={Activity}
            accentColor="orange"
          />
          <MetricCard
            label="Highest Utilization Space"
            value={summary ? summary.mostPopularVenue : "—"}
            subValue={summary ? `${summary.mostPopularVenueBookings} Recorded Events` : "Loading..."}
            icon={Flame}
            accentColor="gray"
          />
        </div>

        {/* 2. Campus Facilities Live Grid */}
        <div className="bg-white border border-gray-200 rounded p-5 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-gray-200 mb-4">
            <div>
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider font-mono">
                Campus Venues Directory
              </h3>
              <p className="text-xs text-gray-500">Live Capacity & Monthly Allocation</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
            >
              + Reserve Space
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {venues.map((venue) => {
              const utilPercent = Math.min(100, Math.round(venue.monthlyUtilizationRate || 0));
              return (
                <div
                  key={venue.id}
                  className="border border-gray-200 rounded p-4 bg-gray-50/40 hover:bg-gray-50 flex flex-col justify-between transition-none"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 pr-2">
                        <h4 className="text-xs font-bold text-gray-900 truncate">
                          {venue.name}
                        </h4>
                        <p className="text-[11px] text-gray-500 truncate mt-0.5">
                          {venue.building}
                        </p>
                      </div>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold shrink-0">
                        AVAILABLE
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs text-gray-600">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-gray-400" />
                        <span className="font-semibold text-gray-900">{venue.capacity}</span> Max Capacity
                      </span>
                      <span className="text-[11px] font-mono text-gray-500">
                        {venue.totalBookings} Lifetime Holds
                      </span>
                    </div>

                    {/* Utilization Meter */}
                    <div className="mt-2.5">
                      <div className="flex justify-between text-[10px] text-gray-400 font-mono mb-1">
                        <span>Utilization Load</span>
                        <span className="font-semibold text-gray-700">{utilPercent}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-blue-600 h-1.5 rounded-full"
                          style={{ width: `${utilPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-between">
                    <span className="text-[11px] text-gray-500 font-mono">ID: #{venue.id}</span>
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="text-xs font-medium text-blue-600 hover:text-blue-800"
                    >
                      Book Date →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Upcoming Scheduled Campus Events Table */}
        <div className="bg-white border border-gray-200 rounded p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-200 mb-4">
            <div>
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider font-mono">
                Confirmed Campus Event Ledger
              </h3>
              <p className="text-xs text-gray-500">Chronological Event Master Schedule</p>
            </div>
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Filter events, venues, departments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-xs pl-8 pr-3 py-1.5 border border-gray-300 rounded focus:border-blue-600 focus:outline-none bg-white text-gray-900 w-64"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/70 text-[11px] font-semibold text-gray-600 font-mono uppercase tracking-wider">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Event Name</th>
                  <th className="py-2.5 px-3">Venue & Hall</th>
                  <th className="py-2.5 px-3">Department</th>
                  <th className="py-2.5 px-3">Coordinator</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-gray-500">
                      No scheduled campus reservations found matching query.
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((b) => (
                    <tr key={b.bookingId} className="hover:bg-gray-50/80">
                      <td className="py-2.5 px-3 font-mono font-medium text-gray-900 whitespace-nowrap">
                        {b.bookingDate}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-gray-900">
                        {b.eventName}
                      </td>
                      <td className="py-2.5 px-3 text-gray-700">
                        <div>{b.venueName}</div>
                        <div className="text-[10px] text-gray-400">{b.building}</div>
                      </td>
                      <td className="py-2.5 px-3 text-gray-600">
                        {b.department}
                      </td>
                      <td className="py-2.5 px-3 text-gray-600">
                        {b.organizerName}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                          <CheckCircle className="w-2.5 h-2.5 text-blue-600" />
                          {b.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => handleDownloadReceipt(b.bookingId)}
                          className="inline-flex items-center gap-1 text-[11px] text-gray-600 hover:text-blue-600 border border-gray-200 hover:border-blue-300 px-2 py-1 rounded bg-white shadow-2xs font-mono"
                          title="View Official .txt Booking Receipt"
                        >
                          <FileText className="w-3 h-3" />
                          <span>.txt</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. Receipt Modal Preview */}
        {selectedReceipt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
            <div className="bg-white border border-gray-300 rounded shadow-lg max-w-2xl w-full p-6">
              <div className="flex items-center justify-between pb-3 border-b border-gray-200 mb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <h4 className="text-xs font-bold text-gray-900 font-mono uppercase">
                    Official File I/O Booking Receipt (.txt)
                  </h4>
                </div>
                <button
                  onClick={() => setSelectedReceipt(null)}
                  className="text-gray-400 hover:text-gray-600 text-xs font-bold"
                >
                  ✕
                </button>
              </div>
              <pre className="p-4 bg-gray-50 border border-gray-200 rounded font-mono text-[11px] text-gray-800 leading-relaxed overflow-x-auto whitespace-pre">
                {selectedReceipt}
              </pre>
              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={() => {
                    const blob = new Blob([selectedReceipt], { type: "text/plain" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `receipt_${selectedReceiptId || "booking"}.txt`;
                    a.click();
                  }}

                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .txt</span>
                </button>
                <button
                  onClick={() => setSelectedReceipt(null)}
                  className="px-3 py-1.5 border border-gray-300 rounded text-xs font-medium text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Instant Reservation Modal */}
      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        venues={venues}
        organizers={organizers}
        onBookingSuccess={() => {
          loadData();
        }}
      />
    </div>
  );
}
