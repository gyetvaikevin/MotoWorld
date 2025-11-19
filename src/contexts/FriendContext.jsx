// src/contexts/FriendContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { onSnapshot, collection } from "firebase/firestore";
import { db } from "../services/firebase";
import { useAuth } from "./AuthContext";

const FriendContext = createContext();

export function FriendProvider({ children }) {
  const { user } = useAuth();
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    if (!user?.uid) return;
    const favsRef = collection(db, "users", user.uid, "friends");
    const reqRef  = collection(db, "users", user.uid, "friendRequests");

    const unsubFavs = onSnapshot(favsRef, (snap) =>
      setFriends(snap.docs.map((d) => d.id))
    );
    const unsubReqs = onSnapshot(reqRef, (snap) =>
      setRequests(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    return () => {
      unsubFavs(); unsubReqs();
    };
  }, [user]);

  return (
    <FriendContext.Provider value={{ friends, requests }}>
      {children}
    </FriendContext.Provider>
  );
}

export const useFriends = () => useContext(FriendContext);
