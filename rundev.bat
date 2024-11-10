@echo off
start cmd /k "cd server && set PORT=8000 && npm start"
start cmd /k "cd server && set PORT=8002 && npm start"
start cmd /k "cd client && set VITE_SERVE=3001 && set VITE_BACKEND_URL=http://localhost:8002 && npm start"
start cmd /k "cd client && set VITE_SERVE=3000 && set VITE_BACKEND_URL=http://localhost:8000 && npm start"
