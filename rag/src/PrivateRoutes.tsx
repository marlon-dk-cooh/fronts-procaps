import { Route, Routes } from "react-router-dom";
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
import { Home } from "./pages/home/Home";
import { Valida } from "./pages/valida/Valida";

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

  useEffect(() => {
    getAllChats();
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/valida" element={<Valida />} />

      <Route
        element={
          <MainLayout
            chats={chats}
            removeChatFromState={removeChatFromState}
            isLoading={isLoadingChats}
          />
        }
      >
        <Route
          path="/sema"
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
          path="/sema/c/:id"
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
    </Routes>
  );
}
