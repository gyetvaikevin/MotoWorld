// src/hooks/chat/chatUtils.js
import {
  collection,
  setDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "../../services/firebase";

// Új privát beszélgetés indítása vagy meglévő visszaadása
export async function startConversation(currentUid, partnerUid) {
  // Megnézzük, van-e már privát beszélgetés
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

  // Ha nincs, létrehozunk egyet
  const docRef = doc(collection(db, "conversations"));
  await setDoc(docRef, {
    participants: [currentUid, partnerUid],
    createdBy: currentUid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(), // kötelezően beállítjuk
    lastMessage: "Privát beszélgetés létrehozva", // vizuális jelzés a listában
    isGroup: false,
    photoURL: null,
    name: null,
  });

  // Biztos ami biztos: külön update is, hogy az updatedAt mező tényleg létrejöjjön
  await updateDoc(docRef, { updatedAt: serverTimestamp() });

  return docRef.id;
}

// Új csoportos beszélgetés indítása – mindig új dokumentumot hoz létre
export async function startGroupConversation(currentUid, participantUids, groupName, groupPhotoURL = null) {
  const docRef = doc(collection(db, "conversations"));
  await setDoc(docRef, {
    participants: [currentUid, ...participantUids],
    createdBy: currentUid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(), // kötelezően beállítjuk
    lastMessage: "Új csoport létrehozva", // vizuális jelzés a listában
    isGroup: true,
    photoURL: groupPhotoURL || null,
    name: groupName || "Új csoport",
  });

  // Biztos ami biztos: külön update is, hogy az updatedAt tényleg létrejöjjön
  await updateDoc(docRef, { updatedAt: serverTimestamp() });

  return docRef.id;
}

// Egyszeri javító futtatás: hiányzó updatedAt visszatöltése (createdAt-re vagy mostani időre)
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
        // opcionális: ha teljesen üres a lastMessage, tegyünk be egy jelzést
        lastMessage: data.lastMessage || (data.isGroup ? "Új csoport létrehozva" : "Privát beszélgetés létrehozva"),
      });
    }
  });

  await batch.commit();
}