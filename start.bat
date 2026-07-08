@echo off
REM Menjalankan website Satria Toko Emas.
REM Jalankan setup.bat dulu jika belum pernah install.
cd /d "%~dp0"
echo Menjalankan server... (tutup jendela ini untuk mematikan server)
call npm start
pause
