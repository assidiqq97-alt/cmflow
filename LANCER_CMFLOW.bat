@echo off
title CMFlow — Serveur Local
color 0A
echo ===================================================
echo   Lancement du Cockpit CMFlow SaaS...
echo ===================================================
echo.
start http://localhost:3000/

where node >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo [OK] Execution via Node.js...
    node server.js
) else (
    echo [OK] Execution via PowerShell...
    powershell -ExecutionPolicy Bypass -File .\serveur.ps1
)

pause
