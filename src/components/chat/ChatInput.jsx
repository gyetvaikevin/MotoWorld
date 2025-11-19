// src/components/chat/ChatInput.jsx
import { useState } from "react";

export default function ChatInput({ onSend }) {
  const [text, setText] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSend(text);
    setText("");
  };

  return (
    <form className="chat-input" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Írj üzenetet..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button type="submit">Küldés</button>
    </form>
  );
}
