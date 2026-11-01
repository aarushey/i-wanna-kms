"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import BookingModal from "@/components/BookingModal";
import { CalendarCheck, Search, FileText, Download, Filter, Building } from "lucide-react";
import { api, Booking, Venue, Organizer } from "@/lib/api";

export default function BookingsLedgerPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [search, setSearch] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);
  const [selectedReceiptId, setSelectedReceiptId] = useState<number | null>(null);

  const loadData = async () => {
    try {
      const [bData, vData, oData] = await Promise.all([
        api.getBookings(),
        api.getVenues(),
        api.getOrganizers(),
      ]);
      setBookings(bData);
      setVenues(vData);
      setOrganizers(oData);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDownloadReceipt = async (id: number) => {
    try {
      const res = await api.getReceipt(id);
      setSelectedReceipt(res.receiptText);
      setSelectedReceiptId(id);
    } catch {
      alert("Receipt file not found.");
    }
  };


  const filtered = bookings.filter((b) => {
    const q = search.toLowerCase();
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
        title="Campus Bookings & Reservation Ledger"
      />

      <main className="p-6 space-y-6 max-w-7xl w-full mx-auto">
        <div className="bg-white border border-gray-200 rounded p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-200 mb-4">
            <div>
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider font-mono">
                Reservation Log ({filtered.length} Recorded Entries)
              </h3>
              <p className="text-xs text-gray-500">Enterprise Audit Log & Physical Space Allocations</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter by event, room, department..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="text-xs pl-8 pr-3 py-1.5 border border-gray-300 rounded focus:border-blue-600 focus:outline-none bg-white text-gray-900 w-64"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/70 text-[11px] font-semibold text-gray-600 font-mono uppercase tracking-wider">
                  <th className="py-2.5 px-3">Ref ID</th>
                  <th className="py-2.5 px-3">Scheduled Date</th>
                  <th className="py-2.5 px-3">Event Title</th>
                  <th className="py-2.5 px-3">Allocated Space</th>
                  <th className="py-2.5 px-3">Academic Department</th>
                  <th className="py-2.5 px-3">Coordinator</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-right">Receipt Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((b) => (
                  <tr key={b.bookingId} className="hover:bg-gray-50/80">
                    <td className="py-2.5 px-3 font-mono font-semibold text-gray-600">
                      #{b.bookingId}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-gray-900 whitespace-nowrap">
                      {b.bookingDate}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-gray-900">
                      {b.eventName}
                    </td>
                    <td className="py-2.5 px-3 text-gray-700">
                      <div className="font-medium">{b.venueName}</div>
                      <div className="text-[10px] text-gray-400">{b.building} (Cap: {b.capacity})</div>
                    </td>
                    <td className="py-2.5 px-3 text-gray-600">
                      {b.department}
                    </td>
                    <td className="py-2.5 px-3 text-gray-600">
                      {b.organizerName}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        {b.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => handleDownloadReceipt(b.bookingId)}
                        className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View .txt</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Receipt Modal */}
        {selectedReceipt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
            <div className="bg-white border border-gray-300 rounded shadow-lg max-w-2xl w-full p-6">
              <div className="flex items-center justify-between pb-3 border-b border-gray-200 mb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <h4 className="text-xs font-bold text-gray-900 font-mono uppercase">
                    Official Booking Receipt (Server File I/O)
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
                  <span>Download File</span>
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

      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        venues={venues}
        organizers={organizers}
        onBookingSuccess={() => loadData()}
      />
    </div>
  );
}
