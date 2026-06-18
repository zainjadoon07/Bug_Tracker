# BugSentinel: Upcoming Production-Level Features

This document tracks upcoming production-level features to be implemented in BugSentinel.

---

## 1. SLA Countdown & Escalation Engine (Chronos)
Enforce resolution deadlines based on ticket priority to ensure SLAs (Service Level Agreements) are met.
- **Deadlines:**
  - `Critical`: 24 Hours
  - `High`: 72 Hours
  - `Medium`: 5 Days
  - `Low`: 10 Days
- **UI Elements:**
  - Active real-time visual countdown timers inside bug listings and the details panel.
  - Automatically flag/escalate tickets (e.g., turning badges red, showing warnings) if the SLA timer runs out.
- **Backend Mechanics:**
  - DB column to record timestamp of SLA limits.
  - Periodic checks or hooks to trigger escalation audits on expiry.

---

## 2. Live Markdown Editor & Rich Previews
Replace generic textareas with a developer-first Markdown formatting system for descriptions and comments.
- **UI Elements:**
  - Live side-by-side split screen preview or toggle tab (Write vs. Preview).
  - Support headers, tables, bold/italics, links, checklist checkboxes, and lists.
  - Live code-block formatting and syntax highlighting.

---

## 3. Workload Balancing Matrix (Resource Planner)
A manager's console to review and plan assignments dynamically to avoid team burnout.
- **UI Elements:**
  - A dashboard grid listing all Developers and Testers.
  - Displays total count of active tickets assigned to them.
  - Aggregates "Priority Points" (e.g., Critical = 4 pts, High = 3 pts, Medium = 2 pts, Low = 1 pt).
  - Flags users in red if their active points exceed safety thresholds.

---

## 4. Saved Search Query Presets
Enable users to save custom workspace filter configurations for quick retrieval.
- **UI Elements:**
  - Quick-save search configuration widget (saves combinations of Projects, Assignees, Priorities, and Statuses).
  - Sidebar layout container displaying saved filters (e.g., `"My Open Critical Testing Tasks"`, `"Recently Closed Projects"`).
  - Clicking a preset instantly applies parameters without manual selections.

---

## 5. WebSockets/SSE Real-Time Push Notifications
Provide instant updates to users as team operations happen, eliminating manual page reloads.
- **UI Elements:**
  - Instant Toast Notification when:
    - A ticket is assigned to you.
    - Another user changes the status of a ticket you reported or are assigned to.
    - A comment is posted on a ticket you are associated with.
  - Real-time updates to dashboard KPIs and activity feeds.
