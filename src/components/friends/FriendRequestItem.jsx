// src/components/friends/FriendRequestItem.jsx
import React from "react";
import useUserProfile from "../../hooks/useUserProfile";
import { useFriendActions } from "../../hooks/friends/useFriendActions";

export default function FriendRequestItem({ req }) {
  const profile = useUserProfile(req.fromUid);
  const { acceptFriendRequest, cancelFriendRequest } = useFriendActions();

  if (!profile) return null;

  return (
    <li className="friend-request-item">
      {profile.photoURL && (
        <img src={profile.photoURL} alt={profile.displayName || req.fromUid} />
      )}
      <span>{profile.displayName || req.fromUid}</span>
      <button onClick={() => acceptFriendRequest(req.fromUid, req.id)}>Elfogad</button>
      <button onClick={() => cancelFriendRequest(req.fromUid, req.id)}>Elutasít</button>
    </li>
  );
}
