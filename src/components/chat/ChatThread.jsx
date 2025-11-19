// src/components/chat/ChatThread.jsx
import { useRef, useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import ChatInput from "./ChatInput";
import useConversation from "../../hooks/chat/useConversation";
import { db } from "../../services/firebase";
import { doc, getDoc, writeBatch } from "firebase/firestore";

const DEFAULT_AVATAR = "/default-avatar.png";

export default function ChatThread({ conversation, onBack }) {
  const { user } = useAuth();
  const { messages, sendMessage } = useConversation(conversation);
  const [partner, setPartner] = useState(null);
  const [currentUserData, setCurrentUserData] = useState(null);
  const scrollRef = useRef(null);

  // saját user Firestore adatai
  useEffect(() => {
    if (!user?.uid) return;
    getDoc(doc(db, "users", user.uid)).then((snap) => {
      if (snap.exists()) setCurrentUserData(snap.data());
    });
  }, [user]);

  // partner adatok
  useEffect(() => {
    const loadPartner = async () => {
      if (!conversation?.participants || !user?.uid) return;
      const partnerId = conversation.participants.find((id) => id !== user.uid);
      if (!partnerId) return;
      const snap = await getDoc(doc(db, "users", partnerId));
      if (snap.exists()) setPartner(snap.data());
    };
    loadPartner();
  }, [conversation, user]);

  // scroll + olvasatlan üzenetek olvasottra állítása
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
    if (messages.length > 0 && user?.uid && conversation?.id) {
      const batch = writeBatch(db);
      messages.forEach((m) => {
        if (m.receiverId === user.uid && m.read === false) {
          batch.update(
            doc(db, "conversations", conversation.id, "messages", m.id),
            { read: true }
          );
        }
      });
      batch.commit();
    }
  }, [messages, user, conversation?.id]);

  return (
    <div className="chat-thread">
      <button onClick={onBack}>← Vissza</button>

      <div className="chat-messages" ref={scrollRef}>
        {messages.map((m) => (
          <div
            key={m.id}
            className={`chat-message ${
              m.senderId === user.uid ? "self" : "partner"
            }`}
          >
            <img
              src={
                m.senderId === user.uid
                  ? currentUserData?.photoURL || DEFAULT_AVATAR
                  : partner?.photoURL || DEFAULT_AVATAR
              }
              alt="avatar"
              className="chat-avatar"
            />
            <div className="bubble">{m.text}</div>
          </div>
        ))}
      </div>

      <ChatInput onSend={sendMessage} />
    </div>
  );
}
