// src/pages/EventDetails.jsx
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { db } from "../services/firebase";
import { doc, getDoc } from "firebase/firestore";
import { MapContainer, TileLayer, Marker, Polyline, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import Comments from "../components/comments/Comments";
import { useAuth } from "../contexts/AuthContext";
import UserNameLink from "../components/profile/UserNameLink"; 

export default function EventDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const docRef = doc(db, "events", id);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          setEventData({
            ...data,
            stops: Array.isArray(data.stops) ? data.stops : [],
          });
        }
      } catch (err) {
        console.error("❌ Hiba az esemény betöltésekor:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const openRouteInMaps = (stops) => {
    // változatlan
  };

  if (loading) return <p style={{ padding: "2rem" }}>Betöltés...</p>;
  if (!eventData) return <p style={{ padding: "2rem" }}>Esemény nem található.</p>;

  return (
    <div style={{ padding: "2rem" }}>
      <div className="event-header" style={{ marginBottom: "1rem" }}>
        <img
          src={eventData.authorPhoto || "/default-avatar.png"}
          alt={eventData.authorName}
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            marginRight: "0.5rem",
          }}
        />
        <UserNameLink
          uid={eventData.createdByUid}
          displayName={eventData.authorName}
        />
      </div>

      <h2>{eventData.title}</h2>
      <p>{eventData.desc}</p>
      {eventData.imageUrl && (
        <img
          src={eventData.imageUrl}
          alt={eventData.title}
          style={{
            maxWidth: "400px",
            borderRadius: "6px",
            marginBottom: "1rem",
          }}
        />
      )}

      {/* térkép + útvonal logika változatlan */}

      <Comments parentId={id} parentType="events" user={user} />
    </div>
  );
}
