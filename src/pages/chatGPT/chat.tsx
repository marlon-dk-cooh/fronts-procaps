/* eslint-disable @typescript-eslint/no-explicit-any */
import { useScrollToBottom } from "@/components/custom/use-scroll-to-bottom";
import {
  useState,
  useEffect,
  Dispatch,
  SetStateAction,
  useRef,
  Fragment,
} from "react";
import { v4 as uuidv4 } from "uuid";
import { useNavigate, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Copy, Pencil, X, Check, RefreshCwIcon, Download } from "lucide-react";
import { toast } from "sonner";
import { ThumbDownIcon, ThumbUpIcon } from "@/components/custom/icons";
import { InputGPT } from "@/components/gpt/InputGPT";
import api, { isAsyncSemaFlow } from "@/api/ApiGPT";
import type { SemaArtifact, SemaRunStatus } from "@/api/ApiGPT";
import {
  ChatInterface,
  ConversationDetailResponse,
  ConversationMessage,
} from "@/interfaces/interfaces";
import ListFile from "@/components/custom/ListFile";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import UseLogout from "@/hooks/useLogout";
import { useTheme } from "@/context/ThemeContext";

interface Message {
  id: string;
  role: "user" | "assistant";
  answer: string;
  files: File[] | string[] | null;
  rate: null | number;
  /** Excels generados por un flujo SEMA, ofrecidos como botones de descarga. */
  artifacts?: SemaArtifact[];
}

/** Cada cuánto se consulta el avance de un run SEMA en segundo plano. */
const SEMA_POLL_INTERVAL_MS = 2500;
/** Tope de seguridad: si el backend nunca llega a un estado terminal, se corta. */
const SEMA_POLL_TIMEOUT_MS = 45 * 60 * 1000;

/**
 * El run_id vivía sólo dentro del closure de handleSubmit, así que un F5 a mitad
 * de proceso dejaba la barra muerta aunque el backend siguiera trabajando y
 * terminara bien. Guardarlo por sesión permite reanudar el polling al montar.
 *
 * sessionStorage y no localStorage: el run pertenece a esta pestaña y no tiene
 * sentido arrastrarlo semanas. Si falta (pestaña nueva, storage limpiado), se
 * cae al endpoint /active-run, que sí lo sabe.
 */
const activeRunKey = (sessionId: string) => `sema:active-run:${sessionId}`;

const readStoredRun = (sessionId: string): string | null => {
  try {
    return sessionStorage.getItem(activeRunKey(sessionId));
  } catch {
    // Modo privado o storage deshabilitado: se pierde la reanudación, nada más.
    return null;
  }
};

const storeRun = (sessionId: string, runId: string) => {
  try {
    sessionStorage.setItem(activeRunKey(sessionId), runId);
  } catch {
    /* idem */
  }
};

const clearStoredRun = (sessionId: string) => {
  try {
    sessionStorage.removeItem(activeRunKey(sessionId));
  } catch {
    /* idem */
  }
};

type props = {
  newChat?: boolean;
  setChats: Dispatch<SetStateAction<ChatInterface[]>>;
  chats: ChatInterface[];
  allMsgs: Record<string, Message[]>;
  setAllMsg: Dispatch<SetStateAction<Record<string, Message[]>>>;
};

export function Chat({
  newChat = false,
  setChats,
  chats,
  allMsgs,
  setAllMsg,
}: props) {
  const [messagesContainerRef, messagesEndRef] =
    useScrollToBottom<HTMLDivElement>();
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [idChat, setIdChat] = useState<string>("");
  const [instructions, setInstructions] = useState("");
  const [isLoadingChat, setIsLoadingChat] = useState<boolean>(false);
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [isSearch, setIsSearch] = useState(false);
  const isStop = useRef<boolean>(false);
  const { logout, user } = UseLogout();
  const { modelSelect } = useTheme();
  // Avance del run SEMA en segundo plano; alimenta la ProgressBar.
  const [runProgress, setRunProgress] = useState<{ value?: number; label: string }>({
    label: "Pensando...",
  });
  // Permite cancelar el polling si el componente se desmonta a mitad de un run.
  const pollAbort = useRef<boolean>(false);

  useEffect(() => {
    pollAbort.current = false;
    return () => {
      pollAbort.current = true;
    };
  }, []);

  /**
   * Consulta el estado de un run SEMA hasta que termina.
   *
   * Los flujos am-bom-extractor y bd-bom-builder no caben en una petición
   * síncrona: el ingress de Container Apps corta a los 240 s y no es
   * configurable. El backend los ejecuta en segundo plano y aquí se sigue su
   * avance, que además es lo que llena la barra de progreso.
   */
  const pollSemaRun = async (
    runId: string,
    isCancelled?: () => boolean
  ): Promise<SemaRunStatus> => {
    const startedAt = Date.now();

    for (;;) {
      // `isCancelled` es propio de cada reanudación. `pollAbort` no alcanza ahí:
      // vuelve a false al remontar, así que un bucle viejo reviviría y publicaría
      // la respuesta por duplicado.
      if (pollAbort.current || isStop.current || isCancelled?.()) {
        throw new Error("cancelado por el usuario");
      }
      if (Date.now() - startedAt > SEMA_POLL_TIMEOUT_MS) {
        throw new Error("El proceso tardó más de lo esperado. Vuelve a intentarlo.");
      }

      let status: SemaRunStatus;
      try {
        status = await api.requestSemaRunStatus(runId);
      } catch (err: any) {
        // Un fallo puntual de red no debe abortar un proceso de varios minutos;
        // sólo un 404/403 significa que ese run ya no es consultable.
        const code = err?.response?.status;
        if (code === 404 || code === 403 || code === 400) throw err;
        await new Promise((resolve) => setTimeout(resolve, SEMA_POLL_INTERVAL_MS));
        continue;
      }

      setRunProgress({
        value: status.progress,
        label: status.detail || "Procesando...",
      });

      if (status.status === "succeeded") return status;
      if (status.status === "failed" || status.status === "canceled") {
        throw new Error(
          status.detail || "No se pudo completar el procesamiento. Vuelve a intentarlo."
        );
      }

      await new Promise((resolve) => setTimeout(resolve, SEMA_POLL_INTERVAL_MS));
    }
  };

  /**
   * Retoma un run que quedó corriendo y publica su resultado.
   *
   * Se usa al montar tras un refresh: el backend nunca dejó de trabajar, lo
   * único que se perdió fue el hilo del navegador.
   */
  const resumeSemaRun = async (
    sessionId: string,
    runId: string,
    isCancelled: () => boolean
  ) => {
    setIsLoading(true);
    setRunProgress({ label: "Retomando el proceso..." });
    try {
      const status = await pollSemaRun(runId, isCancelled);
      const resumedId = status.message_id || runId;

      // Al terminar, el backend ya guardó el intercambio en el historial. Si la
      // carga del historial llega después de esto, el mensaje vendría por ambos
      // lados; se inserta sólo si no está ya presente.
      setAllMsg((prev: any) => {
        const current = prev[sessionId] || [];
        if (current.some((m: Message) => m.id === resumedId)) return prev;
        return {
          ...prev,
          [sessionId]: [
            ...current,
            {
              id: resumedId,
              answer: status.text,
              role: "assistant",
              files: [],
              rate: null,
              artifacts: status.artifacts || [],
            },
          ],
        };
      });
    } catch (error: any) {
      // Desmontar el componente aborta el polling: no es un fallo del proceso y
      // el run debe seguir siendo recuperable en el próximo montaje.
      if (pollAbort.current || isCancelled()) return;

      const detail =
        error?.response?.data?.detail ||
        error?.message ||
        "Hubo un error al procesar tu mensaje.";
      pushMessage(
        { id: uuidv4(), answer: `⚠️ ${detail}`, role: "assistant", files: [], rate: null },
        sessionId
      );
    } finally {
      if (!pollAbort.current && !isCancelled()) {
        clearStoredRun(sessionId);
        setIsLoading(false);
        setRunProgress({ label: "Pensando..." });
      }
    }
  };

  const handleDownloadArtifact = async (artifact: SemaArtifact) => {
    try {
      await api.downloadSemaArtifact(artifact.path, artifact.name);
    } catch {
      toast?.error("No se pudo descargar el archivo. Intenta de nuevo.");
    }
  };

  const pushMessage = (msg: Message, chatKey?: string) => {
    const key = chatKey ?? idChat;
    setAllMsg((prev: any) => ({
      ...prev,
      [key]: [...(prev[key] || []), msg],
    }));
  };

  const updateMessageText = (messageId: string, text: string) => {
    const allMsgCopy = {
      ...allMsgs,
      [idChat]: allMsgs[idChat].map((m: Message) =>
        m.id === messageId && m.role == "user" ? { ...m, answer: text } : m
      ),
    };
    setAllMsg(allMsgCopy);
    handleEdit(messageId, allMsgCopy);
  };

  const handleSubmit = async ({
    text = "",
    idMessageCorrected = "",
    is_regenerate = false,
    files,
  }: {
    text: string;
    idMessageCorrected?: string;
    is_regenerate: boolean;
    files: File[] | null;
  }) => {
    if (isLoading || !user) return;
    const messageId = idMessageCorrected || uuidv4();
    const DESIRED_LENGTH = 28;
    const messageText = text;
    const isChat = chats.findIndex((chat) => chat.chatId == idChat);
    const titleChat =
      isChat >= 0
        ? chats[isChat].title
        : messageText.length > DESIRED_LENGTH
        ? messageText.substring(0, DESIRED_LENGTH)
        : messageText;

    // For existing chats idChat is already set — push user message immediately.
    // For new chats we need the real session_id first (see below).
    if (!is_regenerate && !newChat) {
      pushMessage({ id: messageId, answer: text, role: "user", files, rate: null });
    }

    setIsLoading(true);

    // New chats: backend requires a pre-created session before any message.
    // Create it first so every subsequent pushMessage uses the real session_id.
    let activeSessionId = idChat;
    if (newChat) {
      try {
        const sessionRes = await api.requestCreateSession(titleChat);
        activeSessionId = sessionRes.session_id;
        setIdChat(activeSessionId);
      } catch (sessionErr: any) {
        logout(sessionErr?.response?.statusText || "");
        setIsLoading(false);
        return;
      }
      // Push user message under the real session key so it survives navigation.
      if (!is_regenerate) {
        pushMessage({ id: messageId, answer: text, role: "user", files, rate: null }, activeSessionId);
      }
    }

    try {
      let assistantText = "";
      let assistantArtifacts: SemaArtifact[] = [];
      let assistantMessageId = messageId;

      if (files?.length) {
        const formData = new FormData();
        formData.append("message_id", messageId);
        formData.append("session_id", activeSessionId);
        formData.append("conversation_name", titleChat);
        formData.append("message", messageText);
        formData.append("flag_modifier", String(is_regenerate));
        formData.append("model_name", modelSelect.toLowerCase());
        formData.append("search_tool", String(isSearch));

        files.forEach((fileObj: any) => {
          formData.append("files", fileObj);
        });

        if (isAsyncSemaFlow(modelSelect)) {
          // Flujo pesado: se acepta con 202 y se sigue por polling. `client_run_id`
          // es la clave de idempotencia: un reintento no dispara un segundo OCR.
          formData.append("client_run_id", messageId);
          setRunProgress({ value: 0, label: "Enviando los documentos..." });

          const accepted = await api.requestSemaRun(formData);
          // Se guarda ANTES de empezar a esperar: si el usuario refresca a los
          // dos segundos, el run ya es recuperable.
          storeRun(activeSessionId, accepted.run_id);

          let status: SemaRunStatus;
          try {
            status = await pollSemaRun(accepted.run_id);
          } finally {
            // Si se abortó por desmontaje, el run sigue vivo: conservar el
            // puntero es lo que permite retomarlo al volver.
            if (!pollAbort.current) clearStoredRun(activeSessionId);
          }

          assistantText = status.text;
          assistantArtifacts = status.artifacts || [];
          assistantMessageId = status.message_id || accepted.message_id || messageId;
        } else {
          const res = await api.requestAttachment(formData);
          assistantText = res.text;
          assistantArtifacts = res.artifacts || [];
        }
      } else {
        const res = await api.requestChat(
          text,
          messageId,
          is_regenerate,
          isSearch,
          modelSelect.toLowerCase(),
          activeSessionId,
          titleChat
        );
        assistantText = res.text;
        // bom-planner también genera un Excel y responde por /message.
        assistantArtifacts = res.artifacts || [];
      }

      if (isStop.current) {
        isStop.current = false;
        return;
      }

      pushMessage(
        {
          id: assistantMessageId,
          answer: assistantText,
          role: "assistant",
          files: [],
          rate: null,
          artifacts: assistantArtifacts,
        },
        activeSessionId
      );
    } catch (error: any) {
      // Sólo un problema de credenciales justifica cerrar la sesión. Antes
      // cualquier error (un 422, un 500 transitorio) expulsaba al usuario.
      const statusCode = error?.response?.status;
      if (statusCode === 401 || statusCode === 403) {
        logout(error?.response?.statusText || "");
      }

      const detail =
        error?.response?.data?.detail ||
        error?.message ||
        "Hubo un error al procesar tu mensaje.";
      pushMessage(
        { id: messageId, answer: `⚠️ ${detail}`, role: "assistant", files: [], rate: null },
        activeSessionId
      );
    } finally {
      if (newChat) {
        setChats((prev) => [
          { chatId: activeSessionId, title: titleChat, created_at: JSON.stringify(new Date()) },
          ...prev,
        ]);
        navigate(`/c/${activeSessionId}`);
      }
      setIsLoading(false);
      setRunProgress({ label: "Pensando..." });
      setFiles([]);
    }
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast?.success("Copiado al portapapeles");
    } catch {
      toast?.error("No se pudo copiar el texto");
    }
  };

  const startEditing = (msg: Message) => {
    setEditingId(msg.id);
    setEditText(msg.answer);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditText("");
  };

  const saveEdit = () => {
    if (!editingId) return;
    updateMessageText(editingId, editText);
    toast.success("Mensaje actualizado");
    setEditingId(null);
  };

  const getMessages = (id: string) => {
    // Skip if we already have messages for this session in local state.
    if (allMsgs[id]?.length > 0) return;
    setIsLoadingChat(true);
    api
      .requestOneSession(id)
      .then((res: ConversationDetailResponse) => {
        const msgs: ConversationMessage[] = res.messages ?? [];
        setAllMsg((prev) => ({
          ...prev,
          [id]: msgs.map((msg) => ({
            answer: msg.content,
            files: msg.files,
            id: msg.id,
            role: msg.role,
            rate: msg?.rate || null,
          })),
        }));
      })
      .catch((err: any) => logout(err?.status || ""))
      .finally(() => setIsLoadingChat(false));
  };

  const handleRegenerate = (id: string) => {
    const messages = allMsgs[idChat] ?? [];
    const index = messages.findIndex(
      (msg) => msg.id == id && msg.role == "assistant"
    );
    const userMsg = messages[index - 1];
    // Eliminar los mensajes desde la posición donde se seleccionó
    removeFromSpecificToEnd(index);
    // Re-enviar el mismo mensaje del usuario
    handleSubmit({
      text: userMsg.answer,
      idMessageCorrected: userMsg.id,
      is_regenerate: true,
      files: null,
    });
    return;
  };

  const handleEdit = (id: string, data: Record<string, Message[]>) => {
    const messages = [...(data[idChat] ?? [])];
    const index = messages.findIndex(
      (msg) => msg.id == id && msg.role == "user"
    );

    const userMsg = messages[index];
    // Eliminar los mensajes desde la posición donde se seleccionó
    removeFromSpecificToEnd(index + 1);
    // Re-enviar el mismo mensaje del usuario
    handleSubmit({
      text: userMsg.answer,
      idMessageCorrected: userMsg.id,
      is_regenerate: true,
      files: null,
    });
    return;
  };

  const removeFromSpecificToEnd = (i: number) => {
    setAllMsg((prev) => ({
      ...prev,
      [idChat]: prev[idChat].slice(0, i),
    }));
  };

  // Evita que el doble montaje de StrictMode dispare dos reanudaciones.
  const resumedFor = useRef<string | null>(null);

  useEffect(() => {
    setIdChat(id || uuidv4());
    if (!id) return;

    getMessages(id);

    if (resumedFor.current === id) return;
    resumedFor.current = id;

    // Token de cancelación propio de esta reanudación (ver pollSemaRun).
    let cancelled = false;
    const isCancelled = () => cancelled;

    // Camino normal (mismo navegador): el run_id está en sessionStorage y la
    // barra vuelve sin pedirle nada al backend.
    const storedRun = readStoredRun(id);
    if (storedRun) {
      resumeSemaRun(id, storedRun, isCancelled);
    } else {
      // Sólo si no hay copia local se pregunta al backend. Es un caso de borde
      // (pestaña nueva, storage limpiado), no el camino de todos los montajes.
      api
        .requestSemaActiveRun(id)
        .then((res) => {
          if (cancelled) return;
          if (res.active && res.run_id) {
            storeRun(id, res.run_id);
            resumeSemaRun(id, res.run_id, isCancelled);
          }
        })
        .catch(() => {
          // Sin recuperación el usuario queda como antes de este cambio: sin
          // barra. No amerita molestarlo con un error.
        });
    }

    // Desmontar aborta el polling en curso, así que el próximo montaje debe
    // poder reanudar otra vez (es exactamente lo que hace StrictMode en dev).
    return () => {
      cancelled = true;
      resumedFor.current = null;
    };
  }, [id]);

  const handleStop = async () => {
    isStop.current = true;
    setIsLoading(false);
    // El run sigue vivo en el backend; esto sólo evita que la próxima carga de
    // la página lo retome, que es justo lo que el usuario acaba de descartar.
    clearStoredRun(idChat);
    pushMessage({
      id: uuidv4(),
      answer: "El mesaje fue cancelado por el usuario",
      role: "assistant",
      files: null,
      rate: null,
    });
    //   try {
    //   await api.requestVote(stop_msg_id, 2);
    // } catch (error) {
    //   toast.error("Error al detener la conversación")
    // }
  };

  const handleVote = async (
    vote: number,
    value: number | null,
    idMessage: string,
    idChat: string
  ) => {
    if (!user) return;
    if (value === null) {
      // Cambiar valor de rate
      setAllMsg((prev) => {
        return {
          ...prev,
          [idChat]: prev[idChat].map((msg) =>
            msg.id == idMessage ? { ...msg, rate: vote } : msg
          ),
        };
      });
      try {
        await api.requestVote(idMessage, vote, idChat);
      } catch (err: any) {
        logout(err?.response?.statusText || "");
      }
    }
  };

  const endRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [allMsgs?.[idChat], isLoadingChat]);
  return (
    <>
      <div
        className="flex flex-col w-full max-w-4xl gap-6 flex-1 overflow-y-auto pt-4 scrollbar-thin px-2 scrollbar-thumb-gray-400 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-zinc-800"
        ref={messagesContainerRef}
      >
        <div className="flex-1 text-sm space-y-2 flex flex-col">
          {isLoadingChat && <ChatSkeleton />}
          {newChat && (
            <div className="flex flex-1 justify-center items-center p-2">
              <h1 className="text-3xl font-bold break-all text-center">
                ¡Hola, <span className="font-normal"> soy PROCAPS</span>!
              </h1>
            </div>
          )}
          {!isLoadingChat &&
            (allMsgs[idChat] ?? []).map((msg, i) => (
              <Fragment key={i}>
                {msg.role === "user" && (
                  <div className="flex flex-col group gap-2 items-end">
                    <ListFile files={msg.files} />
                    {msg.answer && (
                      <div
                        className={`bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 shadow-sm w-fit max-w-xl ${
                          editingId == msg.id && "!w-full"
                        }`}
                      >
                        {editingId === msg.id ? (
                          <textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Escape") cancelEditing();
                            }}
                            className="bg-transparent outline-none border-b border-gray-400 text-left w-full"
                            rows={4}
                            autoFocus
                          />
                        ) : (
                          <p>{msg.answer}</p>
                        )}
                      </div>
                    )}

                    <div
                      className={`flex flex-row gap-2  ${
                        editingId === msg.id
                          ? ""
                          : "opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
                      }`}
                    >
                      {editingId === msg.id && !msg.files?.length ? (
                        <>
                          <Button
                            variant={"outline"}
                            className="w-fit h-fit p-2 rounded-full"
                            onClick={saveEdit}
                          >
                            <Check size={16} />
                          </Button>
                          <Button
                            variant={"outline"}
                            className="w-fit h-fit p-2 rounded-full"
                            onClick={cancelEditing}
                          >
                            <X size={16} />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="outline"
                            className="w-fit h-fit p-2 rounded-full"
                            onClick={() => handleCopy(msg.answer)}
                          >
                            <Copy size={16} />
                          </Button>
                          <Button
                            variant="outline"
                            className="w-fit h-fit p-2 rounded-full"
                            onClick={() => startEditing(msg)}
                          >
                            <Pencil size={16} />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {msg.role === "assistant" && (
                  <div>
                    <div className="text-neutral-700 dark:!text-neutral-200 w-fit max-w-8/12 rounded-2xl rounded-tr-none p-2 ia-response prose dark:!prose-invert dark:prose-a:font-extrabold">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw]}
                        components={{
                          code: ({ children, node }) => {
                            const isBlock =
                              node?.position?.start && node?.position?.end
                                ? node?.tagName === "pre"
                                : false;

                            if (isBlock) {
                              // BLOQUE DE CÓDIGO: <pre><code>...</code></pre>
                              return (
                                <code className="text-white">{children}</code>
                              );
                            }

                            // INLINE CODE (no tocar)
                            return <code>{children}</code>;
                          },
                        }}
                      >
                        {msg.answer}
                      </ReactMarkdown>
                    </div>

                    {/* Excels generados por SEMA. El endpoint de descarga exige
                        cabecera Authorization, así que no puede ser un <a href>:
                        se trae el blob y se dispara la descarga desde JS. */}
                    {msg.artifacts && msg.artifacts.length > 0 && (
                      <div className="flex flex-row flex-wrap gap-2 my-2 max-w-8/12">
                        {msg.artifacts.map((artifact) => (
                          <Button
                            key={artifact.path}
                            variant="outline"
                            className="h-fit gap-2 px-3 py-2 rounded-xl text-xs"
                            title={artifact.name}
                            onClick={() => handleDownloadArtifact(artifact)}
                          >
                            <Download size={14} />
                            <span className="truncate max-w-[16rem]">{artifact.name}</span>
                          </Button>
                        ))}
                      </div>
                    )}

                    <div className="flex flex-row">
                      <Button
                        variant="outline"
                        className="p-2 rounded-full border-none w-fit h-fit"
                        onClick={() => handleCopy(msg.answer)}
                      >
                        <Copy size={16} />
                      </Button>
                      <Button
                        variant={msg.rate === 1 ? "active" : "outline"}
                        className="p-2 rounded-full border-none w-fit h-fit"
                        disabled={msg.rate !== null}
                        onClick={() => handleVote(1, msg.rate, msg.id, idChat)}
                      >
                        <ThumbUpIcon size={16} />
                      </Button>
                      <Button
                        variant={msg.rate === 0 ? "active" : "outline"}
                        className="p-2 rounded-full border-none w-fit h-fit"
                        disabled={msg.rate !== null}
                        onClick={() => handleVote(0, msg.rate, msg.id, idChat)}
                      >
                        <ThumbDownIcon size={16} />
                      </Button>
                      <Button
                        variant="outline"
                        className="p-2 rounded-full border-none w-fit h-fit"
                        onClick={() => handleRegenerate(msg.id)}
                      >
                        <RefreshCwIcon size={16} />
                      </Button>
                    </div>
                  </div>
                )}
              </Fragment>
            ))}
          {isLoading && (
            <div className="w-full max-w-xl">
              {/* Con `value` la barra pasa a modo determinado: el porcentaje sale
                  del avance real del pipeline (OCR, extracción, render), no de
                  una animación simulada. */}
              <ProgressBar
                value={runProgress.value}
                label={runProgress.label}
                showValue
              />
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div
          ref={messagesEndRef}
          className="shrink-0 min-w-[24px] min-h-[24px]"
        />
      </div>

      <InputGPT
        question={question}
        setQuestion={setQuestion}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        instructions={instructions}
        setInstructions={setInstructions}
        hasStartedChat={false}
        key={id}
        files={files}
        setFiles={setFiles}
        isSearch={isSearch}
        setIsSearch={setIsSearch}
        handleStop={handleStop}
      />
    </>
  );
}

const ChatSkeleton = () => (
  <div className="p-4 space-y-6">
    {" "}
    {/* Espacio entre los mensajes simulados */}
    {/* Mensaje 1: IA (Izquierda) */}
    <div className="flex justify-start animate-pulse">
      <div
        className="w-full max-w-xl h-8 rounded-xl
                   bg-gray-300 dark:bg-gray-600"
      />
    </div>
    {/* Mensaje 2: IA (Izquierda, más corto) */}
    <div className="flex justify-start animate-pulse">
      <div
        className="w-3/4 max-w-md h-8 rounded-xl
                   bg-gray-300 dark:bg-gray-600"
      />
    </div>
    {/* Mensaje 3: Usuario (Derecha) */}
    <div className="flex justify-end animate-pulse">
      <div
        className="w-1/3 max-w-xs h-8 rounded-xl
                   /* Usamos un color distintivo para simular el mensaje del usuario */
                   bg-blue-200 dark:bg-gray-800"
      />
    </div>
    {/* Mensaje 4: IA (Izquierda) */}
    <div className="flex justify-start animate-pulse">
      <div
        className="w-4/5 max-w-lg h-8 rounded-xl
                   bg-gray-300 dark:bg-gray-600"
      />
    </div>
    {/* Mensaje 5: Usuario (Derecha, más largo) */}
    <div className="flex justify-end animate-pulse">
      <div
        className="w-2/5 max-w-sm h-8 rounded-xl
                   bg-blue-200 dark:bg-gray-800"
      />
    </div>
  </div>
);
