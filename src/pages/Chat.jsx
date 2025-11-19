// src/pages/Chat.jsx
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import ChatList from "../components/chat/ChatList";
import ChatWindow from "../components/chat/ChatWindow";
import NewChat from "../components/chat/NewChat";
import useChatList from "../hooks/chat/useChatList";
import { startConversation } from "../hooks/chat/chatUtils";

export default function ChatPage() {
  const { user } = useAuth();
  const { id: targetUid } = useParams(); // 🔥 paraméter az URL-ből
  const [activeConv, setActiveConv] = useState(null);
  const { conversations } = useChatList();

  // ha van paraméter (pl. /chat/:uid), automatikusan nyissuk meg a beszélgetést
  useEffect(() => {
    const openConversation = async () => {
      if (targetUid && user) {
        // keresd meg, van-e már beszélgetés ezzel a userrel
        let conv = conversations.find((c) =>
          c.participants.includes(targetUid)
        );

        // ha nincs, indíts új beszélgetést
        if (!conv) {
          const convId = await startConversation(user.uid, targetUid);
          conv = { id: convId, participants: [user.uid, targetUid] };
        }

        setActiveConv(conv);
      }
    };
    openConversation();
  }, [targetUid, user, conversations]);

  if (!user) {
    return <p>Kérlek jelentkezz be a chat használatához.</p>;
  }

  return (
    <div style={{ display: "flex", gap: "1rem", height: "80vh" }}>
      {/* Bal oldali panel: beszélgetések + új chat indítása */}
      <div
        style={{
          width: "30%",
          borderRight: "1px solid #333",
          padding: "0.5rem",
        }}
      >
        <NewChat onSelect={setActiveConv} />
        <ChatList conversations={conversations} onSelect={setActiveConv} />
      </div>

      {/* Jobb oldali panel: aktív beszélgetés */}
      <div style={{ flex: 1, padding: "0.5rem" }}>
        {activeConv ? (
          <ChatWindow conversation={activeConv} />
        ) : (
          <p>Válassz egy beszélgetést, vagy indíts újat.</p>
        )}
      </div>
    </div>
  );
}
