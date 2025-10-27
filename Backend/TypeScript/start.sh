#!/bin/bash

echo "🚀 Iniciando WebSocket Server para Django API"
echo "=============================================="

# Verificar si Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Por favor instala Node.js primero."
    exit 1
fi

# Verificar si npm está instalado
if ! command -v npm &> /dev/null; then
    echo "❌ npm no está instalado. Por favor instala npm primero."
    exit 1
fi

# Navegar al directorio del proyecto
cd "$(dirname "$0")"

echo "📦 Instalando dependencias..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Error instalando dependencias"
    exit 1
fi

echo "✅ Dependencias instaladas correctamente"
echo ""
echo "🔧 Configuración:"
echo "   - Puerto WebSocket: 4000"
echo "   - Dashboard: http://localhost:4000/dashboard.html"
echo "   - API Django esperada en: http://localhost:8000"
echo ""
echo "🚀 Iniciando servidor..."
echo "   Presiona Ctrl+C para detener el servidor"
echo ""

# Iniciar el servidor en modo desarrollo
npm run start:dev
