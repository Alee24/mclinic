# MClinic Deployment Guide

This repository is configured for live deployment on a Linux server (Ubuntu 22.04+ recommended).

## Automatic Installation

We have provided a comprehensive `install.sh` script that handles everything including system dependencies.

1.  **Upload** the code to your server.
2.  **Make it executable**:
    ```bash
    chmod +x install.sh
    ```
3.  **Run the script**:
    ```bash
    ./install.sh
    ```

## Post-Installation Notes

-   **API Port**: 3434
-   **Web Port**: 3000
-   **Process Management**: Controlled by PM2.
    -   View logs: `pm2 logs`
    -   Status: `pm2 status`
-   **MySQL**: Running on port 3306 with user `root` and password defined in the script (default: `Digital2025`).

## Manual Port Changes

If you need to change the port later:
1.  Update `apps/api/.env` (PORT).
2.  Update `apps/web/.env` (NEXT_PUBLIC_API_URL).
3.  Restart services: `pm2 restart all`.
