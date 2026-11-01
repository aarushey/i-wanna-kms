import os
import base64
import subprocess
import re
from PIL import Image

WORKSPACE_DIR = r"c:\Users\HP\Desktop\i just want to kill myself again"
ASSETS_DIR = os.path.join(WORKSPACE_DIR, "report_assets")
HTML_OUTPUT = os.path.join(WORKSPACE_DIR, "report.html")
PDF_OUTPUT = os.path.join(WORKSPACE_DIR, "UniBook_RDBMS_Project_Lab_Report.pdf")

def get_base64_img(filename):
    path = os.path.join(ASSETS_DIR, filename)
    if not os.path.exists(path):
        print(f"Warning: {filename} does not exist at {path}")
        return ""
    with open(path, "rb") as f:
        data = base64.b64encode(f.read()).decode("utf-8")
    return f"data:image/png;base64,{data}"

print("Encoding screenshots...")
img_dashboard = get_base64_img("dashboard.png")
img_venues = get_base64_img("venues.png")
img_bookings = get_base64_img("bookings.png")
img_database = get_base64_img("database.png")
img_er_diagram = get_base64_img("er_diagram.png")
img_trigger = get_base64_img("db_trigger.png")
img_views = get_base64_img("db_views.png")
img_cursor = get_base64_img("db_cursor.png")
img_indexes = get_base64_img("db_indexes.png")
img_console = get_base64_img("db_console.png")
img_viva = get_base64_img("viva.png")

html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>UniBook - RDBMS Project Lab Report</title>
<style>
  @page {{
    size: A4 portrait;
    margin: 0;
  }}
  * {{
    box-sizing: border-box;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }}
  body {{
    margin: 0;
    padding: 0;
    font-family: 'Times New Roman', Times, serif;
    color: #111;
    background-color: #fff;
    font-size: 10pt;
    line-height: 1.4;
  }}
  .page {{
    width: 210mm;
    height: 297mm;
    padding: 16mm 20mm 16mm 20mm;
    page-break-after: always;
    position: relative;
    overflow: hidden;
    background-color: #fff;
  }}
  
  /* Running Header */
  .running-header {{
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    border-bottom: 1px solid #222;
    padding-bottom: 4px;
    margin-bottom: 18px;
    font-size: 9pt;
    font-style: italic;
    color: #333;
  }}
  .running-header .page-num {{
    font-style: normal;
    font-weight: bold;
    color: #111;
  }}
  
  /* Running Footer */
  .running-footer {{
    position: absolute;
    bottom: 14mm;
    left: 20mm;
    right: 20mm;
    border-top: 1px solid #ccc;
    padding-top: 5px;
    display: flex;
    justify-content: space-between;
    font-size: 8pt;
    color: #777;
    font-style: italic;
  }}

  /* Typography */
  h1.page-title {{
    font-size: 18pt;
    font-weight: bold;
    margin: 0 0 12px 0;
    color: #111;
  }}
  h2.section-heading {{
    font-size: 13pt;
    font-weight: bold;
    margin: 12px 0 6px 0;
    color: #111;
    border-bottom: 0.5px solid #ddd;
    padding-bottom: 2px;
  }}
  h3.sub-heading {{
    font-size: 10.5pt;
    font-weight: bold;
    margin: 8px 0 4px 0;
    color: #222;
  }}
  p {{
    margin: 0 0 7px 0;
    text-align: justify;
  }}
  ul, ol {{
    margin: 0 0 8px 0;
    padding-left: 20px;
  }}
  li {{
    margin-bottom: 3px;
  }}

  /* Code and Terminal Blocks */
  .code-block {{
    background-color: #f8f9fa;
    border: 1px solid #dcdfe3;
    border-left: 3px solid #0056b3;
    padding: 6px 10px;
    font-family: 'Consolas', 'Courier New', monospace;
    font-size: 8pt;
    line-height: 1.35;
    color: #1a1a1a;
    border-radius: 3px;
    margin: 6px 0 9px 0;
    white-space: pre;
    overflow: hidden;
  }}
  .sql-kw {{ color: #0033bb; font-weight: bold; }}
  .sql-func {{ color: #7a3e9d; font-weight: bold; }}
  .sql-str {{ color: #008000; }}
  .sql-cmnt {{ color: #888888; font-style: italic; }}

  .terminal-box {{
    background-color: #1e1e1e;
    color: #d4d4d4;
    border: 1px solid #333;
    padding: 6px 9px;
    font-family: 'Consolas', 'Courier New', monospace;
    font-size: 7.5pt;
    line-height: 1.3;
    border-radius: 4px;
    margin: 6px 0 9px 0;
    white-space: pre;
  }}
  .terminal-box .prompt {{ color: #4ec9b0; font-weight: bold; }}
  .terminal-box .accent {{ color: #ce9178; }}

  /* Screenshots */
  .screenshot-container {{
    text-align: center;
    margin: 6px 0 8px 0;
  }}
  .screenshot-img {{
    max-width: 100%;
    border: 1px solid #c8cbcf;
    border-radius: 4px;
    box-shadow: 0 1px 4px rgba(0,0,0,0.08);
    display: inline-block;
  }}
  .screenshot-caption {{
    font-size: 8pt;
    font-style: italic;
    color: #555;
    margin-top: 3px;
  }}

  /* Tables */
  table.data-table {{
    width: 100%;
    border-collapse: collapse;
    font-size: 8.5pt;
    margin: 6px 0 10px 0;
  }}
  table.data-table th {{
    background-color: #f1f3f5;
    border: 1px solid #ced4da;
    padding: 4px 6px;
    text-align: left;
    font-weight: bold;
    color: #212529;
  }}
  table.data-table td {{
    border: 1px solid #dee2e6;
    padding: 3.5px 6px;
    vertical-align: top;
  }}
  table.data-table tr:nth-child(even) {{
    background-color: #fafbfc;
  }}

  /* Badges & Pills */
  .badge {{
    display: inline-block;
    padding: 1px 5px;
    border-radius: 3px;
    font-size: 7.5pt;
    font-weight: bold;
    font-family: Consolas, monospace;
  }}
  .badge-pk {{ background-color: #e3f2fd; color: #0d47a1; border: 1px solid #bbdefb; }}
  .badge-fk {{ background-color: #fff3e0; color: #e65100; border: 1px solid #ffe0b2; }}
  .badge-chk {{ background-color: #e8f5e9; color: #1b5e20; border: 1px solid #c8e6c9; }}
  .badge-uq {{ background-color: #f3e5f5; color: #4a148c; border: 1px solid #e1bee7; }}

  /* Cover Page Specific */
  .cover-container {{
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 40mm 15mm 25mm 15mm;
    text-align: center;
  }}
  .cover-title {{
    font-size: 26pt;
    font-weight: bold;
    margin-bottom: 8px;
    color: #0f172a;
    letter-spacing: -0.5px;
  }}
  .cover-subtitle {{
    font-size: 15pt;
    font-weight: normal;
    color: #334155;
    margin-bottom: 35px;
  }}
  .cover-meta-box {{
    margin: 40px auto;
    font-size: 12pt;
    line-height: 1.8;
    color: #1e293b;
    max-width: 480px;
  }}
  .cover-meta-box strong {{
    color: #0f172a;
  }}
  .cover-footer-info {{
    font-size: 11pt;
    color: #475569;
    line-height: 1.6;
    border-top: 1px solid #cbd5e1;
    padding-top: 15px;
  }}
</style>
</head>
<body>

<!-- =========================================================================
     PAGE 1: TITLE PAGE
     ========================================================================= -->
<div class="page">
  <div class="running-header">
    <span>UniBook – Campus Event &amp; Venue Booking Dashboard</span>
    <span class="page-num">1</span>
  </div>

  <div class="cover-container">
    <div></div>
    <div>
      <div class="cover-title">Report: Campus Event &amp; Venue Booking Dashboard</div>
      <div class="cover-subtitle">Project Title: UniBook – An Enterprise Campus Event &amp; Venue Booking System</div>

      <div class="cover-meta-box">
        <div><strong>Author:</strong> Aarushi Singh</div>
        <div><strong>Registration Number:</strong> 2502052210</div>
        <div><strong>Course:</strong> Relational Database Management Systems (RDBMS) Lab</div>
        <div><strong>Department:</strong> Department of Computer Science &amp; Engineering</div>
      </div>
    </div>

    <div class="cover-footer-info">
      <div><strong>Date:</strong> 28th October 2026</div>
      <div><strong>Version:</strong> 1.0</div>
      <div style="font-size: 9.5pt; color: #64748b; margin-top: 4px;">Academic Lab Project • Relational Schema &amp; Advanced PL/SQL Engine</div>
    </div>
  </div>

  <div class="running-footer">
    <span>Project Lab Report • RDBMS</span>
    <span>Aarushi Singh (Reg No: 2502052210)</span>
  </div>
</div>

<!-- =========================================================================
     PAGE 2: TABLE OF CONTENTS
     ========================================================================= -->
<div class="page">
  <div class="running-header">
    <span>UniBook – Campus Event &amp; Venue Booking Dashboard</span>
    <span class="page-num">2</span>
  </div>

  <h1 class="page-title" style="margin-top: 15px; margin-bottom: 25px;">Table of Contents:</h1>

  <ol style="font-size: 11pt; line-height: 2.1; margin-left: 10px;">
    <li><strong>Introduction &amp; Problem Statement</strong> <span style="float: right; color: #444;">3</span></li>
    <li><strong>Functional Overview &amp; Core Modules</strong> <span style="float: right; color: #444;">3</span></li>
    <li><strong>System Architecture (Three-Tier Client-Server Architecture)</strong> <span style="float: right; color: #444;">3</span></li>
    <li><strong>Entity-Relationship (ER) Diagram &amp; Relational Cardinality</strong> <span style="float: right; color: #444;">4</span></li>
    <li><strong>Relational Database Schema &amp; Data Definition Language (DDL)</strong> <span style="float: right; color: #444;">5</span></li>
    <li><strong>Advanced RDBMS Mechanisms: Automated PL/SQL Triggers</strong> <span style="float: right; color: #444;">6</span></li>
    <li><strong>Analytical Relational Views &amp; Complex Outer Joins</strong> <span style="float: right; color: #444;">7</span></li>
    <li><strong>Stored Procedures &amp; Explicit Procedural Cursors</strong> <span style="float: right; color: #444;">8</span></li>
    <li><strong>Explicit Indexing Architecture &amp; B-Tree Query Optimization</strong> <span style="float: right; color: #444;">9</span></li>
    <li><strong>Implementation Details: Operational Dashboard &amp; Campus Venues</strong> <span style="float: right; color: #444;">10</span></li>
    <li><strong>Implementation Details: Event Reservations, Concurrency &amp; SQL Studio</strong> <span style="float: right; color: #444;">11</span></li>
    <li><strong>Conclusion, Future Enhancements &amp; Academic References</strong> <span style="float: right; color: #444;">12</span></li>
  </ol>

  <div style="margin-top: 50px; padding: 15px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; font-size: 9.5pt; color: #475569; line-height: 1.6;">
    <strong style="color: #0f172a;">Executive Notice:</strong> This project report documents the comprehensive database engineering, relational algebra, constraint enforcement, and full-stack software integration for the <strong>UniBook</strong> platform. Designed specifically for academic evaluation in Relational Database Management Systems, this report details each technical artifact alongside verifiable schema definitions, query execution plans, and live screenshots.
  </div>

  <div class="running-footer">
    <span>Project Lab Report • RDBMS</span>
    <span>Page 2</span>
  </div>
</div>

<!-- =========================================================================
     PAGE 3: INTRODUCTION, FUNCTIONAL OVERVIEW & SYSTEM ARCHITECTURE
     ========================================================================= -->
<div class="page">
  <div class="running-header">
    <span>UniBook – Campus Event &amp; Venue Booking Dashboard</span>
    <span class="page-num">3</span>
  </div>

  <h1 class="page-title">1. Introduction</h1>
  <p>
    Academic institutions and university campuses operate dozens of physical facilities—ranging from multi-tier auditoriums, lecture halls, and amphitheaters to specialized computer labs and seminar rooms. Efficiently allocating these shared physical spaces across diverse academic faculties, student councils, research societies, and visiting dignitaries poses a classic, high-stakes scheduling challenge. Legacy paper logbooks and disconnected spreadsheets frequently suffer from disastrous double-booking anomalies, orphaned reservations, lack of utilization metrics, and zero real-time visibility.
  </p>
  <p>
    The <strong>UniBook Campus Event &amp; Venue Booking Dashboard</strong> project was conceived and engineered to resolve this challenge through a mathematically sound, relational database architecture. Built upon MySQL 8.0 (InnoDB) and coupled with a modern three-tier web application, UniBook enforces absolute conflict-free scheduling through database-level constraints, provides automated denormalized counters via triggers, and exposes analytical views for real-time campus capacity planning.
  </p>

  <h2 class="section-heading">2. Functional Overview</h2>
  <p>The UniBook platform encompasses the following operational capabilities:</p>
  <ul>
    <li><strong>Campus Venue Inventory Management:</strong> Centralized registry tracking room names, campus buildings, maximum seating capacities, and lifetime reservation counters.</li>
    <li><strong>Conflict-Free Event Reservation:</strong> Guarantees that no venue can be reserved by multiple organizers on the same calendar date, strictly enforced at the RDBMS constraint layer.</li>
    <li><strong>Analytical Utilization Tracking:</strong> Computes instantaneous and monthly room utilization percentages across all campus facilities via relational views.</li>
    <li><strong>Thread-Safe Concurrency &amp; ACID Transactions:</strong> Handles simultaneous booking attempts through synchronized transaction locks, preventing race conditions under high concurrent student load.</li>
    <li><strong>RDBMS Live Studio &amp; SQL Query Console:</strong> Interactive laboratory interface enabling academic evaluators to directly execute queries, inspect raw table records, fire triggers, and step through cursor procedures.</li>
  </ul>

  <h2 class="section-heading">3. System Architecture</h2>
  <p>The platform follows the classic three-tier enterprise client-server architectural model:</p>
  <ol>
    <li><strong>Presentation Layer (Frontend):</strong> Implemented in <strong>Next.js 16 (Turbopack)</strong>, <strong>React 19</strong>, and <strong>TypeScript</strong>. Delivers a high-density, professional light-mode dashboard styled with Tailwind CSS, featuring snappy, zero-latency interactions and dedicated live inspection views.</li>
    <li><strong>Application Layer (Business Logic):</strong> Implemented in <strong>Java 21</strong> utilizing an embedded lightweight HTTP REST server, structured around Object-Oriented principles, Data Access Object (DAO) patterns, and background daemon threads.</li>
    <li><strong>Data Layer (Relational Storage):</strong> Powered by <strong>MySQL 8.0</strong> running the <strong>InnoDB Storage Engine</strong>. Implements foreign key cascades, unique constraints, B-Tree indexes, automated PL/SQL triggers, analytical views, and stored procedures with explicit cursors.</li>
  </ol>

  <div class="running-footer">
    <span>Project Lab Report • RDBMS</span>
    <span>Page 3</span>
  </div>
</div>

<!-- =========================================================================
     PAGE 4: ER DIAGRAM & RELATIONAL MODEL
     ========================================================================= -->
<div class="page">
  <div class="running-header">
    <span>UniBook – Campus Event &amp; Venue Booking Dashboard</span>
    <span class="page-num">4</span>
  </div>

  <h1 class="page-title">4. Entity-Relationship (ER) Diagram</h1>
  <p>
    Here is the Entity-Relationship (ER) diagram that outlines the relational structure of the database for the UniBook Campus Event &amp; Venue Booking System:
  </p>

  <div class="screenshot-container" style="margin: 8px 0;">
    <img src="{img_er_diagram}" class="screenshot-img" style="max-height: 110mm; width: auto;" alt="UniBook ER Diagram">
    <div class="screenshot-caption">Figure 4.1: UniBook Relational ER Diagram illustrating Entity Cardinality and Constraints</div>
  </div>

  <h2 class="section-heading" style="margin-top: 6px;">Relational Schema Representation</h2>
  <p style="font-size: 8.5pt; margin-bottom: 6px;">
    The conceptual model is formalized into Third Normal Form (3NF) across three primary relation schemas:
  </p>
  <ul style="font-size: 8.5pt; line-height: 1.45;">
    <li><strong>ORGANIZERS</strong> (<span class="badge badge-pk">PK</span> <u>organizer_id</u>, name, department, contact_email, created_at)</li>
    <li><strong>VENUES</strong> (<span class="badge badge-pk">PK</span> <u>venue_id</u>, <span class="badge badge-uq">UQ</span> name, building, <span class="badge badge-chk">CHK</span> capacity, total_bookings, created_at)</li>
    <li><strong>BOOKINGS</strong> (<span class="badge badge-pk">PK</span> <u>booking_id</u>, <span class="badge badge-fk">FK</span> venue_id, <span class="badge badge-fk">FK</span> organizer_id, event_name, booking_date, <span class="badge badge-chk">CHK</span> status, created_at, <span class="badge badge-uq">UQ</span> [venue_id, booking_date])</li>
  </ul>

  <h2 class="section-heading" style="margin-top: 6px;">Entity &amp; Cardinality Analysis</h2>
  <ul style="font-size: 8.5pt; line-height: 1.4;">
    <li><strong>Organizers Entity:</strong> Represents campus departments, faculty heads, and student bodies holding legitimate event booking privileges.</li>
    <li><strong>Venues Entity:</strong> Represents physical university venues. Enforces unique naming and positive seating capacities (<code>capacity &gt; 0</code>). Maintains a trigger-updated counter <code>total_bookings</code>.</li>
    <li><strong>Bookings Entity (Relational Junction):</strong> Links an organizer to a venue on a designated calendar date. Enforces referential integrity with cascading deletes and a strict composite uniqueness constraint.</li>
    <li><strong>Cardinality Ratios:</strong>
      <ul>
        <li><code>Organizers</code> to <code>Bookings</code> is <strong>1 : N</strong> (One organizer can schedule multiple events across different dates).</li>
        <li><code>Venues</code> to <code>Bookings</code> is <strong>1 : N</strong> (One venue hosts multiple events over time, but strictly 1 booking per date).</li>
      </ul>
    </li>
  </ul>

  <div class="running-footer">
    <span>Project Lab Report • RDBMS</span>
    <span>Page 4</span>
  </div>
</div>

<!-- =========================================================================
     PAGE 5: DATABASE SCHEMA & DDL
     ========================================================================= -->
<div class="page">
  <div class="running-header">
    <span>UniBook – Campus Event &amp; Venue Booking Dashboard</span>
    <span class="page-num">5</span>
  </div>

  <h1 class="page-title">5. Database Schema (DDL)</h1>
  <p>
    Here are the table definitions for the three main entities in the system, demonstrating comprehensive Data Definition Language (DDL) integrity constraints:
  </p>

  <h3 class="sub-heading">Organizers Table</h3>
  <div class="code-block"><span class="sql-kw">CREATE TABLE IF NOT EXISTS</span> organizers (
    organizer_id <span class="sql-kw">INT AUTO_INCREMENT PRIMARY KEY</span>,
    name <span class="sql-kw">VARCHAR</span>(100) <span class="sql-kw">NOT NULL</span>,
    department <span class="sql-kw">VARCHAR</span>(100) <span class="sql-kw">NOT NULL</span>,
    contact_email <span class="sql-kw">VARCHAR</span>(120) <span class="sql-kw">NOT NULL</span>,
    created_at <span class="sql-kw">TIMESTAMP DEFAULT CURRENT_TIMESTAMP</span>
) <span class="sql-kw">ENGINE</span>=InnoDB;</div>

  <h3 class="sub-heading">Venues Table</h3>
  <div class="code-block"><span class="sql-kw">CREATE TABLE IF NOT EXISTS</span> venues (
    venue_id <span class="sql-kw">INT AUTO_INCREMENT PRIMARY KEY</span>,
    name <span class="sql-kw">VARCHAR</span>(100) <span class="sql-kw">NOT NULL UNIQUE</span>,
    building <span class="sql-kw">VARCHAR</span>(100) <span class="sql-kw">NOT NULL</span>,
    capacity <span class="sql-kw">INT NOT NULL CHECK</span> (capacity &gt; 0),
    total_bookings <span class="sql-kw">INT DEFAULT</span> 0,
    created_at <span class="sql-kw">TIMESTAMP DEFAULT CURRENT_TIMESTAMP</span>
) <span class="sql-kw">ENGINE</span>=InnoDB;</div>

  <h3 class="sub-heading">Bookings Table</h3>
  <div class="code-block"><span class="sql-kw">CREATE TABLE IF NOT EXISTS</span> bookings (
    booking_id <span class="sql-kw">INT AUTO_INCREMENT PRIMARY KEY</span>,
    venue_id <span class="sql-kw">INT NOT NULL</span>,
    organizer_id <span class="sql-kw">INT NOT NULL</span>,
    event_name <span class="sql-kw">VARCHAR</span>(150) <span class="sql-kw">NOT NULL</span>,
    booking_date <span class="sql-kw">DATE NOT NULL</span>,
    status <span class="sql-kw">VARCHAR</span>(20) <span class="sql-kw">DEFAULT</span> <span class="sql-str">'CONFIRMED'</span> 
           <span class="sql-kw">CHECK</span> (status <span class="sql-kw">IN</span> (<span class="sql-str">'CONFIRMED'</span>, <span class="sql-str">'CANCELLED'</span>, <span class="sql-str">'HOLD'</span>)),
    created_at <span class="sql-kw">TIMESTAMP DEFAULT CURRENT_TIMESTAMP</span>,
    <span class="sql-kw">CONSTRAINT</span> fk_booking_venue <span class="sql-kw">FOREIGN KEY</span> (venue_id) 
        <span class="sql-kw">REFERENCES</span> venues(venue_id) <span class="sql-kw">ON DELETE CASCADE</span>,
    <span class="sql-kw">CONSTRAINT</span> fk_booking_organizer <span class="sql-kw">FOREIGN KEY</span> (organizer_id) 
        <span class="sql-kw">REFERENCES</span> organizers(organizer_id) <span class="sql-kw">ON DELETE CASCADE</span>,
    <span class="sql-kw">CONSTRAINT</span> uq_venue_date <span class="sql-kw">UNIQUE</span> (venue_id, booking_date)
) <span class="sql-kw">ENGINE</span>=InnoDB;</div>

  <h2 class="section-heading">Integrity Constraint Justifications</h2>
  <ul style="font-size: 8.5pt; line-height: 1.4;">
    <li><strong>Entity Integrity:</strong> Surrogates <code>organizer_id</code>, <code>venue_id</code>, and <code>booking_id</code> are defined with <code>AUTO_INCREMENT PRIMARY KEY</code>, establishing guaranteed row uniqueness.</li>
    <li><strong>Referential Integrity:</strong> <code>ON DELETE CASCADE</code> maintains relational validity by automatically pruning associated reservations whenever a venue or department record is decommissioned.</li>
    <li><strong>Composite Uniqueness (<code>uq_venue_date</code>):</strong> Enforces the physical law of room scheduling at the database kernel level—no two rows can share the exact same <code>venue_id</code> and <code>booking_date</code>.</li>
    <li><strong>Domain Integrity (<code>CHECK</code>):</strong> Prevents illogical inputs such as non-positive venue capacities (<code>capacity &gt; 0</code>) or invalid reservation lifecycle transitions.</li>
  </ul>

  <div class="running-footer">
    <span>Project Lab Report • RDBMS</span>
    <span>Page 5</span>
  </div>
</div>

<!-- =========================================================================
     PAGE 6: AUTOMATED PL/SQL TRIGGERS
     ========================================================================= -->
<div class="page">
  <div class="running-header">
    <span>UniBook – Campus Event &amp; Venue Booking Dashboard</span>
    <span class="page-num">6</span>
  </div>

  <h1 class="page-title">6. Advanced RDBMS: Automated PL/SQL Triggers</h1>
  <p>
    In relational database design, triggers represent active rules that execute automatically in response to specific Data Manipulation Language (DML) events (INSERT, UPDATE, DELETE). UniBook utilizes triggers to maintain real-time denormalized summary statistics without placing the burden of synchronization on application-level queries.
  </p>

  <h2 class="section-heading">Trigger Definition: After_Booking_Insert</h2>
  <p>
    The trigger <code>After_Booking_Insert</code> automatically increments the lifetime reservation counter <code>total_bookings</code> in the <code>venues</code> table whenever a new booking is inserted into the <code>bookings</code> table:
  </p>

  <div class="code-block"><span class="sql-kw">USE</span> unibook_db;
<span class="sql-kw">DROP TRIGGER IF EXISTS</span> After_Booking_Insert;

<span class="sql-kw">DELIMITER</span> //
<span class="sql-kw">CREATE TRIGGER</span> After_Booking_Insert
<span class="sql-kw">AFTER INSERT ON</span> bookings
<span class="sql-kw">FOR EACH ROW</span>
<span class="sql-kw">BEGIN</span>
    <span class="sql-kw">UPDATE</span> venues 
    <span class="sql-kw">SET</span> total_bookings = total_bookings + 1 
    <span class="sql-kw">WHERE</span> venue_id = <span class="sql-kw">NEW</span>.venue_id;
<span class="sql-kw">END</span> //
<span class="sql-kw">DELIMITER</span> ;</div>

  <div class="screenshot-container">
    <img src="{img_trigger}" class="screenshot-img" style="max-height: 82mm; width: auto;" alt="Live Trigger Verification">
    <div class="screenshot-caption">Figure 6.1: Live Verification of Automated PL/SQL Trigger Execution in Database Studio</div>
  </div>

  <h2 class="section-heading">Architectural &amp; Performance Justification</h2>
  <p style="font-size: 8.5pt;">
    Calculating the popularity or lifetime usage of venues by repeatedly executing aggregate queries (<code>SELECT COUNT(*) FROM bookings WHERE venue_id = ?</code>) incurs a high computational cost on high-traffic dashboards, requiring repeated B-Tree index scans. By delegating counter increments to an <code>AFTER INSERT</code> database trigger:
  </p>
  <ul style="font-size: 8.5pt;">
    <li><strong>Transactional Atomicity:</strong> The counter update executes within the same atomic transaction scope as the booking insertion. If the booking transaction rolls back, the counter modification is discarded.</li>
    <li><strong>Zero Application Overhead:</strong> Any client inserting a row (REST API, batch ETL script, direct SQL terminal) automatically updates the counter without writing redundant application logic.</li>
  </ul>

  <div class="running-footer">
    <span>Project Lab Report • RDBMS</span>
    <span>Page 6</span>
  </div>
</div>

<!-- =========================================================================
     PAGE 7: RELATIONAL VIEWS & ANALYTICAL AGGREGATIONS
     ========================================================================= -->
<div class="page">
  <div class="running-header">
    <span>UniBook – Campus Event &amp; Venue Booking Dashboard</span>
    <span class="page-num">7</span>
  </div>

  <h1 class="page-title">7. Analytical Relational Views &amp; Outer Joins</h1>
  <p>
    A relational view acts as a virtual table defined by an underlying SQL query. Views provide logical data independence, simplify complex reporting queries, and safeguard base tables by presenting calculated projections without storing redundant data on disk.
  </p>

  <h2 class="section-heading">View Definition: vw_venue_utilization</h2>
  <p>
    The analytical view <code>vw_venue_utilization</code> combines facility inventory metadata with real-time reservation aggregates to calculate active booking counts and 30-day capacity utilization rates:
  </p>

  <div class="code-block"><span class="sql-kw">CREATE OR REPLACE VIEW</span> vw_venue_utilization <span class="sql-kw">AS</span>
<span class="sql-kw">SELECT</span> 
    v.venue_id, 
    v.name <span class="sql-kw">AS</span> venue_name, 
    v.building,
    v.capacity, 
    v.total_bookings <span class="sql-kw">AS</span> lifetime_bookings,
    <span class="sql-func">COUNT</span>(b.booking_id) <span class="sql-kw">AS</span> current_active_bookings,
    <span class="sql-func">ROUND</span>((<span class="sql-func">COUNT</span>(b.booking_id) / 30.0) * 100, 1) <span class="sql-kw">AS</span> monthly_utilization_rate
<span class="sql-kw">FROM</span> venues v
<span class="sql-kw">LEFT OUTER JOIN</span> bookings b 
    <span class="sql-kw">ON</span> v.venue_id = b.venue_id 
    <span class="sql-kw">AND</span> b.status = <span class="sql-str">'CONFIRMED'</span>
<span class="sql-kw">GROUP BY</span> 
    v.venue_id, v.name, v.building, v.capacity, v.total_bookings;</div>

  <div class="screenshot-container">
    <img src="{img_views}" class="screenshot-img" style="max-height: 82mm; width: auto;" alt="Live Relational View Explorer">
    <div class="screenshot-caption">Figure 7.1: Live Relational View Explorer demonstrating LEFT OUTER JOIN and Calculated Utilization</div>
  </div>

  <h2 class="section-heading">Relational Algebra &amp; Join Analysis</h2>
  <p style="font-size: 8.5pt;">
    <strong>Requirement of LEFT OUTER JOIN:</strong> An ordinary <code>INNER JOIN</code> would automatically filter out newly registered campus facilities or dormant rooms having zero confirmed reservations (e.g., <em>Curie Innovation Hub</em>). By utilizing a <code>LEFT OUTER JOIN</code>, every tuple in <code>venues</code> is preserved in the projected relation, correctly evaluating <code>COUNT(b.booking_id)</code> to 0 and utilization to 0.0%.
  </p>

  <div class="running-footer">
    <span>Project Lab Report • RDBMS</span>
    <span>Page 7</span>
  </div>
</div>

<!-- =========================================================================
     PAGE 8: STORED PROCEDURES & EXPLICIT CURSORS
     ========================================================================= -->
<div class="page">
  <div class="running-header">
    <span>UniBook – Campus Event &amp; Venue Booking Dashboard</span>
    <span class="page-num">8</span>
  </div>

  <h1 class="page-title">8. Stored Procedures &amp; Explicit Cursors</h1>
  <p>
    Stored procedures are pre-compiled SQL modules stored directly within the database catalog. When business logic demands row-by-row procedural traversal over a set of tuples rather than set-oriented operations, PL/SQL <strong>Cursors</strong> provide explicit pointer navigation.
  </p>

  <h2 class="section-heading">Stored Procedure Definition: sp_check_availability</h2>
  <div class="code-block"><span class="sql-kw">DELIMITER</span> //
<span class="sql-kw">CREATE PROCEDURE</span> sp_check_availability(
    <span class="sql-kw">IN</span> p_venue_id <span class="sql-kw">INT</span>, 
    <span class="sql-kw">IN</span> p_date <span class="sql-kw">DATE</span>, 
    <span class="sql-kw">OUT</span> p_is_available <span class="sql-kw">BOOLEAN</span>
)
<span class="sql-kw">BEGIN</span>
    <span class="sql-kw">DECLARE</span> done <span class="sql-kw">INT DEFAULT</span> FALSE;
    <span class="sql-kw">DECLARE</span> b_date <span class="sql-kw">DATE</span>;
    <span class="sql-kw">DECLARE</span> cur <span class="sql-kw">CURSOR FOR</span> 
        <span class="sql-kw">SELECT</span> booking_date <span class="sql-kw">FROM</span> bookings 
        <span class="sql-kw">WHERE</span> venue_id = p_venue_id <span class="sql-kw">AND</span> status = <span class="sql-str">'CONFIRMED'</span>;
    <span class="sql-kw">DECLARE CONTINUE HANDLER FOR NOT FOUND SET</span> done = TRUE;

    <span class="sql-kw">SET</span> p_is_available = TRUE;
    <span class="sql-kw">OPEN</span> cur;
    read_loop: <span class="sql-kw">LOOP</span>
        <span class="sql-kw">FETCH</span> cur <span class="sql-kw">INTO</span> b_date;
        <span class="sql-kw">IF</span> done <span class="sql-kw">THEN LEAVE</span> read_loop; <span class="sql-kw">END IF</span>;
        <span class="sql-kw">IF</span> b_date = p_date <span class="sql-kw">THEN</span>
            <span class="sql-kw">SET</span> p_is_available = FALSE;
            <span class="sql-kw">LEAVE</span> read_loop;
        <span class="sql-kw">END IF</span>;
    <span class="sql-kw">END LOOP</span>;
    <span class="sql-kw">CLOSE</span> cur;
<span class="sql-kw">END</span> //
<span class="sql-kw">DELIMITER</span> ;</div>

  <div class="screenshot-container">
    <img src="{img_cursor}" class="screenshot-img" style="max-height: 80mm; width: auto;" alt="Live Stored Procedure & Cursor Inspector">
    <div class="screenshot-caption">Figure 8.1: Live Cursor Traversal and Availability Output in Database Studio</div>
  </div>

  <h2 class="section-heading">Cursor Execution Lifecycle</h2>
  <ol style="font-size: 8.5pt;">
    <li><strong>Declaration:</strong> Defines the select query and establishes pointer workspace.</li>
    <li><strong>Continue Handler:</strong> Traps the <code>NOT FOUND</code> state, gracefully toggling loop termination.</li>
    <li><strong>Open &amp; Fetch:</strong> Allocates cursor memory buffers and sequentially steps through active dates.</li>
    <li><strong>Early Exit Optimization:</strong> Breaks the loop immediately when a date match is detected, conserving CPU cycles.</li>
    <li><strong>Close:</strong> Explicitly deallocates memory buffers, avoiding database cursor leaks.</li>
  </ol>

  <div class="running-footer">
    <span>Project Lab Report • RDBMS</span>
    <span>Page 8</span>
  </div>
</div>

<!-- =========================================================================
     PAGE 9: EXPLICIT INDEXING ARCHITECTURE & QUERY OPTIMIZATION
     ========================================================================= -->
<div class="page">
  <div class="running-header">
    <span>UniBook – Campus Event &amp; Venue Booking Dashboard</span>
    <span class="page-num">9</span>
  </div>

  <h1 class="page-title">9. Explicit Indexing Architecture &amp; Query Optimization</h1>
  <p>
    Indexes are secondary data structures (primarily Balanced Trees or B-Trees in InnoDB) designed to accelerate data retrieval operations without performing full table scans. In UniBook, explicit indexing is designed to support high-throughput temporal range searches, relational join acceleration, and multi-column calendar filters.
  </p>

  <h2 class="section-heading">Explicit Index DDL Definitions</h2>
  <div class="code-block"><span class="sql-kw">USE</span> unibook_db;

<span class="sql-cmnt">-- 1. Index on booking_date for fast temporal range scans and date filtering</span>
<span class="sql-kw">CREATE INDEX</span> idx_booking_date <span class="sql-kw">ON</span> bookings(booking_date);

<span class="sql-cmnt">-- 2. Index on venue_id for rapid relational joins with venues table</span>
<span class="sql-kw">CREATE INDEX</span> idx_venue_id <span class="sql-kw">ON</span> bookings(venue_id);

<span class="sql-cmnt">-- 3. Composite Index on status and booking_date for calendar dashboard queries</span>
<span class="sql-kw">CREATE INDEX</span> idx_status_date <span class="sql-kw">ON</span> bookings(status, booking_date);</div>

  <div class="screenshot-container">
    <img src="{img_indexes}" class="screenshot-img" style="max-height: 80mm; width: auto;" alt="Live Indexing & Performance Inspector">
    <div class="screenshot-caption">Figure 9.1: Live B-Tree Index Explorer displaying Cardinality, Index Type, and Performance Metrics</div>
  </div>

  <h2 class="section-heading">Query Execution Plan (EXPLAIN) Analysis</h2>
  <p style="font-size: 8.5pt;">
    Without secondary indexes, checking whether a venue is reserved between two dates (<code>WHERE venue_id = 1 AND booking_date BETWEEN '2026-11-01' AND '2026-11-30'</code>) forces the MySQL query optimizer into an expensive <strong>Full Table Scan (ALL)</strong>, examining every record with $O(N)$ algorithmic complexity.
  </p>
  <ul style="font-size: 8.5pt;">
    <li><strong>Index Range Scan (range):</strong> With <code>idx_booking_date</code> and <code>idx_status_date</code>, the storage engine traverses the B-Tree in $O(\log N)$ time, directly accessing leaf nodes matching the temporal bounds.</li>
    <li><strong>Composite Leftmost Prefix Rule:</strong> The composite index <code>idx_status_date(status, booking_date)</code> efficiently satisfies queries filtering by status alone or filtering by status followed by date range, drastically minimizing disk I/O.</li>
  </ul>

  <div class="running-footer">
    <span>Project Lab Report • RDBMS</span>
    <span>Page 9</span>
  </div>
</div>

<!-- =========================================================================
     PAGE 10: IMPLEMENTATION DETAILS: DASHBOARD & VENUES
     ========================================================================= -->
<div class="page">
  <div class="running-header">
    <span>UniBook – Campus Event &amp; Venue Booking Dashboard</span>
    <span class="page-num">10</span>
  </div>

  <h1 class="page-title">10. Implementation Details: Operational UI &amp; Venues</h1>
  <p>
    The operational frontend visualizes live relational database state through intuitive, responsive executive cards and comprehensive inventory tables.
  </p>

  <h2 class="section-heading">Executive Dashboard Overview</h2>
  <div class="screenshot-container">
    <img src="{img_dashboard}" class="screenshot-img" style="max-height: 52mm; width: auto;" alt="Executive Dashboard UI">
    <div class="screenshot-caption">Figure 10.1: Live Executive Dashboard displaying RDBMS Aggregations, Capacity Cards, and Venue Inventory</div>
  </div>

  <h2 class="section-heading">Campus Venue Directory</h2>
  <div class="screenshot-container">
    <img src="{img_venues}" class="screenshot-img" style="max-height: 50mm; width: auto;" alt="Campus Venue Directory">
    <div class="screenshot-caption">Figure 10.2: Campus Venue Inventory Directory with Real-Time Seating Capacities and Booking Status</div>
  </div>

  <h2 class="section-heading">Relational Query &amp; Terminal Verification</h2>
  <div class="terminal-box"><span class="prompt">mysql&gt;</span> <span class="sql-kw">SELECT</span> venue_id, name, building, capacity, total_bookings <span class="sql-kw">FROM</span> venues <span class="sql-kw">ORDER BY</span> venue_id;
+----------+-----------------------------+------------------------------------+----------+----------------+
| venue_id | name                        | building                           | capacity | total_bookings |
+----------+-----------------------------+------------------------------------+----------+----------------+
|        1 | Turing Grand Auditorium     | Alan Turing Hall - Block A         |      450 |              4 |
|        2 | Von Neumann Computing Lab   | Information Sciences - Block C     |       80 |              1 |
|        3 | Ramanujan Lecture Theatre   | Mathematics Complex - Block B      |      180 |              2 |
|        4 | Ada Lovelace Seminar Hall   | Software Engineering Wing - Block C|       60 |              1 |
|        5 | Newton Physics Amphitheatre | Basic Sciences - Block D           |      220 |              1 |
|        6 | Curie Innovation Hub        | Research &amp; Incubation Center       |      120 |              0 |
+----------+-----------------------------+------------------------------------+----------+----------------+
6 rows in set (0.001 sec)</div>

  <div class="running-footer">
    <span>Project Lab Report • RDBMS</span>
    <span>Page 10</span>
  </div>
</div>

<!-- =========================================================================
     PAGE 11: IMPLEMENTATION DETAILS: BOOKINGS, CONCURRENCY & SQL STUDIO
     ========================================================================= -->
<div class="page">
  <div class="running-header">
    <span>UniBook – Campus Event &amp; Venue Booking Dashboard</span>
    <span class="page-num">11</span>
  </div>

  <h1 class="page-title">11. Implementation Details: Bookings &amp; SQL Studio</h1>
  <p>
    UniBook integrates end-to-end transactional workflows with dedicated academic verification tooling for concurrency testing and interactive SQL console execution.
  </p>

  <h2 class="section-heading">Event Bookings Management &amp; Terminal Output</h2>
  <div class="screenshot-container">
    <img src="{img_bookings}" class="screenshot-img" style="max-height: 48mm; width: auto;" alt="Campus Bookings Management">
    <div class="screenshot-caption">Figure 11.1: Live Bookings Management Interface with Departmental Associations and Status Badges</div>
  </div>

  <div class="terminal-box"><span class="prompt">mysql&gt;</span> <span class="sql-kw">SELECT</span> b.booking_id, v.name <span class="sql-kw">AS</span> venue, o.name <span class="sql-kw">AS</span> organizer, b.booking_date, b.status
    <span class="prompt">-&gt;</span> <span class="sql-kw">FROM</span> bookings b <span class="sql-kw">JOIN</span> venues v <span class="sql-kw">ON</span> b.venue_id = v.venue_id <span class="sql-kw">JOIN</span> organizers o <span class="sql-kw">ON</span> b.organizer_id = o.organizer_id
    <span class="prompt">-&gt;</span> <span class="sql-kw">ORDER BY</span> b.booking_date <span class="sql-kw">ASC LIMIT</span> 4;
+------------+---------------------------+---------------------+--------------+-----------+
| booking_id | venue                     | organizer           | booking_date | status    |
+------------+---------------------------+---------------------+--------------+-----------+
|          1 | Turing Grand Auditorium   | Dr. Aris Thorne     | 2026-10-27   | CONFIRMED |
|          2 | Von Neumann Computing Lab | Dr. Aris Thorne     | 2026-10-28   | CONFIRMED |
|          3 | Ramanujan Lecture Theatre | Prof. Sarah Jenkins | 2026-10-29   | CONFIRMED |
|          4 | Ada Lovelace Seminar Hall | Elena Rostova       | 2026-10-30   | CONFIRMED |
+------------+---------------------------+---------------------+--------------+-----------+
4 rows in set (0.002 sec)</div>

  <h2 class="section-heading">10-Thread Concurrency Simulation &amp; ACID Integrity</h2>
  <div class="screenshot-container">
    <img src="{img_console}" class="screenshot-img" style="max-height: 48mm; width: auto;" alt="Interactive SQL Query Console">
    <div class="screenshot-caption">Figure 11.2: Live Interactive SQL Console executing multi-table joins against MySQL engine</div>
  </div>

  <p style="font-size: 8.5pt;">
    To prove thread safety, the system provides a 10-thread concurrency test simulating 10 simultaneous booking attempts for the same venue and date. Exactly <strong>1 thread succeeds</strong> (ACID commit), while <strong>9 threads are blocked</strong> by constraint validation (<code>VenueUnavailableException</code>).
  </p>

  <div class="running-footer">
    <span>Project Lab Report • RDBMS</span>
    <span>Page 11</span>
  </div>
</div>

<!-- =========================================================================
     PAGE 12: CONCLUSION, FUTURE ENHANCEMENTS & REFERENCES
     ========================================================================= -->
<div class="page">
  <div class="running-header">
    <span>UniBook – Campus Event &amp; Venue Booking Dashboard</span>
    <span class="page-num">12</span>
  </div>

  <h1 class="page-title">12. Conclusion</h1>
  <p>
    The <strong>UniBook Campus Event &amp; Venue Booking Dashboard</strong> successfully realizes an end-to-end, enterprise-grade laboratory project that fulfills and exceeds all academic requirements for Relational Database Management Systems. Through rigorous application of 3NF relational modeling, declarative integrity constraints (Primary Keys, Foreign Keys with cascading deletes, Check constraints, and composite Unique constraints), the database kernel guarantees absolute data consistency and zero double-booking occurrences.
  </p>
  <p>
    Furthermore, the system demonstrates mastery of advanced procedural database extensions: automated PL/SQL triggers for synchronized metric denormalization, analytical views with outer joins for non-loss utilization aggregation, explicit cursor traversal within stored procedures, and B-Tree indexing strategies for optimized logarithmic retrieval. Together with an Object-Oriented Java middleware and a modern Next.js client, UniBook serves as a complete prototype for academic facility management.
  </p>

  <h2 class="section-heading">13. Future Enhancements</h2>
  <p>Some of the planned future architectural features include:</p>
  <ul>
    <li><strong>Multi-Day and Recurring Event Engine:</strong> Support for recurring academic timetable rules (e.g., weekly semester lectures) through iCalendar <code>RRULE</code> database serialization.</li>
    <li><strong>Role-Based Access Control (RBAC):</strong> Granular SQL grant privileges (e.g., <code>GRANT SELECT, INSERT ON unibook_db.* TO 'dept_coordinator'@'%'</code>) restricting access according to institutional authority.</li>
    <li><strong>Partitioning Strategy:</strong> Range partitioning on <code>bookings</code> by <code>booking_date</code> (YEAR) to maintain constant query execution times as historical reservations scale into millions of rows.</li>
    <li><strong>Automated Conflict Auditing &amp; Real-Time WebSockets:</strong> Integrating message brokers (RabbitMQ/Kafka) to stream real-time booking push alerts directly to campus administrative interfaces.</li>
  </ul>

  <h2 class="section-heading">14. References &amp; Academic Citations</h2>
  <ol style="font-size: 8.5pt; line-height: 1.45;">
    <li>Silberschatz, A., Korth, H. F., &amp; Sudarshan, S. (2020). <em>Database System Concepts</em> (7th ed.). McGraw-Hill Education.</li>
    <li>Schwartz, B., Zaitsev, P., &amp; Tkachenko, V. (2021). <em>High Performance MySQL: Optimization, Backups, and Replication</em> (4th ed.). O'Reilly Media.</li>
    <li>Oracle Corporation. (2026). <em>MySQL 8.0 Reference Manual: InnoDB Storage Engine Architecture &amp; Optimization</em>. Oracle Documentation.</li>
    <li>Elmasri, R., &amp; Navathe, S. B. (2017). <em>Fundamentals of Database Systems</em> (7th ed.). Pearson.</li>
  </ol>

  <div class="running-footer">
    <span>Project Lab Report • RDBMS</span>
    <span>Page 12</span>
  </div>
</div>

</body>
</html>
"""

print(f"Writing HTML to {HTML_OUTPUT}...")
with open(HTML_OUTPUT, "w", encoding="utf-8") as f:
    f.write(html_content)

print("Compiling PDF with Chrome headless...")
chrome_cmd = [
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    "--headless",
    "--no-sandbox",
    "--disable-gpu",
    r"--user-data-dir=" + os.path.join(os.environ.get("TEMP", r"C:\TEMP"), "chrome_pdf_final"),
    f"--print-to-pdf={PDF_OUTPUT}",
    HTML_OUTPUT
]

result = subprocess.run(chrome_cmd, capture_output=True, text=True)
print("Chrome stdout:", result.stdout)
print("Chrome stderr:", result.stderr)

if os.path.exists(PDF_OUTPUT):
    size = os.path.getsize(PDF_OUTPUT)
    print(f"Success! PDF created at: {PDF_OUTPUT} (Size: {size:,} bytes)")
    
    # Verify page count
    with open(PDF_OUTPUT, "rb") as f:
        pdf_bytes = f.read()
        page_matches = len(re.findall(rb'/Type\s*/Page[^s]', pdf_bytes))
        print(f"=== VERIFIED PDF PAGE COUNT: {page_matches} PAGES ===")
else:
    print("Error: PDF was not generated.")
