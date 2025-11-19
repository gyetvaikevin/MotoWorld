import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import { useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet-routing-machine";

// Dupla kattintásra megálló hozzáadása
function ClickHandler({ stops, setStops }) {
  useMapEvents({
    dblclick(e) {
      const { lat, lng } = e.latlng;
      const name = prompt("Megálló neve:");
      if (name) setStops([...stops, { lat, lng, name }]);
    }
  });
  return null;
}

// OSRM útvonaltervezés
function Routing({ stops }) {
  const map = useMap();

  useEffect(() => {
    if (stops.length > 1) {
      const routingControl = L.Routing.control({
        waypoints: stops.map(s => L.latLng(s.lat, s.lng)),
        routeWhileDragging: false,
        show: false,
        createMarker: (i, wp) =>
          L.marker(wp.latLng).bindPopup(stops[i].name || `Megálló ${i + 1}`)
      }).addTo(map);

      return () => map.removeControl(routingControl);
    }
  }, [map, stops]);

  return null;
}

export default function MapPicker({ stops, setStops, className }) {
  return (
    <MapContainer
      center={[47.5, 19.05]}
      zoom={7}
      style={{ height: "400px", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap közreműködők"
      />

      {/* Megálló hozzáadás kezelése */}
      <ClickHandler stops={stops} setStops={setStops} />

      {/* OSRM útvonal kirajzolása */}
      <Routing stops={stops} />

      {/* Megállók megjelenítése */}
      {stops.map((stop, idx) => (
        <Marker
          key={idx}
          position={[stop.lat, stop.lng]}
          icon={L.icon({
            iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
            iconSize: [25, 41],
            iconAnchor: [12, 41]
          })}
        >
          <Popup>{stop.name || `Megálló ${idx + 1}`}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
