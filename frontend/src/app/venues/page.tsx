"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import BookingModal from "@/components/BookingModal";
import { Users, Building, ShieldAlert, CheckCircle, ArrowRight } from "lucide-react";
import { api, Venue, Organizer } from "@/lib/api";

export default function VenuesDirectoryPage() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [filterBuilding, setFilterBuilding] = useState<string>("ALL");

  const loadVenues = async () => {
    try {
      setLoading(true);
      const [vData, oData] = await Promise.all([api.getVenues(), api.getOrganizers()]);
      setVenues(vData);
      setOrganizers(oData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVenues();
  }, []);

  const buildings = ["ALL", ...Array.from(new Set(venues.map((v) => v.building)))];

  const filteredVenues = filterBuilding === "ALL"
    ? venues
    : venues.filter((v) => v.building === filterBuilding);

  return (
    <div className="flex-1 flex flex-col">
      <Header
        onOpenBookingModal={() => setIsModalOpen(true)}
        title="Campus Facilities & Venue Catalog"
      />

      <main className="p-6 space-y-6 max-w-7xl w-full mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-gray-200 rounded p-4 shadow-xs">
          <div>
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider font-mono">
              Infrastructure Registry ({filteredVenues.length} Facilities)
            </h3>
            <p className="text-xs text-gray-500">Filter by campus block or academic wing</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-medium">Building Block:</span>
            <select
              value={filterBuilding}
              onChange={(e) => setFilterBuilding(e.target.value)}
              className="text-xs px-2.5 py-1.5 border border-gray-300 rounded bg-white text-gray-800 focus:outline-none focus:border-blue-600"
            >
              {buildings.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredVenues.map((v) => {
            const util = Math.min(100, Math.round(v.monthlyUtilizationRate || 0));
            return (
              <div
                key={v.id}
                className="bg-white border border-gray-200 rounded p-5 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-gray-400 font-bold">VENUE #{v.id}</span>
                      <h4 className="text-sm font-bold text-gray-900 mt-0.5">{v.name}</h4>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      OPERATIONAL
                    </span>
                  </div>

                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <Building className="w-3.5 h-3.5 text-gray-400" />
                    {v.building}
                  </p>

                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs bg-gray-50 p-2.5 rounded border border-gray-200">
                    <div>
                      <p className="text-[10px] font-mono text-gray-400 uppercase">Max Seating</p>
                      <p className="text-sm font-bold text-gray-900 mt-0.5 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-gray-500" />
                        {v.capacity} Seats
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-mono text-gray-400 uppercase">Total Reservations</p>
                      <p className="text-sm font-bold text-blue-600 mt-0.5 font-mono">
                        {v.totalBookings} Holds
                      </p>
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="flex justify-between text-[10px] font-mono text-gray-500 mb-1">
                      <span>Monthly Load Factor</span>
                      <span className="font-semibold text-gray-800">{util}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-blue-600 h-1.5 rounded-full"
                        style={{ width: `${util}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-gray-200 flex items-center justify-between">
                  <span className="text-[11px] text-gray-400 font-mono">Status: Ready</span>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <span>Schedule Event</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        venues={venues}
        organizers={organizers}
        onBookingSuccess={() => loadVenues()}
      />
    </div>
  );
}
