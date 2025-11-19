// src/components/comments/CommentForm.jsx
import React, { useState } from "react";

export default function CommentForm({ onSubmit }) {
  const [text, setText] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSubmit(text.trim());
    setText("");
  };

  return (
    <form onSubmit={handleSubmit} className="comment-form">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Írj kommentet..."
        className="comment-input"
      />
      <button type="submit" className="comment-submit-btn">
        Küldés
      </button>
    </form>
  );
}
