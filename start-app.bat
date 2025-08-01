@echo off
echo Starting Healthcare Center Application...

REM Check if Node.js is installed
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Node.js is not installed! Please install Node.js before running this application.
    pause
    exit /b
)

REM Start the Next.js development server
echo Starting Next.js server...
npm run dev

REM If the server closes, pause to show any error messages
pause
