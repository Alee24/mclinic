# M-CLINIC PORT CONFIGURATION

**IMPORTANT: This project uses the following ports:**

- **API Port**: `7899`
- **Web Port**: `7898`

## Standard Application Ports

All configuration files, Docker containers, Next.js rewrites, and Apache settings are configured for ports **7899** (API) and **7898** (Web).

## Apache / Reverse Proxy Configuration

The reverse proxy is configured as:
- `/api/` → `http://localhost:7899/api` (API)
- `/` → `http://localhost:7898/` (Web + WebSockets)

## Database

- **Database Name**: `mclinicportal`
- **Database URL**: `mysql://m-cl-app:Mclinic%40App2023%3F@localhost:3306/mclinicportal`
