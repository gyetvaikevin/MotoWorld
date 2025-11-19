// src/utils/notifyUser.js
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../services/firebase";

export const notifyUser = async ({
  type,
  senderId,
  senderName,
  senderPhoto,
  receiverId,
  relatedId,
}) => {
  // Biztonsági guard
  if (!type || !senderId || !receiverId || senderId === receiverId) return;

  const data = {
    type,                         // pl. "friendRequest", "comment", "message"
    senderId,
    senderName: senderName || "Ismeretlen",
    senderPhoto: senderPhoto || "/default-avatar.png",
    receiverId,
    relatedId: relatedId || null, // mindig legyen benne, akkor is ha null
    read: false,                  // új értesítés mindig olvasatlan
    createdAt: serverTimestamp(),
  };

  try {
    await addDoc(collection(db, "notifications"), data);
  } catch (err) {
    console.error("❌ Értesítés hiba:", err);
  }
};

export default notifyUser;
