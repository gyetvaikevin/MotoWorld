
import { useEffect, useState } from "react";
import { db } from "../../services/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function useCurrentUserData(user) {
  const [currentUserData, setCurrentUserData] = useState(null);

  useEffect(() => {
    if (!user?.uid) return;
    getDoc(doc(db, "users", user.uid)).then((snap) => {
      if (snap.exists()) setCurrentUserData(snap.data());
    });
  }, [user?.uid]);

  return currentUserData;
}