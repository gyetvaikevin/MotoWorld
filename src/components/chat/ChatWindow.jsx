// src/components/chat/ChatWindow.jsx
import {
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  orderBy,
  query,
  doc,
  getDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "../../services/firebase";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "../../contexts/AuthContext";
import "./Chat.css";

const DEFAULT_AVATAR = "/default-avatar.png";

export default function ChatWindow({ conversation }) {
  const { user } = useAuth();
  const [convMeta, setConvMeta] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [partner, setPartner] = useState(null);
  const [currentUserData, setCurrentUserData] = useState(null);
  const scrollRef = useRef(null);

  // saját user Firestore adatai
  useEffect(() => {
    if (!user?.uid) return;
    getDoc(doc(db, "users", user.uid)).then((snap) => {
      if (snap.exists()) setCurrentUserData(snap.data());
    });
  }, [user]);

  // Conversation meta
  useEffect(() => {
    const loadConv = async () => {
      if (!conversation?.id || !user?.uid) return;
      try {
        const ref = doc(db, "conversations", conversation.id);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          setConvMeta(null);
          return;
        }
        const data = snap.data();
        const parts = Array.isArray(data.participants) ? data.participants : [];
        if (!parts.includes(user.uid)) {
          setConvMeta(null);
          return;
        }
        setConvMeta({
          id: conversation.id,
          participants: parts,
          createdAt: data.createdAt,
        });
      } catch (err) {
        console.error("❌ Conversation betöltési hiba:", err);
        setConvMeta(null);
      }
    };
    loadConv();
  }, [conversation?.id, user?.uid]);

  // Partner adatainak lekérése
  useEffect(() => {
    const fetchPartner = async () => {
      if (!convMeta?.participants || !user?.uid) return;
      const partnerId = convMeta.participants.find((uid) => uid !== user.uid);
      if (!partnerId) return;
      try {
        const ref = doc(db, "users", partnerId);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const d = snap.data();
          setPartner({
            id: partnerId,
            displayName: d.displayName || partnerId,
            photoURL: d.photoURL || DEFAULT_AVATAR,
          });
        } else {
          setPartner({
            id: partnerId,
            displayName: partnerId,
            photoURL: DEFAULT_AVATAR,
          });
        }
      } catch (err) {
        console.error("❌ Partner betöltési hiba:", err);
      }
    };
    fetchPartner();
  }, [convMeta, user?.uid]);

  // Messages snapshot + olvasatlanok olvasottra állítása
  useEffect(() => {
    if (
      !user?.uid ||
      !convMeta?.id ||
      !convMeta.participants?.includes(user.uid)
    )
      return;

    const q = query(
      collection(db, "conversations", convMeta.id, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setMessages(list);

      // Olvasatlan üzenetek olvasottra állítása
      if (list.length > 0) {
        const batch = writeBatch(db);
        snap.docs.forEach((docSnap) => {
          const data = docSnap.data();
          if (data.receiverId === user.uid && data.read === false) {
            batch.update(docSnap.ref, { read: true });
          }
        });
        batch.commit();
      }

      if (scrollRef.current) {
        setTimeout(() => {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }, 50);
      }
    });

    return () => unsub();
  }, [user?.uid, convMeta?.id, convMeta?.participants]);

  const sendMessage = async () => {
    if (!text.trim() || !user?.uid || !convMeta?.participants || !convMeta?.id)
      return;
    const receiverId = convMeta.participants.find((uid) => uid !== user.uid);
    if (!receiverId) return;
    try {
      await addDoc(collection(db, "conversations", convMeta.id, "messages"), {
        senderId: user.uid,
        receiverId,
        text: text.trim(),
        createdAt: serverTimestamp(),
        read: false, // 🔥 új üzenet mindig olvasatlan
      });
      setText("");
    } catch (err) {
      console.error("❌ Üzenetküldési hiba:", err);
    }
  };

  return (
    <div className="chat-window">
      {/* Fejléc */}
      <div className="chat-header">
        <img
          src={partner?.photoURL || DEFAULT_AVATAR}
          alt={partner?.displayName || "Partner"}
          className="chat-header-avatar"
        />
        <h3 className="chat-header-name">
          {partner?.displayName || "Ismeretlen"}
        </h3>
      </div>

      {/* Üzenetek */}
      <div className="chat-messages" ref={scrollRef}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`chat-message ${
              msg.senderId === user.uid ? "self" : "partner"
            }`}
          >
            <img
              src={
                msg.senderId === user.uid
                  ? currentUserData?.photoURL || DEFAULT_AVATAR
                  : partner?.photoURL || DEFAULT_AVATAR
              }
              alt="avatar"
              className="chat-avatar"
            />
            <div className="bubble">{msg.text}</div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="chat-input">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Írj üzenetet..."
        />
        <button onClick={sendMessage}>Küldés</button>
      </div>
    </div>
  );
}
