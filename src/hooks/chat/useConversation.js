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
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../services/firebase";
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
  }, [user?.uid, conversation?.id]);

  const sendMessage = async (msg) => {
    if (!user?.uid || !conversation?.id) return;

    if (msg.type === "text") {
      await addDoc(collection(db, "conversations", conversation.id, "messages"), {
        senderId: user.uid,
        type: "text",
        text: msg.text.trim(),
        createdAt: serverTimestamp(),
        readBy: [user.uid],
      });

      // frissítsük a beszélgetés meta adatokat
      await updateDoc(doc(db, "conversations", conversation.id), {
        updatedAt: serverTimestamp(),
        lastMessage: msg.text.trim(),
      });
    }

    if (msg.type === "file") {
      const fileRef = ref(storage, `chat/${conversation.id}/${Date.now()}-${msg.file.name}`);
      await uploadBytes(fileRef, msg.file);
      const url = await getDownloadURL(fileRef);

      const fileType = msg.file.type.startsWith("video") ? "video" : "image";

      await addDoc(collection(db, "conversations", conversation.id, "messages"), {
        senderId: user.uid,
        type: fileType,
        mediaUrl: url,
        createdAt: serverTimestamp(),
        readBy: [user.uid],
      });

      await updateDoc(doc(db, "conversations", conversation.id), {
        updatedAt: serverTimestamp(),
        lastMessage: fileType === "video" ? "🎥 Videó" : "📷 Kép",
      });
    }
  };

  return { messages, loading, sendMessage };
}