// src/components/chat/AddMemberModal.jsx
import { useState } from "react";
import { db } from "../../services/firebase";
import {
  doc,
  getDoc,
  addDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { useAuth } from "../../contexts/AuthContext";

const DEFAULT_GROUP_AVATAR = "/default-avatar-group.png";

export default function AddMemberModal({ convId, onClose }) {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    if (!search.trim()) return;
    const q = query(
      collection(db, "users"),
      where("displayName", ">=", search.trim())
    );
    const snap = await getDocs(q);
    const users = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    setResults(users);
  };

  const handleAdd = async (uid) => {
    try {
      const snap = await getDoc(doc(db, "conversations", convId));
      if (!snap.exists()) return;
      const oldConv = snap.data();

      const newParticipants = [...new Set([...oldConv.participants, uid])];

      const newConvRef = await addDoc(collection(db, "conversations"), {
        participants: newParticipants,
        isGroup: true,
        name: oldConv.isGroup ? (oldConv.name || "Új csoport") : "Új csoport",
        // Soha ne legyen null: ha volt csoport, megtartjuk vagy fallback; ha privát, adunk defaultot
        photoURL: oldConv.isGroup
          ? (oldConv.photoURL || DEFAULT_GROUP_AVATAR)
          : DEFAULT_GROUP_AVATAR,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastMessage: "Új tag hozzáadva",
        createdBy: user.uid,
      });

      onClose({ newConvId: newConvRef.id });
    } catch (err) {
      console.error("❌ Új beszélgetés létrehozási hiba:", err);
    }
  };

  return (
    <div className="chat-modal-overlay" onClick={() => onClose(null)}>
      <div className="chat-modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>Új tag hozzáadása</h3>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Keresés név alapján..."
        />
        <button onClick={handleSearch}>Keresés</button>

        <div>
          {results.map((u) => (
            <div
              key={u.id}
              onClick={() => handleAdd(u.id)}
              style={{
                cursor: "pointer",
                padding: "0.5rem",
                borderBottom: "1px solid #ccc",
              }}
            >
              {u.displayName || u.email || u.id}
            </div>
          ))}
        </div>

        <button onClick={() => onClose(null)}>Bezárás</button>
      </div>
    </div>
  );
}