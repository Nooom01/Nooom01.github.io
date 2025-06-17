@echo off
echo Starting Kawaii Blog...
echo.
echo If you see any errors, try:
echo 1. Close this window
echo 2. Open Command Prompt as Administrator
echo 3. Run: Set-ExecutionPolicy RemoteSigned
echo 4. Then try again
echo.
echo Server will start at: http://localhost:3000
echo.
pause
cd /d "%~dp0"
node node_modules/next/dist/bin/next dev
pause