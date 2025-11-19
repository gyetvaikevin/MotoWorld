// src/components/comments/CommentItem.jsx
import React from "react";
import UserNameLink from "../profile/UserNameLink";

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
          <UserNameLink uid={comment.createdByUid} displayName={comment.authorName} />
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
