// src/pages/Marketplace.jsx
import { useState, useEffect } from "react";
import { db } from "../services/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { Link } from "react-router-dom";
import LoaderWrapper from "../components/common/LoaderWrapper";
import UserNameLink from "../components/profile/UserNameLink";
import "../styles/Cards.css";
import "../styles/Marketplace.css";

export default function Marketplace() {
  const [listings, setListings] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "marketplace"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setListings(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const filtered = listings.filter(
    (l) =>
      (category === "all" || l.category === category) &&
      (l.title?.toLowerCase().includes(search.toLowerCase()) ||
        l.desc?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="marketplace-container">
      <h2>Marketplace</h2>

      <div className="filters">
        <input
          placeholder="Keresés..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="all">Összes kategória</option>
          <option value="motor">Motor</option>
          <option value="felszerelés">Felszerelés</option>
          <option value="szerszám">Szerszám</option>
        </select>

        <Link to="/marketplace/add">+ Új hirdetés</Link>
      </div>

      {loading ? (
        <div className="listing-grid">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="skeleton-card" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <p>Nincs találat.</p>
      ) : (
        <div className="listing-grid">
          {filtered.map((l) => (
            <div key={l.id} className="card listing-card">
              {/* ✅ Badge (ha van condition mező) */}
              {l.condition && (
                <span className="listing-badge">{l.condition}</span>
              )}

              {/* ✅ A LINK MOST MÁR KÜLÖN CLASS-T KAP */}
              <Link to={`/marketplace/${l.id}`} className="listing-link">
                {l.imageUrl && <img src={l.imageUrl} alt={l.title} />}
                <h3>{l.title}</h3>
                <p>{l.price} Ft</p>
              </Link>

              {/* 🔥 Hirdető neve kattintható */}
              <UserNameLink
                uid={l.createdByUid}
                displayName={l.authorName}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}