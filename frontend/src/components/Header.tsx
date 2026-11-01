"use client";

import { useState, useEffect } from "react";
import { Plus, Clock, Search, Bell } from "lucide-react";

interface HeaderProps {
  onOpenBookingModal?: () => void;
  title?: string;
}

export default function Header({ onOpenBookingModal, title = "Campus Facility Management" }: HeaderProps) {
  const [currentTime, setCurrentTime] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between shrink-0 sticky top-0 z-20">
      {/* Title & Context */}
      <div className="flex items-center gap-4">
        <div>
          <h2 className="text-sm font-semibold text-gray-900 tracking-tight">{title}</h2>
          <p className="text-[11px] text-gray-500">Live Campus Infrastructure Registry</p>
        </div>
      </div>

      {/* Action Area */}
      <div className="flex items-center gap-4">
        {/* Timestamp */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded bg-gray-50 border border-gray-200 text-gray-600 text-xs font-mono">
          <Clock className="w-3.5 h-3.5 text-gray-400" />
          <span className="tabular-nums">{currentTime || "Loading campus clock..."}</span>
        </div>

        {/* Action Button: Reserve Venue */}
        {onOpenBookingModal && (
          <button
            id="btn-reserve-space"
            onClick={onOpenBookingModal}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded text-xs font-medium shadow-xs transition-none active:scale-[0.99] cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Reserve Space</span>
          </button>
        )}

        {/* User Identity */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-gray-200">
          <div className="w-7 h-7 rounded bg-gray-800 text-white font-medium text-xs flex items-center justify-center">
            AD
          </div>
          <div className="hidden lg:block text-left leading-tight">
            <p className="text-xs font-semibold text-gray-900">Admin Dispatch</p>
            <p className="text-[10px] text-gray-400 font-mono">FACILITY_LEVEL_1</p>
          </div>
        </div>
      </div>
    </header>
  );
}
