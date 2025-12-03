import { useState, useEffect } from "react";
import { auth, db } from "../../services/firebase";
import ChatThread from "./ChatThread";
import ChatList from "./ChatList";
import "../../styles/ChatSidebar.css";
import { startConversation } from "../../hooks/chat/chatUtils";
import useChatList from "../../hooks/chat/useChatList";
import useUserSearch from "../../hooks/chat/useUserSearch";
import {
  collection,
  query,
  onSnapshot,
  orderBy,
} from "firebase/firestore";

export default function ChatSidebar() {
  const [open, setOpen] = useState(false);
  const [activeConv, setActiveConv] = useState(null);
  const [search, setSearch] = useState("");
  const [unreadChats, setUnreadChats] = useState(0);
  const { conversations } = useChatList();
  const { results, searchUsers } = useUserSearch();
  const user = auth.currentUser;

  useEffect(() => {
    if (!user?.uid || conversations.length === 0) {
      setUnreadChats(0);
      return;
    }

    const counts = {};
    const unsubs = conversations.map((conv) => {
      const messagesQ = query(
        collection(db, "conversations", conv.id, "messages"),
        orderBy("createdAt", "desc")
      );
      const unsubUnread = onSnapshot(messagesQ, (snap) => {
        const docs = snap.docs.map((d) => d.data());
        const unread = docs.filter(
          (d) => !d.readBy || !d.readBy.includes(user.uid)
        ).length;

        counts[conv.id] = unread;
        conv.unreadCount = unread > 0 ? unread : undefined;

        const total = Object.values(counts).reduce((sum, c) => sum + c, 0);
        setUnreadChats(total);

        const lastMsg = docs[0];
        if (lastMsg) {
          conv.lastMessage =
            lastMsg.text || (lastMsg.type === "image" ? "📷 kép" : "🎥 videó");
          conv.lastMessageCreatedAt = lastMsg.createdAt;
        }
      });

      return () => unsubUnread();
    });

    return () => {
      unsubs.forEach((cleanup) => cleanup());
    };
  }, [user?.uid, conversations]);

  const handleStartConversation = async (partnerId) => {
    if (!partnerId || !user) return;
    const convId = await startConversation(user.uid, partnerId);
    const conv = conversations.find((c) => c.id === convId) || {
      id: convId,
      participants: [user.uid, partnerId],
    };
    setActiveConv(conv);
    setSearch("");
  };

  return (
    <div className={`chat-sidebar ${open ? "open" : ""}`}>
      <button className="chat-toggle" onClick={() => setOpen(!open)}>
        💬
        {unreadChats > 0 && <span className="chat-badge">{unreadChats}</span>}
      </button>

      {open && (
        <div className="chat-content">
          {!activeConv ? (
            <>
              <div className="chat-search">
                <input
                  type="text"
                  placeholder="Keresés név vagy email alapján..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    searchUsers(e.target.value);
                  }}
                />
              </div>

              {search ? (
                <div className="chat-search-results">
                  {results.length > 0 ? (
                    results.map((u) => (
                      <div
                        key={u.id}
                        className="chat-search-item"
                        onClick={() => handleStartConversation(u.id)}
                      >
                        <img
                          src={u.photoURL || "/default-avatar.png"}
                          alt={u.displayName || u.email}
                        />
                        <div>
                          <div className="name">
                            {u.displayName || "Ismeretlen"}
                          </div>
                          <div className="email">{u.email}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="no-results">Nincs találat</p>
                  )}
                </div>
              ) : (
                <div className="chat-list-wrapper">
                  <ChatList
                    conversations={[...conversations].sort((a, b) => {
                      const aTime =
                        a.lastMessageCreatedAt?.toMillis?.() ||
                        a.updatedAt?.toMillis?.() ||
                        a.createdAt?.toMillis?.() ||
                        0;
                      const bTime =
                        b.lastMessageCreatedAt?.toMillis?.() ||
                        b.updatedAt?.toMillis?.() ||
                        b.createdAt?.toMillis?.() ||
                        0;
                      return bTime - aTime;
                    })}
                    onSelect={setActiveConv}
                  />
                </div>
              )}
            </>
          ) : (
            <ChatThread
              conversation={activeConv}
              onBack={() => setActiveConv(null)}
              onNavigateToConversation={(newConvId) => {
                setActiveConv({ id: newConvId });
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}
