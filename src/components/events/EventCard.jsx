// src/components/events/EventCard.jsx
import React, { useState } from "react";
import { doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db } from "../../services/firebase";
import Comments from "../comments/Comments";
import LikesModal from "./LikesModal";
import AttendeesModal from "./AttendeesModal"; 
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
  const [showAttendees, setShowAttendees] = useState(false);

  const handleAttend = async () => {
    if (!user) return;
    await updateDoc(doc(db, "events", event.id), {
      attendees: arrayUnion(user.uid),
    });
  };

  const handleUnattend = async () => {
    if (!user) return;
    await updateDoc(doc(db, "events", event.id), {
      attendees: arrayRemove(user.uid),
    });
  };

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
        {/* Like rész */}
        <button onClick={() => onLike(event.id)}>👍</button>
        <span className="likes-count" onClick={() => setShowLikes(true)}>
          {event.likes?.length || 0} ember kedveli
        </span>

        {/* Ott leszek rész */}
        {user && (
          <>
            {event.attendees?.includes(user.uid) ? (
              <button onClick={handleUnattend}>Mégsem megyek</button>
            ) : (
              <button onClick={handleAttend}>Ott leszek</button>
            )}
            <span
              className="attendees-count"
              onClick={() => setShowAttendees(true)}
            >
              {event.attendees?.length || 0} ember lesz ott
            </span>
          </>
        )}

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

      {showAttendees && (
        <AttendeesModal
          attendees={event.attendees || []}
          onClose={() => setShowAttendees(false)}
        />
      )}
    </div>
  );
}