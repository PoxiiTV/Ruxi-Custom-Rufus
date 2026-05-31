@echo off
echo.
echo  Ruxi ^| Build Portable
echo  ========================
echo.

cd /d "%~dp0"

echo Compilando Ruxi-Portable.exe...
call npm run build:portable

if %errorlevel% neq 0 (
  echo.
  echo  ERROR: El build fallo. Revisa los mensajes de arriba.
  pause
  exit /b 1
)

echo.
echo  Listo! El ejecutable esta en: dist\Ruxi-Portable.exe
echo  (pedira permisos de administrador al ejecutarse)
echo.
pause
