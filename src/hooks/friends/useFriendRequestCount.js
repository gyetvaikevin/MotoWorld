// src/hooks/friends/useFriendRequestCount.js
import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../services/firebase";
import { useAuth } from "../../contexts/AuthContext";

export function useFriendRequestCount() {
  const { user } = useAuth(); // 🔧 fontos: a contextben a helyes property legyen
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!user?.uid) return;

    // 🔧 mindig a saját uid alatti friendRequests kollekciót figyeljük
    const ref = collection(db, "users", user.uid, "friendRequests");
    const unsub = onSnapshot(ref, (snap) => {
      setCount(snap.size);
    }, (err) => {
      console.error("❌ FriendRequest snapshot hiba:", err);
      setCount(0);
    });

    return () => unsub();
  }, [user?.uid]);

  return count;
}