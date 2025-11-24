// src/hooks/chat/useChatList.js
import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
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

    // Elsődleges: updatedAt szerint rendezzük, hogy az új csoport azonnal előre kerüljön.
    const qPrimary = query(
      colRef,
      where("participants", "array-contains", user.uid),
      orderBy("updatedAt", "desc")
    );

    // Fallback: ha az updatedAt rendezés nem elérhető (index vagy régi adatok miatt),
    // visszaesünk createdAt szerintire, ami minden dokumentumban megvan.
    const qFallback = query(
      colRef,
      where("participants", "array-contains", user.uid),
      orderBy("createdAt", "desc")
    );

    let unsub = null;
    let usedFallback = false;

    const attach = (q) =>
      onSnapshot(
        q,
        (snap) => {
          const list = snap.docs
            .map((docSnap) => {
              const data = docSnap.data();
              const parts = Array.isArray(data.participants)
                ? data.participants
                : [];
              if (!parts.includes(user.uid)) return null;

              return {
                id: docSnap.id,
                participants: parts,
                isGroup: !!data.isGroup,
                name: data.name || (data.isGroup ? "Névtelen csoport" : null),
                photoURL:
                  data.photoURL || (data.isGroup ? "/default-group.png" : null),
                createdAt: data.createdAt || null,
                updatedAt: data.updatedAt || null,
                lastMessage: data.lastMessage || "",
                lastMessageCreatedAt: null, // Sidebar tölti külön, ha szükséges
              };
            })
            .filter(Boolean);

          // Kliens oldali rendezés: preferáljuk updatedAt-et, ha nincs, createdAt.
          const sorted = [...list].sort((a, b) => {
            const aTime =
              a.updatedAt?.toMillis?.() ||
              a.createdAt?.toMillis?.() ||
              0;
            const bTime =
              b.updatedAt?.toMillis?.() ||
              b.createdAt?.toMillis?.() ||
              0;
            return bTime - aTime;
          });

          setConversations(sorted);
          setLoading(false);
        },
        () => {
          // Ha a primer lekérés nem működik (pl. index hiány), válts fallbackre.
          if (!usedFallback) {
            usedFallback = true;
            if (unsub) unsub();
            unsub = attach(qFallback);
          } else {
            // Ha a fallback is hibázik, legalább állítsuk le a loadingot.
            setLoading(false);
          }
        }
      );

    unsub = attach(qPrimary);

    return () => {
      if (unsub) unsub();
    };
  }, [user?.uid]);

  return { conversations, loading };
}