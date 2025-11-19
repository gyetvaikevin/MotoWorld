// src/components/profile/ProfileEdit.jsx
import React from "react";
import ProfileForm from "./ProfileForm";
import DeleteProfileButton from "./DeleteProfileButton";

export default function ProfileEdit() {
  return (
    <div className="form-container">
      <h2>Profil szerkesztése</h2>
      <ProfileForm />
      <hr style={{ margin: "1rem 0" }} />
      <DeleteProfileButton />
    </div>
  );
}
