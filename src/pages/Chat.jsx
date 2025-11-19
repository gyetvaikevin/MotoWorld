import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import ChatList from "../components/chat/ChatList";
import ChatWindow from "../components/chat/ChatWindow";
import NewChat from "../components/chat/NewChat";

export default function ChatPage() {
  const { user } = useAuth(); // globális user
  const [activeConv, setActiveConv] = useState(null);

  if (!user) {
    return <p>Kérlek jelentkezz be a chat használatához.</p>;
  }

  return (
    <div style={{ display: "flex", gap: "1rem", height: "80vh" }}>
      {/* Bal oldali panel: beszélgetések + új chat indítása */}
      <div style={{ width: "30%", borderRight: "1px solid #333", padding: "0.5rem" }}>
        <NewChat user={user} onSelect={setActiveConv} />
        <ChatList user={user} onSelect={setActiveConv} />
      </div>

      {/* Jobb oldali panel: aktív beszélgetés */}
      <div style={{ flex: 1, padding: "0.5rem" }}>
        {activeConv ? (
          <ChatWindow user={user} conversation={activeConv} />
        ) : (
          <p>Válassz egy beszélgetést, vagy indíts újat.</p>
        )}
      </div>
    </div>
  );
}
