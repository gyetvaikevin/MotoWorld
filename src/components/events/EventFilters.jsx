// src/components/events/EventFilters.jsx
import React from "react";

export default function EventFilters({
  searchTerm,
  setSearchTerm,
  sortOption,
  setSortOption,
}) {
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
    </div>
  );
}
