// src/components/events/EventForm.jsx
import React from "react";
import MapPicker from "../common/MapPicker";

export default function EventForm({
  title,
  setTitle,
  desc,
  setDesc,
  image,
  setImage,
  imagePreview,
  setImagePreview,
  stops,
  setStops,
  handleImageChange,
  handleAddEvent,
  loading,
  error,
  success,
}) {
  return (
    <form onSubmit={handleAddEvent} className="event-form">
      {loading && <p style={{ color: "blue" }}>Feltöltés folyamatban...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Cím"
        required
      />
      <textarea
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
        placeholder="Leírás"
        required
      />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => handleImageChange(e, setImage, setImagePreview)}
      />
      {imagePreview && (
        <img src={imagePreview} alt="Előnézet" className="preview" />
      )}

      <MapPicker stops={stops} setStops={setStops} className="edit-map" />

      <button type="submit">Hozzáadás</button>
    </form>
  );
}
