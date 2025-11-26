
import { db, storage } from "../../services/firebase";
import {
  collection, addDoc, serverTimestamp, doc, updateDoc
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const DEFAULT_GROUP_AVATAR = "/default-avatar-group.png";

export async function sendMessage(convId, userUid, msg) {
  if (!convId || !userUid) return;
  if (msg.type === "text") {
    return addDoc(collection(db, "conversations", convId, "messages"), {
      senderId: userUid,
      type: "text",
      text: msg.text,
      createdAt: serverTimestamp(),
      readBy: [userUid],
    });
  } else if (msg.type === "file") {
    const fileRef = ref(storage, `chat/${convId}/${Date.now()}-${msg.file.name}`);
    await uploadBytes(fileRef, msg.file);
    const url = await getDownloadURL(fileRef);
    return addDoc(collection(db, "conversations", convId, "messages"), {
      senderId: userUid,
      type: msg.file.type.startsWith("video") ? "video" : "image",
      mediaUrl: url,
      createdAt: serverTimestamp(),
      readBy: [userUid],
    });
  }
}

export async function leaveGroup(convId, userUid, participants) {
  const newParticipants = participants.filter((p) => p !== userUid);
  await updateDoc(doc(db, "conversations", convId), {
    participants: newParticipants,
    updatedAt: serverTimestamp(),
    lastMessage: "Egy tag kilépett a csoportból",
  });
}