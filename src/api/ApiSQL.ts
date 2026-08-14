// ============================================================
// API SQL — Cliente HTTP para el agente SQL
// ============================================================
// Para activar mocks: VITE_USE_MOCKS=true en .env
// Para usar backend real: VITE_USE_MOCKS=false (o eliminar la variable)
// ============================================================

import axios from "axios";
import { getAuthToken } from "@/utils/auth";
import {
  mockAskSQL,
  mockGetSchemas,
  mockRecoverChat,
  mockSaveSql,
} from "@/mocks/apiSQL.mock";

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === "true";

const client = axios.create({
  baseURL: `${import.meta.env.VITE_APP_API_URL_SQL}/api`,
  headers: { "Content-Type": "application/json" },
});

// ----- Tipos -----

interface RecoverChatRequest {
  user_id: string;
  jwt: string;
}

interface AskSQLPayload {
  question: string;
  catalog: string;
  schema: string;
  instructions?: string;
  corrected_sql_query?: string;
}

// ----- Funciones reales -----

const realRecoverChat = async (
  payload: RecoverChatRequest,
  token: string
): Promise<any> => {
  const response = await client.post("/recover-chat", payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const realAskSQL = async (payload: AskSQLPayload): Promise<any> => {
  const response = await client.post("/ask", payload, {
    headers: { Authorization: `Bearer ${await getAuthToken()}` },
  });
  return response.data;
};

const realGetSchemas = async (catalog: string): Promise<any> => {
  const response = await client.get(`/schemas?catalog=${catalog}`, {
    headers: { Authorization: `Bearer ${await getAuthToken()}` },
  });
  return response.data;
};

const realSaveSql = async (payload: any): Promise<any> => {
  const response = await client.post("/save-sql", payload, {
    headers: { Authorization: `Bearer ${await getAuthToken()}` },
  });
  return response.data;
};

// ----- Exports con switch mock/real -----

export const recoverChat = USE_MOCKS ? mockRecoverChat : realRecoverChat;
export const askSQL = USE_MOCKS ? mockAskSQL : realAskSQL;
export const getSchemas = USE_MOCKS ? mockGetSchemas : realGetSchemas;
export const saveSql = USE_MOCKS ? mockSaveSql : realSaveSql;
