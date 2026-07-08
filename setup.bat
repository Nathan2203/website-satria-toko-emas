@echo off
REM ============================================================
REM  Setup — Satria Toko Emas (Website Harga Emas)
REM  Mengecek Node.js lalu menginstall semua library backend.
REM ============================================================
cd /d "%~dp0"

echo.
echo [1/2] Mengecek Node.js...
where node >nul 2>nul
if errorlevel 1 (
    echo.
    echo   Node.js BELUM terinstall di komputer ini.
    echo   Silakan download dan install versi LTS dari:
    echo.
    echo       https://nodejs.org
    echo.
    echo   Setelah install, jalankan setup.bat ini lagi.
    echo.
    pause
    exit /b 1
)
for /f "delims=" %%v in ('node --version') do echo   Node.js terdeteksi: %%v

echo.
echo [2/2] Menginstall library backend (express, express-session, multer)...
call npm install
if errorlevel 1 (
    echo.
    echo   GAGAL install library. Pastikan komputer terhubung internet,
    echo   lalu jalankan setup.bat ini lagi.
    echo.
    pause
    exit /b 1
)

echo.
echo ============================================================
echo   Instalasi SELESAI.
echo.
echo   Untuk menjalankan website:  npm start
echo   (atau klik dua kali start.bat)
echo.
echo   Tampilan publik : http://localhost:3000
echo   Panel admin     : http://localhost:3000/admin
echo ============================================================
echo.
pause
