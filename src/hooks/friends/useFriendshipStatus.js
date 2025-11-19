import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../services/firebase";
import { useAuth } from "../../contexts/AuthContext";

export function useFriendshipStatus(targetUid) {
  const { firebaseUser, loading } = useAuth();
  const uid = firebaseUser?.uid;

  const [isFriend, setIsFriend] = useState(false);
  const [hasIncomingRequest, setHasIncomingRequest] = useState(false);
  const [hasOutgoingRequest, setHasOutgoingRequest] = useState(false);

  useEffect(() => {
    if (loading) return; 
    if (!uid || !targetUid) return;

    const friendRef = doc(db, "users", uid, "friends", targetUid);
    const inReqRef = doc(db, "users", uid, "friendRequests", targetUid);
    const outReqRef = doc(db, "users", targetUid, "friendRequests", uid);

    const unsubF = onSnapshot(friendRef, (snap) => {
      setIsFriend(snap.exists());
    });
    const unsubIn = onSnapshot(inReqRef, (snap) => {
      setHasIncomingRequest(snap.exists());
    });
    const unsubOut = onSnapshot(outReqRef, (snap) => {
      setHasOutgoingRequest(snap.exists());
    });

    return () => {
      unsubF(); unsubIn(); unsubOut();
    };
  }, [loading, uid, targetUid]);

  return { isFriend, hasIncomingRequest, hasOutgoingRequest };
}
