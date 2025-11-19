// src/pages/Marketplace.jsx
import { useState, useEffect } from "react";
import { db } from "../services/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { Link } from "react-router-dom";
import LoaderWrapper from "../components/common/LoaderWrapper";
import "../styles/Cards.css";


export default function Marketplace() {
  const [listings, setListings] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(true); // ÚJ állapot

  useEffect(() => {
    const q = query(collection(db, "marketplace"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setListings(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false); // ha megjött az adat, kikapcsoljuk a loadingot
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
        <LoaderWrapper text="Hirdetések betöltése..." />
      ) : filtered.length === 0 ? (
        <p>Nincs találat.</p>
      ) : (
        <div className="listing-grid">
          {filtered.map((l) => (
            <Link
              key={l.id}
              to={`/marketplace/${l.id}`}
              className="card listing-card"
            >
              {l.imageUrl && <img src={l.imageUrl} alt={l.title} />}
              <h3>{l.title}</h3>
              <p>{l.price} Ft</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
