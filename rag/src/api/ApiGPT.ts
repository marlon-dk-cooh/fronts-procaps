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
  conversation_id: string;
  message_id: string;
  conversation_name: string;
  flag_modifier: boolean;
  model_name?: string;
  search_tool: boolean;
}

interface VoteRequestData {
  id: string;
  thread_id: string;
  rate: number;
}

interface ApiResponse<T = any> {
  data: T;
}

const realApi = {
  async requestAllSession(token: string): Promise<any> {
    const response: ApiResponse = await apiClientCommon.get("/chat/sessions", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  async requestOneSession(session_id: string): Promise<any> {
    const response: ApiResponse = await apiClientCommon.get(
      "/chat/get_one_session",
      {
        params: { conversation_id: session_id },
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAuthToken()}`,
        },
      }
    );
    return response.data;
  },

  async requestDeleteSession(session_id: string): Promise<any> {
    const response: ApiResponse = await apiClientCommon.delete(
      `/chat/delete_one_session/${session_id}`,
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
      conversation_id: session_id,
      message_id: msg_id,
      conversation_name: session_name,
      flag_modifier: modifier,
      model_name,
      search_tool: model_name === "o1-mini" ? false : search_tool,
    };
    const response: ApiResponse = await apiClientCommon.post(
      "/chat/message",
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
      "/chat/attachment",
      attachment,
      { headers: { Authorization: `Bearer ${getAuthToken()}` } }
    );
    return response.data;
  },

  async requestVote(msg_id: string, vote: number, session_id: string): Promise<any> {
    const requestData: VoteRequestData = {
      id: msg_id,
      thread_id: session_id,
      rate: vote,
    };
    const response: ApiResponse = await apiClientCommon.post(
      "/chat/vote",
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
