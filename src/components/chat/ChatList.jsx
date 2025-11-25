import { useState, useEffect } from "react";
import { db } from "../../services/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "../../contexts/AuthContext";
import UserNameLink from "../profile/UserNameLink";

const DEFAULT_GROUP_AVATAR = "/default-avatar-group.png"; // 🔧 pontos fájlnév

export default function ChatList({ conversations, onSelect }) {
  const { user } = useAuth();
  const [userCache, setUserCache] = useState({});

  const fetchUser = async (uid) => {
    if (userCache[uid]) return userCache[uid];
    const snap = await getDoc(doc(db, "users", uid));
    if (snap.exists()) {
      const data = snap.data();
      setUserCache((prev) => ({ ...prev, [uid]: data }));
      return data;
    }
    return null;
  };

  // 🔧 partner adatok betöltése useEffect-ben
  useEffect(() => {
    conversations.forEach((conv) => {
      if (!conv.isGroup) {
        const partnerId = conv.participants.find((p) => p !== user?.uid);
        if (partnerId && !userCache[partnerId]) {
          fetchUser(partnerId);
        }
      }
    });
  }, [conversations, user?.uid]);

  return (
    <div className="chat-list">
      <h3>Beszélgetések</h3>
      {conversations.length === 0 && <p>Nincs beszélgetésed.</p>}
      <ul>
        {conversations.map((conv) => {
          const hasUnread = conv.unreadCount && conv.unreadCount > 0;

          if (conv.isGroup) {
            return (
              <li
                key={conv.id}
                onClick={() => onSelect(conv)}
                className={`chat-list-item ${hasUnread ? "unread" : ""}`}
              >
                <img
                  src={conv.photoURL || DEFAULT_GROUP_AVATAR}
                  alt={conv.name || "Csoport"}
                  className="chat-avatar"
                />
                <div className="chat-list-info">
                  <span className="group-name">{conv.name || "Névtelen csoport"}</span>
                  <p className="last-msg">
                    {conv.lastMessage || "Új csoportos beszélgetés"}
                  </p>
                </div>
                {hasUnread && <span className="unread-dot">{conv.unreadCount}</span>}
              </li>
            );
          }

          const partnerId = conv.participants.find((p) => p !== user?.uid);
          if (!partnerId) return null;

          const partner = userCache[partnerId];

          return (
            <li
              key={conv.id}
              onClick={() => onSelect(conv)}
              className={`chat-list-item ${hasUnread ? "unread" : ""}`}
            >
              <img
                src={partner?.photoURL || "/default-avatar.png"}
                alt={partner?.displayName || "Ismeretlen"}
                className="chat-avatar"
              />
              <div className="chat-list-info">
                <UserNameLink uid={partnerId} displayName={partner?.displayName} />
                <p className="last-msg">
                  {conv.lastMessage || "Új beszélgetés"}
                </p>
              </div>
              {hasUnread && <span className="unread-dot">{conv.unreadCount}</span>}
            </li>
          );
        })}
      </ul>
    </div>
  );
}