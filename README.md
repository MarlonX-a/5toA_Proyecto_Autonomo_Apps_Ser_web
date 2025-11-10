# FindyourWork

## Descripción General
FindyourWork es una plataforma innovadora que conecta a proveedores de servicios con clientes potenciales. La aplicación facilita la publicación, búsqueda y reserva de servicios profesionales, creando un ecosistema eficiente para la contratación de servicios.

## Arquitectura del Proyecto

El proyecto está construido con una arquitectura moderna y distribuida, utilizando diferentes tecnologías para cada componente:

### Frontend
- **Tecnología**: React con TypeScript
- **Características**:
  - Interfaz de usuario moderna y responsive
  - Gestión de estado con Context API
  - Componentes reutilizables
  - Integración con múltiples APIs
  - Sistema de autenticación
  - Comunicación en tiempo real

### Backend

El backend está distribuido en tres servicios principales:

1. **API REST (Python/Django)**
   - Gestión principal de datos
   - Autenticación y autorización
   - Manejo de modelos y relaciones
   - API RESTful para operaciones CRUD

2. **GraphQL (Golang)**
   - Consultas optimizadas
   - Sistema de caché
   - Resolvers personalizados
   - Queries y mutaciones eficientes

3. **WebSocket (NestJS/TypeScript)**
   - Comunicación en tiempo real
   - Notificaciones instantáneas
   - Actualizaciones en vivo
   - Gestión de eventos

## Características Principales

- Registro y autenticación de usuarios
- Perfiles diferenciados para proveedores y clientes
- Publicación y gestión de servicios
- Sistema de reservas
- Calificaciones y comentarios
- Gestión de ubicaciones
- Sistema de pagos
- Comunicación en tiempo real
- Categorización de servicios

## Estructura del Proyecto

```
├── Frontend/               # Aplicación React con TypeScript
│   ├── src/
│   │   ├── components/    # Componentes reutilizables
│   │   ├── pages/        # Páginas de la aplicación
│   │   ├── context/      # Contextos de React
│   │   ├── api/          # Integraciones con APIs
│   │   └── interfaces/   # Definiciones de tipos
│
├── Backend/
│   ├── Python/           # API REST con Django
│   │   ├── api_rest/     # Aplicación principal
│   │   └── mi_proyecto/  # Configuración del proyecto
│   │
│   ├── Golang/           # Servidor GraphQL
│   │   └── graph/        # Definiciones y resolvers
│   │
│   └── TypeScript/       # Servidor WebSocket con NestJS
│       └── src/          # Código fuente
```

## Requisitos de Instalación

1. **Frontend**
```bash
cd Frontend
npm install
npm run dev
```

2. **Backend - Python/Django**
```bash
cd Backend/Python
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

3. **Backend - Golang/GraphQL**
```bash
cd Backend/Golang
go mod download
go run server.go
```

4. **Backend - NestJS/WebSocket**
```bash
cd Backend/TypeScript
npm install
npm run start
```

## Configuración

Cada servicio requiere su propia configuración. Consulte los archivos README específicos en cada directorio para más detalles:

- Frontend: `Frontend/README.md`
- Django REST: `Backend/Python/django_websocket_config.md`
- GraphQL: `Backend/Golang/GRAPHQL_REPORTS_IMPLEMENTATION.md`
- WebSocket: `Backend/TypeScript/COMO_EJECUTAR.md`

## Tecnologías Utilizadas

- **Frontend**:
  - React
  - TypeScript
  - Vite
  - Context API
  - CSS Modules

- **Backend**:
  - Python/Django
  - Golang
  - NestJS
  - SQLite (Django)
  - WebSocket
  - GraphQL

## Contribuir

1. Fork el proyecto
2. Cree su rama de características (`git checkout -b feature/AmazingFeature`)
3. Commit sus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abra un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## Contacto

MarlonX-a - [GitHub](https://github.com/MarlonX-a)

Link del proyecto: [https://github.com/MarlonX-a/5toA_Proyecto_Autonomo_Apps_Ser_web](https://github.com/MarlonX-a/5toA_Proyecto_Autonomo_Apps_Ser_web)