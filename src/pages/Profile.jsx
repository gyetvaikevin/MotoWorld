// src/pages/Profile.jsx
import React, { useEffect, useState } from "react";
import { db, storage } from "../services/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  deleteDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import DeleteProfileButton from "../components/profile/DeleteProfileButton";
import StartChatButton from "../components/chat/StartChatButton"; 
import "../styles/profile.css";
import "../styles/Cards.css";

const DEFAULT_AVATAR = "/default-avatar.png";

export default function Profile() {
  const { uid: paramUid } = useParams();
  const { user } = useAuth();

  const targetUid = paramUid || user?.uid;

  const [events, setEvents] = useState([]);
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    if (!targetUid) return;

    const q = query(
      collection(db, "events"),
      where("createdByUid", "==", targetUid)
    );
    const unsubEvents = onSnapshot(q, (snap) =>
      setEvents(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );

    (async () => {
      const userRef = doc(db, "users", targetUid);
      const snap = await getDoc(userRef);
      if (snap.exists()) setProfileData(snap.data());
      else setProfileData(null);
    })();

    return () => unsubEvents();
  }, [targetUid]);

  const isOwnProfile = user?.uid && targetUid === user.uid;

  const handleDeleteEvent = async (id, imagePath) => {
    if (!isOwnProfile) return;
    if (!window.confirm("Biztos törlöd az eseményt?")) return;
    try {
      await deleteDoc(doc(db, "events", id));
      if (imagePath) await deleteObject(ref(storage, imagePath));
    } catch (err) {
      console.error("Esemény törlés hiba:", err);
      alert("Hiba történt a törlés során.");
    }
  };

  if (!user) {
    return (
      <div className="profile-container">
        <h2>Profil</h2>
        <p>Jelentkezz be a profil megtekintéséhez.</p>
      </div>
    );
  }

  if (!targetUid) {
    return (
      <div className="profile-container">
        <h2>Profil</h2>
        <p>Érvénytelen profil azonosító.</p>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <h2>{isOwnProfile ? "Profilom" : "Felhasználói profil"}</h2>

      <div className="profile-header">
        {isOwnProfile ? (
          <>
            <Link to="/profile/edit">
              <button>Profil szerkesztése</button>
            </Link>
            <Link to="/friends">
              <button>Barátaim</button>
            </Link>
          </>
        ) : (
          // 🔥 új gomb csak más profilokon
          <StartChatButton targetUid={targetUid} />
        )}

        {profileData?.photoURL && profileData.photoURL !== DEFAULT_AVATAR ? (
          <img
            src={profileData.photoURL}
            alt="Profilkép"
            className="profile-avatar"
          />
        ) : (
          <div className="profile-avatar-placeholder">
            {profileData?.displayName?.[0]?.toUpperCase() || "?"}
          </div>
        )}

        <p>
          <strong>Név:</strong> {profileData?.displayName || "Nincs megadva"}
        </p>
        <p>
          <strong>Email:</strong>{" "}
          {isOwnProfile ? user.email : profileData?.email || "Privát"}
        </p>
        <p>
          <strong>Motor:</strong> {profileData?.bikeName || "Nincs megadva"}
        </p>
        {profileData?.bikeImage && (
          <img src={profileData.bikeImage} alt="Motor" className="profile-bike" />
        )}
      </div>

      <h3>{isOwnProfile ? "Saját eseményeim" : "Eseményei"}</h3>
      {events.length === 0 ? (
        <p>Nincsenek események.</p>
      ) : (
        <div className="profile-events">
          {events.map((ev) => (
            <div key={ev.id} className="card profile-event-card">
              <h4>{ev.title}</h4>
              <p>{ev.desc}</p>
              {ev.imageUrl && <img src={ev.imageUrl} alt={ev.title} />}
              {isOwnProfile && (
                <div className="profile-event-actions">
                  <button onClick={() => handleDeleteEvent(ev.id, ev.imagePath)}>
                    Törlés
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <hr style={{ margin: "1rem 0" }} />
      {isOwnProfile && <DeleteProfileButton />}
    </div>
  );
}
