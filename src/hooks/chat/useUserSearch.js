// src/hooks/chat/useUserSearch.js
import { useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../services/firebase";
import { useAuth } from "../../contexts/AuthContext";

export default function useUserSearch() {
  const { user } = useAuth();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const searchUsers = async (term) => {
    setLoading(true);
    setError("");
    setResults([]);

    try {
      const trimmed = term.trim().toLowerCase();
      if (!trimmed || !user?.uid) return;

      const snap = await getDocs(collection(db, "users"));
      const allUsers = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

      const filtered = allUsers.filter(
        (u) =>
          u.id !== user.uid &&
          (
            (u.displayName || "").toLowerCase().includes(trimmed) ||
            (u.email || "").toLowerCase().includes(trimmed)
          )
      );

      setResults(filtered);
    } catch (err) {
      console.error("❌ Keresési hiba:", err);
      setError("Hiba történt a keresés közben.");
    } finally {
      setLoading(false);
    }
  };

  return { results, loading, error, searchUsers };
}