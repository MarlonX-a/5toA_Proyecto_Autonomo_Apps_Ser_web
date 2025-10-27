@echo off
echo 🚀 Iniciando WebSocket Server para Django API
echo ==============================================

REM Verificar si Node.js está instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js no está instalado. Por favor instala Node.js primero.
    pause
    exit /b 1
)

REM Verificar si npm está instalado
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm no está instalado. Por favor instala npm primero.
    pause
    exit /b 1
)

echo 📦 Instalando dependencias...
call npm install

if %errorlevel% neq 0 (
    echo ❌ Error instalando dependencias
    pause
    exit /b 1
)

echo ✅ Dependencias instaladas correctamente
echo.
echo 🔧 Configuración:
echo    - Puerto WebSocket: 4000
echo    - Dashboard: http://localhost:4000/dashboard.html
echo    - API Django esperada en: http://localhost:8000
echo.
echo 🚀 Iniciando servidor...
echo    Presiona Ctrl+C para detener el servidor
echo.

REM Iniciar el servidor en modo desarrollo
call npm run start:dev

pause
