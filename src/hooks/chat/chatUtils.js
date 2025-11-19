// src/hooks/chat/chatUtils.js
import {
  collection,
  setDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  doc,
} from "firebase/firestore";
import { db } from "../../services/firebase";

// Új beszélgetés indítása vagy meglévő visszaadása
export async function startConversation(currentUid, partnerUid) {
  // Megnézzük, van-e már közös beszélgetés
  const q = query(
    collection(db, "conversations"),
    where("participants", "array-contains", currentUid)
  );
  const snap = await getDocs(q);

  const existing = snap.docs.find((d) => {
    const parts = Array.isArray(d.data().participants) ? d.data().participants : [];
    return parts.includes(partnerUid);
  });

  if (existing) return existing.id;

  // Ha nincs, létrehozunk egyet
  const docRef = doc(collection(db, "conversations"));
  await setDoc(docRef, {
    participants: [currentUid, partnerUid],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    lastMessage: "",
  });

  return docRef.id;
}
