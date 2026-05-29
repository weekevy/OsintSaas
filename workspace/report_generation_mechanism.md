# OSINT Report Generation Mechanism

This document outlines the architecture, technology stack, and workflow for generating professional intelligence dossiers within the OsintSaas platform.

## 1. Technology Stack

- **Orchestration**: [BullMQ](https://docs.bullmq.io/) (Redis-backed queueing system).
- **Templating Engine**: [Handlebars.js](https://handlebarsjs.com/) (Semantic templates).
- **PDF Engine**: [Puppeteer](https://pptr.dev/) (Headless Chromium).
- **Database**: MariaDB (via `mysql2/promise`).
- **Real-time Updates**: Socket.io (via an internal notification proxy).
- **Visualization**: Inline SVG generation for charts and diagrams.

## 2. Workflow Overview

The report generation is a background process handled by a dedicated worker in `server/worker.js`. It follows these steps:

1.  **Trigger**: A job is added to the `report-queue` via the Next.js API.
2.  **Initialization**: The worker updates the report status in the database to `generating` and sends a "started" notification to the UI.
3.  **Data Aggregation**:
    *   Fetches Scan, Target, and Project metadata.
    *   Retrieves all security findings associated with the scan.
    *   Reads raw module JSON output (if available) for deep-dive technical details.
4.  **Intelligence Enrichment**:
    *   Uses the `enrichFindings` function to map raw scan results to professional descriptions, methodology, and remediation steps.
    *   Calculates severity distributions (Critical, High, Medium, Low).
5.  **Visualization**:
    *   Generates an SVG pie chart for severity distribution.
    *   Generates an OSINT workflow diagram showing the data path.
6.  **HTML Rendering**:
    *   Selects a Handlebars template based on the user's theme preference (Light/Dark).
    *   Injects all aggregated and enriched data into the template.
7.  **PDF Synthesis**:
    *   Launches a Puppeteer instance.
    *   Renders the compiled HTML.
    *   Applies professional headers and footers (Classification, Page numbering).
    *   Saves the PDF to `server/public/uploads/reports/`.
8.  **Finalization**:
    *   Updates the database with the file path and `ready` status.
    *   Notifies the user via WebSocket that the report is available for download.

## 3. Key Functions (`server/worker.js`)

| Function | Purpose |
| :--- | :--- |
| `reportWorker` | The main job processor that orchestrates the entire synthesis lifecycle. |
| `enrichFindings` | Intelligent mapping function that adds technical context and remediation to raw findings. |
| `generateSeverityChart` | Dynamically creates an SVG pie chart based on the findings' severity. |
| `generateWorkflowDiagram` | Generates a visual SVG representation of the OSINT reconnaissance steps. |
| `notifyUI` | Sends progress and status updates to the frontend via the WebSocket server. |

## 4. Templates

### 4.1 Project Structure (Template)

Projects serve as the container for all OSINT investigations. A project "template" consists of the following data points:

- **Identity**: Name, Description, and unique Icon (Folder, Search, Shield, Chart, Team, Globe).
- **Categorization**: Status (Planning, Active, Review, Completed, Archived) and Priority (Low, Medium, High, Critical).
- **Timeline**: Due Date and Creation Date.
- **Aesthetics**: Theme Color (Purple, Blue, Green, Red, Orange, Pink) used for UI gradients.
- **Organization**: Linked Targets, Scans, and Team Members.

### 4.2 Report Template (Structure)

The report template (e.g., `report-dark.hbs`) is structured into logical blocks that mirror a professional intelligence dossier:

1.  **Classification Banner**: Top and bottom bars indicating the confidentiality level (e.g., CONFIDENTIAL, SECRET).
2.  **Hero Section**:
    *   **Title**: "Threat Assessment Report" or custom dossier name.
    *   **Risk Score**: A large circular badge showing the calculated 0-100% composite risk score.
    *   **Risk Level**: Text label (Low, Medium, High, Critical).
3.  **Metadata Grid**: A grid showing Target Identity, Report Reference, Scan Type, Date Issued, Investigator, and Project Name.
4.  **Severity Breakdown**: Visual pills showing the count of findings by severity level.
5.  **Executive Summary**: Narrative section containing investigator notes and the assessment verdict.
6.  **Analysis Methodology**: Description of the reconnaissance process accompanied by a **Workflow Diagram**.
7.  **Intelligence Detections**: The core of the report. Each finding is represented as a card with:
    *   Title and Severity Badge.
    *   Technical Description.
    *   Logic/Source information.
    *   Finding Weight (Visual Bar).
    *   Recommended Remediation Action.
    *   Raw Intelligence Snippets (optional).
8.  **Strategic Remediation**: A 3-column timeline (Immediate, Short-Term, Medium-Term) providing a roadmap for risk mitigation.
9.  **Technical Audit Log**: A raw console-style log showing the step-by-step actions performed by the OSINT orchestrator.

## 5. Directory Structure

- **Storage**: `server/public/uploads/reports/`
- **Logic**: `server/worker.js`
- **Templates**: `server/lib/templates/`
