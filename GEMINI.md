# OsintSaas Project Documentation

## Architecture Overview
OsintSaas is a modular OSINT (Open Source Intelligence) framework built with a modern web stack and containerized investigation modules.

### Core Components
- **Client (Frontend)**: React 19 application built with Vite and Tailwind CSS.
- **Server (Backend)**: Next.js application handling API requests, authentication, and task orchestration.
- **Worker**: Standalone BullMQ worker (`server/worker.js`) that processes background scans and report generation.
- **OSINT Modules**: Independent containerized tools (Python/FastAPI) that perform specific intelligence gathering tasks.
- **Database**: MariaDB for persistent storage.
- **Cache/Queue**: Redis for BullMQ and real-time messaging.

### Data Model
The database (`osint_db`) includes:
- **Users & Teams**: Multi-tenant support with role-based access.
- **Projects & Targets**: Hierarchical organization of investigations.
- **Scans**: Generic scan record linked to module-specific result tables (e.g., `job_recruitment_scans`).
- **Findings**: Granular intelligence nodes discovered during scans.
- **Reports**: PDF documents generated from scan results.

### Communication Flow
1. **Client** initiates a scan via Next.js API.
2. **API** validates the request and adds a job to the `scan-queue` in Redis.
3. **Worker** picks up the job, notifies the UI via WebSocket, and calls the external **OSINT Module API**.
4. **OSINT Module** performs the scan and (presumably) updates the database directly or returns results to the worker.
5. **Worker** updates the scan status and triggers UI updates.
6. **Report Generation** is handled by a separate `report-queue` using Puppeteer.

## Development Workflows
- **Running locally**: `npm run dev` in the root runs all components concurrently.
- **Adding a Module**: 
  1. Create a new directory in `docker/`.
  2. Define the service in `docker-compose.yml`.
  3. Add the module-specific results table in `server/database/init.sql`.
  4. Update `server/worker.js` to handle the new module type.

## Conventions
- **Styling**: Tailwind CSS 4.
- **State Management**: React Context (Auth, Socket).
- **API Communication**: Axios.
- **Real-time**: Socket.io.
