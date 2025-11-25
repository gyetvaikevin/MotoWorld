// src/hooks/chat/useChatList.js
import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "../../services/firebase";
import { useAuth } from "../../contexts/AuthContext";

const DEFAULT_GROUP_AVATAR = "/default-avatar-group.png";

export default function useChatList() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setConversations([]);
    setLoading(true);
    if (!user?.uid) return;

    const colRef = collection(db, "conversations");

    const q = query(
      colRef,
      where("participants", "array-contains", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs
          .map((docSnap) => {
            const data = docSnap.data();
            const parts = Array.isArray(data.participants) ? data.participants : [];
            if (!parts.includes(user.uid)) return null;

            return {
              id: docSnap.id,
              participants: parts,
              isGroup: !!data.isGroup,
              name: data.name || (data.isGroup ? "Névtelen csoport" : null),
              // Egységes default
              photoURL: data.photoURL || (data.isGroup ? DEFAULT_GROUP_AVATAR : null),
              createdAt: data.createdAt || null,
              updatedAt: data.updatedAt || null,
              lastMessage: data.lastMessage || "",
              lastMessageCreatedAt: null,
            };
          })
          .filter(Boolean);

        const sorted = [...list].sort((a, b) => {
          const aTime = a.updatedAt?.toMillis?.() || a.createdAt?.toMillis?.() || 0;
          const bTime = b.updatedAt?.toMillis?.() || b.createdAt?.toMillis?.() || 0;
          return bTime - aTime;
        });

        setConversations(sorted);
        setLoading(false);
      },
      (err) => {
        console.error("❌ useChatList snapshot hiba:", err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [user?.uid]);

  return { conversations, loading };
}