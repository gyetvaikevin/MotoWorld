// src/hooks/chat/useChatList.js
import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "../../services/firebase";
import { useAuth } from "../../contexts/AuthContext";

export default function useChatList() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setConversations([]);
    setLoading(true);
    if (!user?.uid) return;

    const colRef = collection(db, "conversations");

    // 🔧 Mindig createdAt szerint kérünk le, mert az biztosan van minden dokumentumban
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
              photoURL: data.photoURL || (data.isGroup ? "/default-group.png" : null),
              createdAt: data.createdAt || null,
              updatedAt: data.updatedAt || null,
              lastMessage: data.lastMessage || "",
              lastMessageCreatedAt: null, // Sidebar tölti külön
            };
          })
          .filter(Boolean);

        // 🔧 Kliens oldali rendezés: preferáljuk updatedAt-et, ha van, különben createdAt
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