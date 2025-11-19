// src/pages/ListingDetails.jsx
import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { db, storage, auth } from "../services/firebase";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import LoaderWrapper from "../components/common/LoaderWrapper";

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
  if (!listing) return <p style={{ padding: "2rem" }}>Hirdetés nem található.</p>;

  return (
    <div className="card listing-details" style={{ padding: "2rem" }}>
      <h2>{listing.title}</h2>
      <p><strong>Kategória:</strong> {listing.category}</p>
      <p><strong>Ár:</strong> {listing.price} Ft</p>
      <p>{listing.desc}</p>
      {listing.imageUrl && (
        <img
          src={listing.imageUrl}
          alt={listing.title}
          style={{ maxWidth: "400px", borderRadius: "6px", marginBottom: "1rem" }}
        />
      )}

      {/* Saját hirdetés esetén szerkesztés/törlés */}
      {user?.uid === listing.createdByUid && (
        <div style={{ marginTop: "1rem" }}>
          <Link to={`/marketplace/edit/${listing.id}`}>
            <button>Szerkesztés</button>
          </Link>
          <button onClick={handleDelete} style={{ marginLeft: "0.5rem" }}>
            Törlés
          </button>
        </div>
      )}

      <div style={{ marginTop: "1rem" }}>
        <Link to="/marketplace">← Vissza a Marketplace-re</Link>
      </div>
    </div>
  );
}
