// src/components/events/AttendeesModal.jsx
import React, { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../services/firebase";

function AttendeeUser({ uid }) {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const snap = await getDoc(doc(db, "users", uid));
      if (snap.exists()) setUserData(snap.data());
    };
    fetchUser();
  }, [uid]);

  if (!userData) return null;

  return (
    <div className="attendee-item">
      <img
        src={userData.photoURL || "/default-avatar.png"}
        alt={userData.displayName}
        className="attendee-avatar"
      />
      <span>{userData.displayName}</span>
    </div>
  );
}

export default function AttendeesModal({ attendees, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <h3>Résztvevők</h3>
        {attendees.length === 0 ? (
          <p>Még senki nem jelezte a részvételt.</p>
        ) : (
          <div className="attendees-list">
            {attendees.map((uid) => (
              <AttendeeUser key={uid} uid={uid} />
            ))}
          </div>
        )}
        <button onClick={onClose} className="modal-close-btn">
          Bezárás
        </button>
      </div>
    </div>
  );
}