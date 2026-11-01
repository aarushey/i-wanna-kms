"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  CalendarCheck2,
  Beaker,
  ShieldCheck,
  GraduationCap,
  Database
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    {
      name: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
      badge: null,
    },
    {
      name: "Venues",
      href: "/venues",
      icon: Building2,
      badge: null,
    },
    {
      name: "Bookings",
      href: "/bookings",
      icon: CalendarCheck2,
      badge: null,
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col justify-between shrink-0 select-none">
      <div>
        {/* Brand / Logo */}
        <div className="h-16 flex items-center px-6 border-b border-gray-200 gap-3">
          <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
            U
          </div>
          <div className="leading-tight">
            <h1 className="font-semibold text-gray-900 text-sm tracking-tight flex items-center gap-1.5">
              UniBook
              <span className="text-[10px] font-medium bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded border border-gray-200">
                CAMPUS
              </span>
            </h1>
            <p className="text-[11px] text-gray-400 font-mono">FACILITY OPS V2.4</p>
          </div>
        </div>

        {/* Operational Section */}
        <div className="px-3 py-4">
          <div className="px-3 pb-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">
            Operations
          </div>
          <nav className="space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 text-xs font-medium rounded transition-none ${
                    isActive
                      ? "bg-blue-50 text-blue-700 font-semibold border-l-2 border-blue-600 -ml-[2px] pl-[14px]"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-blue-600" : "text-gray-400"}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Academic Grading Section */}
        <div className="px-3 pt-2">
          <div className="px-3 pb-2 text-[10px] font-bold text-emerald-700 uppercase tracking-wider font-mono flex items-center gap-1">
            <Database className="w-3.5 h-3.5" />
            RDBMS Showcase
          </div>
          <nav className="space-y-0.5">
            <Link
              href="/database"
              className={`flex items-center justify-between px-3 py-2 text-xs font-medium rounded transition-none ${
                pathname === "/database"
                  ? "bg-emerald-50 text-emerald-800 font-semibold border-l-2 border-emerald-600 -ml-[2px] pl-[14px]"
                  : "text-gray-700 hover:text-gray-900 hover:bg-emerald-50/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <Database className={`w-4 h-4 shrink-0 ${pathname === "/database" ? "text-emerald-700" : "text-emerald-600"}`} />
                <span>RDBMS Studio &amp; Tables</span>
              </div>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-mono font-semibold px-1.5 py-0.2 rounded border border-emerald-200">
                MYSQL
              </span>
            </Link>

            <Link
              href="/viva-demo"
              className={`flex items-center justify-between px-3 py-2 text-xs font-medium rounded transition-none ${
                pathname === "/viva-demo"
                  ? "bg-orange-50 text-orange-700 font-semibold border-l-2 border-orange-500 -ml-[2px] pl-[14px]"
                  : "text-gray-700 hover:text-gray-900 hover:bg-orange-50/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <Beaker className={`w-4 h-4 shrink-0 ${pathname === "/viva-demo" ? "text-orange-600" : "text-orange-500"}`} />
                <span>Concurrency &amp; Files</span>
              </div>
              <span className="text-[10px] bg-orange-100 text-orange-700 font-mono font-semibold px-1.5 py-0.2 rounded border border-orange-200">
                SUITE
              </span>
            </Link>
          </nav>
        </div>
      </div>

      {/* System Integrity Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50/50">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <div className="leading-tight">
            <p className="text-[11px] font-medium text-gray-700">Relational Sync Active</p>
            <p className="text-[10px] text-gray-400 font-mono">ACID Guaranteed</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
