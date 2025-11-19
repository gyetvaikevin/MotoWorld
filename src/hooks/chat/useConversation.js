// src/hooks/chat/useConversation.js
import { useEffect, useState } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../services/firebase";
import { useAuth } from "../../contexts/AuthContext";

export default function useConversation(conversation) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid || !conversation?.id) return;

    const q = query(
      collection(db, "conversations", conversation.id, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    return () => unsub();
  }, [user, conversation]);

  const sendMessage = async (text) => {
    if (!text.trim() || !user?.uid || !conversation?.participants) return;

    const receiverId = conversation.participants.find(
      (uid) => uid !== user.uid
    );
    if (!receiverId) return;

    // 🔥 új üzenet mindig olvasatlan
    await addDoc(collection(db, "conversations", conversation.id, "messages"), {
      senderId: user.uid,
      receiverId,
      text: text.trim(),
      createdAt: serverTimestamp(),
      read: false,
    });

    // 🔥 Frissítjük a beszélgetés meta adatait
    await updateDoc(doc(db, "conversations", conversation.id), {
      updatedAt: serverTimestamp(),
      lastMessage: text.trim(),
    });

    // ❌ notifyUser törölve – nem kell normál értesítés chathez
  };

  return { messages, loading, sendMessage };
}
