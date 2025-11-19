// src/hooks/friends/useFriendRequestCount.js
import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../services/firebase";
import { useAuth } from "../../contexts/AuthContext";

export function useFriendRequestCount() {
  const { firebaseUser } = useAuth();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!firebaseUser?.uid) return;

    const ref = collection(db, "users", firebaseUser.uid, "friendRequests");
    const unsub = onSnapshot(ref, (snap) => {
      setCount(snap.size);
    });

    return () => unsub();
  }, [firebaseUser?.uid]);

  return count;
}
