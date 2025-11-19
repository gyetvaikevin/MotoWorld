// src/components/chat/ChatSidebar.jsx
import { useState, useEffect } from "react";
import { auth, db } from "../../services/firebase";
import ChatThread from "./ChatThread";
import ChatList from "./ChatList";
import "./Chat.css";
import { startConversation } from "../../hooks/chat/chatUtils";
import useChatList from "../../hooks/chat/useChatList";
import useUserSearch from "../../hooks/chat/useUserSearch";
import { collection, query, where, onSnapshot, orderBy, limit } from "firebase/firestore";

export default function ChatSidebar() {
  const [open, setOpen] = useState(false);
  const [activeConv, setActiveConv] = useState(null);
  const [search, setSearch] = useState("");
  const [unreadChats, setUnreadChats] = useState(0);
  const { conversations } = useChatList();
  const { results, searchUsers } = useUserSearch();
  const user = auth.currentUser;

  // Olvasatlan üzenetek számláló + lastMessage időbélyeg
  useEffect(() => {
    if (!user?.uid || conversations.length === 0) {
      setUnreadChats(0);
      return;
    }

    const counts = {};
    const unsubs = conversations.map((conv) => {
      // Olvasatlanok számlálása
      const unreadQ = query(
        collection(db, "conversations", conv.id, "messages"),
        where("receiverId", "==", user.uid),
        where("read", "==", false)
      );
      const unsubUnread = onSnapshot(unreadQ, (snap) => {
        counts[conv.id] = snap.size;
        conv.unreadCount = snap.size; // 🔥 csak akkor jelenik meg, ha > 0
        const total = Object.values(counts).reduce((sum, c) => sum + c, 0);
        setUnreadChats(total);
      });

      // Legutolsó üzenet időbélyegének lekérése
      const lastMsgQ = query(
        collection(db, "conversations", conv.id, "messages"),
        orderBy("createdAt", "desc"),
        limit(1)
      );
      const unsubLast = onSnapshot(lastMsgQ, (snap) => {
        if (!snap.empty) {
          const lastMsg = snap.docs[0].data();
          conv.lastMessage = lastMsg.text;
          conv.lastMessageCreatedAt = lastMsg.createdAt;
        }
      });

      return () => {
        unsubUnread();
        unsubLast();
      };
    });

    return () => {
      unsubs.forEach((cleanup) => cleanup());
    };
  }, [user?.uid, conversations]);

  const handleStartConversation = async (partnerId) => {
    if (!partnerId || !user) return;
    const convId = await startConversation(user.uid, partnerId);
    const conv =
      conversations.find((c) => c.id === convId) || {
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

              {search && (
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
              )}

              {!search && (
                <ChatList
                  conversations={[...conversations].sort((a, b) => {
                    const aTime = a.lastMessageCreatedAt?.toMillis?.() || 0;
                    const bTime = b.lastMessageCreatedAt?.toMillis?.() || 0;
                    return bTime - aTime; // 🔥 legfrissebb felül
                  })}
                  onSelect={setActiveConv}
                />
              )}
            </>
          ) : (
            <ChatThread
              conversation={activeConv}
              onBack={() => setActiveConv(null)}
            />
          )}
        </div>
      )}
    </div>
  );
}
