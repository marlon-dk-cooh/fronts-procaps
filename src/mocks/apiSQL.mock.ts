// ============================================================
// MOCK — API SQL
// Implementa la misma interfaz que src/api/ApiSQL.ts
// ============================================================

import { MOCK_SCHEMAS, delay, getNextSqlResponse } from "./data";

export const mockAskSQL = async (_payload: {
  question: string;
  catalog: string;
  schema: string;
  instructions?: string;
  corrected_sql_query?: string;
}): Promise<any> => {
  await delay(1400);
  return getNextSqlResponse();
};

export const mockGetSchemas = async (_catalog: string): Promise<any> => {
  await delay(500);
  return { schemas: MOCK_SCHEMAS };
};

export const mockRecoverChat = async (
  _payload: { user_id: string; jwt: string },
  _token: string
): Promise<any> => {
  await delay(600);
  // Devuelve historial vacío en mock (la página maneja el caso de 0 mensajes)
  return { id: "mock-session", session_id: "mock-session", user_id: "mock-user", messages: [] };
};

export const mockSaveSql = async (_payload: any): Promise<any> => {
  await delay(300);
  return { success: true, message: "Query guardada (mock)" };
};
