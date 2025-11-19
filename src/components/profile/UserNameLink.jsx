// src/components/profile/UserNameLink.jsx
import { Link } from "react-router-dom";
import "../../styles/Profile.css";

export default function UserNameLink({ uid, displayName }) {
  return (
    <Link to={`/profile/${uid}`} className="profile-link">
      {displayName || "Ismeretlen"}
    </Link>
  );
}
