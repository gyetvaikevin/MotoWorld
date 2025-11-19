// src/components/events/EventCard.jsx
import React, { useState } from "react";
import Comments from "../comments/Comments";
import LikesModal from "./LikesModal";
import UserNameLink from "../profile/UserNameLink"; 

export default function EventCard({
  event,
  user,
  onEdit,
  onDelete,
  onLike,
  openRouteInMaps,
}) {
  const [showLikes, setShowLikes] = useState(false);

  return (
    <div className="card event-card">
      <div className="event-header">
        <img
          src={event.authorPhoto || "/default-avatar.png"}
          alt={event.authorName}
          className="event-avatar"
        />
        <span className="event-author">
          <UserNameLink
            uid={event.createdByUid}
            displayName={event.authorName}
          />
        </span>
      </div>

      <h3>{event.title}</h3>
      <p>{event.desc}</p>
      {event.imageUrl && (
        <img src={event.imageUrl} alt={event.title} className="preview" />
      )}

      {event.stops?.length >= 2 && (
        <button onClick={() => openRouteInMaps(event.stops)}>
          Útvonal megnyitása térkép appban
        </button>
      )}

      <div className="event-actions">
        <button onClick={() => onLike(event.id)}>👍</button>
        <span className="likes-count" onClick={() => setShowLikes(true)}>
          {event.likes?.length || 0} ember kedveli
        </span>

        {user?.uid === event.createdByUid && (
          <>
            <button onClick={() => onEdit(event)}>Szerkesztés</button>
            <button onClick={() => onDelete(event.id, event.imagePath)}>
              Törlés
            </button>
          </>
        )}
      </div>

      <Comments parentId={event.id} parentType="events" user={user} />

      {showLikes && (
        <LikesModal
          likes={event.likes || []}
          onClose={() => setShowLikes(false)}
        />
      )}
    </div>
  );
}
