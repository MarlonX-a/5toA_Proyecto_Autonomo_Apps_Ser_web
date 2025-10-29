# FindYourWork – Documentación (escrita por mí)

Quiero dejar una guía clara para levantar el proyecto rápido, entender cómo se conecta todo y cómo probarlo sin perder tiempo.

## ¿Qué es?
- Plataforma para conectar clientes y proveedores mediante servicios y reservas.
- 3 capas integradas:
  - Django (API REST + autenticación + CRUD)
  - NestJS (WebSocket + dashboard tiempo real)
  - React (Frontend que consume REST y recibe tiempo real)

## Arquitectura (cómo lo pensé)
- Django expone REST en `http://localhost:8000/api_rest/` y la documentación en `http://localhost:8000/api/docs/`.
- NestJS corre en `http://localhost:4000`, sirve el dashboard en `http://localhost:4000/dashboard.html` y el WS en `ws://localhost:4000`.
- El Frontend corre en `http://localhost:5173`.

Flujo de eventos:

```
Django (REST + signals) ──HTTP──> NestJS (/api/events/emit) ──WS──> Clientes conectados (Frontend)
```

## Cómo levantar todo

### 1) Backend/Python (Django)
```bash
cd Backend/Python
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```
- Swagger: `http://localhost:8000/api/docs/`
- Login: `POST /api_rest/login/`
- Register: `POST /api_rest/register/`
- Profile: `GET /api_rest/profile/` con `Authorization: Token <mi_token>`

### 2) Backend/TypeScript (NestJS / WebSocket)
```bash
cd Backend/TypeScript
npm install
npm run start:dev
```
- Dashboard: `http://localhost:4000/dashboard.html`
- WS: `ws://localhost:4000`

### 3) Frontend (React)
```bash
cd Frontend
npm install
npm run dev
```
- Abrir: `http://localhost:5173`

## Lo que ya tengo listo
- REST (CRUD, auth por token, validaciones y Swagger).
- WebSocket (salas por rol, métricas, dashboard, integración desde Django vía signals).
- Frontend consume REST (login, flujo básico). Tiempo real: listo en backend; el cliente WS es fácil de activar.

## Cómo pruebo notificaciones
1) Dejo abierto el dashboard de NestJS.
2) Creo una reserva/pago/comentario desde el Frontend o con curl.
3) Veo el evento en el dashboard. Si el Frontend escucha WS, también aparece una notificación.

## Notas
- CORS en Django debe permitir: `http://localhost:5173` y `http://localhost:4000`.
- URLs deben apuntar a `/api_rest/` (no `/api/v1/`).
- Los logs de Nest ayudan para ver requests y eventos.
