# Semantic Search — Plantilla Frontend

Interfaz de búsqueda semántica sobre bases de conocimiento. Permite consultar documentos usando lenguaje natural, con filtros por categoría, tipo de archivo, fecha y relevancia mínima.

Stack: React 19 + TypeScript + Vite + Tailwind CSS v4.

---

## Vista previa

### Pantalla de búsqueda
![Pantalla de búsqueda](image/screen_1.png)

### Resultados
![Resultados de búsqueda](image/screen_2.png)

---

## Inicio rápido

```bash
npm install
npm run dev
```

---

## Conectar backend

### Endpoint esperado

```
POST /api/search
Content-Type: application/json
Authorization: Bearer <token>
```

**Request:**
```json
{
  "query": "arquitectura de microservicios",
  "category": "Arquitectura",
  "file": "PDF",
  "minRelevance": 70,
  "rangeDate": "Último mes"
}
```

**Response:**
```json
{
  "results": [
    {
      "id": 1,
      "title": "Guía de Arquitectura de Microservicios",
      "snippet": "Los microservicios permiten desacoplar...",
      "source": "docs/arquitectura/microservicios.pdf",
      "category": "Arquitectura",
      "date": "2025-01-15",
      "relevance": 0.97,
      "highlights": ["microservicios", "arquitectura"],
      "chunks": 3
    }
  ]
}
```

Configura la URL del backend en `.env`:

```
VITE_API_URL=http://localhost:8000
```

El código de conexión está en `src/SemanticSearch.tsx` — busca el comentario `// TODO: conectar backend`.

---

## Estructura del proyecto

```
src/
├── components/
│   ├── Chip.tsx          # Botón de filtro reutilizable (activo/inactivo)
│   ├── Filters.tsx       # Panel de filtros colapsable
│   └── Results.tsx       # Tarjetas de resultados expandibles
├── interface/
│   ├── FormSearch.ts     # Interfaces SearchState y SearchFilters
│   └── ResultSearch.ts   # Interface SearchResult
├── mock/
│   └── Results.ts        # Datos de ejemplo (desactiva en producción)
├── SemanticSearch.tsx    # Componente principal — orquesta todo
└── App.tsx
```

---

## Funcionalidades

| Feature | Descripción |
|---|---|
| Búsqueda semántica | Lenguaje natural contra vectorstore |
| Filtro por categoría | Chips seleccionables (Arquitectura, Seguridad, DevOps…) |
| Filtro por tipo de archivo | PDF, Markdown, Word |
| Rango de fechas | Última semana / mes / trimestre / año |
| Relevancia mínima | Slider 0–100% |
| Badges de relevancia | Exacto ≥95%, Alto ≥85%, Medio ≥70%, Bajo <70% |
| Contexto expandido | Fragmento ampliado con similitud coseno |
| Copiar fragmento | Botón en cada resultado |
| Tema claro/oscuro | Toggle en el header, persistido en CSS |
| Atajo de teclado | `/` para enfocar el buscador |

---

## TypeScript interfaces

```ts
// src/interface/ResultSearch.ts
interface SearchResult {
  id: number;
  title: string;
  snippet: string;
  source: string;
  category: string;
  date: string;
  relevance: number;   // 0–1 (cosine similarity)
  highlights: string[];
  chunks: number;
}

// src/interface/FormSearch.ts
interface SearchFilters {
  category: string;
  file: string;
  minRelevance: number;  // 0–100
  rangeDate: string;
}
```

---

## Scripts

```bash
npm run dev       # Servidor de desarrollo
npm run build     # Build de producción
npm run preview   # Preview del build
npm run lint      # ESLint
```
