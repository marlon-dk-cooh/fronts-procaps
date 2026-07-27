# RAG Chat — Plantilla Frontend

Plantilla de aplicación de chat con IA lista para conectar a tu backend. Incluye:

- **Chat GPT/RAG** — conversaciones con historial y soporte de archivos adjuntos.
- **Chat SQL** — consultas en lenguaje natural traducidas a SQL con visualización de resultados.
- **Tema claro/oscuro** con persistencia en `localStorage`.
- **Sistema de colores** centralizado, fácil de personalizar.

Stack: React 18 + TypeScript + Vite + Tailwind CSS + Shadcn/Radix UI.

---

## Inicio rápido

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env
# Edita .env con las URLs de tu backend

# 3. Iniciar en modo desarrollo
npm run dev
```

---

## Personalizar colores de marca

Todos los colores de marca están en un solo lugar: `src/index.css`.

```css
/* src/index.css — Sección: COLORES DE MARCA */
:root {
  --brand-primary: 354 82% 52%;   /* Rojo → cámbialo a tu color principal */
  --brand-secondary: 220 70% 50%; /* Azul → color secundario */
  --brand-accent: 43 74% 66%;     /* Dorado → color de acento */
}
```

Los valores usan formato HSL (Hue Saturation% Lightness%). Herramienta: https://www.w3schools.com/colors/colors_hsl.asp

En los componentes usa las clases de Tailwind:

| Clase                          | Descripción                      |
|--------------------------------|----------------------------------|
| `bg-brand-primary`             | Fondo con color primario         |
| `text-brand-primary`           | Texto con color primario         |
| `bg-brand-primary-foreground`  | Texto sobre fondo primario       |
| `bg-brand-secondary`           | Fondo con color secundario       |
| `bg-brand-accent`              | Fondo con color de acento        |

---

## Conectar autenticación

La plantilla no incluye autenticación activa. Todos los puntos de conexión están marcados con `// TODO`.

### 1. Token de acceso — `src/utils/auth.ts`

```ts
export function getAuthToken(): string {
  // TODO: Reemplaza con tu proveedor
  return localStorage.getItem('authToken') ?? '';
}
```

### 2. Login — `src/pages/login/Login.tsx`

```ts
const handleLogin = async (e) => {
  // TODO: Llama tu API de autenticación aquí
  // const { token } = await authApi.post('/login', { email, password });
  // setAuthToken(token);
  // navigate('/');
};
```

### 3. Logout — `src/hooks/useLogout.tsx`

```ts
const logout = () => {
  // TODO: Agrega logout de tu proveedor
  clearAuthToken();
  window.location.href = '/';
};
```

### Proveedores comunes

**Azure AD (MSAL)**
```bash
npm install @azure/msal-browser @azure/msal-react
```
Configura `clientId`, `tenantId` y `redirectUri` en `.env`.

**Auth0**
```bash
npm install @auth0/auth0-react
```

**JWT propio**
Solo usa `setAuthToken(token)` / `getAuthToken()` desde `src/utils/auth.ts`.

---

## Conectar backend

### Chat GPT/RAG — `src/api/ApiGPT.ts`

| Endpoint | Método | Descripción |
|---|---|---|
| `/chat/sessions` | GET | Lista conversaciones |
| `/chat/get_one_session` | GET | Obtiene una conversación |
| `/chat/message` | POST | Envía mensaje |
| `/chat/attachment` | POST | Sube archivo |
| `/chat/vote` | POST | Vota un mensaje |
| `/chat/delete_one_session/:id` | DELETE | Elimina conversación |

Configura la URL base en `.env`:
```
VITE_APP_API_URL_GPT=http://localhost:8000/api
```

### Chat SQL — `src/api/ApiSQL.ts`

| Endpoint | Método | Descripción |
|---|---|---|
| `/api/ask` | POST | Consulta en lenguaje natural |
| `/api/recover-chat` | POST | Recupera historial |
| `/api/save-sql` | POST | Guarda query SQL |

Configura la URL base en `.env`:
```
VITE_APP_API_URL_SQL=http://localhost:8001
```

---

## Estructura del proyecto

```
src/
├── api/            # Clientes HTTP (ApiGPT.ts, ApiSQL.ts)
├── components/
│   ├── custom/     # Componentes específicos de la app
│   ├── layout/     # Layout principal
│   └── ui/         # Componentes base Shadcn/Radix
├── config/         # Configuración (añade tu auth config aquí)
├── context/        # ThemeContext (dark/light mode)
├── hooks/          # useLogout (→ conectar a tu auth provider)
├── interfaces/     # Tipos TypeScript
├── pages/
│   ├── chatGPT/    # Página de chat RAG
│   ├── chatSql/    # Página de chat SQL
│   └── login/      # Página de login (→ conectar a tu auth provider)
└── utils/
    └── auth.ts     # Utilidades de token (punto central de auth)
```

---

## Scripts disponibles

```bash
npm run dev       # Inicia servidor de desarrollo
npm run build     # Build de producción
npm run preview   # Preview del build
npm run lint      # Linting con ESLint
```

---

## Docker

```bash
docker build -t rag-chat .
docker run -p 8501:8501 rag-chat
```
