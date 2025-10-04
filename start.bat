@echo off
echo Starting Heart Rate Monitoring System...
echo.

echo Installing backend dependencies...
call npm install
if %errorlevel% neq 0 (
    echo Error installing backend dependencies
    pause
    exit /b 1
)

echo.
echo Installing frontend dependencies...
cd client
call npm install
if %errorlevel% neq 0 (
    echo Error installing frontend dependencies
    pause
    exit /b 1
)

cd ..
echo.
echo Starting MongoDB (make sure MongoDB is installed and running)...
echo Starting backend server...
start "Backend Server" cmd /k "npm run dev"

echo.
echo Starting frontend development server...
start "Frontend Server" cmd /k "npm run client"

echo.
echo Both servers are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Press any key to exit...
pause >nul
