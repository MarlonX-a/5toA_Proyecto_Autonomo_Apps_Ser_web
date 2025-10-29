# 🚀 CÓMO EJECUTAR EL SERVidor WEBSOCKET - GUÍA SIMPLE

## Opción 1: Ejecutar con el archivo .bat (MÁS FÁCIL - Windows)

1. **Abre una terminal** (cmd o PowerShell)
2. **Navega a la carpeta del proyecto:**
   ```
   cd Backend\TypeScript
   ```
3. **Ejecuta el archivo .bat:**
   ```
   start.bat
   ```
   
   ¡Eso es todo! El servidor se iniciará automáticamente.

## Opción 2: Ejecutar manualmente (PASO A PASO)

### Paso 1: Abrir terminal en la carpeta
```
cd Backend\TypeScript
```

### Paso 2: Instalar dependencias (solo la primera vez)
```
npm install
```

### Paso 3: Iniciar el servidor
```
npm run start:dev
```

### Paso 4: Verificar que funciona
Deberías ver este mensaje:
```
🚀 Servidor WebSocket corriendo en puerto 4000
📡 Dashboard disponible en http://localhost:4000/dashboard.html
🔌 WebSocket disponible en ws://localhost:4000
```

## 📝 ¿Qué hace este servidor?

- **WebSocket Server** en el puerto 4000
- **Dashboard** para ver las conexiones activas
- **Comunica** con tu API de Django (debe estar en puerto 8000)
- **Maneja eventos en tiempo real** (reservas, pagos, comentarios)

## 🌐 URLs importantes

- **Dashboard:** http://localhost:4000/dashboard.html
- **WebSocket:** ws://localhost:4000
- **API REST:** http://localhost:4000/dashboard (estadísticas)

## ❗ Importante

**Antes de ejecutar este servidor, asegúrate de que:**
- ✅ Tu servidor de Django está corriendo en http://localhost:8000
- ✅ Tienes Node.js instalado (versión 18 o superior)
- ✅ Tienes npm instalado

## 🆘 Si algo falla

### Error: "npm no se reconoce"
- Instala Node.js desde: https://nodejs.org/

### Error: "puerto 4000 en uso"
- Cierra otras aplicaciones que usen el puerto 4000
- O cambia el puerto en `src/main.ts`

### Error: "No se puede conectar a Django"
- Asegúrate de que Django esté corriendo
- Verifica que esté en http://localhost:8000

## 📱 ¿Qué ver en el dashboard?

Una vez que el servidor esté corriendo:
1. Abre tu navegador
2. Ve a: http://localhost:4000/dashboard.html
3. Verás:
   - Conexiones activas
   - Eventos en tiempo real
   - Clientes conectados
   - Salas activas

## 🔄 Para detener el servidor

Presiona `Ctrl + C` en la terminal donde está corriendo.


