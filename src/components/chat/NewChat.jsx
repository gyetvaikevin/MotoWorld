// src/components/chat/NewChat.jsx
import { useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../services/firebase";
import { startConversation } from "../../hooks/chat/chatUtils";
import { useAuth } from "../../contexts/AuthContext";

const DEFAULT_AVATAR = "/default-avatar.png";

export default function NewChat({ onSelect }) {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSearch = async () => {
    if (!search.trim() || !user?.uid) return;
    setLoading(true);
    setMessage("");
    setResults([]);

    try {
      const q = query(
        collection(db, "users"),
        where("displayName", ">=", search.trim())
      );

      const snap = await getDocs(q);
      const filtered = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((u) => u.id !== user.uid);

      if (filtered.length === 0) {
        setMessage("Nincs találat.");
      }
      setResults(filtered);
    } catch (err) {
      console.error("❌ Keresési hiba:", err);
      setMessage("Hiba történt a keresés közben.");
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async (partner) => {
    if (!user?.uid || !partner?.id) return;
    try {
      const convId = await startConversation(user.uid, partner.id, {
        participants: [user.uid, partner.id],
        isGroup: false,
      });

      onSelect({ id: convId, participants: [user.uid, partner.id], isGroup: false });
      setSearch("");
      setResults([]);
    } catch (err) {
      console.error("❌ Beszélgetés indítási hiba:", err);
    }
  };

  return (
    <div style={{ marginBottom: "1rem" }}>
      <h3>Új beszélgetés indítása</h3>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Keresés név alapján..."
          style={{ flex: 1, padding: "0.5rem" }}
        />
        <button onClick={handleSearch}>Keresés</button>
      </div>

      {loading && <p>Keresés folyamatban...</p>}
      {message && <p>{message}</p>}

      <div>
        {results.map((u) => (
          <div
            key={u.id}
            onClick={() => handleStart(u)}
            style={{
              cursor: "pointer",
              padding: "0.5rem",
              borderBottom: "1px solid #ccc",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            {u.photoURL ? (
              <img
                src={u.photoURL}
                alt={u.displayName}
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
              />
            ) : (
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  backgroundColor: "#ccc",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "14px",
                  fontWeight: "bold",
                }}
              >
                {u.displayName?.[0]?.toUpperCase() || "?"}
              </div>
            )}
            <span>{u.displayName || u.email || u.id}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
