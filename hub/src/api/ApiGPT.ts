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
          Authorization: `Bearer ${getAuthToken()}`,
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
          Authorization: `Bearer ${getAuthToken()}`,
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
          Authorization: `Bearer ${getAuthToken()}`,
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
          Authorization: `Bearer ${getAuthToken()}`,
        },
      }
    );
    return response.data;
  },

  async requestAttachment(attachment: any): Promise<any> {
    const response: ApiResponse = await apiClientMultipart.post(
      "/attachment",
      attachment,
      { headers: { Authorization: `Bearer ${getAuthToken()}` } }
    );
    return response.data;
  },

  async requestRenameSession(session_id: string, new_title: string): Promise<any> {
    const response: ApiResponse = await apiClientCommon.patch(
      `/sessions/${session_id}/rename`,
      { session_name: new_title },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAuthToken()}`,
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
          Authorization: `Bearer ${getAuthToken()}`,
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
