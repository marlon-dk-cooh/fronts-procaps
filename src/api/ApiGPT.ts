// ============================================================
// API GPT — Cliente HTTP para el backend de chat
// ============================================================
// Para activar mocks: VITE_USE_MOCKS=true en .env
// Para usar backend real: VITE_USE_MOCKS=false (o eliminar la variable)
//
// El token se obtiene de getAuthToken(). Cambia esa función en
// src/utils/auth.ts para conectar tu proveedor de autenticación.
// ============================================================

import axios, { AxiosInstance } from "axios";
import { getAuthToken } from "@/utils/auth";
import mockApi from "@/mocks/apiGPT.mock";

const BASE_URL = import.meta.env.VITE_APP_API_URL_GPT;

const apiClientMultipart: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "multipart/form-data" },
});

const apiClientCommon: AxiosInstance = axios.create({ baseURL: BASE_URL });

interface ChatRequestData {
  query: string;
  session_id: string;
  message_id: string;
  conversation_name: string;
  flag_modifier: boolean;
  model_name?: string;
  search_tool: boolean;
}

interface VoteRequestData {
  session_id: string;
  message_id: string;
  rate: number;
}

interface ApiResponse<T = any> {
  data: T;
}

/** Excel descargable generado por un flujo SEMA. */
export interface SemaArtifact {
  name: string;
  path: string;
  kind?: string;
}

/** 202 de POST /sema/run: el flujo quedó corriendo en segundo plano. */
export interface SemaRunAccepted {
  run_id: string;
  session_id: string;
  message_id: string;
  status: string;
}

/** Estado de un run: alimenta la barra de progreso y trae el resultado final. */
export interface SemaRunStatus {
  run_id: string;
  session_id: string;
  status: "queued" | "running" | "succeeded" | "failed" | "canceled";
  phase: string;
  progress: number;
  detail: string;
  items_done: number;
  items_total: number;
  current_item: string;
  message_id: string;
  text: string;
  artifacts: SemaArtifact[];
  error_type: string;
}

/** Run en curso de una sesión: permite recuperar la barra tras un refresh. */
export interface SemaActiveRun {
  active: boolean;
  run_id: string;
  status: string;
}

/**
 * Flujos que corren en segundo plano por exceder el límite de 240 s del ingress.
 *
 * El selector de la UI ahora ofrece proveedores de LLM genéricos, así que ningún
 * valor coincide con esta lista y todo se envía por la ruta síncrona. Esta lista
 * debe repoblarse con los `model_name` que usen 202 + polling en el backend.
 */
const ASYNC_SEMA_FLOWS = new Set(["am-bom-extractor", "bd-bom-builder"]);

export function isAsyncSemaFlow(modelName: string): boolean {
  return ASYNC_SEMA_FLOWS.has((modelName || "").trim().toLowerCase());
}

// Normalises a raw CosmosDB session document to the shape the frontend expects:
// { id, conversation_name, created_at, ... }
function normaliseSession(s: any) {
  return {
    ...s,
    id: s.id ?? s.session_id,
    conversation_name: s.conversation_name ?? s.name_session ?? s.session_name,
    created_at: s.created_at ?? s.fecha_creacion,
  };
}

const realApi = {
  async requestCreateSession(name?: string): Promise<any> {
    const params = name ? `?name=${encodeURIComponent(name)}` : "";
    const response: ApiResponse = await apiClientCommon.post(
      `/sessions${params}`,
      null,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await getAuthToken()}`,
        },
      }
    );
    return response.data; // { session_id, user_id, session_name }
  },

  async requestAllSession(token: string): Promise<any> {
    const response: ApiResponse = await apiClientCommon.get("/sessions", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const data = response.data;
    return {
      ...data,
      sessions: (data.sessions || []).map(normaliseSession),
    };
  },

  async requestOneSession(session_id: string): Promise<any> {
    const response: ApiResponse = await apiClientCommon.get(
      `/sessions/${session_id}/messages`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await getAuthToken()}`,
        },
      }
    );
    const data = response.data;
    // CosmosDB returns one doc per exchange: { id, UserQuestion, IAResponse, rate, created_at }.
    // Expand each doc into two ConversationMessage objects the chat page can render.
    const expanded: any[] = [];
    for (const doc of data.messages ?? []) {
      if (doc.UserQuestion != null) {
        expanded.push({ id: `${doc.id}_q`, role: "user", content: doc.UserQuestion, rate: null, files: null });
      }
      if (doc.IAResponse != null) {
        expanded.push({ id: doc.id, role: "assistant", content: doc.IAResponse, rate: doc.rate ?? null, files: null });
      }
    }
    return {
      conversation_id: data.session_id ?? session_id,
      messages: expanded,
    };
  },

  async requestDeleteSession(session_id: string): Promise<any> {
    const response: ApiResponse = await apiClientCommon.delete(
      `/sessions/${session_id}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await getAuthToken()}`,
        },
      }
    );
    return response.data;
  },

  async requestChat(
    user_query: string,
    msg_id: string,
    modifier: boolean,
    search_tool: boolean,
    model_name: string = "gpt-4o",
    session_id: string,
    session_name: string
  ): Promise<any> {
    const requestData: ChatRequestData = {
      query: user_query,
      session_id,
      message_id: msg_id,
      conversation_name: session_name,
      flag_modifier: modifier,
      model_name,
      search_tool: model_name === "o1-mini" ? false : search_tool,
    };
    const response: ApiResponse = await apiClientCommon.post(
      "/message",
      requestData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await getAuthToken()}`,
        },
      }
    );
    return response.data;
  },

  async requestAttachment(attachment: any): Promise<any> {
    const response: ApiResponse = await apiClientMultipart.post(
      "/attachment",
      attachment,
      { headers: { Authorization: `Bearer ${await getAuthToken()}` } }
    );
    return response.data;
  },

  /**
   * Lanza un flujo SEMA pesado en segundo plano.
   *
   * El ingress de Azure Container Apps corta toda petición a los 240 s y no es
   * configurable, así que am-bom-extractor y bd-bom-builder (OCR + decenas de
   * llamadas al LLM, minutos de trabajo) no caben en /attachment. Esto devuelve
   * 202 de inmediato; el avance se consulta con requestSemaRunStatus.
   */
  async requestSemaRun(attachment: FormData): Promise<SemaRunAccepted> {
    const response: ApiResponse<SemaRunAccepted> = await apiClientMultipart.post(
      "/sema/run",
      attachment,
      { headers: { Authorization: `Bearer ${await getAuthToken()}` } }
    );
    return response.data;
  },

  async requestSemaRunStatus(run_id: string): Promise<SemaRunStatus> {
    const response: ApiResponse<SemaRunStatus> = await apiClientCommon.get(
      `/sema/run/${encodeURIComponent(run_id)}/status`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await getAuthToken()}`,
        },
      }
    );
    return response.data;
  },

  /**
   * Pregunta si la sesión tiene un run SEMA todavía en curso.
   *
   * Red de seguridad para la barra de progreso: solo se llama cuando el
   * sessionStorage no tiene el run_id (pestaña nueva, storage limpiado, otro
   * dispositivo). En el caso normal el refresh se resuelve sin tocar la red.
   */
  async requestSemaActiveRun(session_id: string): Promise<SemaActiveRun> {
    const response: ApiResponse<SemaActiveRun> = await apiClientCommon.get(
      `/sema/session/${encodeURIComponent(session_id)}/active-run`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await getAuthToken()}`,
        },
      }
    );
    return response.data;
  },

  /**
   * Descarga un Excel generado por SEMA.
   *
   * El endpoint exige cabecera Authorization, así que un <a href> directo no
   * sirve: hay que traer el blob y disparar la descarga a mano.
   */
  async downloadSemaArtifact(path: string, filename?: string): Promise<void> {
    const response = await apiClientCommon.get("/sema/artifact", {
      params: { path },
      responseType: "blob",
      headers: { Authorization: `Bearer ${await getAuthToken()}` },
    });

    const url = URL.createObjectURL(response.data as Blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename || path.split("/").pop() || "archivo.xlsx";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  },

  async requestRenameSession(session_id: string, new_title: string): Promise<any> {
    const response: ApiResponse = await apiClientCommon.patch(
      `/sessions/${session_id}/rename`,
      { session_name: new_title },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await getAuthToken()}`,
        },
      }
    );
    return response.data;
  },

  async requestVote(msg_id: string, vote: number, session_id: string): Promise<any> {
    const requestData: VoteRequestData = {
      session_id,
      message_id: msg_id,
      rate: vote,
    };
    const response: ApiResponse = await apiClientCommon.post(
      "/vote",
      requestData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await getAuthToken()}`,
        },
      }
    );
    return response.data;
  },
};

// Cambia VITE_USE_MOCKS=true en .env para usar datos de prueba
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === "true";
const api = USE_MOCKS ? mockApi : realApi;

export default api;
