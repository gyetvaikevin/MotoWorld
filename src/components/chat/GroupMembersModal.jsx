// src/components/chat/GroupMembersModal.jsx
import { useEffect, useState } from "react";
import { db } from "../../services/firebase";
import { doc, getDoc } from "firebase/firestore";
import "../../styles/ChatModal.css";


const DEFAULT_AVATAR = "/default-avatar.png";

export default function GroupMembersModal({ participants, onClose }) {
  const [members, setMembers] = useState([]);

  useEffect(() => {
    const loadMembers = async () => {
      if (!participants) return;
      const results = [];
      for (const uid of participants) {
        try {
          const snap = await getDoc(doc(db, "users", uid));
          if (snap.exists()) {
            results.push({ id: uid, ...snap.data() });
          } else {
            results.push({ id: uid, displayName: uid, photoURL: DEFAULT_AVATAR });
          }
        } catch (err) {
          results.push({ id: uid, displayName: uid, photoURL: DEFAULT_AVATAR });
        }
      }
      setMembers(results);
    };
    loadMembers();
  }, [participants]);

  return (
    <div className="chat-modal-overlay" onClick={onClose}>
      <div className="chat-modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>Csoport tagjai</h3>
        <ul className="members-list">
          {members.map((m) => (
            <li key={m.id} className="member-item">
              <img
                src={m.photoURL || DEFAULT_AVATAR}
                alt={m.displayName}
                className="member-avatar"
              />
              <span>{m.displayName || m.id}</span>
            </li>
          ))}
        </ul>
        <button className="close-btn" onClick={onClose}>Bezárás</button>
      </div>
    </div>
  );
}