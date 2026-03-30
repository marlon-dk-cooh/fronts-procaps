// ============================================================
// MOCK — API GPT
// Implementa la misma interfaz que src/api/ApiGPT.ts
// ============================================================

import {
  MOCK_SESSIONS,
  MOCK_MESSAGES,
  delay,
  getNextChatResponse,
} from "./data";

const mockApi = {
  async requestAllSession(_token: string): Promise<any> {
    await delay(600);
    return MOCK_SESSIONS;
  },

  async requestOneSession(session_id: string): Promise<any> {
    await delay(500);
    const session = MOCK_MESSAGES[session_id];
    if (!session) {
      throw { status: 404, message: "Sesión no encontrada" };
    }
    return session;
  },

  async requestDeleteSession(_session_id: string): Promise<any> {
    await delay(400);
    return { success: true };
  },

  async requestChat(
    _user_query: string,
    _msg_id: string,
    _modifier: boolean,
    _search_tool: boolean,
    _model_name: string,
    _session_id: string,
    _session_name: string
  ): Promise<any> {
    await delay(1200);
    return { text: getNextChatResponse() };
  },

  async requestAttachment(_attachment: any): Promise<any> {
    await delay(1000);
    return {
      text: "He procesado el archivo adjunto. En el modo mock no analizo el contenido real, pero en producción el modelo leerá el documento y responderá basándose en él.\n\n> **Modo mock activo** — conecta el backend para procesamiento real de archivos.",
    };
  },

  async requestVote(
    _msg_id: string,
    _vote: number,
    _session_id: string
  ): Promise<any> {
    await delay(200);
    return { success: true };
  },
};

export default mockApi;
