// src/components/events/EditEventForm.jsx
import React from "react";

export default function EditEventForm({
  editTitle,
  setEditTitle,
  editDesc,
  setEditDesc,
  editImage,
  setEditImage,
  editImagePreview,
  setEditImagePreview,
  handleImageChange,
  handleUpdate,
  onCancel,
}) {
  return (
    <form onSubmit={handleUpdate}>
      <input
        value={editTitle}
        onChange={(e) => setEditTitle(e.target.value)}
        required
      />
      <textarea
        value={editDesc}
        onChange={(e) => setEditDesc(e.target.value)}
        required
      />
      <input
        type="file"
        accept="image/*"
        onChange={(e) =>
          handleImageChange(e, setEditImage, setEditImagePreview)
        }
      />
      {editImagePreview && (
        <img src={editImagePreview} alt="Új kép" className="preview" />
      )}
      <button type="submit">Mentés</button>
      <button type="button" onClick={onCancel}>
        Mégse
      </button>
    </form>
  );
}
