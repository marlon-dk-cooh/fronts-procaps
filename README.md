# Agentes | Procaps — Interfaz de chat

Interfaz web del asistente conversacional de Procaps. La aplicación expone una
sola experiencia de chat en la raíz (`/`), más la herramienta de consultas SQL
en `/sql`.

**Stack:** React 18 + TypeScript + Vite + Tailwind CSS + Radix UI.

## Funcionalidades

- **Chat** (`/`) — conversaciones con historial, archivos adjuntos, edición de
  mensajes enviados y regeneración de respuestas.
- **Agente SQL** (`/sql`) — preguntas en lenguaje natural traducidas a SQL, con
  tabla de resultados y gráficas.
- **Gestión de conversaciones** — crear, renombrar y eliminar desde la barra
  lateral.
- **Modo claro / oscuro** — se cambia desde el menú de usuario y se conserva en
  `localStorage`.
- **Selector de LLM** — proveedor del modelo, junto al campo de mensaje.

---

## Inicio rápido (desarrollo)

```bash
npm install
cp .env.example .env    # completa las URLs de tu backend
npm run dev             # http://localhost:8501
```

Para trabajar sin backend, deja `VITE_USE_MOCKS=true`: la app responde con los
datos de prueba de `src/mocks/`.

---

## Configuración

### 1. Variables de entorno

Todas las variables se leen **en tiempo de build**, no en tiempo de ejecución:
Vite las incrusta en el bundle. Cambiar una variable exige reconstruir la imagen.

| Variable | Obligatoria | Descripción |
|---|---|---|
| `VITE_APP_API_URL_GPT` | Sí | Base del backend de chat, incluyendo `/api/v1`. |
| `VITE_APP_API_URL_SQL` | Sí | Host del backend SQL **sin** ruta: `ApiSQL.ts` añade `/api`. |
| `VITE_CATALOG` | No | Catálogo de Unity Catalog por defecto en el chat SQL. |
| `VITE_USE_MOCKS` | No | `true` usa datos simulados; en despliegue debe ser `false`. |

> **Precedencia:** las variables presentes en el entorno del proceso (las que
> inyecta Docker con `--build-arg`) tienen prioridad sobre el archivo `.env`
> incluido en el repositorio. En despliegue, pasa siempre las URLs por
> `--build-arg` y no dependas del `.env` versionado.

### 2. Autenticación

La plantilla **no trae un proveedor de autenticación activo**. El token se
centraliza en `src/utils/auth.ts` y se envía como `Authorization: Bearer` en
cada petición. Hay que conectar tres puntos, marcados con `TODO`:

| Archivo | Qué conectar |
|---|---|
| `src/utils/auth.ts` | `getAuthToken()` — devolver el token de tu proveedor. |
| `src/pages/login/Login.tsx` | `handleLogin()` — llamar a tu API de login y guardar el token. |
| `src/hooks/useLogout.tsx` | `logout()` — cerrar sesión en tu proveedor. |

Para Azure AD, `src/config/msalConfig.ts` trae la configuración comentada como
plantilla; al activarla requiere `VITE_CLIENT_ID`, `VITE_TENANT_ID` y
`VITE_REDIRECT_URI` (ver los ejemplos comentados en `.env.example`).

### 3. Modelos del selector de LLM

El catálogo vive en `src/components/gpt/DropdownModel.tsx`. Cada entrada define
un `value` que viaja al backend como `model_name`:

```ts
{ value: "gpt-5.4", label: "LLM - OpenAI", description: "gpt-5.4" }
```

Al integrar el backend, ajusta esos `value` a los identificadores reales que
espera el servicio. El primer elemento de la lista es el modelo por defecto.

> Si algún modelo necesita ejecución en segundo plano (respuesta `202` +
> *polling*, para procesos que superan el límite de 240 s del ingress), agrega su
> `model_name` al conjunto `ASYNC_SEMA_FLOWS` en `src/api/ApiGPT.ts`.

### 4. Colores de marca

Se definen en un solo lugar, `src/index.css`, en formato HSL:

```css
:root {
  --brand-primary: ...;
  --brand-secondary: ...;
  --brand-accent: ...;
}
```

Se usan desde Tailwind con `bg-brand-primary`, `text-brand-primary`, etc.

---

## Endpoints que consume

**Chat** — `src/api/ApiGPT.ts`, relativos a `VITE_APP_API_URL_GPT`:

| Endpoint | Método | Descripción |
|---|---|---|
| `/sessions` | GET / POST | Lista y crea conversaciones |
| `/sessions/:id/messages` | GET | Mensajes de una conversación |
| `/sessions/:id/rename` | PATCH | Renombra una conversación |
| `/sessions/:id` | DELETE | Elimina una conversación |
| `/message` | POST | Envía un mensaje |
| `/attachment` | POST | Envía un mensaje con archivos |
| `/vote` | POST | Califica una respuesta |
| `/sema/run`, `/sema/run/:id/status` | POST / GET | Ejecución asíncrona y su estado |
| `/sema/artifact` | GET | Descarga el Excel generado |

**SQL** — `src/api/ApiSQL.ts`, relativos a `VITE_APP_API_URL_SQL` + `/api`:

| Endpoint | Método | Descripción |
|---|---|---|
| `/ask` | POST | Consulta en lenguaje natural |
| `/recover-chat` | POST | Recupera el historial |
| `/schemas?catalog=` | GET | Esquemas del catálogo |
| `/save-sql` | POST | Guarda una consulta |

---

## Despliegue

La imagen es multi-etapa: compila con Node 18 y sirve el resultado estático con
Nginx en el puerto **80**. `nginx.conf` ya incluye el *fallback* a `index.html`
que necesita el enrutamiento del lado del cliente.

```bash
docker build \
  --build-arg VITE_APP_API_URL_GPT="https://<host>/api/v1" \
  --build-arg VITE_APP_API_URL_SQL="https://<host>" \
  --build-arg VITE_CATALOG="sema_persistence" \
  --build-arg VITE_USE_MOCKS="false" \
  -t agentes-procaps .

docker run -p 8080:80 agentes-procaps
```

Lista de verificación antes de publicar:

- [ ] `VITE_USE_MOCKS=false`.
- [ ] URLs de backend apuntando al ambiente correcto (no a `localhost`).
- [ ] Autenticación conectada en los tres archivos de la sección 2.
- [ ] Backend con CORS habilitado para el dominio del frontend.
- [ ] `values` del selector de LLM alineados con los del backend.

El pipeline de Azure DevOps (`Pipelines/config.yaml`) publica la imagen
`ai-hub` en el registro `azcrprocapsdevservicios.azurecr.io`.

---

## Estructura

```
src/
├── api/          # Clientes HTTP: ApiGPT.ts (chat), ApiSQL.ts (SQL)
├── components/
│   ├── custom/   # Header, sidebar, mensajes, entrada de chat
│   ├── gpt/      # Selector de modelo y modales del chat
│   ├── layout/   # MainLayout (sidebar + header + contenido)
│   └── ui/       # Componentes base Radix/Shadcn
├── config/       # msalConfig.ts (Azure AD)
├── context/      # ThemeContext: tema claro/oscuro y modelo seleccionado
├── hooks/        # useLogout
├── mocks/        # Datos de prueba para VITE_USE_MOCKS=true
├── pages/
│   ├── chatGPT/  # Chat principal ("/" y "/c/:id")
│   ├── chatSql/  # Agente SQL ("/sql")
│   └── login/    # Login (pendiente de conectar)
└── utils/auth.ts # Manejo del token
```

## Scripts

```bash
npm run dev       # Servidor de desarrollo (puerto 8501)
npm run build     # Build de producción a dist/
npm run preview   # Previsualiza el build
npm run lint      # ESLint
```
