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
9
// Avance simulado del run asíncrono: cada consulta de estado adelanta una fase.
let mockRunTick = 0;

const mockApi = {
  async requestCreateSession(_name?: string): Promise<any> {
    await delay(200);
    return { session_id: crypto.randomUUID(), user_id: "dev-user", session_name: _name || "Nueva sesion" };
  },

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

  async requestRenameSession(
    _session_id: string,
    _new_title: string
  ): Promise<any> {
    await delay(300);
    return { success: true };
  },

  // --- Ejecución asíncrona de SEMA -------------------------------------------
  // Simula el ciclo 202 -> polling -> resultado, para poder ver la barra de
  // progreso y los botones de descarga sin backend.

  async requestSemaRun(_attachment: any): Promise<any> {
    await delay(400);
    mockRunTick = 0;
    return {
      run_id: "sema-mock-0001",
      session_id: "mock-session",
      message_id: "msg-mock-0001",
      status: "queued",
    };
  },

  async requestSemaRunStatus(run_id: string): Promise<any> {
    await delay(200);
    mockRunTick += 1;

    const steps = [
      { phase: "ocr", progress: 12, detail: "Leyendo el documento (OCR) (14 s)" },
      { phase: "ocr", progress: 26, detail: "Leyendo el documento (OCR) (38 s)" },
      { phase: "metadata", progress: 34, detail: "Identificando el método" },
      { phase: "structure_tests", progress: 58, detail: "Estructurando las pruebas (3/5)" },
      { phase: "extract_insumos", progress: 81, detail: "Extrayendo insumos (7/9)" },
      { phase: "render", progress: 93, detail: "Generando el Excel" },
    ];

    if (mockRunTick <= steps.length) {
      const step = steps[mockRunTick - 1];
      return {
        run_id, session_id: "mock-session", status: "running",
        items_done: 0, items_total: 0, current_item: "",
        message_id: "", text: "", artifacts: [], error_type: "",
        ...step,
      };
    }

    return {
      run_id,
      session_id: "mock-session",
      status: "succeeded",
      phase: "done",
      progress: 100,
      detail: "Listo",
      items_done: 0,
      items_total: 0,
      current_item: "",
      message_id: "msg-mock-0001",
      text:
        "Listo, ya terminé de procesar metodo_4280.pdf y tu archivo está disponible para descargar.\n\n" +
        "Procesamiento completado del método MA-0157 V3 (Acetaminofén Tabletas 500 mg).\n" +
        "- Pruebas estructuradas: 5\n- Insumos extraídos: 34 (28 únicos)",
      artifacts: [
        {
          name: "619021289_Acetaminofen_20260805.xlsx",
          path: "processes/source=extract/year=2026/month=08/day=05/bom/619021289.xlsx",
          kind: "excel",
        },
      ],
      error_type: "",
    };
  },

  async requestSemaActiveRun(_session_id: string): Promise<any> {
    await delay(100);
    // En modo mock nunca hay un run que recuperar: el refresh arranca limpio.
    return { active: false, run_id: "", status: "" };
  },

  async downloadSemaArtifact(_path: string, _filename?: string): Promise<void> {
    await delay(200);
    // En modo mock no hay archivo real que descargar.
  },
};

export default mockApi;
