@echo off
title Formative Web Studio
cd /d "%~dp0"
echo Starting Formative Web Studio...
start http://localhost:5173
call npm run dev
