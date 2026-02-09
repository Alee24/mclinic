@echo off
REM ============================================================================
REM BACKUP LIVE DATABASE BEFORE CLEARING ACTIVITY DATA (Windows Version)
REM ============================================================================

REM Database connection details (UPDATE THESE FOR YOUR LIVE SERVER)
SET DB_HOST=your-live-server-host
SET DB_USER=your-db-username
SET DB_PASS=your-db-password
SET DB_NAME=mclinicportal

REM Create backup file name with timestamp
for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c%%a%%b)
for /f "tokens=1-2 delims=/:" %%a in ('time /t') do (set mytime=%%a%%b)
SET BACKUP_FILE=mclinic_backup_%mydate%_%mytime%.sql

echo ============================================================================
echo Creating backup of live database...
echo Database: %DB_NAME%
echo Backup file: %BACKUP_FILE%
echo ============================================================================

REM Create backup using mysqldump
mysqldump -h %DB_HOST% -u %DB_USER% -p%DB_PASS% %DB_NAME% > %BACKUP_FILE%

if %ERRORLEVEL% EQU 0 (
    echo ✅ Backup created successfully: %BACKUP_FILE%
    echo.
    echo ⚠️  IMPORTANT: Download this backup file to a safe location before proceeding!
    pause
) else (
    echo ❌ Backup failed!
    pause
    exit /b 1
)
