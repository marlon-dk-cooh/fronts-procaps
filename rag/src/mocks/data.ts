// ============================================================
// MOCK DATA — Datos de ejemplo para desarrollo sin backend
// Edita este archivo para ajustar los datos de prueba.
// ============================================================

import { ConversationDetailResponse, ConversationSessionResponse } from "@/interfaces/interfaces";

// ----- Chat GPT / RAG -----

export const MOCK_SESSIONS: ConversationSessionResponse = {
  sessions: [
    {
      id: "session-001",
      conversation_name: "¿Cómo funciona RAG?",
      created_at: "2025-03-26T09:00:00Z",
    },
    {
      id: "session-002",
      conversation_name: "Resumen del informe de ventas Q1",
      created_at: "2025-03-25T14:30:00Z",
    },
    {
      id: "session-003",
      conversation_name: "Estrategia de marketing digital",
      created_at: "2025-03-24T10:15:00Z",
    },
  ],
};

export const MOCK_MESSAGES: Record<string, ConversationDetailResponse> = {
  "session-001": {
    conversation_id: "session-001",
    conversation_name: "¿Cómo funciona RAG?",
    messages: [
      {
        id: "msg-001-1",
        role: "user",
        content: "¿Cómo funciona RAG?",
        created_at: "2025-03-26T09:00:00Z",
        rate: null,
        files: null,
      },
      {
        id: "msg-001-2",
        role: "assistant",
        content:
          "**RAG (Retrieval-Augmented Generation)** es una técnica que combina la recuperación de información con la generación de texto.\n\n## ¿Cómo funciona?\n\n1. **Recuperación**: El sistema busca documentos relevantes en una base de conocimiento (vectorstore, base de datos, etc.).\n2. **Aumentación**: Los documentos recuperados se adjuntan al prompt como contexto.\n3. **Generación**: El modelo de lenguaje genera una respuesta basada en ese contexto.\n\n### Ventajas\n- Respuestas más precisas y actualizadas.\n- Reduce alucinaciones del modelo.\n- No requiere fine-tuning.\n\n¿Te gustaría saber más sobre alguna parte del proceso?",
        created_at: "2025-03-26T09:00:05Z",
        rate: 1,
        files: null,
      },
      {
        id: "msg-001-3",
        role: "user",
        content: "¿Qué vectorstore me recomiendas para producción?",
        created_at: "2025-03-26T09:01:00Z",
        rate: null,
        files: null,
      },
      {
        id: "msg-001-4",
        role: "assistant",
        content:
          "Para producción, las opciones más populares son:\n\n| Vectorstore | Ideal para | Escalabilidad |\n|---|---|---|\n| **Pinecone** | SaaS, inicio rápido | Alta (managed) |\n| **Weaviate** | Open source + cloud | Alta |\n| **Qdrant** | Alto rendimiento | Alta |\n| **pgvector** | Ya usas PostgreSQL | Media |\n| **Chroma** | Prototipado local | Baja |\n\nMi recomendación: si ya tienes Postgres, comienza con **pgvector**. Si necesitas escala desde el día 1, usa **Qdrant** (self-hosted) o **Pinecone** (managed).",
        created_at: "2025-03-26T09:01:10Z",
        rate: null,
        files: null,
      },
    ],
  },
  "session-003": {
    conversation_id: "session-003",
    conversation_name: "Estrategia de marketing digital",
    messages: [], // Sin mensajes → muestra alerta en el chat
  },

  "session-002": {
    conversation_id: "session-002",
    conversation_name: "Resumen del informe de ventas Q1",
    messages: [
      {
        id: "msg-002-1",
        role: "user",
        content: "Resume el informe de ventas del primer trimestre.",
        created_at: "2025-03-25T14:30:00Z",
        rate: null,
        files: null,
      },
      {
        id: "msg-002-2",
        role: "assistant",
        content:
          "## Resumen Ventas Q1 2025\n\n**Total de ingresos:** $2.4M (+18% vs Q1 2024)\n\n### Highlights\n- 🟢 Canal digital creció un **34%** interanual.\n- 🔴 Canal físico cayó un **8%** por cierre de 3 tiendas.\n- 🟡 Nuevos clientes: 1,240 (+22%).\n\n### Top 3 Productos\n1. Producto A — $820K\n2. Producto B — $610K\n3. Producto C — $430K\n\n> **Nota:** Estos son datos de ejemplo del mock. Conecta el backend para ver datos reales.",
        created_at: "2025-03-25T14:30:08Z",
        rate: null,
        files: null,
      },
    ],
  },
};

export const MOCK_CHAT_RESPONSES = [
  "Entendido. Basándome en la información disponible, **aquí está mi análisis**:\n\nEsta es una respuesta de ejemplo generada por el mock. Cuando conectes el backend real, verás las respuestas del modelo de lenguaje aquí.\n\n¿Hay algo específico que quieras explorar?",
  "Buena pregunta. En resumen:\n\n- Punto uno relevante para tu consulta.\n- Punto dos con más detalle.\n- Punto tres con una conclusión.\n\n> Recuerda: estás en **modo mock**. Activa el backend para respuestas reales.",
  "Aquí tienes un bloque de código de ejemplo:\n\n```python\ndef calcular_total(ventas: list[float]) -> float:\n    return sum(ventas)\n\ntotal = calcular_total([100.0, 250.5, 75.0])\nprint(f'Total: ${total:.2f}')\n```\n\nEste es el resultado que obtendrías con datos reales del backend.",
];

// ----- SQL Agent -----

export const MOCK_SCHEMAS = ["ventas", "inventario", "clientes", "logistica"];

export const MOCK_SQL_RESPONSES = [
  {
    answer:
      "Las ventas totales del mes de marzo fueron de **$1,234,567**. El canal con mejor desempeño fue el digital con un 42% del total.",
    sql_query:
      "SELECT canal, SUM(monto) as total FROM ventas WHERE MONTH(fecha) = 3 GROUP BY canal ORDER BY total DESC",
    sql_result: {
      columns: ["canal", "total"],
      rows: [
        { canal: "Digital", total: "518518" },
        { canal: "Físico", total: "395061" },
        { canal: "Mayorista", total: "320988" },
      ],
    },
  },
  {
    answer:
      "Los 5 productos más vendidos en el último trimestre son los que se muestran en la tabla. El producto **Alpha Pro** lidera con 3,420 unidades vendidas.",
    sql_query:
      "SELECT producto, SUM(unidades) as total_unidades, SUM(monto) as ingresos FROM ventas WHERE fecha >= DATEADD(month, -3, GETDATE()) GROUP BY producto ORDER BY total_unidades DESC LIMIT 5",
    sql_result: {
      columns: ["producto", "total_unidades", "ingresos"],
      rows: [
        { producto: "Alpha Pro", total_unidades: "3420", ingresos: "684000" },
        { producto: "Beta Lite", total_unidades: "2890", ingresos: "289000" },
        { producto: "Gamma X", total_unidades: "2100", ingresos: "630000" },
        { producto: "Delta Plus", total_unidades: "1750", ingresos: "262500" },
        { producto: "Epsilon Go", total_unidades: "1200", ingresos: "96000" },
      ],
    },
  },
  {
    answer:
      "Se identificaron **142 clientes** con alto riesgo de churn en el último mes. La mayoría pertenece al segmento B2B con más de 12 meses sin compras.",
    sql_query:
      "SELECT cliente_id, nombre, ultimo_pedido, meses_sin_compra FROM clientes WHERE meses_sin_compra >= 12 AND segmento = 'B2B' ORDER BY meses_sin_compra DESC",
    sql_result: {
      columns: ["cliente_id", "nombre", "ultimo_pedido", "meses_sin_compra"],
      rows: [
        { cliente_id: "C-001", nombre: "Empresa Acme S.A.", ultimo_pedido: "2024-03-12", meses_sin_compra: "24" },
        { cliente_id: "C-002", nombre: "Distribuidora Norte", ultimo_pedido: "2024-05-01", meses_sin_compra: "22" },
        { cliente_id: "C-003", nombre: "Comercial Sur Ltda.", ultimo_pedido: "2024-06-15", meses_sin_compra: "21" },
        { cliente_id: "C-004", nombre: "Grupo Inversiones XYZ", ultimo_pedido: "2024-07-20", meses_sin_compra: "20" },
        { cliente_id: "C-005", nombre: "Tech Solutions Corp", ultimo_pedido: "2024-08-01", meses_sin_compra: "19" },
      ],
    },
  },
];

let sqlResponseIndex = 0;
export function getNextSqlResponse() {
  const response = MOCK_SQL_RESPONSES[sqlResponseIndex % MOCK_SQL_RESPONSES.length];
  sqlResponseIndex++;
  return response;
}

let chatResponseIndex = 0;
export function getNextChatResponse() {
  const response = MOCK_CHAT_RESPONSES[chatResponseIndex % MOCK_CHAT_RESPONSES.length];
  chatResponseIndex++;
  return response;
}

// Simula latencia de red
export const delay = (ms = 800) => new Promise((res) => setTimeout(res, ms));
