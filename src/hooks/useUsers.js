// src/hooks/useUsers.js
import { useState, useEffect } from "react";
import { getDoc, doc } from "firebase/firestore";
import { db } from "../services/firebase";

export default function useUsers(uids = []) {
  const [usersMap, setUsersMap] = useState({});

  useEffect(() => {
    if (!uids.length) {
      setUsersMap({});
      return;
    }

    let cancelled = false;
    (async () => {
      const map = {};
      // lekérdezzük egyedileg minden uid profilját
      for (const uid of Array.from(new Set(uids))) {
        try {
          const snap = await getDoc(doc(db, "users", uid));
          if (snap.exists()) map[uid] = snap.data();
        } catch (err) {
          console.error("useUsers hiba", uid, err);
        }
      }
      if (!cancelled) setUsersMap(map);
    })();

    return () => {
      cancelled = true;
    };
  }, [uids.join(",")]);

  return usersMap;
}
