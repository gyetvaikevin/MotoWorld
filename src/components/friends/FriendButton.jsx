import React, { useMemo } from "react";
import { useFriendshipStatus } from "../../hooks/friends/useFriendshipStatus";
import { useFriendActions } from "../../hooks/friends/useFriendActions";
import "../../styles/Friends.css";

export default function FriendButton({ profileUid }) {

  const { isFriend, hasIncomingRequest, hasOutgoingRequest } =
    useFriendshipStatus(profileUid);
  const {
    sendFriendRequest,
    cancelFriendRequest,
    acceptFriendRequest,
    removeFriend,
  } = useFriendActions();

  if (!profileUid) return null;

  const { label, handler, disabled } = useMemo(() => {
    if (isFriend) {
      return { label: "Ismerősök", handler: () => {}, disabled: true };
    }
    if (hasIncomingRequest) {
      return {
        label: "Elfogadás",
        handler: () => acceptFriendRequest(profileUid),
        disabled: false,
      };
    }
    if (hasOutgoingRequest) {
      return {
        label: "Ismerősnek jelölve",
        handler: () => cancelFriendRequest(profileUid),
        disabled: false,
      };
    }
    return {
      label: "Ismerősnek jelöl",
      handler: () => sendFriendRequest(profileUid),
      disabled: false,
    };
  }, [
    isFriend,
    hasIncomingRequest,
    hasOutgoingRequest,
    profileUid,
    sendFriendRequest,
    acceptFriendRequest,
    cancelFriendRequest,
  ]);

  return (
    <button className="friend-button" onClick={handler} disabled={disabled}>
      {label}
    </button>
  );
}
