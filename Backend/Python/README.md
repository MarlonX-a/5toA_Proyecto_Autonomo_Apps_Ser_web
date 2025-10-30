# Backend/Python – API REST (Django)

## Qué resuelve
- Autenticación por token (login/register/profile).
- CRUD de entidades (cliente, proveedor, servicio, reserva, pago, comentario, calificación, etc.).
- Validaciones en serializers y permisos por vista.
- Swagger con toda la API documentada.

## Requisitos
- Python 3.11+
- pip

## Instalación rápida
```bash 
cd Backend/Python
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

## Endpoints clave
- Documentación: `GET /api/docs/`
- Login: `POST /api_rest/login/`
- Register: `POST /api_rest/register/` (rol: `cliente` o `proveedor`)
- Profile: `GET /api_rest/profile/` (Header `Authorization: Token <token>`)

## CORS y autenticación
En `mi_proyecto/settings.py`:
- `CORS_ALLOWED_ORIGINS` incluye `http://localhost:5173` y `http://localhost:4000`.
- `rest_framework.authtoken` habilitado.

## Señales (integración tiempo real)
Cuando se crean/actualizan entidades:
- Django envía un POST a `http://localhost:4000/api/events/emit`.
- NestJS re-emite el evento por WebSocket a las salas por rol/usuario.
