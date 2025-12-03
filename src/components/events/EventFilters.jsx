// src/components/events/EventFilters.jsx
import React, { useState } from "react";

export default function EventFilters({
  searchTerm,
  setSearchTerm,
  sortOption,
  setSortOption,
  locationFilter,
  setLocationFilter,
}) {
  const [city, setCity] = useState("");
  const [radius, setRadius] = useState(0);
  const [suggestions, setSuggestions] = useState([]);

  const fetchSuggestions = async (query) => {
    if (!query) {
      setSuggestions([]);
      return;
    }
    try {
      const res = await fetch(
        `https://us-central1-motoworld-5ffd0.cloudfunctions.net/photonSearch?q=${encodeURIComponent(
          query
        )}`
      );
      const data = await res.json();
      setSuggestions(
        data.features.map((f) => ({
          display_name: f.properties.name,
          lat: f.geometry.coordinates[1],
          lon: f.geometry.coordinates[0],
        }))
      );
    } catch (err) {
      console.error("Hiba a település keresésnél:", err);
      setSuggestions([]);
    }
  };

  const handleCityChange = (e) => {
    const value = e.target.value;
    setCity(value);
    fetchSuggestions(value);
  };

  const applyLocationFilter = (lat, lng, name) => {
    if (lat && lng && radius > 0) {
      setLocationFilter({
        center: [parseFloat(lat), parseFloat(lng)],
        radius: radius * 1000, // km → m
      });
      setCity(name);
    } else {
      setLocationFilter(null);
    }
    setSuggestions([]);
  };

  return (
    <div className="event-filters">
      <input
        placeholder="Keresés..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <select
        value={sortOption}
        onChange={(e) => setSortOption(e.target.value)}
      >
        <option value="dateDesc">Legújabb elöl</option>
        <option value="dateAsc">Legrégebbi elöl</option>
        <option value="likesDesc">Legtöbb like</option>
        <option value="likesAsc">Legkevesebb like</option>
      </select>

      <div className="location-filter">
        <input
          type="text"
          placeholder="Település neve"
          value={city}
          onChange={handleCityChange}
        />

        {suggestions.length > 0 && (
          <ul className="autocomplete-list">
            {suggestions.map((s, idx) => (
              <li
                key={idx}
                onClick={() =>
                  applyLocationFilter(s.lat, s.lon, s.display_name)
                }
              >
                {s.display_name}
              </li>
            ))}
          </ul>
        )}

        <select
          value={radius}
          onChange={(e) => setRadius(parseInt(e.target.value))}
        >
          <option value={0}>Nincs helyszűrés</option>
          <option value={10}>10 km</option>
          <option value={50}>50 km</option>
          <option value={100}>100 km</option>
        </select>
      </div>
    </div>
  );
}
