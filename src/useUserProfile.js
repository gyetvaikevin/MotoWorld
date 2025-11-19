// src/hooks/useUserProfile.js
import { useState, useEffect } from "react";
import { auth, db } from "../services/firebase";
import { doc, onSnapshot } from "firebase/firestore";

export default function useUserProfile() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const ref = doc(db, "users", user.uid);
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        setProfile(snap.data());
      }
    });

    return () => unsub();
  }, []);

  return profile;
}
