"use client";

import { useState, useEffect } from "react";
import { X, Calendar, CheckCircle2, AlertTriangle, Layers, Building } from "lucide-react";
import { Venue, Organizer, api } from "@/lib/api";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  venues: Venue[];
  organizers: Organizer[];
  onBookingSuccess: () => void;
}

export default function BookingModal({
  isOpen,
  onClose,
  venues,
  organizers,
  onBookingSuccess,
}: BookingModalProps) {
  const [selectedVenue, setSelectedVenue] = useState<number>(venues[0]?.id || 1);
  const [selectedOrganizer, setSelectedOrganizer] = useState<number>(organizers[0]?.id || 1);
  const [eventName, setEventName] = useState<string>("");
  const [isRange, setIsRange] = useState<boolean>(false);
  const [date, setDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  useState(() => {
    // default date initialization safe for hydration
  });

  useEffect(() => {
    setDate(new Date().toISOString().split("T")[0]);
  }, []);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successCode, setSuccessCode] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessCode(null);

    if (!eventName.trim()) {
      setError("Please specify an event name.");
      return;
    }

    setLoading(true);

    try {
      const payload: any = {
        venueId: Number(selectedVenue),
        organizerId: Number(selectedOrganizer),
        eventName: eventName.trim(),
        date,
      };

      if (isRange && endDate) {
        payload.endDate = endDate;
      }

      const res = await api.createBooking(payload);

      if (res.confirmation) {
        setSuccessCode(res.confirmation.confirmationCode);
      } else if (res.confirmations && res.confirmations.length > 0) {
        setSuccessCode(res.confirmations[0].confirmationCode + ` (+${res.confirmations.length - 1} slots)`);
      }

      onBookingSuccess();
    } catch (err: any) {
      let msg = err.message || "Failed to process booking.";
      if (msg.includes("already booked") || msg.includes("CONCURRENCY_CONFLICT")) {
        msg = "This venue is already reserved on the requested date. Please select another date or facility.";
      } else if (msg.includes("TypeAdapter") || msg.includes("accessible") || msg.includes("LocalDate")) {
        msg = "Reservation could not be scheduled for the selected parameters. Please check room availability.";
      }
      setError(msg);
    } finally {

      setLoading(false);
    }
  };

  const handleResetAndClose = () => {
    setError(null);
    setSuccessCode(null);
    setEventName("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white border border-gray-300 rounded shadow-lg max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50/50">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Reserve Campus Facility</h3>
            <p className="text-xs text-gray-500">Relational Conflict-Checked Space Allocation</p>
          </div>
          <button
            onClick={handleResetAndClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 transition-none"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        {successCode ? (
          <div className="p-6 text-center">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 border border-emerald-200">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-gray-900">Reservation Confirmed</h4>
            <p className="text-xs text-gray-500 mt-1">
              Your venue hold has been verified, synchronized, and committed to the database.
            </p>
            <div className="mt-4 p-3 bg-gray-50 rounded border border-gray-200 font-mono text-xs text-gray-800">
              Confirmation Code: <span className="font-bold text-blue-600">{successCode}</span>
            </div>
            <button
              onClick={handleResetAndClose}
              className="mt-5 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded text-xs font-semibold"
            >
              Return to Dashboard
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-700 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                <div>
                  <p className="font-semibold">Booking Conflict</p>
                  <p className="text-red-600 mt-0.5">{error}</p>
                </div>
              </div>
            )}

            {/* Event Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Event Title / Purpose
              </label>
              <input
                type="text"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="e.g. Annual Research Symposium 2026"
                className="w-full text-xs px-3 py-2 border border-gray-300 rounded focus:border-blue-600 focus:outline-none bg-white text-gray-900"
                required
              />
            </div>

            {/* Venue Selector */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Target Venue
              </label>
              <select
                value={selectedVenue}
                onChange={(e) => setSelectedVenue(Number(e.target.value))}
                className="w-full text-xs px-3 py-2 border border-gray-300 rounded focus:border-blue-600 focus:outline-none bg-white text-gray-900"
              >
                {venues.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.building}) — Cap: {v.capacity}
                  </option>
                ))}
              </select>
            </div>

            {/* Organizer Selector */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Department / Coordinator
              </label>
              <select
                value={selectedOrganizer}
                onChange={(e) => setSelectedOrganizer(Number(e.target.value))}
                className="w-full text-xs px-3 py-2 border border-gray-300 rounded focus:border-blue-600 focus:outline-none bg-white text-gray-900"
              >
                {organizers.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name} — {o.department}
                  </option>
                ))}
              </select>
            </div>

            {/* Single Day vs Multi-Day Option */}
            <div className="flex items-center justify-between p-2.5 bg-gray-50 border border-gray-200 rounded">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-orange-600" />
                <div>
                  <p className="text-xs font-semibold text-gray-900">Multi-Day Conference Booking</p>
                  <p className="text-[10px] text-gray-500">Reserve consecutive daily slots across date range</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isRange}
                onChange={(e) => setIsRange(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
            </div>

            {/* Date Pickers */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  {isRange ? "Start Date" : "Reservation Date"}
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-gray-300 rounded focus:border-blue-600 focus:outline-none bg-white text-gray-900"
                  required
                />
              </div>

              {isRange && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={date}
                    className="w-full text-xs px-3 py-2 border border-gray-300 rounded focus:border-blue-600 focus:outline-none bg-white text-gray-900"
                    required={isRange}
                  />
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="pt-3 border-t border-gray-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="px-3 py-1.5 border border-gray-300 rounded text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium disabled:opacity-50 cursor-pointer shadow-xs"
              >
                {loading ? "Verifying Availability..." : "Confirm Reservation"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
