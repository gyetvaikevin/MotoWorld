// src/components/profile/ProfileImageUploader.jsx
import React from "react";

export default function ProfileImageUploader({
  label,
  imageUrl,
  preview,
  onFileChange,
  onDelete,
  disabled,
}) {
  return (
    <div>
      <label>{label}</label>
      {preview ? (
        <img src={preview} alt="preview" width="150" />
      ) : imageUrl ? (
        <img src={imageUrl} alt="current" width="150" />
      ) : null}

      <input
        type="file"
        onChange={(e) => {
          const file = e.target.files[0];
          onFileChange(file);
        }}
        disabled={disabled}
      />

      {imageUrl && onDelete && (
        <button type="button" onClick={onDelete}>
          Kép törlése
        </button>
      )}
    </div>
  );
}
