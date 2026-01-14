# M-CLINIC PORT CONFIGURATION

**IMPORTANT: This project uses the following ports:**

- **API Port**: `5454`
- **Web Port**: `5054`

## DO NOT change these ports to 3434/3034

All configuration files, scripts, and Apache settings are configured for ports **5454** and **5054**.

## Files that reference these ports:

1. `deploy-portal.sh`
2. `apps/api/src/main.ts`
3. `start-api.sh`
4. `update.sh`
5. `complete-recovery.sh`
6. `configure-system.sh`
7. `apache-ssl.conf`
8. `diagnose-and-fix.sh`
9. All PM2 ecosystem configurations

## Apache Configuration

The Apache reverse proxy is configured as:
- `/api/` → `http://localhost:5454/` (API)
- `/` → `http://localhost:5054/` (Web + WebSockets)

## Database

- **Database Name**: `mclinicportal`
- **Database URL**: `mysql://m-cl-app:Mclinic%40App2023%3F@localhost:3306/mclinicportal`
