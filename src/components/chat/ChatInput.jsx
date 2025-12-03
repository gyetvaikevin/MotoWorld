// src/components/chat/ChatInput.jsx
import { useState } from "react";
import "../../styles/ChatInput.css";

export default function ChatInput({ onSend }) {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (file) {
      onSend({ type: "file", file });
      setFile(null);
    } else if (text.trim()) {
      onSend({ type: "text", text: text.trim() });
      setText("");
    }
  };

  return (
    <form className="chat-input" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Írj üzenetet..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <input
        type="file"
        accept="image/*,video/*"
        onChange={(e) => setFile(e.target.files[0])}
      />
      <button type="submit">Küldés</button>
    </form>
  );
}
