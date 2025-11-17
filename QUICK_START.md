# 🚀 Guía de Instalación Rápida - FindYourWork

## Requisitos Previos

- Node.js 18+ (descargar desde https://nodejs.org/)
- Python 3.8+ (para Django)
- Git
- Visual Studio Code (opcional, recomendado)

## Instalación y Ejecución

### 1. 🔌 Servidor WebSocket (NestJS)

```bash
# Ir a la carpeta de TypeScript
cd Backend/TypeScript

# Instalar dependencias
npm install

# Crear archivo .env (opcional)
cp .env.example .env

# Iniciar servidor en modo desarrollo
npm run start:dev
```

**Verificar**: Abre http://localhost:4000/api/health en el navegador
**Dashboard**: http://localhost:4000/dashboard.html

### 2. 🐍 API REST (Django)

En otra terminal:

```bash
# Ir a la carpeta de Python
cd Backend/Python

# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Migrar base de datos
python manage.py migrate

# Iniciar servidor
python manage.py runserver
```

**Verificar**: Abre http://localhost:8000/api/ en el navegador

### 3. 🎨 Frontend (React)

En otra terminal:

```bash
# Ir a la carpeta del Frontend
cd Frontend

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

**Acceder**: Abre http://localhost:5173 en el navegador

## ✅ Verificación

Todos los servidores deberían estar corriendo:

- ✅ WebSocket: http://localhost:4000
- ✅ Django REST: http://localhost:8000
- ✅ Frontend: http://localhost:5173

## 🧪 Prueba de Integración

### Terminal 1: Ejecutar test del WebSocket

```bash
cd Backend/TypeScript
bash test-websocket.sh
```

### Terminal 2: Crear una reserva desde Django

```bash
curl -X POST http://localhost:8000/api/reservas/ \
  -H "Content-Type: application/json" \
  -d '{
    "cliente_id": 1,
    "fecha": "2024-12-01",
    "hora": "14:30",
    "total_estimado": 50000
  }'
```

### Verificar en el Dashboard

Abre http://localhost:4000/dashboard.html y verifica que el evento aparece.

## 📁 Estructura del Proyecto

```
5toA_Proyecto_Autonomo_Apps_Ser_web/
├── Backend/
│   ├── TypeScript/           # Servidor WebSocket (NestJS)
│   │   ├── src/
│   │   ├── package.json
│   │   └── README.md         # Documentación detallada
│   ├── Python/              # API REST (Django)
│   │   ├── manage.py
│   │   ├── requirements.txt
│   │   └── README.md         # Documentación detallada
│   └── Golang/              # GraphQL (opcional)
├── Frontend/                 # Aplicación React
│   ├── src/
│   ├── package.json
│   └── README_NEW.md        # Documentación detallada
└── README.md                 # Guía general del proyecto
```

## 🔗 Integración WebSocket ↔ Django

Para que Django envíe eventos al WebSocket:

1. Copia el archivo `Backend/Python/WEBSOCKET_INTEGRATION_EXAMPLE.md`
2. Sigue las instrucciones para crear el servicio `WebSocketNotifier`
3. Registra las señales de Django

## 🛠️ Solución de Problemas

### Error: "Puerto 4000 ya está en uso"
```bash
# Matar proceso en el puerto (macOS/Linux)
lsof -i :4000 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Windows: usar Task Manager o
netstat -ano | findstr :4000
taskkill /PID <PID> /F
```

### Error: "Cannot find module"
```bash
# Limpiar e reinstalar
rm -rf node_modules package-lock.json
npm install
```

### WebSocket no se conecta
1. Verifica que el servidor en puerto 4000 esté corriendo
2. Comprueba la consola del navegador para errores
3. Verifica CORS en `Backend/TypeScript/src/main.ts`

### Django no se conecta a WebSocket
1. Instala requests: `pip install requests`
2. Verifica que el servidor NestJS esté activo
3. Comprueba `WS_SERVER_URL` en `Backend/Python/mi_proyecto/settings.py`

## 📚 Documentación Completa

- **Backend WebSocket**: Ver `Backend/TypeScript/README.md`
- **API REST**: Ver `Backend/Python/README.md`
- **Frontend**: Ver `Frontend/README_NEW.md`
- **Integración WebSocket**: Ver `Backend/TypeScript/WEBSOCKET_INTEGRATION.md`

## 🎯 Próximos Pasos

1. ✅ Instalar y ejecutar los 3 servidores
2. ✅ Probar la integración con el script de test
3. 📖 Leer la documentación en las carpetas individuales
4. 🔗 Implementar las señales de Django (ver WEBSOCKET_INTEGRATION_EXAMPLE.md)
5. 🎨 Personalizar el dashboard según necesidades

## 📞 Soporte

Si encuentras problemas:

1. Verifica que todos los servidores están corriendo
2. Comprueba los logs en cada terminal
3. Lee la documentación específica en cada carpeta
4. Verifica los archivos de configuración (.env)

---

**¡Estás listo para empezar! 🎉**

Abre http://localhost:5173 en tu navegador para acceder a la aplicación.
