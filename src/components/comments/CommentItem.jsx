// src/components/comments/CommentItem.jsx
import React from "react";

export default function CommentItem({ comment, user, onDelete }) {
  return (
    <div className="comment-item">
      <img
        src={comment.authorPhoto || "/default-avatar.png"}
        alt={comment.authorName}
        className="comment-avatar"
      />
      <div className="comment-body">
        <div className="comment-header">
          <span className="comment-author">{comment.authorName}</span>
          {user?.uid === comment.createdByUid && (
            <button className="comment-delete-btn" onClick={onDelete}>
              🗑
            </button>
          )}
        </div>
        <p className="comment-text">{comment.text}</p>
      </div>
    </div>
  );
}
