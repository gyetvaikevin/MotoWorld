// src/components/chat/StartChatButton.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function StartChatButton({ targetUid }) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (!targetUid) return;
    // 🔥 átirányítjuk a chat oldalra, paraméterrel
    navigate(`/chat/${targetUid}`);
  };

  return (
    <button className="start-chat-btn" onClick={handleClick}>
      💬 Üzenet küldése
    </button>
  );
}
