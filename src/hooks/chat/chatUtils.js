// src/hooks/chat/chatUtils.js
import {
  collection,
  setDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  doc,
  writeBatch,
} from "firebase/firestore";
import { db } from "../../services/firebase";

const DEFAULT_GROUP_AVATAR = "/default-avatar-group.png";

export async function startConversation(currentUid, partnerUid) {
  const q = query(
    collection(db, "conversations"),
    where("participants", "array-contains", currentUid)
  );
  const snap = await getDocs(q);

  const existing = snap.docs.find((d) => {
    const data = d.data();
    const parts = Array.isArray(data.participants) ? data.participants : [];
    return !data.isGroup && parts.length === 2 && parts.includes(partnerUid);
  });

  if (existing) return existing.id;

  const docRef = doc(collection(db, "conversations"));
  await setDoc(docRef, {
    participants: [currentUid, partnerUid],
    createdBy: currentUid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    lastMessage: "Privát beszélgetés létrehozva",
    isGroup: false,
    photoURL: null,
    name: null,
  });

  return docRef.id;
}

export async function startGroupConversation(
  currentUid,
  participantUids,
  groupName,
  groupPhotoURL
) {
  const docRef = doc(collection(db, "conversations"));
  await setDoc(docRef, {
    participants: [currentUid, ...participantUids],
    createdBy: currentUid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    lastMessage: "Új csoport létrehozva",
    isGroup: true,
    photoURL: groupPhotoURL ? groupPhotoURL : DEFAULT_GROUP_AVATAR,
    name: groupName || "Új csoport",
  });

  return docRef.id;
}

export async function backfillMissingUpdatedAtForUser(userUid) {
  const q = query(
    collection(db, "conversations"),
    where("participants", "array-contains", userUid)
  );
  const snap = await getDocs(q);

  const batch = writeBatch(db);
  snap.docs.forEach((docSnap) => {
    const data = docSnap.data();
    if (!data.updatedAt) {
      batch.update(docSnap.ref, {
        updatedAt: data.createdAt || serverTimestamp(),
        lastMessage:
          data.lastMessage ||
          (data.isGroup
            ? "Új csoport létrehozva"
            : "Privát beszélgetés létrehozva"),
      });
    }
  });

  await batch.commit();
}