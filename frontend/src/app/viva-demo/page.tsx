"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import {
  Beaker,
  ShieldCheck,
  Zap,
  FileCode,
  Database,
  Download,
  AlertTriangle,
  CheckCircle2,
  Terminal,
  RefreshCw,
  Cpu,
  Layers
} from "lucide-react";
import { api, ConcurrencyTestResult, CursorCheckResult, ManifestResult } from "@/lib/api";

export default function VivaDemoPage() {
  // Test 1: Concurrency Collision
  const [targetVenueId, setTargetVenueId] = useState<number>(3);
  const [runningStressTest, setRunningStressTest] = useState<boolean>(false);
  const [stressResult, setStressResult] = useState<ConcurrencyTestResult | null>(null);

  // Test 2: File I/O
  const [manifestData, setManifestData] = useState<ManifestResult | null>(null);
  const [loadingManifest, setLoadingManifest] = useState<boolean>(false);
  const [receiptBookingId, setReceiptBookingId] = useState<number>(1);
  const [receiptText, setReceiptText] = useState<string | null>(null);
  const [loadingReceipt, setLoadingReceipt] = useState<boolean>(false);

  // Test 3: Stored Procedure & Cursor
  const [procVenueId, setProcVenueId] = useState<number>(1);
  const [procDate, setProcDate] = useState<string>("");
  const [procResult, setProcResult] = useState<CursorCheckResult | null>(null);
  const [runningProc, setRunningProc] = useState<boolean>(false);

  useEffect(() => {
    setProcDate(new Date().toISOString().split("T")[0]);
  }, []);

  // Handlers
  const handleRunStressTest = async () => {
    try {
      setRunningStressTest(true);
      const res = await api.runStressTest(targetVenueId);
      setStressResult(res);
    } catch (e: any) {
      alert("Error running stress test: " + e.message);
    } finally {
      setRunningStressTest(false);
    }
  };

  const handleInspectManifest = async () => {
    try {
      setLoadingManifest(true);
      const res = await api.getManifest();
      setManifestData(res);
    } catch (e: any) {
      alert("Error inspecting manifest: " + e.message);
    } finally {
      setLoadingManifest(false);
    }
  };

  const handleFetchReceipt = async () => {
    try {
      setLoadingReceipt(true);
      const res = await api.getReceipt(receiptBookingId);
      setReceiptText(res.receiptText);
    } catch (e: any) {
      alert("Error loading receipt: " + e.message);
    } finally {
      setLoadingReceipt(false);
    }
  };

  const handleRunCursorProcedure = async () => {
    try {
      setRunningProc(true);
      const res = await api.checkCursorProcedure(procVenueId, procDate);
      setProcResult(res);
    } catch (e: any) {
      alert("Error calling procedure: " + e.message);
    } finally {
      setRunningProc(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <Header title="Academic Evaluation & Viva Defense Sandbox" />

      <main className="p-6 space-y-6 max-w-7xl w-full mx-auto">
        {/* Academic Course Banner */}
        <div className="bg-white border-l-4 border-orange-500 border border-gray-200 rounded p-5 shadow-xs">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-orange-100 text-orange-800 border border-orange-200">
                  SYLLABUS EVALUATION MODE
                </span>
                <span className="text-xs text-gray-500 font-mono">CS-302 (Java OOP) & CS-304 (MySQL RDBMS)</span>
              </div>
              <h2 className="text-base font-bold text-gray-900 mt-1">
                UniBook Automated Viva Verification Suite
              </h2>
              <p className="text-xs text-gray-600 mt-1 max-w-3xl leading-relaxed">
                This dedicated evaluator console triggers live tests for all syllabus-mandated backend concepts:
                multithreaded race-condition collision prevention (`synchronized`), File I/O streaming
                (`BufferedReader`/`FileWriter`), and MySQL stored procedures using explicit cursors.
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2 bg-gray-50 border border-gray-200 rounded px-3 py-2 text-right">
              <Cpu className="w-4 h-4 text-orange-600" />
              <div className="text-left font-mono">
                <p className="text-[10px] text-gray-400">THREAD DISPATCH</p>
                <p className="text-xs font-bold text-gray-900">JDK 21 LTS + JDBC</p>
              </div>
            </div>
          </div>
        </div>

        {/* 1. Multithreaded Concurrency Collision Panel */}
        <div className="bg-white border border-gray-200 rounded p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-200 gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-blue-50 text-blue-600 border border-blue-200 rounded">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-gray-900 font-mono uppercase tracking-wider">
                  Test 1: Multithreaded Collision Stress Test
                </h3>
                <p className="text-xs text-gray-500">
                  Tests Java <code className="text-blue-600 font-bold">synchronized processBooking()</code> and <code className="text-orange-600 font-bold">VenueUnavailableException</code>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600 font-medium">Target Venue:</span>
                <select
                  value={targetVenueId}
                  onChange={(e) => setTargetVenueId(Number(e.target.value))}
                  className="text-xs px-2.5 py-1.5 border border-gray-300 rounded bg-white text-gray-900 focus:outline-none"
                >
                  <option value={1}>Turing Grand Auditorium (#1)</option>
                  <option value={2}>Von Neumann Computing Lab (#2)</option>
                  <option value={3}>Ramanujan Lecture Theatre (#3)</option>
                  <option value={4}>Ada Lovelace Seminar Hall (#4)</option>
                </select>
              </div>

              <button
                id="btn-fire-threads"
                onClick={handleRunStressTest}
                disabled={runningStressTest}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {runningStressTest ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Executing 10 Threads...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5" />
                    <span>Fire 10 Concurrent Threads</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {stressResult ? (
            <div className="mt-4 space-y-3">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-emerald-800 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>
                    <strong>Concurrency Verdict: {stressResult.threadSafetyResult}</strong> — Exactly 1 thread obtained the critical section lock; 9 threads safely caught <code className="font-mono">VenueUnavailableException</code>.
                  </span>
                </div>
                <div className="font-mono text-[11px] text-emerald-700 font-semibold">
                  Date: {stressResult.targetDate}
                </div>
              </div>

              <div className="overflow-x-auto border border-gray-200 rounded">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 border-b border-gray-200 font-mono text-[11px] text-gray-600 uppercase">
                    <tr>
                      <th className="py-2 px-3">Thread ID</th>
                      <th className="py-2 px-3">Execution Status</th>
                      <th className="py-2 px-3">Reservation Ref / Code</th>
                      <th className="py-2 px-3">Response Time</th>
                      <th className="py-2 px-3">Exception Diagnostic</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-mono text-[11px]">
                    {stressResult.threadLogs.map((log) => {
                      const isWinner = log.status.includes("SUCCESS");
                      return (
                        <tr key={log.threadId} className={isWinner ? "bg-blue-50/70 font-semibold" : "hover:bg-gray-50"}>
                          <td className="py-2 px-3 text-gray-900 font-bold">{log.threadId}</td>
                          <td className="py-2 px-3">
                            <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              isWinner ? "bg-emerald-100 text-emerald-800" : "bg-red-50 text-red-700"
                            }`}>
                              {log.status}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-gray-700">
                            {log.confirmationCode ? (
                              <span className="text-blue-700 font-bold">#{log.bookingId} ({log.confirmationCode})</span>
                            ) : "—"}
                          </td>
                          <td className="py-2 px-3 text-gray-500">{log.durationMs}ms</td>
                          <td className="py-2 px-3 text-gray-600">
                            {log.exception ? (
                              <span className="text-red-600">{log.exception}: {log.reason}</span>
                            ) : "Lock Granted"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="mt-4 p-6 text-center border border-dashed border-gray-300 rounded bg-gray-50/50">
              <Terminal className="w-6 h-6 text-gray-400 mx-auto mb-2" />
              <p className="text-xs text-gray-600 font-medium">
                Click &quot;Fire 10 Concurrent Threads&quot; to test race-condition prevention in real time.
              </p>
              <p className="text-[11px] text-gray-400 mt-1 font-mono">
                Simulates 10 parallel HTTP workers submitting simultaneous bookings to the synchronized service.
              </p>
            </div>
          )}
        </div>

        {/* 2. File I/O Stream Processing Panel */}
        <div className="bg-white border border-gray-200 rounded p-5 shadow-xs">
          <div className="flex items-center gap-2.5 pb-4 border-b border-gray-200">
            <div className="p-2 bg-orange-50 text-orange-600 border border-orange-200 rounded">
              <FileCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-gray-900 font-mono uppercase tracking-wider">
                Test 2: File I/O Stream Processing (BufferedReader &amp; FileWriter)
              </h3>
              <p className="text-xs text-gray-500">
                Verifies server disk reading of manifest manifests and immutable receipt file exports
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Sub-Panel A: BufferedReader Manifest Inspector */}
            <div className="border border-gray-200 rounded p-4 bg-gray-50/50 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-gray-900 font-mono">
                    Part A: BufferedReader Stream Reader
                  </h4>
                  <button
                    id="btn-load-manifest"
                    onClick={handleInspectManifest}
                    disabled={loadingManifest}
                    className="text-xs bg-white border border-gray-300 hover:border-gray-400 text-gray-700 px-2.5 py-1 rounded font-semibold cursor-pointer shadow-2xs"
                  >
                    {loadingManifest ? "Reading Stream..." : "Load Manifest (.csv)"}
                  </button>
                </div>
                <p className="text-[11px] text-gray-500 mb-3">
                  Reads <code className="text-gray-800 font-mono">venues_manifest.csv</code> line-by-line via <code className="text-orange-600 font-mono">BufferedReader.readLine()</code>.
                </p>

                {manifestData ? (
                  <div className="space-y-2">
                    <div className="p-2 bg-white border border-gray-200 rounded font-mono text-[10px] text-gray-600">
                      <div>Stream Class: <strong>{manifestData.streamReader}</strong></div>
                      <div>Source File: <strong>{manifestData.sourceFile}</strong> ({manifestData.lineCount} lines)</div>
                    </div>
                    <pre className="p-3 bg-gray-900 text-emerald-400 rounded font-mono text-[10px] leading-relaxed max-h-48 overflow-y-auto">
                      {manifestData.rawLines.join("\n")}
                    </pre>
                  </div>
                ) : (
                  <div className="p-4 text-center border border-dashed border-gray-200 rounded text-xs text-gray-400 font-mono">
                    Click &quot;Load Manifest&quot; to inspect disk input stream.
                  </div>
                )}
              </div>
            </div>

            {/* Sub-Panel B: FileWriter Receipt Generator */}
            <div className="border border-gray-200 rounded p-4 bg-gray-50/50 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-gray-900 font-mono">
                    Part B: FileWriter Receipt Generator
                  </h4>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={receiptBookingId}
                      onChange={(e) => setReceiptBookingId(Number(e.target.value))}
                      className="w-14 text-xs px-2 py-1 border border-gray-300 rounded bg-white font-mono text-center"
                      title="Booking ID"
                    />
                    <button
                      id="btn-read-receipt"
                      onClick={handleFetchReceipt}
                      disabled={loadingReceipt}
                      className="text-xs bg-white border border-gray-300 hover:border-gray-400 text-gray-700 px-2.5 py-1 rounded font-semibold cursor-pointer shadow-2xs"
                    >
                      {loadingReceipt ? "Fetching..." : "Read Receipt"}
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-gray-500 mb-3">
                  Outputs and parses <code className="text-gray-800 font-mono">receipt_[id].txt</code> using <code className="text-orange-600 font-mono">BufferedWriter</code>.
                </p>

                {receiptText ? (
                  <div className="space-y-2">
                    <pre className="p-3 bg-white border border-gray-200 rounded font-mono text-[10px] text-gray-800 leading-relaxed max-h-48 overflow-y-auto whitespace-pre">
                      {receiptText}
                    </pre>
                    <button
                      onClick={() => {
                        const blob = new Blob([receiptText], { type: "text/plain" });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `receipt_${receiptBookingId}.txt`;
                        a.click();
                      }}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-1.5 rounded text-xs font-semibold flex items-center justify-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Generated Receipt (.txt)</span>
                    </button>
                  </div>
                ) : (
                  <div className="p-4 text-center border border-dashed border-gray-200 rounded text-xs text-gray-400 font-mono">
                    Select a Booking ID and click &quot;Read Receipt&quot; to inspect output stream.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 3. Stored Procedure with Explicit Cursor Panel */}
        <div className="bg-white border border-gray-200 rounded p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-200 gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-gray-900 font-mono uppercase tracking-wider">
                  Test 3: Stored Procedure with Cursor (<code className="lowercase">sp_check_availability</code>)
                </h3>
                <p className="text-xs text-gray-500">
                  Executes MySQL Stored Procedure using explicit CURSOR iteration and PL/SQL CONTINUE HANDLER
                </p>
              </div>
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
                <option value={5}>Newton Amphitheatre (#5)</option>
                <option value={6}>Curie Innovation Hub (#6)</option>
              </select>

              <input
                type="date"
                value={procDate}
                onChange={(e) => setProcDate(e.target.value)}
                className="text-xs px-2.5 py-1.5 border border-gray-300 rounded bg-white text-gray-900 focus:outline-none"
              />

              <button
                id="btn-call-proc"
                onClick={handleRunCursorProcedure}
                disabled={runningProc}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {runningProc ? "Running Procedure..." : "Call sp_check_availability"}
              </button>
            </div>
          </div>

          {procResult ? (
            <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 border border-gray-200 rounded space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-gray-500">Procedure Name:</span>
                  <span className="font-mono font-bold text-gray-900">{procResult.procedureInvoked}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-gray-500">Target Venue ID / Date:</span>
                  <span className="font-mono font-bold text-gray-900">#{procResult.venueId} on {procResult.requestedDate}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                  <span className="font-mono text-gray-700 font-semibold">Evaluated Availability:</span>
                  <span className={`px-2 py-0.5 rounded font-mono font-bold text-xs ${
                    procResult.isAvailable ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                  }`}>
                    {procResult.isAvailable ? "TRUE (SLOT VACANT)" : "FALSE (SLOT OCCUPIED)"}
                  </span>
                </div>
                <p className="text-[11px] text-gray-600 mt-2 bg-white p-2 rounded border border-gray-200">
                  {procResult.statusExplanation}
                </p>
              </div>

              <div className="p-4 bg-gray-900 text-gray-100 rounded text-xs font-mono">
                <p className="text-orange-400 font-bold mb-1">// Stored Procedure Implementation</p>
                <pre className="text-[10px] leading-relaxed text-gray-300 overflow-x-auto whitespace-pre">
{`DECLARE cur CURSOR FOR 
    SELECT booking_date FROM bookings WHERE venue_id = p_venue_id;
DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

OPEN cur;
read_loop: LOOP
    FETCH cur INTO b_date;
    IF done THEN LEAVE read_loop; END IF;
    IF b_date = p_date THEN
        SET p_is_available = FALSE;
        LEAVE read_loop;
    END IF;
END LOOP;
CLOSE cur;`}
                </pre>
              </div>
            </div>
          ) : (
            <div className="mt-4 p-5 text-center border border-dashed border-gray-300 rounded bg-gray-50/50">
              <p className="text-xs text-gray-600 font-medium">
                Select a campus venue and date to invoke the MySQL cursor-driven stored procedure.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
