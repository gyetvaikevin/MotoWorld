// src/hooks/friends/useFriendActions.js
import {
  setDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import { db } from "../../services/firebase";
import { notifyUser } from "../../utils/notifyUser";
import { useAuth } from "../../contexts/AuthContext";

export function useFriendActions() {
  const { user, firebaseUser } = useAuth();
  const uid = firebaseUser?.uid;

  if (!uid) throw new Error("useFriendActions: nincs bejelentkezett Firebase user");

  // Küldés: duplikált jelölés tiltása (saját friends olvasás), címzett alá nem olvasunk.
  const sendFriendRequest = async (targetUid) => {
    if (!targetUid || targetUid === uid) return;

    // már barátok vagytok? (saját olvasás: engedett)
    const myFriendRef = doc(db, "users", uid, "friends", targetUid);
    const myFriendSnap = await getDoc(myFriendRef);
    if (myFriendSnap.exists()) {
      return;
    }

    // request létrehozása: doc ID = küldő uid (determinista), olvasás nélkül
    const reqDocRef = doc(db, "users", targetUid, "friendRequests", uid);
    await setDoc(reqDocRef, {
      fromUid: uid,
      createdAt: serverTimestamp(),
    });

    // értesítés a címzettnek
    await notifyUser({
      type: "friendRequest",
      senderId: uid,
      senderName: user?.displayName || "Ismeretlen",
      senderPhoto: user?.photoURL || "/default-avatar.png",
      receiverId: targetUid,
      relatedId: uid,
    });
  };

  // Bejövő request elutasítása: a címzett oldalán töröljük (engedett)
  const cancelFriendRequest = async (fromUid) => {
    if (!fromUid) return;
    const incomingReqRef = doc(db, "users", uid, "friendRequests", fromUid);
    await deleteDoc(incomingReqRef);
  };

  // Elfogadás: kétoldalú barátság + bejövő request törlése
  const acceptFriendRequest = async (fromUid) => {
    if (!fromUid) return;

    // saját oldal
    const myFriendRef = doc(db, "users", uid, "friends", fromUid);
    await setDoc(myFriendRef, {
      friendUid: fromUid,
      createdAt: serverTimestamp(),
    });

    // küldő oldal
    const otherFriendRef = doc(db, "users", fromUid, "friends", uid);
    await setDoc(otherFriendRef, {
      friendUid: uid,
      createdAt: serverTimestamp(),
    });

    // töröljük a beérkező requestet (doc ID = fromUid)
    const incomingReqRef = doc(db, "users", uid, "friendRequests", fromUid);
    await deleteDoc(incomingReqRef);

    // értesítés a küldőnek, hogy elfogadtad
    await notifyUser({
      type: "friendRequestAccepted",
      senderId: uid,
      senderName: user?.displayName || "Ismeretlen",
      senderPhoto: user?.photoURL || "/default-avatar.png",
      receiverId: fromUid,
      relatedId: uid,
    });
  };

  // Barát törlése: szimmetrikus törlés mindkét oldalon
  const removeFriend = async (friendUid) => {
    if (!friendUid) return;
    const myFriendRef = doc(db, "users", uid, "friends", friendUid);
    await deleteDoc(myFriendRef);

    const otherFriendRef = doc(db, "users", friendUid, "friends", uid);
    await deleteDoc(otherFriendRef);
  };

  return {
    sendFriendRequest,
    cancelFriendRequest,
    acceptFriendRequest,
    removeFriend,
  };
}
