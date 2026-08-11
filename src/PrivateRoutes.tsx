import { Navigate, Route, Routes } from "react-router-dom";
import { Chat } from "./pages/chatGPT/chat";
import {
  ChatInterface,
  ConversationSessionResponse,
} from "./interfaces/interfaces";
import { useEffect, useState } from "react";
import { MainLayout } from "./components/layout/MainLayout";
import { ChatSQL } from "./pages/chatSql/chatSQL";
import api from "./api/ApiGPT";
import { getAuthToken } from "./utils/auth";

export default function AppRoutes() {
  const [chats, setChats] = useState<ChatInterface[]>([]);
  const [allMessages, setAllMessages] = useState({});
  const [isLoadingChats, setIsLoadingChats] = useState(false);

  function getAllChats() {
    setIsLoadingChats(true);
    api
      .requestAllSession(getAuthToken())
      .then((res: ConversationSessionResponse) => {
        setChats(
          res.sessions.map((chat) => ({
            ...chat,
            chatId: chat.id,
            title: chat.conversation_name,
          }))
        );
      })
      .catch((err) => {
        console.error("Error fetching sessions:", err);
      })
      .finally(() => setIsLoadingChats(false));
  }

  function removeChatFromState(chatId: string) {
    if (!chatId) return;
    setChats((prev) => prev.filter((chat) => chat.chatId !== chatId));
    setAllMessages((prev: any) => {
      const newObj = { ...prev };
      delete newObj[chatId];
      return newObj;
    });
  }

  function renameChatInState(chatId: string, newTitle: string) {
    setChats((prev) =>
      prev.map((chat) => (chat.chatId === chatId ? { ...chat, title: newTitle } : chat))
    );
    api.requestRenameSession(chatId, newTitle).catch(console.error);
  }

  useEffect(() => {
    getAllChats();
  }, []);

  return (
    <Routes>
      <Route
        element={
          <MainLayout
            chats={chats}
            removeChatFromState={removeChatFromState}
            renameChatInState={renameChatInState}
            isLoading={isLoadingChats}
          />
        }
      >
        <Route
          path="/"
          element={
            <Chat
              newChat
              setChats={setChats}
              chats={chats}
              allMsgs={allMessages}
              setAllMsg={setAllMessages}
            />
          }
        />
        <Route
          path="/c/:id"
          element={
            <Chat
              setChats={setChats}
              chats={chats}
              allMsgs={allMessages}
              setAllMsg={setAllMessages}
            />
          }
        />
        <Route path="/sql" element={<ChatSQL />} />
      </Route>

      {/* Rutas heredadas del portal (/sema, /valida, ...) caen en el chat. */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
