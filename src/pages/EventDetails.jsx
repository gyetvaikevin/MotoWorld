import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { db } from "../services/firebase";
import { doc, getDoc } from "firebase/firestore";
import { MapContainer, TileLayer, Marker, Polyline, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Új: kommentek komponens
import Comments from "../components/comments/Comments";
import { useAuth } from "../contexts/AuthContext";

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
    if (!stops || stops.length < 2) {
      alert("Legalább indulási és érkezési pont szükséges.");
      return;
    }

    const origin = `${stops[0].lat},${stops[0].lng}`;
    const destination = `${stops[stops.length - 1].lat},${stops[stops.length - 1].lng}`;
    const hasWaypoints = stops.length > 2;
    const waypoints = hasWaypoints
      ? stops.slice(1, -1).map((s) => `${s.lat},${s.lng}`).join("|")
      : "";

    const gmapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
      origin
    )}&destination=${encodeURIComponent(destination)}${
      hasWaypoints ? `&waypoints=${encodeURIComponent(waypoints)}` : ""
    }`;
    const appleUrl = `maps://?saddr=${encodeURIComponent(
      origin
    )}&daddr=${encodeURIComponent(destination)}`;

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    window.open(isIOS ? appleUrl : gmapsUrl, "_blank", "noopener,noreferrer");
  };

  if (loading) return <p style={{ padding: "2rem" }}>Betöltés...</p>;
  if (!eventData) return <p style={{ padding: "2rem" }}>Esemény nem található.</p>;

  return (
    <div style={{ padding: "2rem" }}>
      <h2>{eventData.title}</h2>
      <p>{eventData.desc}</p>
      {eventData.imageUrl && (
        <img
          src={eventData.imageUrl}
          alt={eventData.title}
          style={{ maxWidth: "400px", borderRadius: "6px", marginBottom: "1rem" }}
        />
      )}

      {/* Térkép */}
      {eventData.stops && eventData.stops.length > 0 && (
        <>
          <MapContainer
            center={[eventData.stops[0].lat, eventData.stops[0].lng]}
            zoom={10}
            style={{ height: "400px", width: "100%", marginBottom: "1rem" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap közreműködők"
            />
            {eventData.stops.map((stop, idx) => (
              <Marker
                key={idx}
                position={[stop.lat, stop.lng]}
                icon={L.icon({
                  iconUrl:
                    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
                  iconSize: [25, 41],
                  iconAnchor: [12, 41],
                  popupAnchor: [1, -34],
                })}
              >
                <Popup>{stop.name || `Megálló ${idx + 1}`}</Popup>
              </Marker>
            ))}
            {eventData.stops.length > 1 && (
              <Polyline
                positions={eventData.stops.map((s) => [s.lat, s.lng])}
                color="blue"
              />
            )}
          </MapContainer>

          {eventData.stops.length >= 2 && (
            <button onClick={() => openRouteInMaps(eventData.stops)}>
              Útvonal megnyitása térkép appban
            </button>
          )}
        </>
      )}

      {/* Kommentek megjelenítése */}
      <Comments parentId={id} parentType="events" user={user} />
    </div>
  );
}
