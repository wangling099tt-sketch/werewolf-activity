@echo off
REM Start Werewolf Activity server + client in 2 windows
start "Werewolf Server" cmd /k "cd server && npm install && npm start"
timeout /t 2 /nobreak > nul
start "Werewolf Client" cmd /k "cd client && npm install && npm run dev"
echo Both servers starting...
echo Server: http://localhost:3001
echo Client: http://localhost:5173
pause