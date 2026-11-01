"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import {
  Database,
  Table2,
  GitFork,
  Zap,
  Eye,
  SearchCode,
  FileCode,
  Key,
  Link2,
  CheckCircle2,
  Layers,
  ArrowRight,
  Terminal,
  Play,
  RotateCcw
} from "lucide-react";
import { api, SqlQueryResult, TriggerDemoResult, CursorCheckResult } from "@/lib/api";

export default function DatabaseStudioPage() {
  const [activeTab, setActiveTab] = useState<
    "tables" | "diagram" | "trigger" | "views" | "cursor" | "indexes" | "console"
  >("tables");

  // Tab 1: Tables state
  const [selectedTable, setSelectedTable] = useState<string>("venues");
  const [tableData, setTableData] = useState<SqlQueryResult | null>(null);
  const [loadingTable, setLoadingTable] = useState<boolean>(false);

  // Tab 3: Trigger state
  const [triggerResult, setTriggerResult] = useState<TriggerDemoResult | null>(null);
  const [runningTrigger, setRunningTrigger] = useState<boolean>(false);

  // Tab 4: View state
  const [viewData, setViewData] = useState<SqlQueryResult | null>(null);

  // Tab 5: Cursor Stored Procedure state
  const [procVenueId, setProcVenueId] = useState<number>(1);
  const [procDate, setProcDate] = useState<string>("");
  const [procResult, setProcResult] = useState<CursorCheckResult | null>(null);
  const [runningProc, setRunningProc] = useState<boolean>(false);

  // Tab 7: Custom SQL Console state
  const [sqlInput, setSqlInput] = useState<string>(
    "SELECT b.booking_id, v.name AS venue, o.department, b.booking_date, b.status\nFROM bookings b\nJOIN venues v ON b.venue_id = v.venue_id\nJOIN organizers o ON b.organizer_id = o.organizer_id\nORDER BY b.booking_date ASC;"
  );
  const [consoleResult, setConsoleResult] = useState<SqlQueryResult | null>(null);
  const [runningConsole, setRunningConsole] = useState<boolean>(false);
  const [consoleError, setConsoleError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      if (tabParam && ["tables", "diagram", "trigger", "views", "cursor", "indexes", "console"].includes(tabParam)) {
        setActiveTab(tabParam as any);
      }
      const tblParam = params.get("table");
      if (tblParam) {
        setSelectedTable(tblParam);
        loadTableData(tblParam);
      }
    }
    setProcDate(new Date().toISOString().split("T")[0]);
    loadTableData("venues");
    loadViewData();
  }, []);

  const loadTableData = async (table: string) => {
    try {
      setLoadingTable(true);
      setSelectedTable(table);
      const res = await api.executeSqlQuery(`SELECT * FROM ${table} ORDER BY 1 ASC;`);
      setTableData(res);
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoadingTable(false);
    }
  };

  const loadViewData = async () => {
    try {
      const res = await api.executeSqlQuery(`SELECT * FROM vw_venue_utilization ORDER BY venue_id ASC;`);
      setViewData(res);
    } catch (e: any) {
      console.error(e);
    }
  };

  const handleRunTrigger = async () => {
    try {
      setRunningTrigger(true);
      const res = await api.runTriggerDemo();
      setTriggerResult(res);
      // Reload tables to reflect updated total_bookings
      loadTableData("venues");
    } catch (e: any) {
      alert("Trigger execution error: " + e.message);
    } finally {
      setRunningTrigger(false);
    }
  };

  const handleRunCursor = async () => {
    try {
      setRunningProc(true);
      const res = await api.checkCursorProcedure(procVenueId, procDate);
      setProcResult(res);
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setRunningProc(false);
    }
  };

  const handleExecuteConsoleQuery = async (queryToRun?: string) => {
    const q = queryToRun || sqlInput;
    try {
      setRunningConsole(true);
      setConsoleError(null);
      const res = await api.executeSqlQuery(q);
      setConsoleResult(res);
    } catch (e: any) {
      setConsoleError(e.message || "Query syntax error.");
    } finally {
      setRunningConsole(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <Header title="RDBMS Database Studio &amp; Schema Inspector" />

      <main className="p-6 space-y-6 max-w-7xl w-full mx-auto">
        {/* RDBMS Showcase Hero Header */}
        <div className="bg-white border-l-4 border-emerald-600 border border-gray-200 rounded p-5 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  RDBMS SHOWCASE
                </span>
                <span className="text-xs text-gray-500 font-mono">
                  MySQL 8.0 Engine • Relational Schema &amp; Advanced PL/SQL
                </span>
              </div>
              <h2 className="text-base font-bold text-gray-900 mt-1">
                Relational Database Architecture &amp; Live Verification Studio
              </h2>
              <p className="text-xs text-gray-600 mt-0.5 max-w-3xl leading-relaxed">
                Use this studio to present the database requirements to your professor: live tables,
                foreign key constraints, B-Tree indexes, analytical views with outer joins, automated triggers,
                and cursor-driven stored procedures.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-gray-50 border border-gray-200 rounded text-xs font-mono text-gray-700">
                DB: <strong className="text-emerald-700">unibook_db</strong>
              </span>
              <span className="px-2.5 py-1 bg-gray-50 border border-gray-200 rounded text-xs font-mono text-gray-700">
                ENGINE: <strong className="text-emerald-700">InnoDB</strong>
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="mt-5 pt-3 border-t border-gray-200 flex flex-wrap gap-1.5 text-xs">
            {[
              { id: "tables", label: "Live Tables Explorer", icon: Table2 },
              { id: "diagram", label: "ER Diagram & Schema", icon: GitFork },
              { id: "trigger", label: "PL/SQL Trigger", icon: Zap },
              { id: "views", label: "Views & Outer Joins", icon: Eye },
              { id: "cursor", label: "Cursor Stored Procedure", icon: FileCode },
              { id: "indexes", label: "B-Tree Indexes", icon: SearchCode },
              { id: "console", label: "Interactive SQL Console", icon: Terminal },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded font-medium transition-none cursor-pointer ${
                    isActive
                      ? "bg-emerald-600 text-white font-semibold shadow-xs"
                      : "bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* =========================================================================
            TAB 1: LIVE TABLES EXPLORER
           ========================================================================= */}
        {activeTab === "tables" && (
          <div className="bg-white border border-gray-200 rounded p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-200 gap-3">
              <div>
                <h3 className="text-xs font-bold text-gray-900 font-mono uppercase tracking-wider">
                  Live Database Table Visualizer
                </h3>
                <p className="text-xs text-gray-500">
                  Select a table to query real-time rows directly from MySQL
                </p>
              </div>

              {/* Table Switcher */}
              <div className="flex items-center gap-1.5">
                {["venues", "bookings", "organizers", "vw_venue_utilization"].map((tbl) => (
                  <button
                    key={tbl}
                    onClick={() => loadTableData(tbl)}
                    className={`px-2.5 py-1 rounded text-xs font-mono font-medium cursor-pointer ${
                      selectedTable === tbl
                        ? "bg-blue-600 text-white font-bold"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                    }`}
                  >
                    {tbl}
                  </button>
                ))}
              </div>
            </div>

            {/* Table Meta Bar */}
            <div className="flex items-center justify-between text-xs bg-gray-50 p-2.5 rounded border border-gray-200 font-mono">
              <span className="text-gray-600">
                Query: <code className="text-blue-700 font-bold">SELECT * FROM {selectedTable}</code>
              </span>
              <span className="text-gray-500">
                {tableData ? `${tableData.rowCount} Rows • Execution Time: ${tableData.executionTimeMs}ms` : "Loading..."}
              </span>
            </div>

            {/* Table Grid */}
            <div className="overflow-x-auto border border-gray-200 rounded">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-200 font-mono text-[11px] text-gray-700 uppercase">
                  <tr>
                    {tableData?.columns.map((col) => {
                      const isPk = col.includes("_id") && !col.includes("organizer_id") && !col.includes("venue_id");
                      const isFk = col === "venue_id" && selectedTable === "bookings" || col === "organizer_id" && selectedTable === "bookings";
                      return (
                        <th key={col} className="py-2.5 px-3 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            {isPk && <span title="Primary Key"><Key className="w-3 h-3 text-amber-500" /></span>}
                            {isFk && <span title="Foreign Key"><Link2 className="w-3 h-3 text-blue-500" /></span>}
                            <span>{col}</span>
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-mono text-[11px]">
                  {loadingTable ? (
                    <tr>
                      <td colSpan={10} className="py-6 text-center text-gray-500">
                        Querying database...
                      </td>
                    </tr>
                  ) : (
                    tableData?.rows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        {tableData.columns.map((col) => (
                          <td key={col} className="py-2.5 px-3 whitespace-nowrap text-gray-800">
                            {String(row[col] ?? "NULL")}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 2: ER DIAGRAM & SCHEMA VISUALIZER
           ========================================================================= */}
        {activeTab === "diagram" && (
          <div className="bg-white border border-gray-200 rounded p-5 shadow-xs space-y-6">
            <div>
              <h3 className="text-xs font-bold text-gray-900 font-mono uppercase tracking-wider">
                Entity Relationship Diagram &amp; Relational Constraints
              </h3>
              <p className="text-xs text-gray-500">
                Visualizing normalized 3NF schema, Primary Keys, Foreign Keys with ON DELETE CASCADE, and CHECK/UNIQUE constraints
              </p>
            </div>

            {/* Visual Schema Blocks */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              {/* Entity: Organizers */}
              <div className="border border-gray-300 rounded overflow-hidden shadow-xs">
                <div className="bg-purple-50 border-b border-purple-200 px-3 py-2 flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-purple-900 flex items-center gap-1.5">
                    <Table2 className="w-3.5 h-3.5 text-purple-700" />
                    organizers
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-100 text-purple-800">
                    Parent (1)
                  </span>
                </div>
                <div className="p-3 bg-white space-y-1.5 text-xs font-mono">
                  <div className="flex items-center justify-between p-1 bg-amber-50 rounded border border-amber-200 text-amber-900 font-semibold">
                    <span className="flex items-center gap-1">
                      <Key className="w-3 h-3 text-amber-600" />
                      organizer_id
                    </span>
                    <span className="text-[10px] text-gray-500">INT PK AUTO_INC</span>
                  </div>
                  <div className="flex items-center justify-between p-1 text-gray-800">
                    <span>name</span>
                    <span className="text-[10px] text-gray-400">VARCHAR(100) NOT NULL</span>
                  </div>
                  <div className="flex items-center justify-between p-1 text-gray-800">
                    <span>department</span>
                    <span className="text-[10px] text-gray-400">VARCHAR(100) NOT NULL</span>
                  </div>
                  <div className="flex items-center justify-between p-1 text-gray-800">
                    <span>contact_email</span>
                    <span className="text-[10px] text-gray-400">VARCHAR(120) NOT NULL</span>
                  </div>
                </div>
              </div>

              {/* Entity: Bookings (Junction / Child) */}
              <div className="border border-blue-400 rounded overflow-hidden shadow-xs ring-1 ring-blue-200">
                <div className="bg-blue-50 border-b border-blue-200 px-3 py-2 flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-blue-900 flex items-center gap-1.5">
                    <Table2 className="w-3.5 h-3.5 text-blue-700" />
                    bookings
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                    Child (N)
                  </span>
                </div>
                <div className="p-3 bg-white space-y-1.5 text-xs font-mono">
                  <div className="flex items-center justify-between p-1 bg-amber-50 rounded border border-amber-200 text-amber-900 font-semibold">
                    <span className="flex items-center gap-1">
                      <Key className="w-3 h-3 text-amber-600" />
                      booking_id
                    </span>
                    <span className="text-[10px] text-gray-500">INT PK AUTO_INC</span>
                  </div>
                  <div className="flex items-center justify-between p-1 bg-blue-50 rounded border border-blue-200 text-blue-900 font-semibold">
                    <span className="flex items-center gap-1">
                      <Link2 className="w-3 h-3 text-blue-600" />
                      venue_id
                    </span>
                    <span className="text-[10px] text-blue-700">FK -&gt; venues(venue_id)</span>
                  </div>
                  <div className="flex items-center justify-between p-1 bg-purple-50 rounded border border-purple-200 text-purple-900 font-semibold">
                    <span className="flex items-center gap-1">
                      <Link2 className="w-3 h-3 text-purple-600" />
                      organizer_id
                    </span>
                    <span className="text-[10px] text-purple-700">FK -&gt; organizers(id)</span>
                  </div>
                  <div className="flex items-center justify-between p-1 text-gray-800">
                    <span>event_name</span>
                    <span className="text-[10px] text-gray-400">VARCHAR(150) NOT NULL</span>
                  </div>
                  <div className="flex items-center justify-between p-1 text-gray-800">
                    <span>booking_date</span>
                    <span className="text-[10px] text-gray-400">DATE NOT NULL [INDEX]</span>
                  </div>
                  <div className="flex items-center justify-between p-1 text-gray-800">
                    <span>status</span>
                    <span className="text-[10px] text-gray-400">CHECK (&apos;CONFIRMED&apos;...)</span>
                  </div>
                  <div className="p-1 bg-gray-50 rounded border border-gray-200 text-[10px] text-gray-600">
                    CONSTRAINT uq_venue_date UNIQUE (venue_id, booking_date)
                  </div>
                </div>
              </div>

              {/* Entity: Venues */}
              <div className="border border-gray-300 rounded overflow-hidden shadow-xs">
                <div className="bg-emerald-50 border-b border-emerald-200 px-3 py-2 flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                    <Table2 className="w-3.5 h-3.5 text-emerald-700" />
                    venues
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    Parent (1)
                  </span>
                </div>
                <div className="p-3 bg-white space-y-1.5 text-xs font-mono">
                  <div className="flex items-center justify-between p-1 bg-amber-50 rounded border border-amber-200 text-amber-900 font-semibold">
                    <span className="flex items-center gap-1">
                      <Key className="w-3 h-3 text-amber-600" />
                      venue_id
                    </span>
                    <span className="text-[10px] text-gray-500">INT PK AUTO_INC</span>
                  </div>
                  <div className="flex items-center justify-between p-1 text-gray-800">
                    <span>name</span>
                    <span className="text-[10px] text-emerald-700 font-bold">UNIQUE VARCHAR(100)</span>
                  </div>
                  <div className="flex items-center justify-between p-1 text-gray-800">
                    <span>building</span>
                    <span className="text-[10px] text-gray-400">VARCHAR(100)</span>
                  </div>
                  <div className="flex items-center justify-between p-1 text-gray-800">
                    <span>capacity</span>
                    <span className="text-[10px] text-emerald-700 font-bold">CHECK (capacity &gt; 0)</span>
                  </div>
                  <div className="flex items-center justify-between p-1 bg-orange-50 rounded border border-orange-200 text-orange-900">
                    <span>total_bookings</span>
                    <span className="text-[10px] text-orange-700">UPDATED BY TRIGGER</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Relational Narrative for Professor */}
            <div className="p-4 bg-gray-50 border border-gray-200 rounded text-xs text-gray-700 space-y-1.5">
              <p className="font-bold text-gray-900">
                Key Relational Constraints Explained for Defense:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-600 font-mono text-[11px]">
                <li>
                  <strong>Referential Integrity (Foreign Keys):</strong> Deleting a venue or organizer triggers <code className="text-blue-700 font-bold">ON DELETE CASCADE</code>, safely purging dependent bookings without orphaned rows.
                </li>
                <li>
                  <strong>Unique Composite Constraint:</strong> <code className="text-blue-700 font-bold">UNIQUE(venue_id, booking_date)</code> prevents double-booking collisions directly at the database engine level.
                </li>
                <li>
                  <strong>Domain Integrity (CHECK):</strong> <code className="text-blue-700 font-bold">CHECK (capacity &gt; 0)</code> ensures invalid room capacities cannot be inserted.
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 3: PL/SQL TRIGGER (After_Booking_Insert)
           ========================================================================= */}
        {activeTab === "trigger" && (
          <div className="bg-white border border-gray-200 rounded p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-200 gap-3">
              <div>
                <h3 className="text-xs font-bold text-gray-900 font-mono uppercase tracking-wider">
                  Live PL/SQL Trigger Verification: After_Booking_Insert
                </h3>
                <p className="text-xs text-gray-500">
                  Proves that inserting into <code className="font-mono">bookings</code> automatically updates <code className="font-mono">venues.total_bookings</code> via database trigger
                </p>
              </div>

              <button
                onClick={handleRunTrigger}
                disabled={runningTrigger}
                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{runningTrigger ? "Trigger Firing..." : "Fire Trigger Test (Insert Booking)"}</span>
              </button>
            </div>

            {/* Trigger Definition Code */}
            <div className="p-3 bg-gray-900 text-gray-100 rounded text-xs font-mono">
              <span className="text-orange-400 font-bold">// MySQL PL/SQL Trigger Definition</span>
              <pre className="text-[11px] leading-relaxed text-gray-300 mt-1 overflow-x-auto whitespace-pre">
{`DELIMITER //
CREATE TRIGGER After_Booking_Insert
AFTER INSERT ON bookings
FOR EACH ROW
BEGIN
    UPDATE venues 
    SET total_bookings = total_bookings + 1 
    WHERE venue_id = NEW.venue_id;
END //
DELIMITER ;`}
              </pre>
            </div>

            {/* Trigger Live Output */}
            {triggerResult ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded space-y-3">
                <div className="flex items-center gap-2 text-emerald-800 font-semibold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Trigger Successfully Fired: Counter Automatically Incremented!</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-center">
                  <div className="p-3 bg-white border border-emerald-200 rounded">
                    <p className="text-[10px] font-mono text-gray-500 uppercase">Target Venue</p>
                    <p className="text-xs font-bold text-gray-900 mt-0.5">{triggerResult.venueName}</p>
                  </div>
                  <div className="p-3 bg-white border border-emerald-200 rounded">
                    <p className="text-[10px] font-mono text-gray-500 uppercase">Before Trigger</p>
                    <p className="text-lg font-bold text-gray-700 font-mono mt-0.5">{triggerResult.beforeCount} Bookings</p>
                  </div>
                  <div className="p-3 bg-white border border-emerald-200 rounded">
                    <p className="text-[10px] font-mono text-gray-500 uppercase">Action Performed</p>
                    <p className="text-xs font-bold text-blue-600 font-mono mt-0.5">INSERT INTO bookings</p>
                  </div>
                  <div className="p-3 bg-white border border-emerald-200 rounded">
                    <p className="text-[10px] font-mono text-gray-500 uppercase">After Trigger</p>
                    <p className="text-lg font-bold text-emerald-600 font-mono mt-0.5">{triggerResult.afterCount} Bookings (+{triggerResult.delta})</p>
                  </div>
                </div>

                <p className="text-[11px] text-emerald-700 font-mono">
                  Notice: Zero application UPDATE statements were issued. The MySQL engine executed <code className="font-bold">After_Booking_Insert</code> automatically!
                </p>
              </div>
            ) : (
              <div className="p-6 text-center border border-dashed border-gray-300 rounded bg-gray-50/50">
                <p className="text-xs text-gray-600 font-medium">
                  Click &quot;Fire Trigger Test&quot; above to prove live trigger execution to your professor.
                </p>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB 4: VIEWS & COMPLEX JOINS (vw_venue_utilization)
           ========================================================================= */}
        {activeTab === "views" && (
          <div className="bg-white border border-gray-200 rounded p-5 shadow-xs space-y-4">
            <div>
              <h3 className="text-xs font-bold text-gray-900 font-mono uppercase tracking-wider">
                Relational View with LEFT OUTER JOIN &amp; Aggregations
              </h3>
              <p className="text-xs text-gray-500">
                Uses <code className="font-mono">LEFT OUTER JOIN</code> and <code className="font-mono">GROUP BY</code> so unbooked facilities still appear with 0% utilization
              </p>
            </div>

            {/* View SQL Definition */}
            <div className="p-3 bg-gray-900 text-gray-100 rounded text-xs font-mono">
              <span className="text-blue-400 font-bold">// MySQL Relational View Definition</span>
              <pre className="text-[11px] leading-relaxed text-gray-300 mt-1 overflow-x-auto whitespace-pre">
{`CREATE OR REPLACE VIEW vw_venue_utilization AS
SELECT 
    v.venue_id, 
    v.name AS venue_name, 
    v.building,
    v.capacity, 
    v.total_bookings AS lifetime_bookings,
    COUNT(b.booking_id) AS current_active_bookings,
    ROUND((COUNT(b.booking_id) / 30.0) * 100, 1) AS monthly_utilization_rate
FROM venues v
LEFT OUTER JOIN bookings b 
    ON v.venue_id = b.venue_id 
    AND b.status = 'CONFIRMED'
GROUP BY 
    v.venue_id, v.name, v.building, v.capacity, v.total_bookings;`}
              </pre>
            </div>

            {/* View Live Output Table */}
            <div className="overflow-x-auto border border-gray-200 rounded">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-200 font-mono text-[11px] text-gray-700 uppercase">
                  <tr>
                    {viewData?.columns.map((c) => (
                      <th key={c} className="py-2.5 px-3">
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-mono text-[11px]">
                  {viewData?.rows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      {viewData.columns.map((c) => (
                        <td key={c} className="py-2 px-3">
                          {String(row[c])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded text-xs text-blue-900">
              <strong>Viva Defense Explanation:</strong> An <code className="font-mono">INNER JOIN</code> would have omitted <em>Curie Innovation Hub</em> because it has 0 bookings. By using <code className="font-mono">LEFT OUTER JOIN</code>, facility managers see every room regardless of booking state.
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 5: CURSOR STORED PROCEDURE (sp_check_availability)
           ========================================================================= */}
        {activeTab === "cursor" && (
          <div className="bg-white border border-gray-200 rounded p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-200 gap-3">
              <div>
                <h3 className="text-xs font-bold text-gray-900 font-mono uppercase tracking-wider">
                  Stored Procedure with Explicit Cursor Iteration
                </h3>
                <p className="text-xs text-gray-500">
                  <code className="font-mono">sp_check_availability</code> uses a CURSOR to sequentially iterate venue records
                </p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={procVenueId}
                  onChange={(e) => setProcVenueId(Number(e.target.value))}
                  className="text-xs px-2.5 py-1.5 border border-gray-300 rounded bg-white text-gray-900 focus:outline-none"
                >
                  <option value={1}>Turing Grand Auditorium (#1)</option>
                  <option value={2}>Von Neumann Lab (#2)</option>
                  <option value={3}>Ramanujan Theatre (#3)</option>
                  <option value={4}>Ada Lovelace Hall (#4)</option>
                </select>

                <input
                  type="date"
                  value={procDate}
                  onChange={(e) => setProcDate(e.target.value)}
                  className="text-xs px-2.5 py-1.5 border border-gray-300 rounded bg-white text-gray-900 focus:outline-none"
                />

                <button
                  onClick={handleRunCursor}
                  disabled={runningProc}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded text-xs font-semibold cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {runningProc ? "Executing Cursor..." : "Execute Procedure"}
                </button>
              </div>
            </div>

            {/* Stored Procedure Code */}
            <div className="p-3 bg-gray-900 text-gray-100 rounded text-xs font-mono">
              <span className="text-emerald-400 font-bold">// MySQL Stored Procedure with Cursor</span>
              <pre className="text-[11px] leading-relaxed text-gray-300 mt-1 overflow-x-auto whitespace-pre">
{`DELIMITER //
CREATE PROCEDURE sp_check_availability(
    IN p_venue_id INT, 
    IN p_date DATE, 
    OUT p_is_available BOOLEAN
)
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE b_date DATE;
    DECLARE cur CURSOR FOR 
        SELECT booking_date FROM bookings WHERE venue_id = p_venue_id AND status = 'CONFIRMED';
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    SET p_is_available = TRUE;

    OPEN cur;
    read_loop: LOOP
        FETCH cur INTO b_date;
        IF done THEN LEAVE read_loop; END IF;
        IF b_date = p_date THEN
            SET p_is_available = FALSE;
            LEAVE read_loop;
        END IF;
    END LOOP;
    CLOSE cur;
END //
DELIMITER ;`}
              </pre>
            </div>

            {/* Output */}
            {procResult && (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-gray-500">Procedure Invoked:</span>
                  <span className="font-mono font-bold text-gray-900">{procResult.procedureInvoked}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-gray-500">Result:</span>
                  <span className={`px-2 py-0.5 rounded font-mono font-bold text-xs ${
                    procResult.isAvailable ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                  }`}>
                    {procResult.isAvailable ? "TRUE (SLOT IS VACANT)" : "FALSE (SLOT IS OCCUPIED)"}
                  </span>
                </div>
                <p className="text-[11px] text-gray-600 font-mono bg-white p-2 rounded border border-gray-200 mt-1">
                  {procResult.statusExplanation}
                </p>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB 6: B-TREE INDEXES
           ========================================================================= */}
        {activeTab === "indexes" && (
          <div className="bg-white border border-gray-200 rounded p-5 shadow-xs space-y-4">
            <div>
              <h3 className="text-xs font-bold text-gray-900 font-mono uppercase tracking-wider">
                B-Tree Indexing &amp; Query Optimization
              </h3>
              <p className="text-xs text-gray-500">
                Explicit secondary indexes created to prevent full table scans on large datasets
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 border border-gray-200 rounded">
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">
                  B-TREE INDEX
                </span>
                <h4 className="text-sm font-bold text-gray-900 font-mono mt-2">idx_booking_date</h4>
                <p className="text-xs text-gray-500 mt-1">On table: <code className="font-mono">bookings(booking_date)</code></p>
                <p className="text-[11px] text-gray-600 mt-2 leading-relaxed">
                  Optimizes daily calendar lookups and date-range queries from O(N) to O(log N).
                </p>
              </div>

              <div className="p-4 bg-gray-50 border border-gray-200 rounded">
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">
                  B-TREE INDEX
                </span>
                <h4 className="text-sm font-bold text-gray-900 font-mono mt-2">idx_venue_id</h4>
                <p className="text-xs text-gray-500 mt-1">On table: <code className="font-mono">bookings(venue_id)</code></p>
                <p className="text-[11px] text-gray-600 mt-2 leading-relaxed">
                  Optimizes relational JOIN predicates when aggregating venue reservation history.
                </p>
              </div>

              <div className="p-4 bg-gray-50 border border-gray-200 rounded">
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 font-bold">
                  COMPOSITE INDEX
                </span>
                <h4 className="text-sm font-bold text-gray-900 font-mono mt-2">idx_status_date</h4>
                <p className="text-xs text-gray-500 mt-1">On table: <code className="font-mono">bookings(status, booking_date)</code></p>
                <p className="text-[11px] text-gray-600 mt-2 leading-relaxed">
                  Enables index-only scans for active confirmed bookings filtering.
                </p>
              </div>
            </div>

            <div className="p-3 bg-gray-900 text-gray-100 rounded text-xs font-mono">
              <span className="text-emerald-400 font-bold">// DDL Statements for Index Creation</span>
              <pre className="text-[11px] leading-relaxed text-gray-300 mt-1 overflow-x-auto whitespace-pre">
{`CREATE INDEX idx_booking_date ON bookings(booking_date);
CREATE INDEX idx_venue_id ON bookings(venue_id);
CREATE INDEX idx_status_date ON bookings(status, booking_date);`}
              </pre>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 7: INTERACTIVE SQL QUERY CONSOLE
           ========================================================================= */}
        {activeTab === "console" && (
          <div className="bg-white border border-gray-200 rounded p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-200 gap-3">
              <div>
                <h3 className="text-xs font-bold text-gray-900 font-mono uppercase tracking-wider">
                  Interactive SQL Terminal
                </h3>
                <p className="text-xs text-gray-500">
                  Execute live SELECT queries against the MySQL database with instant tabular output
                </p>
              </div>

              {/* Quick Query Shortcuts */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => {
                    const q = "SELECT * FROM venues;";
                    setSqlInput(q);
                    handleExecuteConsoleQuery(q);
                  }}
                  className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-xs font-mono"
                >
                  All Venues
                </button>
                <button
                  onClick={() => {
                    const q = "SELECT * FROM vw_venue_utilization;";
                    setSqlInput(q);
                    handleExecuteConsoleQuery(q);
                  }}
                  className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-xs font-mono"
                >
                  View Utilization
                </button>
                <button
                  onClick={() => {
                    const q = "SELECT b.booking_id, v.name, o.department, b.booking_date, b.status FROM bookings b JOIN venues v ON b.venue_id = v.venue_id JOIN organizers o ON b.organizer_id = o.organizer_id;";
                    setSqlInput(q);
                    handleExecuteConsoleQuery(q);
                  }}
                  className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-xs font-mono"
                >
                  3-Table Join
                </button>
              </div>
            </div>

            {/* Query Editor */}
            <div className="space-y-2">
              <textarea
                value={sqlInput}
                onChange={(e) => setSqlInput(e.target.value)}
                rows={4}
                className="w-full p-3 bg-gray-900 text-emerald-400 font-mono text-xs rounded border border-gray-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 leading-relaxed"
                placeholder="Type your SELECT query here..."
              />
              <div className="flex justify-end">
                <button
                  onClick={() => handleExecuteConsoleQuery()}
                  disabled={runningConsole}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 rounded text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>{runningConsole ? "Executing Query..." : "Execute Query"}</span>
                </button>
              </div>
            </div>

            {consoleError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-700 font-mono">
                Error: {consoleError}
              </div>
            )}

            {/* Results Grid */}
            {consoleResult && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-gray-500 font-mono">
                  <span>Returned {consoleResult.rowCount} rows</span>
                  <span>Execution time: {consoleResult.executionTimeMs}ms</span>
                </div>

                <div className="overflow-x-auto border border-gray-200 rounded max-h-80 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 border-b border-gray-200 font-mono text-[11px] text-gray-700 uppercase sticky top-0">
                      <tr>
                        {consoleResult.columns.map((c) => (
                          <th key={c} className="py-2.5 px-3 whitespace-nowrap bg-gray-50">
                            {c}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-mono text-[11px]">
                      {consoleResult.rows.map((row, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          {consoleResult.columns.map((c) => (
                            <td key={c} className="py-2 px-3 whitespace-nowrap">
                              {String(row[c] ?? "NULL")}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
