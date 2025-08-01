@echo off
echo Healthcare Center Application Setup
echo ==================================
echo.

REM Check if Node.js is installed
echo Checking Node.js installation...
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed! Please install Node.js before running this setup.
    pause
    exit /b
)

REM Display Node.js version
node --version
echo.

REM Install dependencies
echo Installing dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to install dependencies! Please check your internet connection and try again.
    pause
    exit /b
)
echo Dependencies installed successfully.
echo.

REM Setup Prisma and database
echo Setting up database...
call npm run db:push
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to setup database schema! Please check your database configuration.
    pause
    exit /b
)
echo Database schema created successfully.
echo.

REM Seed the database with initial data
echo Seeding database with initial data...
call npm run db:seed
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to seed database! Please check your database configuration.
    pause
    exit /b
)
echo Database seeded successfully.
echo.

REM Setup complete
echo ==================================
echo Setup completed successfully!
echo.
echo You can now run the application using:
echo   start-app.bat
echo.
echo Default login credentials:
echo   Admin: admin@example.com / password123
echo   Doctor: doctor@example.com / password123
echo ==================================
pause
