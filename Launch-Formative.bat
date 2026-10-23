@echo off
title Formative Studio
if exist "%~dp0build-release\win-unpacked\Formative.exe" (
    cd /d "%~dp0build-release\win-unpacked"
    start "" "Formative.exe"
    exit
)
if exist "%~dp0build-release\Formative 1.0.0.exe" (
    cd /d "%~dp0build-release"
    start "" "Formative 1.0.0.exe"
    exit
)
echo Executable not found in build-release. Launching dev desktop...
cd /d "%~dp0"
call npm run desktop

