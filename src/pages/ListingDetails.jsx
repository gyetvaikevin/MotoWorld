// src/pages/ListingDetails.jsx
import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { db, storage, auth } from "../services/firebase";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import LoaderWrapper from "../components/common/LoaderWrapper";
import UserNameLink from "../components/profile/UserNameLink";
import "../styles/ListingDetails.css";

export default function ListingDetails() {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = auth.currentUser;

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const docRef = doc(db, "marketplace", id);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setListing({ id: snap.id, ...snap.data() });
        }
      } catch (err) {
        console.error("❌ Hiba a hirdetés betöltésekor:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchListing();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Biztosan törlöd a hirdetést?")) return;
    try {
      await deleteDoc(doc(db, "marketplace", id));
      if (listing.imagePath) {
        await deleteObject(ref(storage, listing.imagePath));
      }
      navigate("/marketplace");
    } catch (err) {
      console.error("❌ Hiba törléskor:", err);
    }
  };

  if (loading) return <LoaderWrapper text="Hirdetés betöltése..." />;
  if (!listing) return <p className="not-found">Hirdetés nem található.</p>;

  return (
    <div className="listing-details-container">
      <Link to="/marketplace" className="back-link">← Vissza</Link>

      <div className="listing-details-card">
        {/* Bal oldal – nagy kép */}
        <div className="details-image-wrapper">
          {listing.imageUrl && (
            <img
              src={listing.imageUrl}
              alt={listing.title}
              className="details-image"
            />
          )}
        </div>

        {/* Jobb oldal – infó panel */}
        <div className="details-info">
          {/* Badge (ha van condition) */}
          {listing.condition && (
            <span className="details-badge">{listing.condition}</span>
          )}

          <h2 className="details-title">{listing.title}</h2>

          <p className="details-price">{listing.price} Ft</p>

          <p className="details-category">
            <strong>Kategória:</strong> {listing.category}
          </p>

          <p className="details-desc">{listing.desc}</p>

          <p className="details-author">
            <strong>Hirdető:</strong>{" "}
            <UserNameLink
              uid={listing.createdByUid}
              displayName={listing.authorName}
            />
          </p>

          {/* Saját hirdetés esetén szerkesztés/törlés */}
          {user?.uid === listing.createdByUid && (
            <div className="details-actions">
              <Link to={`/marketplace/edit/${listing.id}`}>
                <button className="btn-edit">Szerkesztés</button>
              </Link>
              <button className="btn-delete" onClick={handleDelete}>
                Törlés
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}