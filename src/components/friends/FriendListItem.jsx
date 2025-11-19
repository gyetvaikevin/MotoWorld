// src/components/friends/FriendListItem.jsx
import React from "react";
import useUserProfile from "../../hooks/useUserProfile";
import { useFriendActions } from "../../hooks/friends/useFriendActions";

export default function FriendListItem({ uid }) {
  const profile = useUserProfile(uid);
  const { removeFriend } = useFriendActions();

  if (!profile) return null;

  return (
    <li className="friend-item">
      {profile.photoURL && (
        <img src={profile.photoURL} alt={profile.displayName || uid} />
      )}
      <span>{profile.displayName || uid}</span>
      <button onClick={() => removeFriend(uid)}>Eltávolít</button>
    </li>
  );
}
